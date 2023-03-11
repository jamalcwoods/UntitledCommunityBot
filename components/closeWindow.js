const { populateCloseInteractionMessage } = require("../sessionTools.js")
const { getServerDBData, updateServerDBData } = require("../firebaseTools.js")

module.exports = {
    data:{
        name:"closeWindow"
    },
    execute(interaction,componentConfig,callback){
        getServerDBData(interaction.guild.id,function(serverData){
            let session = componentConfig.session

            interaction.update(populateCloseInteractionMessage())

            callback({
                removeSession:session
            })
        })
    }
}