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
            subcommand.setName("exit")
                .setDescription("Exits the voice channel")
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

                case 'remove-queue':
                    const queue = client.distube.getQueue(voiceChannel);
                    if (!queue) {
                        embed.setColor('Red').setDescription("❌ There are no songs in the queue!");
                        return interaction.editReply({ embeds: [embed] });
                    }
                    const songs = queue.songs;

                    const position = options.getInteger("position");
                    if (position < 0 || position >= queue.songs.length) // Check if the position is valid
                    {
                        embed.setColor('Red').setDescription("❌ Invalid position provided!");
                        return interaction.editReply({ embeds: [embed] });
                    }
                    try {
                        // console.log("Removing song at position:", position);
                        // console.log("Song to remove:", songs[position]);

                        const removedSong = songs.splice(position, 1);
                        // queue.remove(position);
                        embed.setColor('Blue').setDescription(`🗑 Removed the song: **${removedSong[0].name}** from the queue`)
                    } catch (error) {
                        // console.error(`Error removing song: ${error}`);
                        embed.setColor('Red').setDescription("❌ An error occurred while removing the song!");
                    }

                    return interaction.editReply({ embeds: [embed] });

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
                            const currentSong = queue.songs[0];
                            const queueString = queue.songs.slice(1).map((song, id) => {
                                return `**${id + 1}.** [${song.name}] - \`${song.formattedDuration}\` - Requested by: ${song.user}`;
                            }).join('\n');

                            embed.setColor('Blue')
                                .setTitle('🎶 Music Queue')
                                .setDescription(
                                    `**Currently Playing:** [${currentSong.name}](${currentSong.url}) - \`${currentSong.formattedDuration}\`\n\n**Up Next:**\n${queueString ? queueString : 'No more songs in the queue!'}`
                                ).setThumbnail(currentSong.thumbnail);
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

