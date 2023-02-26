const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, APIEmbedField } = require('discord.js');


module.exports = {

	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('View info about this bot'),
    config:{},
	async execute(interaction,componentConfig,callback) {
        const embed = new EmbedBuilder;
        
        embed.addFields(
            { name: 'About this bot', value: 'This bot is made by Jemini W' }
        )

        interaction.reply({
            content: " ",
            embeds: [embed],
            ephemeral: false,
        })

        callback({})
	},
};