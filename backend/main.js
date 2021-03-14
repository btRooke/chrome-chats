// Express
const app = require('express')();
const path = require('path');
app.get('/', (req, res) => {
    res.sendFile(path.resolve('temp.html'));
});

// http and socket.io
const PORT = 2000;
const http = require('http').createServer(app);
const rooms = require("./rooms/rooms");
const io = require('socket.io')(http, {
    cors: {
        origin: "chrome-extension://*",
        allowEIO3: true
    }
});

io.on('connection', (_) => {
    console.log('A user connected!');
});

http.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
});

rooms.roomManagement(io);