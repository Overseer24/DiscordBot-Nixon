const { EmbedBuilder } = require("discord.js");
const { execute } = require("./interactionCreate");


module.exports = {
    name: "distubeEvents",
    execute(client) {
        client.distube
            .on('playSong', (queue, song) => {
                const textChannel = queue.textChannel;
                if (textChannel) {
                    textChannel.send({
                        embeds: [new EmbedBuilder()
                            .setColor('Green')
                            .setTitle("🎶 Now Playing")
                            .setDescription(`**[${song.name}](${song.url})**`)
                            .addFields(
                                { name: "⏳ Duration", value: song.formattedDuration, inline: true },
                                { name: "🙋 Requested by", value: song.user.username, inline: true }
                            )
                            .setThumbnail(song.thumbnail)
                            .setTimestamp()]
                    });
                }
            })
            .on('addSong', (queue, song) => {
                const textChannel = queue.textChannel;
                if (textChannel) {
                    textChannel.send({
                        embeds: [new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("📥 Song Added")
                            .setDescription(`**[${song.name}](${song.url})** has been added to the queue!`)]
                    });
                }
            })
            .on('finish', queue => {
                const textChannel = queue.textChannel;
                if (textChannel) {
                    textChannel.send({
                        embeds: [new EmbedBuilder()
                            .setColor('#a200ff')
                            .setTitle('🏁 Queue Finished')
                            .setDescription('The queue has ended. Thanks for listening!')
                            .setFooter({ text: 'Hope you enjoyed the music! 🎶' })]
                    });
                }

                // Disconnect after 1 minute if no new songs are added
                setTimeout(() => {
                    if (!client.distube.getQueue(queue.voiceChannel)) {
                        queue.voiceChannel.leave();
                    }
                }, 60000); // 1 minute timeout
            })
            .on('error', (channel, error) => {
                console.error("DisTube Error:", error);
                if (channel) {
                    channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor('Red')
                            .setTitle("⛔ Error")
                            .setDescription(`An error occurred: \`${error.message}\``)]
                    });
                }
            });
    }
};
