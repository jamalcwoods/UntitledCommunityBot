const { populateEventCustomizationControls, populateEventCustomizationWindow} = require("../sessionTools.js")
module.exports = {
    data:{
        name:"changeMessagePage"
    },
    execute(interaction,componentConfig,callback){
        let session = componentConfig.session
        
        switch(parseInt(componentConfig.args[0])){
            case 0:
                session.session_data.messagesPage--
                break;

            case 1:
                session.session_data.messagesPage++
                break;
        }

        interaction.update({
            content:" ",
            embeds:populateEventCustomizationWindow(session),
            components:populateEventCustomizationControls(session),
            ephemeral:true
        })

        callback({
            updateSession:session
        })
    }
}