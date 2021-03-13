const db = require('../db')
const crypto = require('crypto');

const ROOMS = {}

class Room {
    constructor(url, io) {
        this.url = url;
        this.hash = crypto.createHash('sha256').update(this.url).digest('hex');
        this.users = [];
        this.messages = [];
        db.getMessages(this, io);
    }

    addUser(username) {
        this.users.push(username);
    }

    addMessage(username, payload) {
        db.sendMessage(this.hash, {'username': username, 'message': payload})
    }
}

function roomManagement(io) {
    io.on('connection', (socket) => {
        io.emit('ping');
        joinRoom(io, socket);
    });
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

        room.addUser(data.username);

        console.log(`Joined Room`)

        socket.emit("joined-room", {room: room.url});
        sendMessage(io, socket, room);
    });
}

function sendMessage(io, socket, room) {
    socket.on('send-message', (data) => {
        room.addMessage(data.username, data.message);
    });
}

exports.roomManagement = roomManagement;