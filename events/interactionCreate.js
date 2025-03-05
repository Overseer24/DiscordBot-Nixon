const e = require("express");

module.exports = {
    name: "interactionCreate",
    async execute(client, interaction) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`❌ Command ${interaction.commandName} not found.`);
            return interaction.reply({ content: "❌ Command not found!", ephemeral: true });
        }

        try {
            // Defer the reply if the command might take longer than 3 seconds
      

            // Execute the command
            await command.execute(interaction);
        } catch (error) {
            console.error("Command Error:", error);
            await interaction.reply({ content: "❌ There was an error while executing this command!", ephemeral: true });
        }
    },
};