const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Just Ping Me!!!'),
    async execute(interaction) {
        if (interaction.replied || interaction.deferred) {
            return interaction.editReply("Pong!");
        }
        return interaction.reply("Pong!");
    }
};