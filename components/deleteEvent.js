const { populateEventCustomizationControls, populateEventCustomizationWindow} = require("../sessionTools.js")
const { getServerDBData, updateServerDBData } = require("../firebaseTools.js")
const { time } = require("discord.js")
module.exports = {
    data:{
        name:"deleteEvent"
    },
    execute(interaction,componentConfig,callback){
        getServerDBData(interaction.guild.id,function(serverData){
            let session = componentConfig.session
            let updates = []

            session.session_data.guildData.custom.splice(session.session_data.selected,1)


            session.session_data = {
                mode:"selection",
                selected:-1,
                guildData:session.session_data.guildData
            }

            if(session.session_data.guildData.custom.length == 0){
                delete session.session_data.guildData.custom
                updates.push({
                    id:interaction.guild.id,
                    path:"custom",
                    value:null
                })
            } else {
                updates.push({
                    id:interaction.guild.id,
                    path:"custom",
                    value:session.session_data.guildData.custom
                })
            }

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