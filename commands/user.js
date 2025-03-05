const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("user")
        .setDescription("Get user info"),

    async execute(interaction) {
        if (interaction.replied || interaction.deferred) {
            return interaction.editReply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
        }
        return interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
    },
};
