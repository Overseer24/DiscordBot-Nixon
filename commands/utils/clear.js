const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete yung mga bold mong message sa channel')
        .addIntegerOption(option => option.setName('amount').setDescription('Ilang message gusto mo i-delete?').setRequired(true))
        .setDefaultMemberPermissions(
            PermissionFlagsBits.MANAGE_MESSAGES
        ),
    async execute(interaction) {
        const channel = interaction.channel;
        const embed = new EmbedBuilder();

        const amount = interaction.options.getInteger('amount');
        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: "❌ You must specify a number between 1 and 100.", flags: MessageFlags.Ephemeral });
        }

        // console.log(interaction.user);
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const message = await channel.bulkDelete(amount, true);
            embed.setColor('Green')
                .setTitle("Success!")
                .setDescription(`Deleted ${message.size} messages`)
                .setImage("https://c.tenor.com/NhZWy2Hl5uMAAAAC/tenor.gif")
                .setTimestamp(new Date());

            setTimeout(() => interaction.deleteReply().catch(console.error), 5000);
            return interaction.editReply({ embeds: [embed] });

        } catch (error) {

            embed.setColor('Red')
                .setTitle("Error!")
                .setDescription(`There was an error while deleting messages`);

            setTimeout(() => interaction.deleteReply().catch(console.error), 5000);
            return interaction.editReply({ embeds: [embed] });
        }

    }
}