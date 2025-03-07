const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Just Ping Me!!!'),
    async execute(interaction) {
        const gifURL = "https://i.makeagif.com/media/8-02-2015/cg42o6.gif";

        const embed = new EmbedBuilder()
            .setColor('DarkRed')
            .setTitle("PPPPPPOOOONG")
            .setDescription(`UGHHH`)
            .setImage(gifURL);
        await interaction.deferReply();
        return interaction.editReply({ embeds: [embed] });

    }
};