/*const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const db = admin.database();                // Messages stored here
const images = admin.storage().bucket();    // Images stored here

module.exports.getMessages = function(room, io) {
    db.ref('sites/' + room.hash).child('messages')
        .orderByKey()
        //.limitToLast(number)
        .on('child_added', (snapshot) => {
            loadMessage(snapshot, (doc) => {
                room.messages.push(doc);
                console.log(JSON.stringify(doc));
                //room.loadedMessages++;
                io.to(room.hash).emit('message', doc);
            });
        }, (error) => console.log(error));
}

module.exports.getNextPage = function(room, socket, total, number) {
    db.ref('sites/' + room.hash).child('messages')
        .orderByKey()
        .endBefore(total)
        .limitToLast(number)
        .once('child_added', (snapshot) => {
            loadMessage(snapshot, (doc) => {
                room.messages.unshift(doc);
                //room.loadedMessages++;
            });
        }, (error) => console.log(error)).then();
}

module.exports.addMessage = function(hash, message) {
    message.timestamp = Date.now();
    message.imageURL = null;

    db.ref('sites/' + hash).child('messages').push(message);
}

module.exports.addImage = function(hash, message) {
    let doc = db.ref('sites/' + hash).child('messages').push();
    let token = uuidv4();

    images.upload(message.message, {
        destination: doc.key,
        metadata: {
            cacheControl: 'max-age=31536000',
            metadata: {
                firebaseStorageDownloadTokens: token
            }
        }
    }).then(() => {
        message.message = token;
        message.timestamp = Date.now();
        message.imageURL = doc.key;
        doc.set(message).then();
    }).catch(err => {
        console.log(err);
    });
}

function loadMessage(doc, cb) {
    if (doc.child('imageURL')) {
        loadImage(doc, (image) => {
            doc.message = image;
            delete doc.imageURL;
            cb(doc);
        });
    } else {
        delete doc.imageURL;
        cb(doc);
    }
}

function loadImage(doc, cb) {
    let url = createDownloadUrl(images.name, doc.key, doc.message)
    fetch(url).then(res => cb(res.blob()));
}

function createDownloadUrl(bucket, pathToFile, downloadToken) {
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/
            ${encodeURIComponent(pathToFile)}?alt=media&token=${downloadToken}`;
}*/

const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const db = admin.database();                // Messages stored here
const images = admin.storage().bucket();    // Images stored here

module.exports.getMessages = function(room, io) {
    db.ref('sites/' + room.hash).child('messages').orderByKey()
        .on('child_added', (snapshot) => {
            if (snapshot.child('imageURL')) {
                loadImage(snapshot, (image) => {
                    snapshot.message = image;
                    delete snapshot.imageURL;
                    room.messages.push(snapshot);
                    io.to(room.hash).emit('message', snapshot);
                });
            } else {
                delete snapshot.imageURL;
                room.messages.push(snapshot);
                io.to(room.hash).emit('message', snapshot);
            }
        }, (error) => console.log(error));
}


module.exports.addMessage = function(hash, message) {
    message.timestamp = Date.now();
    message.imageURL = null;

    db.ref('sites/' + hash).child('messages').push(message);
}


module.exports.addImage = function(hash, message) {
    let doc = db.ref('sites/' + hash).child('messages').push();
    let token = uuidv4();

    images.upload(message.message, {
        destination: doc.key,
        metadata: {
            cacheControl: "max-age=31536000",
            metadata: {
                firebaseStorageDownloadTokens: token
            }
        }
    }).then(() => {
        message.message = token;
        message.timestamp = Date.now();
        message.imageURL = doc.key;
        doc.set(message).then();
    }).catch(err => {
        console.log(err);
    });
}


function loadImage(doc, cb) {
    let url = createDownloadUrl(images.name, doc.key, doc.message)
    fetch(url).then(res => cb(res.blob()));
}

const createDownloadUrl = (bucket, pathToFile, downloadToken) => {
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/
            ${encodeURIComponent(pathToFile)}?alt=media&token=${downloadToken}`;
};