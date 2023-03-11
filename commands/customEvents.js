const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, APIEmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { getServerDBData, updatePlayerDBData, updateServerDBData } = require('../firebaseTools.js')
const { getQuote, timeVal } = require('../tools.js')
const { populateEventCustomizationControls, populateEventCustomizationWindow } = require('../sessionTools')


module.exports = {
	data: new SlashCommandBuilder()
    .setName('customevent')
    .setDescription('Manage Custom Event Messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(subcommand =>
		subcommand
			.setName('menu')
			.setDescription('Open custom event menu')
    )
    .addSubcommand(subcommand =>
		subcommand
			.setName('set-title')
			.setDescription('Set the title of a currently selected custom event')
			.addStringOption(option =>
                option
                .setName('newtitle') 
                .setDescription("New title of currently selected custom event")
                .setRequired(true)
            )  
    )
    .addSubcommand(subcommand =>
		subcommand
			.setName('add-message')
			.setDescription('Add a message to the list of messages that can be sent for this event')
			.addStringOption(option =>
                option
                .setName('newmessage') 
                .setDescription("New message to add to the list of messages that can be sent")
                .setRequired(true)
            )  
    )
    .addSubcommand(subcommand =>
		subcommand
			.setName('channel')
			.setDescription('Set a channel for the currently selected custom message to be sent to')
			.addChannelOption(option =>
                option
                .setName('channel') 
                .setDescription("Channel you want the currently selected custom message to be sent to")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )  
    ),
    async execute(interaction,config,callback) {
        getServerDBData(interaction.guild.id,function(serverData){
            const embed = new EmbedBuilder;
            let session = config.session
            let client = config.client
            let updates = []
            switch(interaction.options["_subcommand"]){
                case "menu":
                    let newSession = {
                        id: Math.floor(Math.random() * 10000),
                        guildID:interaction.guild.id,
                        users:[interaction.user.id],
                        session_data:{
                            mode:"selection",
                            selected:-1,
                            selectedAttribute:0,
                            guildData:serverData
                        },
                        interactionMessage:null
                    }
        
                    interaction.reply({
                        content:" ",
                        embeds:populateEventCustomizationWindow(newSession),
                        components:populateEventCustomizationControls(newSession),
                        fetchReply: true
                    }).then((message) =>{
                        newSession.session_data.m_id = message.id
                        newSession.session_data.c_id = message.channelId
                        callback({
                            addSession:newSession
                        })
                    })
                    break;

                case "set-title":
                    if(session != null && session.session_data.mode == "editing"){
                        let newTitle = interaction.options["_hoistedOptions"][0].value;
                        
                        serverData.custom[session.session_data.selected].title = newTitle

                        updates.push({
                            id:interaction.guild.id,
                            path:"custom",
                            value:serverData.custom
                        })

                        client.channels.fetch(session.session_data.c_id).then(channel => {
                            channel.messages.fetch(session.session_data.m_id).then(message => {
                                
                                session.session_data.guildData = serverData

                                message.edit({
                                    content:" ",
                                    embeds:populateEventCustomizationWindow(session),
                                    components:populateEventCustomizationControls(session)
                                })

                                interaction.reply({
                                    content:"The selected event has been renamed to: " + newTitle,
                                    ephemeral: true
                                })

                                callback({
                                    updateSession:session,
                                    updateServer:updates
                                })
                            })
                        })
                    } else {
                        interaction.reply({
                            content:"You must be editing an event to use this command",
                            ephemeral: true
                        })
                    }
                    
                    break;

                case 'add-message':
                    if(session != null && session.session_data.mode == "editing"){
                        let newMessage = interaction.options["_hoistedOptions"][0].value;
                        
                        if(serverData.custom[session.session_data.selected].textPool) {
                            serverData.custom[session.session_data.selected].textPool.push(newMessage)
                        } else {
                            serverData.custom[session.session_data.selected].textPool = [newMessage]
                        }
                        
                        updates.push({
                            id:interaction.guild.id,
                            path:"custom",
                            value:serverData.custom
                        })

                        client.channels.fetch(session.session_data.c_id).then(channel => {
                            channel.messages.fetch(session.session_data.m_id).then(message => {
                                
                                session.session_data.guildData = serverData

                                message.edit({
                                    content:" ",
                                    embeds:populateEventCustomizationWindow(session),
                                    components:populateEventCustomizationControls(session)
                                })

                                interaction.reply({
                                    content:"The message:\n\n" + newMessage + "\n\nhas been added to the events message list",
                                    ephemeral: true
                                })

                                callback({
                                    updateSession:session,
                                    updateServer:updates
                                })
                            })
                        })
                    } else {
                        interaction.reply({
                            content:"You must be editing an event to use this command",
                            ephemeral: true
                        })
                    }
                    break;

                case 'channel':
                    if(session != null && session.session_data.mode == "editing"){
                        let channelID = interaction.options["_hoistedOptions"][0].value;
                        
                        serverData.custom[session.session_data.selected].channel = channelID

                        
                        updates.push({
                            id:interaction.guild.id,
                            path:"custom",
                            value:serverData.custom
                        })
    
                        client.channels.fetch(session.session_data.c_id).then(channel => {
                            channel.messages.fetch(session.session_data.m_id).then(message => {
                                
                                session.session_data.guildData = serverData
    
                                message.edit({
                                    content:" ",
                                    embeds:populateEventCustomizationWindow(session),
                                    components:populateEventCustomizationControls(session)
                                })
    
                                interaction.reply({
                                    content:"This event's message will be sent to the: <#" + channelID + "> channel",
                                    ephemeral: true
                                })
    
                                callback({
                                    updateSession:session,
                                    updateServer:updates
                                })
                            })
                        })
                    } else {
                        interaction.reply({
                            content:"You must be editing an event to use this command",
                            ephemeral: true
                        })
                    }
                    break;
            }
            
        })
    }
}