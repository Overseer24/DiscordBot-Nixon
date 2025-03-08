require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { Collection } = require("discord.js");
const { DisTube } = require("distube");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { SpotifyPlugin } = require("@distube/spotify");
const { YouTubePlugin } = require("@distube/youtube");
process.env.FFMPEG_PATH = require('ffmpeg-static');
// const { SoundCloudPlugin } = require("@distube/soundcloud");
// const gTTS = require('gtts');
// const { createAudioPlayer, createAudioResource, getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');


const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],

});
client.distube = new DisTube(client, {
    // leaveOnEmpty: true,
    // leaveOnFinish: false,
    // leaveOnStop: true,
    // emitNewSongOnly: true,

    plugins: [
        new SpotifyPlugin(
            {
            api: {
                clientId: process.env.SPOTIFY_CLIENT_ID,
                clientSecret: process.env.SPOTIFY_CLIENT_SECRET
            }
        }
    ),
        
        new YouTubePlugin(),
        // new SoundCloudPlugin(),
        new YtDlpPlugin()
    ],
});
client.distube.setMaxListeners(20); // Increase max listeners to 20
let disconnectTimeout;

const status = queue =>
    `🔊 **Volume:** \`${queue.volume}%\` | 🎚️ **Filter:** \`${queue.filters.names.join(', ') || 'Inactive'}\` | 🔁 **Repeat:** \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'Queue' : 'Track') : 'Off'
    }\` | 🤖 **Autoplay:** \`${queue.autoplay ? 'On' : 'Off'}\``;

client.distube
    .on('playSong', (queue, song) => {
        resetDisconnectTimer()
        console.log("🎵 Now Playing:", song.name, "| Duration:", song.formattedDuration);
        console.log("Queue status:", {
            playing: queue.playing,
            songsLeft: queue.songs.length,
            volume: queue.volume,
            repeatMode: queue.repeatMode,
            autoplay: queue.autoplay
        });
        if (queue.textChannel) {
            queue.textChannel.send({
                embeds: [new EmbedBuilder()
                    .setColor('#a200ff')
                    .setTitle('🎶 Now Playing')
                    .setDescription(`**${song.name}** - \`${song.formattedDuration}\`\n\n👤 **Requested by:** ${song.user}\n\n${status(queue)}`)
                    .setThumbnail(song.thumbnail)
                    .setFooter({ text: 'Enjoy the music! 🎧' })]
            });
        } else {
            console.error('Text channel not found for song playback');
        }

    })
    .on('addSong', async (queue, song) => {
        resetDisconnectTimer()

        queue.textChannel.send(
            {
                embeds: [new EmbedBuilder()
                    .setColor('#a200ff')
                    .setTitle('🎶 Song Added to Queue')
                    .setDescription(`**${song.name}** - \`${song.formattedDuration}\`\n\n👤 **Requested by:** ${song.user}`)
                    .setThumbnail(song.thumbnail)
                    .setFooter({ text: 'More tunes coming up! 🎶' })]
            }
        )

        // if (!queue.playing) {
        //     await queue.play();
        // }
    })
    .on('addList', (queue, playlist) => {
        resetDisconnectTimer()
        queue.textChannel.send(
            {
                embeds: [new EmbedBuilder()
                    .setColor('#a200ff')
                    .setTitle('🎶 Playlist Added to Queue')
                    .setDescription(`**${playlist.name}** - \`${playlist.songs.length} tracks\`\n\n${status(queue)}`)
                    .setThumbnail(playlist.thumbnail)
                    .setFooter({ text: 'Let the music play! 🎵' })]
            }
        )
    })
    .on('error', (channel, e) => {
        console.error("Tanaefgdaasd foadsnf:", channel);
        console.error("Error Biatch:", e); // This will be an Error object
        if (channel) {
            // channel.send({
            //     embeds: [
            //         new EmbedBuilder()
            //             .setColor('Red')
            //             .setTitle('⛔ Error')
            //             .setDescription(`⚠️ **An error occurred while playing a song:**\n\`${e.message}\``)
            //             .setFooter({ text: 'Try another song or check the bot logs.' })
            //     ]
            // }).catch(console.error);
            console.log("Error L:", e)
        }
    })
    .on('empty', channel => {
        if (channel && channel.send) {
            channel.send({
                embeds: [new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('⛔ Voice Channel Empty')
                    .setDescription('The voice channel is empty! Leaving the channel...')
                    .setFooter({ text: 'Goodbye for now! 👋' })]
            });
        } else {
            console.error('Empty channel is not a valid TextChannel');
        }
    })
    .on('searchNoResult', (message, query) =>
        message.channel.send(
            {
                embeds: [new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('⛔ No Results Found')
                    .setDescription(`No results found for: **${query}**`)
                    .setFooter({ text: 'Try a different search term.' })]
            })
    )
    .on('finish', queue => {
        const textChannel = queue.voiceChannel?.guild.channels.cache.get(queue.textChannel?.id);
        if (textChannel && textChannel.send) {
            textChannel.send({
                embeds: [new EmbedBuilder()
                    .setColor('#a200ff')
                    .setTitle('🎶 Queue Finished')
                    .setDescription('The queue has ended. Thanks for listening!')
                    .setFooter({ text: 'More tunes coming up! 🎶' })]
            });
        }

        const connection = queue.voice.connection;

        if (!connection) {
            console.error("No active voice connection found.");
            return;
        }

        // Disconnect after 30 sec if no new songs are added
        disconnectTimeout = setTimeout(() => {
            console.log("No new songs, playing TTS...");
            const ttsFile = 'tts.mp3';
            if (!fs.existsSync(ttsFile)) {
                console.error("TTS file not found:", ttsFile);
                return;
            }
            const player = createAudioPlayer();
            const resource = createAudioResource(ttsFile);

            connection.subscribe(player);
            player.play(resource);

            player.on(AudioPlayerStatus.Idle, () => {
                console.log("Finished playing TTS file.");
                if (queue.voice.connection) {
                    queue.voice.connection.destroy();
                }

            });  //

        }, 30000);

    });

const resetDisconnectTimer = () => {
    if (disconnectTimeout) {
        console.log("🛑 Clearing previous disconnect timeout.");
        clearTimeout(disconnectTimeout);
        disconnectTimeout = null;
    } else {
        console.log("✅ No active disconnect timeout to clear.");
    }
    console.log("🔄 Disconnect timer reset! Bot will stay in the VC.");
};



const messageMap = new Map();
const ATTACHMENTS_CHANNEL_ID = process.env.ATTACHMENT_CHANNELS_ID;
const GENERAL_CHANNEL_ID = process.env.GENERAL_CHANNELS_ID;

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync("./commands")

for (const fileOrFolder of commandFiles) {
    const fullPath = path.join(commandsPath, fileOrFolder);
    if (fs.statSync(fullPath).isDirectory()) {
        const subFiles = fs.readdirSync(fullPath).filter(file => file.endsWith(".js"));

        for (const file of subFiles) {
            const filePath = path.join(fullPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`Command ${file} is missing 'data' or 'execute'`);
            }
        }
    }
    else if (fileOrFolder.endsWith(".js")) {
        const command = require(fullPath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`Command ${file} is missing 'data' or 'execute'`);
        }
    }
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




// client.distube.on("error", (channel, error) => {
//     console.error(`DisTube Error in channel ${channel.id}:`,);
//     console.error("Full error details:", error);
// });

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