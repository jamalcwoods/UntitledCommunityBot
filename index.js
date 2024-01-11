const { token } = require("./private/credentials.json");
const fs = require('fs');
const { getQOTD, timeVal, getQuote } = require('./tools.js')
const { Client, GatewayIntentBits, Collection, EmbedBuilder} = require('discord.js');
const { getServerDBData, updatePlayerDBData, updateServerDBData } = require('./firebaseTools.js')
const client = new Client({
     intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ] 
});

client.once('ready', () => {
	console.log('Ready!');
});

let lastHour;
let sessions = []
let ESTOffset = -300

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.components = new Collection();
const componentFiles = fs.readdirSync('./components').filter(file => file.endsWith('.js'));

for (const file of componentFiles) {
	const component = require(`./components/${file}`);
	client.components.set(component.data.name, component);
}

function updateSession(newSession){
    for(var i = 0;i < sessions.length; i++){
        let session = sessions[i]
        if(session.id == newSession.id && newSession.type == session.type){
            sessions[i] = newSession
            for(p of newSession.users){
                updatePlayerDBData(p,"session",newSession.id)
            }
            break;
        }
    }
}

function removeSession(newSession){
    for(var i = 0;i < sessions.length; i++){
        let session = sessions[i]
        if(session.id == newSession.id){
            sessions.splice(i,1) 
            break;
        }
    }
    for(p of newSession.users){
        updatePlayerDBData(p,"session",null)
    }
}

function addSession(newSession){
    sessions.push(newSession)
    for(p of newSession.users){
        updatePlayerDBData(p,"session",newSession.id)
    }
}

function getUserSession(user){
    for(session of sessions){
        if(session.users.includes(user.id)){
            return session
        }
    }
    return null
}

function getSessionByID(id){
    for(var i = 0;i < sessions.length; i++){
        let session = sessions[i]
        if(session.id == id){
            return session
        }
    }
    return null
}

function processResult(result){
    if(result.removeSession){
        removeSession(result.removeSession)
    }

    if(result.addSession){
        addSession(result.addSession)
    }

    if(result.updatePlayer){
        for(batch of result.updatePlayer){
            updatePlayerDBData(batch.id,batch.path,batch.value)
        }
    }

    if(result.updateServer){
        for(batch of result.updateServer){
            updateServerDBData(batch.id,batch.path,batch.value)
        }
    }

    if(result.updateSession){
        updateSession(result.updateSession)
    }
}

client.on('interactionCreate', async interaction => {  
    switch(interaction.type){
        case 3:
            let componenetVals = interaction.customId.split("_")
            const component = client.components.get(componenetVals[0])
            let sessionID = componenetVals[1]
            let args = ""
            if(componenetVals[2]){
                args = componenetVals[2].split("|")
            }
            try {
                let componentConfig = {}
                if(args != ""){
                    componentConfig.args = args
                }
                componentConfig.session = getSessionByID(sessionID)
                componentConfig.client = client
                if(parseInt(sessionID) == componentConfig.session.id){
                    component.execute(interaction,componentConfig,processResult)
                } else {
                    await interaction.reply({ content: 'You are not in the session for this component!', ephemeral: true });
                }
            } catch (error){
                console.error(error)
                await interaction.reply({ content: 'There was an error interacting with this component!', ephemeral: true });
            }
            break;
        case 2:
            if (!interaction.isCommand()) return;

            const command = client.commands.get(interaction.commandName);

            console.log("command: " + interaction.commandName)
            if (!command) return;
            try {
                getServerDBData(interaction.guildId,function(serverData){
                    let commandConfig = {
                        server: serverData,
                        session: getUserSession(interaction.user),
                        client: client
                    };
                    command.execute(interaction,commandConfig,processResult)
                })
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
            break;  
    }
});

setInterval(() => {
    let now = new Date();
    let utcOffset = now.getTimezoneOffset()
    now.setMinutes(now.getMinutes() + utcOffset + ESTOffset)
    console.log(now.getHours())
    getServerDBData("",function(servers){
        for(serverID in servers){
            let server = servers[serverID]
            if(server.qotd && server.qotd.active){
                if(now.getHours() >= parseInt(server.qotd.time)){
                    if(!server.qotd.fired && client.channels.cache.get(server.qotd.channel) != undefined){
                        client.channels.fetch(server.qotd.channel).then(channel =>{
                            const embed = new EmbedBuilder;

                            embed.addFields(
                                { name: 'Question of the Day', value: server.qotd.next }
                            )

                            channel.send({
                                content:" ",
                                embeds:[embed],
                                ephemeral:false
                            })

                            server.qotd.next = getQOTD(server.qotd.next)
                            server.qotd.fired = true

                            updateServerDBData(serverID,"qotd",server.qotd)
                        })
                    }
                } else {
                    server.qotd.fired = false
                    updateServerDBData(serverID,"qotd",server.qotd)
                }
            }

            if(server.quote && server.quote.active){
                if(now.getHours() >= parseInt(server.quote.time)){
                    if(!server.quote.fired && client.channels.cache.get(server.quote.channel) != undefined){
                        client.channels.fetch(server.quote.channel).then(channel =>{
                            const embed = new EmbedBuilder;

                            embed.addFields(
                                { name: 'Daily Quote', value: server.quote.next.text + (server.quote.next.author == null ? "" : "\n-" + server.quote.next.author) }
                            )

                            channel.send({
                                content:" ",
                                embeds:[embed],
                                ephemeral:false
                            })

                            server.quote.next = getQuote(server.quote.next)
                            server.quote.fired = true

                            updateServerDBData(serverID,"quote",server.quote)
                        })
                    }
                } else {
                    server.quote.fired = false
                    updateServerDBData(serverID,"quote",server.quote)
                }
            }       
            
            if(server.custom){
                for(var i = 0; i < server.custom.length;i++){
                    if(server.custom[i].active){
                        if(now.getHours() >= parseInt(server.custom[i].time) && server.custom[i].days.includes(now.getDay())){
                            if(!server.custom[i].fired && client.channels.cache.get(server.custom[i].channel) != undefined){
                                let msg;
                                if(server.custom[i].repeat){
                                    msg = server.custom[i].textPool[Math.floor(Math.random() * server.custom[i].textPool.length)]
                                } else {
                                    let index = Math.floor(Math.random() * server.custom[i].textPool.length)
                                    if(!server.custom[i].used){
                                        server.custom[i].used = []
                                    }
                                    if(server.custom[i].used.length == server.custom[i].textPool.length){
                                        server.custom[i].used = []
                                    }
                                    while(server.custom[i].used.includes(index)){
                                        index = Math.floor(Math.random() * server.custom[i].textPool.length)
                                    }
                                    msg = server.custom[i].textPool[index]
                                    server.custom[i].used.push(index)
                                }

                                let title = server.custom[i].title
                                server.custom[i].fired = true
                                client.channels.fetch(server.custom[i].channel).then(channel =>{
                                    const embed = new EmbedBuilder;
                                    embed.addFields(
                                        { name: title, value: msg.text}
                                    )

                                    if(msg.image != null){
                                        embed.setImage(msg.image)
                                    }

        
                                    channel.send({
                                        content:" ",
                                        embeds:[embed],
                                        ephemeral:false
                                    })
                                })
                            }
                        } else {
                            server.custom[i].fired = false
                        }
                    }
                }
                updateServerDBData(serverID,"custom",server.custom)
            }  
        }
    })
    lastHour = now.getHours()
}, 5000)

client.login(token);