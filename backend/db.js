const admin = require('firebase-admin');
const db = admin.database();

const sites = db.ref("sites");          // Site messages stored here

module.exports.getMessages = function(url, arr) {
    sites.doc(url).child('messages').orderByKey()
        .on('child_added', (snapshot) => {
            arr.push(snapshot)
        })
}

module.exports.sendMessage = function(url, message) {
    message.timestamp = Date.now();

    sites.doc(url).child('messages')
        .push(message)
}