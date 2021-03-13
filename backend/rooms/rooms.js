
const ROOMS = {}

class Room {
    constructor(url) {
        this.url = url
        this.players = []
        this.messages = []
    }

    addPlayer(player_name) {
        this.players.push(player_name);
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
        if (ROOMS[data.url] == undefined) {
            ROOMS[data.url] = new Room(data.url)
        }

        ROOMS[data.url].addPlayer(data.username);
        socket.join(data.url);

        console.log(`Joined Room: ${JSON.stringify(ROOMS[data.url])}`)

        socket.emit("joined-room", ROOMS[data.url]);
        sendMessage(io, socket, ROOMS[data.url], data.username);
    });
}


function sendMessage(io, socket, room, username) {
    socket.on('send-message', (data) => {
        console.log(`message received: ${JSON.stringify(data)}`);

        // Send the message to all players in the room.
        console.log(`Rooms: ${JSON.stringify(room)}`);
        room.messages.push(data);
        io.to(room.url).emit('message', {username, message: data.message});
    })
}

exports.roomManagement = roomManagement;