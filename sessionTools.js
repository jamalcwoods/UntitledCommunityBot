const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, StringSelectMenuBuilder, time} = require('discord.js')
const { timeVal, getTimes } = require('./tools.js')

let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
]

module.exports = {
    populateEventCustomizationControls(session){
        let row1;
        switch(session.session_data.mode){
            case "selection":
                if(session.session_data.guildData.custom){
                    row1 = new ActionRowBuilder()
                    .addComponents(
                            new ButtonBuilder()
                            .setCustomId('closeWindow_' + session.id)
                            .setLabel('Finish Editing')
                            .setStyle('Danger'),
                            new ButtonBuilder()
                            .setCustomId('createCustomEvent_' + session.id)
                            .setLabel('Make New Event')
                            .setStyle('Success'),
                    );

                    let EventSelectionLabels = []

                    for(var e = 0; e < session.session_data.guildData.custom.length; e++){
                        let messageEvent = session.session_data.guildData.custom[e] 
                        EventSelectionLabels.push({
                            label: messageEvent.title,
                            description: "Edit the '" + messageEvent.title + "' event",
                            value: e.toString(),
                        })
                    }

                    let row2 = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                            .setCustomId('selectEvent_' + session.id)
                            .setPlaceholder('Select an event to edit')
                            .addOptions(EventSelectionLabels),
                    );
                    return [row1,row2]
                } else {
                    row1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('closeWindow_' + session.id)
                        .setLabel('Finish Editing')
                        .setStyle('Danger'),
                        new ButtonBuilder()
                        .setCustomId('createCustomEvent_' + session.id)
                        .setLabel('Create New Event Message')
                        .setStyle('Success')
                    );
                    return [row1]
                } 

            case "editing":
                let event = session.session_data.guildData.custom[session.session_data.selected]

                row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('changeEvent_' + session.id)
                    .setLabel('Select Different Event')
                    .setStyle('Primary'),
                    new ButtonBuilder()
                    .setCustomId('deleteEvent_' + session.id)
                    .setLabel('Remove Event')
                    .setStyle('Danger'),
                    new ButtonBuilder()
                    .setCustomId('toggleRepeat_' + session.id)
                    .setLabel(event.repeat ? "Disable Repeating Messages" : "Allow Repeating Messages")
                    .setStyle('Primary'),
                    new ButtonBuilder()
                    .setCustomId('toggleEvent_' + session.id)
                    .setLabel(event.active ? "Disable Event" : "Activate Event")
                    .setStyle(event.active ? 'Danger' : 'Success'),
                );


                    let daySelections = []
                    let timeSelections = []
                    let times = getTimes()
                    for(var t = 0;t < times.length;t++){
                        timeSelections.push({ 
                            label: times[t],
                            description: 'Set this event to trigger at ' + times[t],
                             value: t.toString() 
                        })
                    }

                    if(!event.days){
                        event.days = []
                    }
                    for(var e = 0; e < days.length; e++){
                        daySelections.push({
                            label: days[e],
                            description: (event.days.includes(parseInt(e)) ? "Deny this event from triggering on " : "Allow this event to trigger on ") + days[e],
                            value: e.toString(),
                        })
                    }

                    let row2 = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                            .setCustomId('eventDaySelect_' + session.id)
                            .setPlaceholder('Select a day for this event')
                            .addOptions(daySelections)
                    );
                    let row3 = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                        .setCustomId('eventTimeSelect_' + session.id)
                        .setPlaceholder('Select a time for this event to trigger at')
                        .addOptions(timeSelections)
                );
                if(event.textPool && event.textPool.length > 5){
                    let row4 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('changeMessagePage_' + session.id + "_0")
                        .setLabel('Previous Message Page')
                        .setStyle('Primary')
                        .setDisabled(session.session_data.messagesPage == 1),
                        new ButtonBuilder()
                        .setCustomId('changeMessagePage_' + session.id + "_1")
                        .setLabel('Next Message Page')
                        .setStyle('Primary')
                        .setDisabled(session.session_data.messagesPage == Math.ceil(event.textPool.length/5))
                    );
                    return [row4,row2,row3,row1]
                } else {
                    return [row2,row3,row1]
                }
        }
    },
    populateEventCustomizationWindow(session){
        const embed = new EmbedBuilder;
        let text = ""
        switch(session.session_data.mode){
            case "selection":
                if(session.session_data.guildData.custom){
                    text = "Select an event from the drop down below"
                } else {
                    text = "No events for this server"
                }
        
                embed.addFields({
                    name:"Custom Events",
                    value:text
                })
                break;
            
            case "editing":
                let event = session.session_data.guildData.custom[session.session_data.selected]
                
                text += "You can change this event's name with `/customevent set-title`\n\n"
                if(event.channel == -1){
                    text += "A channel must be set for this event to send messages to, set one with `/customevent channel`"
                } else {
                    text += "This event will send messages to the <#" + event.channel +"> channel"
                }
                if(event.role){
                    text += "\nThis event will mention the <@&" + event.role +"> role"
                } else {
                    text += "\n\nYou can set a role for this event to mention by using `/customevent set-role`"
                }
                if(event.active){
                    text += "\n\nThis event will trigger at " + timeVal(event.time)
                    if(event.days == undefined || event.days.length == 0){
                        text += "\nThis event is not set to trigger on any days"
                    } else {
                        text += "\nThe days this event will trigger are:\n"
                        for(day in event.days){
                            text += "\n" + days[event.days[day]]
                        }
                    }
                } else {
                    text += "\n\nThis event is currently inactive"
                }
                
                let messageText = ""
                
                if(event.repeat){
                    messageText += "\n\nMessages for this event will randomly be chosen and may repeat"
                } else {
                    messageText += "\n\nMessages for this event will only repeat once every message has been sent"
                }
                if(event.textPool){
                    messageText += "\nYou can remove messages with `/customevent remove-message`\n"
                    messageText += "You can add images to messages with `/customevent add-message-image`\n"
                    messageText += "\nMessages that will be sent:"
                    if(event.textPool.length > 5){
                        messageText += " (Page 1/" + Math.ceil(event.textPool.length/5) + ")\n\n"
                    } else {
                        messageText += "\n\n"
                    }
                    for(var x = (5 * session.session_data.messagesPage) - 4; x <= 5 * session.session_data.messagesPage; x++){
                        i = (x-1)
                        let msg = event.textPool[i]
                        if(msg != undefined){
                            messageText += "Message Slot #" +(parseInt(i)+1) + ": " + msg.text + "\n"
                            if(msg.image){
                                messageText += "[Image Link](" + msg.image+ ")" + "\n\n"
                            } else {
                                messageText += "\n"
                            }
                        }
                    }
                } else {
                    messageText += "\n\nNo messages in this events message list, add more using `/customevent add-message`"
                }
        
                embed.addFields({
                    name:"Editing Event: " + event.title,
                    value:text
                })

                embed.addFields({
                    name:"Messages",
                    value:messageText
                })
                break;
        }
        
        return [embed]
    },
    populateCloseInteractionMessage(){
        const embed = new EmbedBuilder;

        embed.addFields({
            name:"Interaction Finished",
            value:"Changes saved"
        })

        return {
            content:" ",
            embeds:[embed],
            components:[],
        }
    }
}