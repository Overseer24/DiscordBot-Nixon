const { MessageFlags } = require("discord.js");

module.exports = {
    name: "interactionCreate",
    async execute(client, interaction) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            return interaction.reply({ content: "❌ Command not found!", flags: MessageFlags.Ephemeral });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: "❌ There was an error while executing this command!" });
            } else {
                await interaction.reply({ content: "❌ There was an error while executing this command!",  flags: MessageFlags.Ephemeral });
            }
        }
    }
};
