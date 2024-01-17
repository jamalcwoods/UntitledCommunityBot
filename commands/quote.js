const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, APIEmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { getServerDBData, updatePlayerDBData, updateServerDBData } = require('../firebaseTools.js')
const { getQuote, timeVal } = require('../tools.js')

module.exports = {
	data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Manage Motivational Quote System')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(subcommand =>
		subcommand
			.setName('channel')
			.setDescription('Set a channel for the Motivational Quote to be sent to')
			.addChannelOption(option =>
                option
                .setName('channel') 
                .setDescription("Channel you want the Motivational Quote to be sent to")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )  
    )
    .addSubcommand(subcommand =>
		subcommand
			.setName('time')
			.setDescription('Set a time for the Motivational Quote to be sent')
			.addStringOption(option =>
                option.setName('time')
                .setDescription('Time that the Motivational Quote will be sent')
                .setRequired(true)
                .addChoices(
                    { name: '12:00 AM (EST)', value: '0' },
                    { name: '1:00 AM (EST)', value: '1' },
                    { name: '2:00 AM (EST)', value: '2' },
                    { name: '3:00 AM (EST)', value: '3' },
                    { name: '4:00 AM (EST)', value: '4' },
                    { name: '5:00 AM (EST)', value: '5' },
                    { name: '6:00 AM (EST)', value: '6' },
                    { name: '7:00 AM (EST)', value: '7' },
                    { name: '8:00 AM (EST)', value: '8' },
                    { name: '9:00 AM (EST)', value: '9' },
                    { name: '10:00 AM (EST)', value: '10' },
                    { name: '11:00 AM (EST)', value: '11' },
                    { name: '12:00 PM (EST)', value: '12' },
                    { name: '1:00 PM (EST)', value: '13' },
                    { name: '2:00 PM (EST)', value: '14' },
                    { name: '3:00 PM (EST)', value: '15' },
                    { name: '4:00 PM (EST)', value: '16' },
                    { name: '5:00 PM (EST)', value: '17' },
                    { name: '6:00 PM (EST)', value: '18' },
                    { name: '7:00 PM (EST)', value: '19' },
                    { name: '8:00 PM (EST)', value: '20' },
                    { name: '9:00 PM (EST)', value: '21' },
                    { name: '10:00 PM (EST)', value: '22' },
                    { name: '11:00 PM (EST)', value: '23' },
                )
            )
    )
    .addSubcommand(subcommand =>
		subcommand
			.setName('view')
			.setDescription('View settings for Motivational Quote system')
    )
    .addSubcommand(subcommand =>
		subcommand
			.setName('reroll')
			.setDescription('Reroll the Motivational Quote')
    )
    .addSubcommand(subcommand =>
		subcommand
            .setName('custom')
            .setDescription('Set a custom Motivational Quote to be sent')
            .addStringOption(option =>
                option
                .setName('custom_quote_text')
			    .setDescription('Enter a custom quote')
                .setRequired(true)
            )
            .addStringOption(option =>
                option
                .setName('custom_quote_author')
			    .setDescription('Enter name of the author of the custom quote')
                .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
		subcommand
			.setName('toggle')
			.setDescription('Turn the Motivational Quote system off/on')
    ),
    async execute(interaction,config,callback) {
        getServerDBData(interaction.guild.id,function(serverData){
            const embed = new EmbedBuilder;

            if(!serverData){
                serverData = {
                    quote:{
                        channel:"0",
                        time:-1,
                        next:getQuote(""),
                        fired:false,
                        active:true
                    }
                }
            } else {
                if(!serverData.quote){
                    serverData.quote = {
                        channel:"0",
                        time:-1,
                        next:getQuote(null),
                        fired:false,
                        active:true
                    }
                }
            }

            let updates = [] 
    
            switch(interaction.options["_subcommand"]){
                case "time":
                    let value = interaction.options["_hoistedOptions"][0].value
                    console.log(interaction.options["_hoistedOptions"][0])
                    embed.addFields(
                        { name: 'Quote Time Set', value: 'The Motivational Quote will now be sent at ' + timeVal(value) }
                    )

                    serverData.quote.time = value
                    
                    break;
    
                case "channel":
                    let channelID = interaction.options["_hoistedOptions"][0].value
                    embed.addFields(
                        { name: 'Quote Channel Set', value: 'The Motivational Quote will now be sent to the channel <#' + channelID + ">" }
                    )

                    serverData.quote.channel = channelID
    
                    break;

                case "view":
                    let text;
                    if(serverData.quote.active){
                        text = "The next Motivational Quote will be:\n\n" + serverData.quote.next.text + (serverData.quote.next.author == null ? "" : "\n-" + serverData.quote.next.author) + "\n\nYou may reroll the quote using the command `/quote reroll`\n"
                        if(serverData.quote.time != -1){
                            text += "\nThis quote will be sent at " + timeVal(serverData.quote.time)
                        } 
                        if(serverData.quote.channel != "0"){
                            text += "\nThis quote will be sent in <#" + serverData.quote.channel + ">"
                        }
                    } else {
                        text = "The Motivational Quote System is currently off, turn it on using `/quote toggle`"
                    }
                    embed.addFields(
                        { name: 'Upcoming Quote', value: text }
                    )
                    break;
                case "reroll":
                    serverData.quote.next = getQuote(serverData.quote.next)
                    embed.addFields(
                        { name: 'Quote Set', value: "The next quote will be:\n\n" + serverData.quote.next.text + (serverData.quote.next.author == null ? "" : "\n-" + serverData.quote.next.author) }
                    )
                    break;
                case "custom":
                    serverData.quote.next = {
                        text:interaction.options["_hoistedOptions"][0].value,
                        author:interaction.options["_hoistedOptions"][1].value
                    }
                    embed.addFields(
                        { name: 'Quote Set', value: "The next quote will be: " + serverData.quote.next.text + (serverData.quote.next.author == null ? "" : "\n-" + serverData.quote.next.author) }
                    )
                    break;
                case "toggle": 
                    serverData.quote.active = !serverData.quote.active
                    embed.addFields(
                        { name: 'Quote Toggled', value: "The Motivational Quote system has been turned " + (serverData.quote.active ? "on" : "off") }
                    )
                    break;
            }
    
            let warning = ""
            if(serverData.quote.time == -1){
                warning += "\n\nA time needs to be set for when this quote will be sent. Please do the command `/quote time`"
            }

            if(serverData.quote.channel == "0"){
                warning += "\n\nA channel needs to be set for where the quote will be sent. Please do the command `/quote channel`"
            }

            if(warning != ""){
                embed.addFields(
                    { name: 'Warning', value: warning }
                )
            }

            updates.push({
                id:interaction.guild.id,
                path:"quote",
                value:serverData.quote
            })
    
            interaction.reply({
                content:" ",
                embeds:[embed],
                ephemeral:true
            })
    
            
    
            callback({
                updateServer:updates
            })
        })
    }
}