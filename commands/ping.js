const { SlashCommandBuilder, EmbedBuilder} = require("discord.js");

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

            if (interaction.replied || interaction.deferred) {
                return interaction.editReply({ embeds: [embed] }); // Use editReply if already replied/deferred
            } else {
                return interaction.reply({ embeds: [embed] }); // Use reply if not yet replied/deferred
            }
       
    }
};