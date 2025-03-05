require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { Collection } = require("discord.js");
const { DisTube } = require("distube");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { SpotifyPlugin } = require("@distube/spotify");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],
    rest: {
        timeout: 30000, // Increase timeout to 30 seconds
    },

});
client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    nsfw: true,
    plugins: [
        new SpotifyPlugin({
            api: {
                clientId: process.env.SPOTIFY_CLIENT_ID,
                clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            },
        }),
        new YtDlpPlugin()
    ],
});

const status = queue =>
    `Volume: \`${queue.volume}%\` |  Filter: \`${queue.filters.names.join(', ') || 'Inactive'}\` | Repeat: \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'Queue' : 'Track') : 'Off'
    }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``
client.distube
    .on('playSong', (queue, song) =>
        queue.textChannel.send({
            embeds: [new EmbedBuilder().setColor('#a200ff')
                .setDescription(`🎶 | Playing: \`${song.name}\` - \`${song.formattedDuration}\`\nFrom: ${song.user
                    }\n${status(queue)}`)]
        })
    )
    .on('addSong', (queue, song) =>
        queue.textChannel.send(
            {
                embeds: [new EmbedBuilder().setColor('#a200ff')
                    .setDescription(`🎶 | Added \`${song.name}\` - \`${song.formattedDuration}\` to queue by: ${song.user}`)]
            }
        )
    )
    .on('addList', (queue, playlist) =>
        queue.textChannel.send(
            {
                embeds: [new EmbedBuilder().setColor('#a200ff')
                    .setDescription(`🎶 | Added from \`${playlist.name}\` : \`${playlist.songs.length
                        } \` queue tracks; \n${status(queue)}`)]
            }
        )
    )
    .on('error', (channel, e) => {
        if (channel) channel.send(`⛔ | Error: ${e.toString().slice(0, 1974)}`)
        else console.error(e)
    })
    .on('empty', channel => channel.send({
        embeds: [new EmbedBuilder().setColor("Red")
            .setDescription('⛔ | The voice channel is empty! Leaving the channel...')]
    }))
    .on('searchNoResult', (message, query) =>
        message.channel.send(
            {
                embeds: [new EmbedBuilder().setColor("Red")
                    .setDescription('`⛔ | No results found for: \`${query}\`!`')]
            })
    )
    .on('finish', queue => queue.textChannel.send({
        embeds: [new EmbedBuilder().setColor('#a200ff')
            .setDescription('🏁 | The queue is finished!')]
    }))

const messageMap = new Map();
const ATTACHMENTS_CHANNEL_ID = process.env.ATTACHMENT_CHANNELS_ID;
const GENERAL_CHANNEL_ID = process.env.GENERAL_CHANNELS_ID;

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, "events");
fs.readdirSync(eventsPath).forEach((file) => {
    if (file.endsWith(".js")) {
        const event = require(`./events/${file}`);
        client.on(event.name, event.execute.bind(null, client));
    }
});

client.on("messageCreate", async (message) => {
    // Check if the message is in the attachments channel and contains attachments
    if (message.channel.id === ATTACHMENTS_CHANNEL_ID && message.attachments.size > 0) {
        const generalChannel = await message.guild.channels.fetch(GENERAL_CHANNEL_ID);

        message.attachments.forEach(async (attachment) => {
            // Check if the attachment is a video
            if (attachment.contentType && attachment.contentType.startsWith("video")) {

                // Generate a thumbnail using FFmpeg


                // Create the embed
                const embed = new EmbedBuilder()
                    .setTitle("🎥 New Video Attachment")
                    .setDescription(`${message.author} has sent a video in ${message.channel}`)
                    .setImage(message.author.displayAvatarURL({ size: 512 })) // Use the generated thumbnail
                    .setFooter({ text: `Author: ${message.author.tag}` })
                    .setTimestamp();

                // Send the embed with the thumbnail
                const sentMessage = await generalChannel.send({ embeds: [embed] }).catch(console.error);

                messageMap.set(message.id, sentMessage.id);

                // Delete the thumbnail file after sending
            } else {
                // Handle non-video attachments (e.g., images)
                const embed = new EmbedBuilder()
                    .setTitle("📎 New Attachment")
                    .setDescription(`${message.author} has sent an image in ${message.channel}`)
                    .setImage(attachment.url)
                    .setFooter({ text: `Author: ${message.author.tag}` })
                    .setTimestamp();

                const sentMessage = await generalChannel.send({ embeds: [embed] }).catch(console.error);

                messageMap.set(message.id, sentMessage.id);
            }
        });
    }
});

client.on("messageDelete", async (message) => {
    if (message.channel.id !== ATTACHMENTS_CHANNEL_ID) return; // Only track attachment channel

    const generalChannel = await message.guild.channels.fetch(GENERAL_CHANNEL_ID);
    const linkedMessageId = messageMap.get(message.id);

    if (linkedMessageId) {
        try {
            const linkedMessage = await generalChannel.messages.fetch(linkedMessageId);
            if (linkedMessage) {
                await linkedMessage.delete(); // Delete the copied message
            }
        } catch (error) {
            console.error("Failed to delete linked message:", error);
        }

        messageMap.delete(message.id); // Remove from map
    }
});

// client.on("interactionCreate", async (interaction) => {
//     if(!interaction.isCommand()) return;

//     if(interaction.commandName === "ping") {
//         await interaction.reply({ content: "Pong!" });
//     }

//     if(interaction.commandName === "server") {
//         await interaction.reply({ content: `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}` });
//     }

//     if(interaction.commandName === "user") {
//         await interaction.reply({ content: `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}` });
//     }
// });


client.distube.on("error", (channel, error) => {
    console.error(`DisTube Error in channel ${channel.id}:`,);
    console.error("Full error details:", error.message);
});

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("error", (error) => {
    console.error("Client Error:", error);
});

client.on("shardError", (error, shardId) => {
    console.error(`Shard ${shardId} Error:`, error);
});

client.on("shardDisconnect", (event, shardId) => {
    console.warn(`Shard ${shardId} Disconnected:`, event);
});

client.on("shardReconnecting", (shardId) => {
    console.log(`Shard ${shardId} Reconnecting...`);
});

client.login(process.env.DISCORD_TOKEN).catch(console.error);