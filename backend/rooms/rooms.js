const db = require('../db')

const ROOMS = {}

class Room {
    constructor(url) {
        this.url = url;
        this.users = [];
        this.messages = [];
    }

    addUser(username) {
        this.users.push(username);
    }

    addMessage(message) {
        this.messages.push(message);
    }
}

function roomManagement(io) {
    io.on('connection', (socket) => {
        io.emit('ping');

        console.log('A user connected!');
        joinRoom(io, socket);
    });
}

function joinRoom(io, socket) {
    socket.on('room-request', (data) => {
        /*if (!ROOMS[data.url]) {
            ROOMS[data.url] = db.getMessages(data.url, []);
        }*/
        if (ROOMS[data.url] == undefined) {
            ROOMS[data.url] = new Room(data.url)
        }

        socket.join(data.url);

        ROOMS[data.url].addUser(data.username);

        console.log(`Joined Room: ${JSON.stringify(ROOMS[data.url])}`)

        socket.emit("joined-room", ROOMS[data.url]);
        sendMessage(io, socket, ROOMS[data.url], data.username);
    });
}


function sendMessage(io, socket, room, username) {
    socket.on('send-message', (data) => {
        // db.sendMessage(data.url, {'username': data.username, 'payload': data.payload})
        console.log(`message received: ${JSON.stringify(data)}`);

        // Send the message to all players in the room.
        console.log(`Rooms: ${JSON.stringify(room)}`);
        room.addMessage(data.message);
        io.to(room.url).emit('message', {username, message: data.message});
    })
}

exports.roomManagement = roomManagement;