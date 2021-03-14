const db = require('../db')
const crypto = require('crypto');

const ROOMS = {}

class Room {
    constructor(url, io) {
        this.url = url;
        this.hash = crypto.createHash('sha256').update(this.url).digest('hex');
        this.messages = [];
        this.numUsers = 0;
        db.getMessages(this, io);
    }

    addUser() {
        this.numUsers++;
    }

    removeUser() {
        this.numUsers--;
    }

    addMessage(username, payload) {
        console.log(`Message sent: ${JSON.stringify(payload)}`);
        db.addMessage(this.hash, {'username': username, 'message': payload});
    }

    addImage(username, payload) {
        db.addImage(this.hash, {'username': username, 'message': payload, 'isImage': true});
    }
}

function roomManagement(io) {
    io.on('connection', (socket) => {
        io.emit('ping');
        joinRoom(io, socket);
    });
}

function leaveRoom(io, socket, room) {
    socket.on("leave-room", () => {
        emitUserUpdate(io, room, true);
        socket.leave(room.hash);
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

        let urlID = crypto.createHash('sha256').update(data.url).digest('hex');
        socket.join(urlID);

        if (!ROOMS[urlID]) {
            ROOMS[urlID] = new Room(data.url, io);
        }

        let room = ROOMS[urlID];

        console.log(`Joined Room`)

        emitUserUpdate(io, room, false);

        socket.emit("joined-room", {room: room.url});

        sendMessage(io, socket, room);
        sendImage(io, socket, room);
        leaveRoom(io, socket, room)
    });
}

function sendMessage(io, socket, room) {
    socket.on('send-message', (data) => {
        console.log(`${JSON.stringify(data)}`);
        room.addMessage(data.username, data.message);
    });
}

function sendImage(io, socket, room) {
    socket.on('send-image', (data) => {
        room.addImage(data.username, data.message);
    });
}

exports.roomManagement = roomManagement;