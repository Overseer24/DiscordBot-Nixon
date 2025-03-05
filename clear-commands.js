const { REST, Routes } = require("discord.js");
require("dotenv").config();

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log("🗑 Clearing all global slash commands...");
        await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DESQ_SERVER_ID), { body: [] });
        console.log("✅ Successfully cleared all global commands.");
    } catch (error) {
        console.error("❌ Error clearing commands:", error);
    }
})();
