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
            subcommand.setName("remove-queue")
                .setDescription("Removes a song from the queue")
                .addIntegerOption(option =>
                    option.setName("position")
                        .setDescription("The position of the song to remove")
                        .setRequired(true))
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
                )))
        .addSubcommand(subcommand => subcommand.setName('filter').setDescription('Filter the music')
            .addStringOption(option => option.setName('filter').setDescription('The filter to apply').setRequired(true)
                .addChoices(
                    { name: '3D', value: '3d' },
                    { name: 'Bass Boost', value: 'bassboost' },
                    { name: 'Echo', value: 'echo' },
                    { name: 'Flanger', value: 'flanger' },
                    { name: 'Gate', value: 'gate' },
                    { name: 'Haas', value: 'haas' },
                    { name: 'Karaoke', value: 'karaoke' },
                    { name: 'Nightcore', value: 'nightcore' },
                    { name: 'Reverse', value: 'reverse' },
                    { name: 'Vaporwave', value: 'vaporwave' },
                    { name: 'MCompand', value: 'mcompand' },
                    { name: 'Phaser', value: 'phaser' },
                    { name: 'Tremolo', value: 'tremolo' },
                    { name: 'Surround', value: 'surround' },
                    { name: 'Earwax', value: 'earwax' },
                    { name: 'Clear', value: 'clear' }
                ))
        ),

    async execute(interaction) {
        const { options, member, guild, channel } = interaction;
        const client = interaction.client;
        const subcommand = options.getSubcommand();
        const query = options.getString("query")
        const volume = options.getNumber("percentage");
        const option = options.getString("option");
        const voiceChannel = member.voice.channel;

        const embed = new EmbedBuilder();

        if (!client.distube) {
            embed.setColor('Red').setDescription("DisTube is not initialized in the bot!");
            return interaction.reply({ embeds: [embed] });
        }

        if (!voiceChannel) {
            embed.setColor('Red').setDescription("You must be in a voice channel to use this command!");
            return interaction.reply({ embeds: [embed] });
        }

        if (guild.members.me.voice.channelId && member.voice.channelId !== guild.members.me.voice.channelId) {
            embed.setColor('Red').setDescription(`You cannot use me because I'm already active in <#${guild.members.me.voice.channelId}>`);
            return interaction.reply({ embeds: [embed] });
        }

        try {
            await interaction.deferReply(); // Avoid timeout issues

            switch (subcommand) {
                case 'play':
                    let query = options.getString("query").trim();
                    query = query.replace(/&list=.*$/, ""); // Remove playlist query to avoid issues

                    await client.distube.play(voiceChannel, query, { textChannel: channel, member: member });

                    embed.setColor('Green').setDescription(`🎵 Requesting the song: **${query}**`);
                    return interaction.editReply({ embeds: [embed] });

                case 'volume':
                    await client.distube.setVolume(voiceChannel, volume);
                    embed.setColor('Blue').setDescription(`🔊 Setting volume to **${volume}%**`);
                    return interaction.editReply({ embeds: [embed] });

                // case 'remove-queue':
                //     const queue = client.distube.getQueue(voiceChannel);
                //     console.log("Queue:", queue);
                //     if (!queue) {
                //         embed.setColor('Red').setDescription("❌ There are no songs in the queue!");
                //         return interaction.editReply({ embeds: [embed] });
                //     }
                    // const position = options.getInteger("position") - 1;
                    // if (position < 0 || position >= queue.songs.length) // Check if the position is valid
                    // {
                    //     embed.setColor('Red').setDescription("❌ Invalid position provided!");
                    //     return interaction.editReply({ embeds: [embed] });
                    // }
                    // try {
                    //     const removedSong = queue.songs.splice(position, 1);
                    //     embed.setColor('Blue').setDescription(`🗑 Removed the song: **${removedSong[0].name}** from the queue!`);
                    //     return interaction.editReply({ embeds: [embed] });
                    // } catch (error) {
                    //     console.error(`Error removing song from queue: ${error}`);
                    //     embed.setColor('Red').setDescription("❌ An error occurred while removing the song from the queue!");
                    //     return interaction.editReply({ embeds: [embed] });
                    // }



                case 'options': {
                    const queue = client.distube.getQueue(voiceChannel);

                    if (!queue) {
                        embed.setColor('Red').setDescription("❌ There is no queue in this server!");
                        return interaction.editReply({ embeds: [embed] });
                    }
                    switch (option) {
                        case 'skip':
                            if (!queue || !queue.songs.length) {
                                embed.setColor('Red').setDescription("❌ There are no songs to skip!");
                                return interaction.editReply({ embeds: [embed] });
                            }

                            if (queue.songs.length > 1) {
                                await queue.skip();
                                embed.setColor('Blue').setDescription(`⏭ Skipped to the next song: **${queue.songs[1].name}**`);
                            } else {
                                await queue.stop();
                                embed.setColor('Blue').setDescription('⏹ No more songs in the queue. Stopping playback.');
                            }

                            return interaction.editReply({ embeds: [embed] });
                        case 'stop':
                            //log what type of event
                        
                            await queue.stop();
                            embed.setColor('Blue').setDescription('⏹ Stopping the music...');
                            break;

                        case 'pause':
                            await queue.pause();
                            embed.setColor('Blue').setDescription('⏸ Pausing the music...');
                            break;

                        case 'resume':
                            await queue.resume();
                            embed.setColor('Blue').setDescription('▶ Resuming the music...');
                            break;

                        case 'queue':
                            embed.setColor('Blue')
                                .setTitle('🎶 Music Queue')
                                .setDescription(queue.songs.map((song, id) => {
                                    return id === 0
                                        ? `**${id + 1}.** [${song.name}](${song.url}) - \`${song.formattedDuration}\` **(Currently Playing 🎵)**`
                                        : `**${id + 1}.** [${song.name}](${song.url}) - \`${song.formattedDuration}\``;
                                }).join('\n'));
                            break;

                        case 'loop-queue':
                            queue.setRepeatMode(queue.repeatMode === 2 ? 0 : 2);
                            embed.setColor('Blue').setDescription(queue.repeatMode === 2 ? '🔁 The queue is now looped!' : '🔁 Loop mode disabled!');
                            break;

                        case 'loop-all':
                            queue.setRepeatMode(queue.repeatMode === 1 ? 0 : 1);
                            embed.setColor('Blue').setDescription(queue.repeatMode === 1 ? '🔂 The current track is looped!' : '🔂 Loop mode disabled!');
                            break;

                        case 'autoplay':
                            const autoplay = queue.toggleAutoplay();
                            embed.setColor('Blue').setDescription(autoplay ? '🎵 Autoplay is **enabled**' : '🎵 Autoplay is **disabled**');
                            break;
                    }

                    return interaction.editReply({ embeds: [embed] });
                }
                case 'filter': {
                    const queue = client.distube.getQueue(voiceChannel);
                    if (!queue) {
                        embed.setColor('Red').setDescription("❌ There is no queue to filter in this server!");
                        return interaction.editReply({ embeds: [embed] });
                    }
                    const filter = options.getString("filter");
                    console.log("Filter:", filter);
                    if (filter === 'clear') {
                        if (queue.filters.names.length === 0) {
                            embed.setColor('Red').setDescription("❌ No filters are currently active!");
                        } else {
                            queue.filters.clear(); // Clears all filters
                            embed.setColor('Blue').setDescription("🎵 All filters have been cleared!");
                        }
                        return interaction.editReply({ embeds: [embed] });
                    }
                    const availableFilters = [
                        '3d', 'bassboost', 'echo', 'flanger', 'gate', 'haas',
                        'karaoke', 'nightcore', 'reverse', 'vaporwave', 'mcompand',
                        'phaser', 'tremolo', 'surround', 'earwax', 'clear'
                    ];
                    if (!availableFilters.includes(filter)) {
                        embed.setColor('Red').setDescription("❌ Invalid filter provided!");
                        return interaction.editReply({ embeds: [embed] });
                    }
                    try {
                        if (queue.filters.names.includes(filter)) {
                            queue.filters.remove(filter);
                            embed.setColor('Blue').setDescription(`🎵 ${filter} filter disabled!`);
                        } else {
                            queue.filters.add(filter);
                            embed.setColor('Blue').setDescription(`🎵 ${filter} filter enabled!`);
                        }
                        return interaction.editReply({ embeds: [embed] });
                    } catch (error) {
                        console.error(`Error applying filter: ${error}`);
                        embed.setColor('Red').setDescription("❌ An error occurred while applying the filter!");
                        await interaction.editReply({ embeds: [embed] });
                        if (queue.songs.length > 1) {
                            queue.skip();
                        } else {
                            queue.stop();
                        }

                    }


                }
            }
        } catch (error) {
            console.error("🚨 Error in music command:", error);
            embed.setColor('Red').setDescription("⚠ An error occurred while processing your request.");
            return interaction.editReply({ embeds: [embed] });
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