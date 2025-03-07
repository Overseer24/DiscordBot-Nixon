const { REST, Routes } = require("discord.js");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const botToken = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

const rest = new REST({ version: '10' }).setToken(botToken);

const commands = [];

// const commandPath = path.join(__dirname, "commands");
// const commandFiles = fs.readdirSync(commandPath).

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync("./commands")

for (const fileOrFolder of commandFiles) {
    const fullPath = path.join(commandsPath, fileOrFolder);
    if (fs.statSync(fullPath).isDirectory()) {
        const subFiles = fs.readdirSync(fullPath).filter(file => file.endsWith(".js"));

        for (const file of subFiles) {
            const filePath = path.join(fullPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`Command ${file} is missing 'data' or 'execute'`);
            }
        }
    }
    else if (fileOrFolder.endsWith(".js")) {
        const command = require(fullPath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`Command ${file} is missing 'data' or 'execute'`);
        }
    }
}



(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DESQ_SERVER_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Failed to reload application (/) commands:', error);
    }
})();

// const slashRegister = async () => {
//     try {
//         await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID,process.env.DESQ_SERVER_ID), {
//             body: [
//                 {
//                     name: 'ping',
//                     description: 'Just ping me!'
//                 },
//                 {
//                     name: 'server',
//                     description: 'Get server info'
//                 },
//                 {
//                     name: 'user',
//                     description: 'Get user infos'
//                 },
//                 {
//                     name: 'say',
//                     description: 'Make the bot say something',
//                 },
//             ]
//         })
//     } catch (e) {
//         console.error(e);
//     }
// }

// slashRegister();