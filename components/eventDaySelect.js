const { populateEventCustomizationControls, populateEventCustomizationWindow} = require("../sessionTools.js")
const { getServerDBData, updateServerDBData } = require("../firebaseTools.js")
module.exports = {
    data:{
        name:"eventDaySelect"
    },
    execute(interaction,componentConfig,callback){
        getServerDBData(interaction.guild.id,function(serverData){
            let session = componentConfig.session
            let dayValue = parseInt(interaction.values[0])
            let updates = []
            let eventData = session.session_data.guildData.custom[session.session_data.selected]
            if(eventData.days.includes(dayValue)){
                eventData.days.splice(eventData.days.indexOf(dayValue),1)
            } else {
                eventData.days.push(dayValue)
            }

            updates.push({
                id:interaction.guild.id,
                path:"custom/" + session.session_data.selected,
                value:eventData
            })

            interaction.update({
                content:" ",
                embeds:populateEventCustomizationWindow(session),
                components:populateEventCustomizationControls(session),
                ephemeral:true
            })

            callback({
                updateSession:session,
                updateServer:updates
            })
        })
    }
}