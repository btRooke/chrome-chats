//const db = require('../db')
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
                this.messages.push(added);
            }
        });
    }

    addImage(username, payload) {
        console.log(`Image sent`);
        query.addMessage(this.url, username, payload, true, (added) => {
            this.messages.push(added)
        });
    }
}

function roomManagement(io) {
    io.on('connection', (socket) => {
        joinRoom(io, socket);
        getMessages(io, socket);
        sendMessage(io, socket);
        sendImage(io, socket);
        leaveRoom(io, socket);
    });
}

function leaveRoom(io, socket) {
    socket.on("leave-room", (url) => {
        if (url) {
            let room = ROOMS[url];
            if (room) {
                try {
                    socket.leave(room.url);
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
    io.to(room.url).emit("users-changed", numUsers);
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


function getMessages(io, socket) {
    socket.on('get-messages', (data) => {
        let room = ROOMS[data.url];

        console.log(JSON.stringify(data));
        if (!room) {
            return null;
        }

        if (!room.messages) {
            query.getMessages(data.url, data.totalMessages, (messages) => {
                if (messages) {
                    room.messages = messages;

                    console.log(JSON.stringify(messages));
                    socket.emit("messages", messages);
                }
            });
        } else {
            return room.messages;
        }
    });
}

function sendMessage(io, socket) {
    socket.on('send-message', (data) => {
        let room = ROOMS[data.url];
        if (room) {
            room.addMessage(data.username, data.message);
            io.in(data.url).emit("message", {username: data.username, message: data.message, timestamp: new Date()});
        }
    });
}

function sendImage(io, socket) {
    socket.on('send-image', (data) => {
        let room = ROOMS[data.url];
        if (room) {
            room.addImage(data.username, data.message);
            io.in(data.url).emit("message", {username: data.username, message: data.message, isImage: true, timestamp: new Date()});
        }
    });
}

exports.roomManagement = roomManagement;