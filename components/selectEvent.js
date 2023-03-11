const { populateEventCustomizationControls, populateEventCustomizationWindow} = require("../sessionTools.js")
const { getServerDBData, updateServerDBData } = require("../firebaseTools.js")
module.exports = {
    data:{
        name:"selectEvent"
    },
    execute(interaction,componentConfig,callback){
        getServerDBData(interaction.guild.id,function(serverData){
            let session = componentConfig.session

            session.session_data.mode = "editing"
            session.session_data.selected = parseInt(interaction.values[0])
            session.session_data.guildData = serverData

            interaction.update({
                content:" ",
                embeds:populateEventCustomizationWindow(session),
                components:populateEventCustomizationControls(session),
                ephemeral:true
            })

            callback({
                updateSession:session
            })
        })
    }
}