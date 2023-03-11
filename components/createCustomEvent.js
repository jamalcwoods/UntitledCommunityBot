const { populateEventCustomizationControls, populateEventCustomizationWindow} = require("../sessionTools.js")
const { getServerDBData, updateServerDBData } = require("../firebaseTools.js")
module.exports = {
    data:{
        name:"createCustomEvent"
    },
    execute(interaction,componentConfig,callback){
        getServerDBData(interaction.guild.id,function(serverData){
            let session = componentConfig.session

            let newEvent = {
                title:"New Event",
                fired:false,
                active:false,
                time:17,
                days:[0,1,2,3,4,5,6],
                channel:-1
            }

            if(!serverData.custom){
                serverData.custom = [newEvent]
            } else {
                serverData.custom.push(newEvent)
            }

            let updates = [{
                id:interaction.guild.id,
                path:"custom",
                value:serverData.custom
            }]

            session.session_data.mode = "editing"
            session.session_data.selected = serverData.custom.length - 1
            session.session_data.guildData = serverData

            interaction.update({
                content:" ",
                embeds:populateEventCustomizationWindow(session),
                components:populateEventCustomizationControls(session),
                ephemeral:true
            })

            callback({
                updateServer:updates,
                updateSession:session
            })
        })
    }
}