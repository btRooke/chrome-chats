const admin = require('firebase-admin');
const db = admin.database();

module.exports.getMessages = function(room, io) {
    db.ref("sites/" + room.hash).child('messages').orderByKey()
        .on('child_added', (snapshot) => {
            room.messages.push(snapshot);
            io.to(room.hash).emit('message', snapshot);
        }, (error) => console.log(error));
}


module.exports.sendMessage = function(url, message) {
    message.timestamp = Date.now();
    console.log(JSON.stringify(message));
    db.ref("sites/" + url).child('messages').push(message)
}