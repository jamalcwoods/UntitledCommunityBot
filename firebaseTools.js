const { initializeApp} = require('firebase/app');
const { getDatabase, ref, set, get} = require('firebase/database')
const { firebase } = require("./private/credentials.json");

const app = initializeApp(firebase);
const db = getDatabase()


function updateServerDBData(serverID,path,data,callback){
    set(ref(db, 'servers/' + serverID + "/" + path), data).then( () =>{
        if(callback){
            callback()
        }
    })
}

module.exports = {
    updatePlayerDBData(id,path,data,callback){
        set(ref(db, 'users/' + id + "/" + path), data);
        if(callback){
            callback()
        }
    },
    getPlayerDBData(user,callback){
        get(ref(db, `users/` + user.id)).then((snapshot) => {
            let data = snapshot.val();
            if(data == null){
                callback(false)
            } else {
                callback(data);
            }
        });
    },
    getServerDBData(serverID,callback){
        get(ref(db, `servers/` + serverID)).then((snapshot) => {
            let data = snapshot.val();
            if(data == null){
                let newServerData = {
                    qotd:false,
                    quote:false,
                }
                updateServerDBData(serverID,"",newServerData,function(){
                    callback(newServerData)
                })
            } else {
                callback(data);
            }
        });
    },
    updateAllServerDBData(servers){
        set(ref(db, 'servers/'), servers);
    },
    updateServerDBData(serverID,path,data,callback){
        updateServerDBData(serverID,path,data,callback)
    }
}