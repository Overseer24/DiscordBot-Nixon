const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wah')
        .setDescription('Hmmmm'),
    async execute(interaction) {
        const gifURL = "https://c.tenor.com/NOyjdR4yR7UAAAAC/tenor.gif";

        try {
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle("Wah")
                .setDescription(`Me and my jowa`)
                .setImage(gifURL);

            if (interaction.replied || interaction.deferred) {
                return interaction.editReply({ embeds: [embed] }); // Use editReply if already replied/deferred
            } else {
                return interaction.reply({ embeds: [embed] }); // Use reply if not yet replied/deferred
            }
        } catch (error) {
            console.log(error);
        }

    }
};