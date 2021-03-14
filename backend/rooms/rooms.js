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
                console.log(`Message added to database`);
            }
        });
        // db.addMessage(this.hash, {'username': username, 'message': payload});
    }

    addImage(username, payload) {
        console.log(`Image sent`);
        query.addMessage(this.url, username, payload, true, (added) => {
            console.log("Image added!");
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
        if (room) {
            let wanted = data.totalMessages + data.pagination;
            if (wanted <= room.messages.length) {
                socket.emit("messages", room.messages.slice(data.totalMessages + 1, wanted + 1)).reverse();
            } else {
                query.getMessages(data.url, data.totalMessages, wanted, (messages) => {
                    if (messages) {
                        room.messages.unshift(messages);
                        socket.emit("messages", messages);
                    }
                })
            }
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