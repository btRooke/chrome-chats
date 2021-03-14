//const db = require('../db')
const crypto = require('crypto');
const query = require('../db/query')

const ROOMS = {}

class Room {
    constructor(url, io) {
        this.url = url;
        this.messages = [];
        this.numUsers = 0;
        this.io = io;
    }

    addUser() {
        this.numUsers++;
    }

    removeUser() {
        this.numUsers--;
    }

    addMessage(username, payload) {
        console.log(`Message sent: ${JSON.stringify(payload)}`);
        query.addMessage(this.url, username, payload, false, (added) => {
            if (added) {
                this.io.of(this.url).emit("message", {username, message: payload});
            }
        });
        // db.addMessage(this.hash, {'username': username, 'message': payload});
    }

    addImage(username, payload) {
       // db.addImage(this.hash, {'username': username, 'message': payload, 'isImage': true});
    }
}

function roomManagement(io) {
    io.on('connection', (socket) => {
        joinRoom(io, socket);
        sendMessage(io, socket);
        sendImage(io, socket);
        leaveRoom(io, socket)
    });
}

function leaveRoom(io, socket) {
    socket.on("leave-room", (url) => {
        if (url) {
            let room = ROOMS[url];
            if (room) {
                try {
                    socket.leave(room.hash);
                    emitUserUpdate(io, room, true);
                } catch (e) {
                    console.log("couldn't leave room")
                }
            }
        }
    })
}

function emitUserUpdate(io, room, leave) {
    if (leave)
        room.removeUser();
    else
        room.addUser();

    const numUsers = room.numUsers;
    io.to(room.hash).emit("users-changed", numUsers);
}

function joinRoom(io, socket) {
    socket.on('room-request', (data) => {
        console.log(`Join Request: ${JSON.stringify(data)}`);

        socket.join(data.url);

        if (!ROOMS[data.url]) {
            ROOMS[data.url] = new Room(data.url, io);
        }

        let room = ROOMS[data.url];
        console.log(`Joined Room`)

        emitUserUpdate(io, room, false);

        socket.emit("joined-room", room.url);
    });
}

function sendMessage(io, socket) {
    socket.on('send-message', (data) => {
        let room = ROOMS[data.url];
        if (room) {
            console.log(`${JSON.stringify(data)}`);
            room.addMessage(data.username, data.message);
        }
    });
}

function sendImage(io, socket) {
    socket.on('send-image', (data) => {
        let room = ROOMS[data.url];

        if (room) {
            room.addImage(data.username, data.message);
        }
    });
}

exports.roomManagement = roomManagement;