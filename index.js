require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    rest: {
        timeout: 30000, // Increase timeout to 30 seconds
    },
});

const ATTACHMENTS_CHANNEL_ID = process.env.ATTACHMENT_CHANNELS_ID;
const GENERAL_CHANNEL_ID = process.env.GENERAL_CHANNELS_ID;

client.on("messageCreate", async (message) => {
    // Check if the message is in the attachments channel and contains attachments
    if (message.channel.id === ATTACHMENTS_CHANNEL_ID && message.attachments.size > 0) {
        const generalChannel = await message.guild.channels.fetch(GENERAL_CHANNEL_ID);

        message.attachments.forEach(async (attachment) => {
            // Check if the attachment is a video
            if (attachment.contentType && attachment.contentType.startsWith("video")) {

                // Generate a thumbnail using FFmpeg


                // Create the embed
                const embed = new EmbedBuilder()
                    .setTitle("🎥 New Video Attachment")
                    .setDescription(`${message.author} has sent a video in ${message.channel}`)
                    .setImage(message.author.displayAvatarURL({ size: 512 })) // Use the generated thumbnail
                    .setFooter({ text: `Author: ${message.author.tag}` })
                    .setTimestamp();

                // Send the embed with the thumbnail
                generalChannel.send({ embeds: [embed], files: [thumbnailAttachment] }).catch(console.error);

                // Delete the thumbnail file after sending
    } else {
        // Handle non-video attachments (e.g., images)
        const embed = new EmbedBuilder()
            .setTitle("📎 New Attachment")
            .setImage(attachment.url)
            .setFooter({ text: `Author: ${message.author.tag}` })
            .setTimestamp();

        generalChannel.send({ embeds: [embed] }).catch(console.error);
    }
});
    }
});

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("error", (error) => {
    console.error("Client Error:", error);
});

client.on("shardError", (error, shardId) => {
    console.error(`Shard ${shardId} Error:`, error);
});

client.on("shardDisconnect", (event, shardId) => {
    console.warn(`Shard ${shardId} Disconnected:`, event);
});

client.on("shardReconnecting", (shardId) => {
    console.log(`Shard ${shardId} Reconnecting...`);
});

client.login(process.env.DISCORD_TOKEN).catch(console.error);