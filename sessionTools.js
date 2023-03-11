const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, StringSelectMenuBuilder} = require('discord.js')
const { timeVal } = require('./tools.js')

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
                            .setLabel('Cancel')
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
                    .setCustomId('toggleEvent_' + session.id)
                    .setLabel(event.active ? "Disable Event" : "Activate Event")
                    .setStyle(event.active ? 'Danger' : 'Success'),
                );


                    let daySelections = []
                    let timeSelections = [
                        { 
                            label: '12:00 PM (EST)',
                            description: 'Set this event to trigger at 12:00 PM (EST)',
                             value: '17' },
                        { 
                            label: '1:00 PM (EST)',
                            description: 'Set this event to trigger at 1:00 PM (EST)', 
                            value: '18' },
                        { 
                            label: '2:00 PM (EST)',
                            description: 'Set this event to trigger at 2:00 PM (EST)', 
                            value: '19' },
                        { 
                            label: '3:00 PM (EST)',
                            description: 'Set this event to trigger at 3:00 PM (EST)', 
                            value: '20' },
                        { 
                            label: '4:00 PM (EST)',
                            description: 'Set this event to trigger at 4:00 PM (EST)', 
                            value: '21' },
                        { 
                            label: '5:00 PM (EST)',
                            description: 'Set this event to trigger at 5:00 PM (EST)', 
                            value: '22' },
                        { 
                            label: '6:00 PM (EST)',
                            description: 'Set this event to trigger at 6:00 PM (EST)', 
                            value: '23' },
                        { 
                            label: '7:00 PM (EST)',
                            description: 'Set this event to trigger at 7:00 PM (EST)', 
                            value: '0' },
                        { 
                            label: '8:00 PM (EST)',
                            description: 'Set this event to trigger at 8:00 PM (EST)', 
                            value: '1' },
                        { 
                            label: '9:00 PM (EST)',
                            description: 'Set this event to trigger at 9:00 PM (EST)', 
                            value: '2' },
                        { 
                            label: '10:00 PM (EST)',
                            description: 'Set this event to trigger at 10:00 PM (EST)',
                             value: '3' },
                        { 
                            label: '11:00 PM (EST)',
                            description: 'Set this event to trigger at 11:00 PM (EST)',
                             value: '4' },
                        { 
                            label: '12:00 AM (EST)',
                            description: 'Set this event to trigger at 12:00 AM (EST)',
                             value: '5' },
                        { 
                            label: '1:00 AM (EST)',
                            description: 'Set this event to trigger at 1:00 AM (EST)', 
                            value: '6' },
                        { 
                            label: '2:00 AM (EST)',
                            description: 'Set this event to trigger at 2:00 AM (EST)', 
                            value: '7' },
                        { 
                            label: '3:00 AM (EST)',
                            description: 'Set this event to trigger at 3:00 AM (EST)', 
                            value: '8' },
                        { 
                            label: '4:00 AM (EST)',
                            description: 'Set this event to trigger at 4:00 AM (EST)', 
                            value: '9' },
                        { 
                            label: '5:00 AM (EST)',
                            description: 'Set this event to trigger at 5:00 AM (EST)', 
                            value: '10' },
                        { 
                            label: '6:00 AM (EST)',
                            description: 'Set this event to trigger at 6:00 AM (EST)', 
                            value: '11' },
                        { 
                            label: '7:00 AM (EST)',
                            description: 'Set this event to trigger at 7:00 AM (EST)', 
                            value: '12' },
                        { 
                            label: '8:00 AM (EST)',
                            description: 'Set this event to trigger at 8:00 AM (EST)', 
                            value: '13' },
                        { 
                            label: '9:00 AM (EST)',
                            description: 'Set this event to trigger at 9:00 AM (EST)', 
                            value: '14' },
                        { 
                            label: '10:00 AM (EST)',
                            description: 'Set this event to trigger at 10:00 AM (EST)',
                             value: '15' },
                        { 
                            label: '11:00 AM (EST)',
                            description: 'Set this event to trigger at 11:00 AM (EST)',
                             value: '16' }
                    ]

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
                return [row2,row3,row1]
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
                text += "\n" + (event.active? "This event is currently active" : "This event is currently inactive")
                text += "\nThis event will trigger at " + timeVal(event.time)
                if(event.days == undefined || event.days.length == 0){
                    text += "\nThis event is not set to trigger on any days"
                } else {
                    text += "\nThe days this event will trigger are:\n"
                    for(day in event.days){
                        text += "\n" + days[event.days[day]]
                    }
                }
                if(event.textPool){
                    text += "\n\nMessage that will be sent:\n\n"
                    for(i in event.textPool){
                        let msg = event.textPool[i]
                        text += "Message #" +(parseInt(i)+1) + ": " + msg + "\n"
                    }
                } else {
                    text += "\n\nNo messages in this events message list, add more using `/customevent add-message`"
                }
        
                embed.addFields({
                    name:"Editing Event: " + event.title,
                    value:text
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