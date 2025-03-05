const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("music")
        .setDescription("Plays a song by keyword, URL, or Spotify link!!!")
        .addSubcommand(subcommand =>
            subcommand.setName("play")
                .setDescription("Plays a song")
                .addStringOption(option =>
                    option.setName("query")
                        .setDescription("Specify the song name, URL, or Spotify link")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('volume')
                .setDescription('Set the volume of the music')
                .addNumberOption(option => option.setName('percentage')
                    .setDescription('The volume percentage')
                    .setMinValue(1).setMaxValue(100)
                    .setRequired(true))
        )
        .addSubcommand(subcommand => subcommand.setName('options').setDescription('Music options')
            .addStringOption(option => option.setName('option').setDescription('The option to set').setRequired(true)
                .addChoices(
                    { name: 'queue', value: 'queue' },
                    { name: 'skip', value: 'skip' },
                    { name: 'stop', value: 'stop' },
                    { name: 'pause', value: 'pause' },
                    { name: 'resume', value: 'resume' },
                    { name: 'loop-queue', value: 'loop-queue' },
                    { name: 'loop-all', value: 'loop-all' },
                    { name: 'autoplay', value: 'autoplay' },
                ))),

    async execute(interaction) {
        const { options, member, guild, channel } = interaction;
        const client = interaction.client;
        const subcommand = options.getSubcommand();
        const query = options.getString("query");
        const volume = options.getNumber("percentage");
        const option = options.getString("option");
        const voiceChannel = member.voice.channel;

        const embed = new EmbedBuilder();

        if (!client.distube) {
            embed.setColor('Red').setDescription("DisTube is not initialized in the bot!");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!voiceChannel) {
            embed.setColor('Red').setDescription("You must be in a voice channel to use this command!");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (guild.members.me.voice.channelId && member.voice.channelId !== guild.members.me.voice.channelId) {
            embed.setColor('Red').setDescription(`You cannot use me because I'm already active in <#${guild.members.me.voice.channelId}>`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            switch (subcommand) {
                case 'play':
                    if (!query) {
                        embed.setColor('Red').setDescription("Please provide a song name, URL, or Spotify link!");
                        return interaction.reply({ embeds: [embed], ephemeral: true });
                    }

                    await client.distube.play(voiceChannel, query, { textChannel: channel, member: member });
                    return interaction.reply({ content: 'Requesting the song...', ephemeral: true });

                case 'volume':
                    if (!volume) {
                        embed.setColor('Red').setDescription("Please provide a volume percentage!");
                        return interaction.reply({ embeds: [embed], ephemeral: true });
                    }

                    await client.distube.setVolume(voiceChannel, volume);
                    return interaction.reply({ content: `Setting the volume to ${volume}%`, ephemeral: true });

                case 'options':
                    const queue = client.distube.getQueue(voiceChannel);

                    if (!queue) {
                        embed.setColor('Red').setDescription("There is no queue in this server!");
                        return interaction.reply({ embeds: [embed], ephemeral: true });
                    }

                    switch (option) {
                        case 'skip':
                            await queue.skip();
                            embed.setColor('Blue').setDescription('Skipping the current song...');
                            break;

                        case 'stop':
                            await queue.stop();
                            embed.setColor('Blue').setDescription('Stopping the music...');
                            break;

                        case 'pause':
                            await queue.pause();
                            embed.setColor('Blue').setDescription('Pausing the music...');
                            break;

                        case 'resume':
                            await queue.resume();
                            embed.setColor('Blue').setDescription('Resuming the music...');
                            break;

                        case 'queue':
                            embed.setColor('Blue').setDescription(`Queue:\n${queue.songs.map((song, id) => `**${id + 1}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``).join('\n')}`);
                            break;

                        case 'loop-queue':
                            if (queue.repeatMode === 1) {
                                await queue.setRepeatMode(0);
                                embed.setColor('Blue').setDescription('The track is not looped');
                            } else {
                                await queue.setRepeatMode(2);
                                embed.setColor('Blue').setDescription('The track is looped');
                            }
                            break;

                        case 'loop-all':
                            if (queue.repeatMode === 0) {
                                await queue.setRepeatMode(1);
                                embed.setColor('Blue').setDescription('The queue is looped');
                            } else {
                                await queue.setRepeatMode(0);
                                embed.setColor('Blue').setDescription('The queue is not looped');
                            }
                            break;

                        case 'autoplay':
                            const autoplay = queue.toggleAutoplay();
                            embed.setColor('Blue').setDescription(autoplay ? 'Autoplay is enabled' : 'Autoplay is disabled');
                            break;
                    }

                    return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            embed.setColor('Red').setDescription('An error occurred while processing the command!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName("play")
//         .setDescription("Plays a song by keyword, URL, or Spotify link!!!")
//         .addStringOption(option =>
//             option.setName("song")
//                 .setDescription("YouTube URL, Spotify link, or song name")
//                 .setRequired(true)
//         ),

//     async execute(interaction) {
//         const query = interaction.options.getString("song");
//         console.log("Query received:", query);

//         // Check if the query is valid
//         if (!query || query.trim().length === 0) {
//             return interaction.reply({ content: "❌ Please provide a valid song name, URL, or Spotify link!", ephemeral: true });
//         }

//         const channel = interaction.member.voice.channel;

//         // Check if the user is in a voice channel
//         if (!channel) {
//             return interaction.reply({ content: "❌ You must join a voice channel first!", ephemeral: true });
//         }

//         const client = interaction.client;

//         // Ensure DisTube is initialized
//         if (!client.distube) {
//             return interaction.reply({ content: "❌ DisTube is not initialized in the bot!", ephemeral: true });
//         }

//         try {
//             // Defer the reply to prevent timeouts
//             if (!interaction.replied && !interaction.deferred) {
//                 await interaction.deferReply();
//             }

//             // Fetch the text channel
//             const textChannel = interaction.channel?.isTextBased() ? interaction.channel : interaction.guild.channels.cache.find(channel => channel.isTextBased());

//             if (!textChannel) {
//                 return interaction.editReply({ content: "❌ Unable to find a valid text channel!" });
//             }

//             // Try to play the song
//             const song = await client.distube.play(channel, query, {
//                 member: interaction.member,
//                 textChannel: textChannel, // Use the fetched text channel
//                 // Set a higher connection timeout (for example, 60 seconds instead of 30)
//                 voiceConnectionTimeout: 60000

//             });

//             console.log("Song played:", song);

//             // Check if the song was successfully found and played
//             if (!song) {
//                 return interaction.editReply({ content: "❌ Couldn't find the song. Try another query!" });
//             }

//             const embed = new EmbedBuilder()
//                 .setColor(0x0099ff)
//                 .setTitle("🎵 Now Playing")
//                 .setDescription(`**[${song.name}](${song.url})**`)
//                 .addFields(
//                     { name: "⏳ Duration", value: song.formattedDuration, inline: true },
//                     { name: "🙋 Requested by", value: interaction.user.username, inline: true }
//                 )
//                 .setThumbnail(song.thumbnail)
//                 .setTimestamp();

//             await interaction.editReply({ embeds: [embed] });

//         } catch (error) {
//             console.error("Error in play command:", error);

//             // Log additional details to help troubleshoot
//             console.error("Error details:", error);
//             if (error.channel) {
//                 console.error("Error occurred in channel:", error.channel.id);
//             }

//             // Handle specific DisTube errors
//             if (error.code === "NO_RESULT") {
//                 return interaction.editReply({ content: "❌ No results found for your query. Please try a different song or URL!" });
//             }

//             // Reply with a generic error message if something goes wrong
//             if (interaction.replied || interaction.deferred) {
//                 await interaction.editReply({ content: "❌ An error occurred while processing the command!" });
//             } else {
//                 await interaction.reply({ content: "❌ An error occurred!", ephemeral: true });
//             }
//         }
//     }
// };