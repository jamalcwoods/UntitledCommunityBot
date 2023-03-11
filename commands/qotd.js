const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, APIEmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { getServerDBData, updatePlayerDBData, updateServerDBData } = require('../firebaseTools.js')
const { getQOTD, timeVal } = require('../tools.js')

module.exports = {
	data: new SlashCommandBuilder()
    .setName('qotd')
    .setDescription('Manage Question of The Day System')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(subcommand =>
		subcommand
			.setName('channel')
			.setDescription('Set a channel for the Question of the Day to be sent to')
			.addChannelOption(option =>
                option
                .setName('channel') 
                .setDescription("Channel you want the Question of the Day to be sent to")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )  
    )
    .addSubcommand(subcommand =>
		subcommand
			.setName('time')
			.setDescription('Set a time for the Question of The Day to be sent')
			.addStringOption(option =>
                option.setName('time')
                .setDescription('Time that the Question of The Day will be sent')
                .setRequired(true)
                .addChoices(
                    { name: '12:00 AM (EST)', value: '17' },
                    { name: '1:00 AM (EST)', value: '18' },
                    { name: '2:00 AM (EST)', value: '19' },
                    { name: '3:00 AM (EST)', value: '20' },
                    { name: '4:00 AM (EST)', value: '21' },
                    { name: '5:00 AM (EST)', value: '22' },
                    { name: '6:00 AM (EST)', value: '23' },
                    { name: '7:00 AM (EST)', value: '0' },
                    { name: '8:00 AM (EST)', value: '1' },
                    { name: '9:00 AM (EST)', value: '2' },
                    { name: '10:00 AM (EST)', value: '3' },
                    { name: '11:00 AM (EST)', value: '4' },
                    { name: '12:00 PM (EST)', value: '5' },
                    { name: '1:00 PM (EST)', value: '6' },
                    { name: '2:00 PM (EST)', value: '7' },
                    { name: '3:00 PM (EST)', value: '8' },
                    { name: '4:00 PM (EST)', value: '9' },
                    { name: '5:00 PM (EST)', value: '10' },
                    { name: '6:00 PM (EST)', value: '11' },
                    { name: '7:00 PM (EST)', value: '12' },
                    { name: '8:00 PM (EST)', value: '13' },
                    { name: '9:00 PM (EST)', value: '14' },
                    { name: '10:00 PM (EST)', value: '15' },
                    { name: '11:00 PM (EST)', value: '16' },
                )
            )
    )
    .addSubcommand(subcommand =>
		subcommand
			.setName('view')
			.setDescription('View settings for Question of the Day system')
    )
    .addSubcommand(subcommand =>
		subcommand
			.setName('reroll')
			.setDescription('Reroll the Question of the Day')
    )
    .addSubcommand(subcommand =>
		subcommand
            .setName('custom')
            .setDescription('Set a custom Question of the Day to be sent')
            .addStringOption(option =>
                option
                .setName('custom_question')
			    .setDescription('Enter a custom question')
                .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
		subcommand
			.setName('toggle')
			.setDescription('Turn the Question of the Day system off/on')
    ),
    async execute(interaction,config,callback) {
        getServerDBData(interaction.guild.id,function(serverData){
            const embed = new EmbedBuilder;

            if(!serverData){
                serverData = {
                    qotd:{
                        channel:"0",
                        time:-1,
                        next:getQOTD(""),
                        fired:false,
                        active:true
                    }
                }
            }

            let updates = [] 
    
            switch(interaction.options["_subcommand"]){
                case "time":
                    let value = interaction.options["_hoistedOptions"][0].value
                    embed.addFields(
                        { name: 'QOTD Time Set', value: 'The question of the day will now be sent at ' + timeVal(value) }
                    )

                    serverData.qotd.time = value
                    
                    break;
    
                case "channel":
                    let channelID = interaction.options["_hoistedOptions"][0].value
                    embed.addFields(
                        { name: 'QOTD Channel Set', value: 'The question of the day will now be sent to the channel <#' + channelID + ">" }
                    )

                    serverData.qotd.channel = channelID
    
                    break;

                case "view":
                    let text;
                    if(serverData.qotd.active){
                        text = "The next question of the day will be:\n\n" + serverData.qotd.next + "\n\nYou may reroll the question using the command `/qotd reroll`\n"
                        if(serverData.qotd.time != -1){
                            text += "\nThis question will be sent at " + timeVal(serverData.qotd.time)
                        } 
                        if(serverData.qotd.channel != "0"){
                            text += "\nThis question will be sent in <#" + serverData.qotd.channel + ">"
                        }
                    } else {
                        text = "The Question of the Day System is currently off, turn it on using `/qotd toggle`"
                    }
                    embed.addFields(
                        { name: 'Upcoming QOTD', value: text }
                    )
                    break;
                case "reroll":
                    serverData.qotd.next = getQOTD(serverData.qotd.next)
                    embed.addFields(
                        { name: 'QOTD Question Set', value: "The next question will be: " + serverData.qotd.next }
                    )
                    break;
                case "custom":
                    serverData.qotd.next = interaction.options["_hoistedOptions"][0].value
                    embed.addFields(
                        { name: 'QOTD Question Set', value: "The next question will be: " + serverData.qotd.next }
                    )
                    break;
                case "toggle": 
                    serverData.qotd.active = !serverData.qotd.active
                    embed.addFields(
                        { name: 'QOTD Toggled', value: "The Question of the Day system has been turned " + (serverData.qotd.active ? "on" : "off") }
                    )
                    break;
            }
    
            let warning = ""
            if(serverData.qotd.time == -1){
                warning += "\n\nA time needs to be set for when this question will be sent. Please do the command `/qotd time`"
            }

            if(serverData.qotd.channel == "0"){
                warning += "\n\nA channel needs to be set for where the question will be sent. Please do the command `/qotd channel`"
            }

            if(warning != ""){
                embed.addFields(
                    { name: 'Warning', value: warning }
                )
            }

            updates.push({
                id:interaction.guild.id,
                path:"qotd",
                value:serverData.qotd
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