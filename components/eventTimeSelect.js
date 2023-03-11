const { populateEventCustomizationControls, populateEventCustomizationWindow} = require("../sessionTools.js")
const { getServerDBData, updateServerDBData } = require("../firebaseTools.js")
const { time } = require("discord.js")
module.exports = {
    data:{
        name:"eventTimeSelect"
    },
    execute(interaction,componentConfig,callback){
        getServerDBData(interaction.guild.id,function(serverData){
            let session = componentConfig.session
            let timeValue = parseInt(interaction.values[0])
            let updates = []
            let eventData = session.session_data.guildData.custom[session.session_data.selected]

            eventData.time = timeValue

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