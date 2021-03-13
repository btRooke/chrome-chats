// Firebase
const admin = require('firebase-admin');
const app = require('express')();
const http = require('http').createServer(app);

const rooms = require("./rooms/rooms");
const io = require('socket.io')(http, {
    cors: {
        origin: "chrome-extension://*",
        allowEIO3: true
    }
});

const path = require('path');

const serviceAccount = require('./firebase-config/chromechat-2d5d5-firebase-adminsdk-248o3-b99106582a.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://chromechat-2d5d5-default-rtdb.europe-west1.firebasedatabase.app'
});

// Express
const app = require('express')();
app.get('/', (req, res) => {
    res.sendFile(path.resolve('temp.html'));
});

// http and socket.io
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const PORT = 2000;

io.on('connection', (socket) => {
    console.log('A user connected!');
});

http.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
});

const rooms = require('./rooms/rooms')
rooms.roomManagement(io);