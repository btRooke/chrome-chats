
const ROOMS = {

}

function roomManagement(io) {
    io.on('connection', (socket) => {
        io.emit('ping');

        console.log('A user connected!');
        joinRoom(socket);
        sendMessage(io, socket);
    });
}


function joinRoom(socket) {
    socket.on('room-request', (data) => {
        if (ROOMS[data.url] == undefined)
            ROOMS[data.url] = true;

        socket.join(data.url);
        socket.emit("Connected to the chat!");
    });
}

function sendMessage(io, socket) {
    socket.on("send-message", (data) => {
        io.of(data.url).emit("message", {"username": data.username, "payload": data.payload})
    })
}

exports.roomManagement = roomManagement;