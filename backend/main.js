// Firebase
const admin = require('firebase-admin');

const firebaseConfig = {
    apiKey: "AIzaSyB3SW_iZLe-yVxYyT5ZPl0RGXBtb_hqd-A",
    authDomain: "chromechat-2d5d5.firebaseapp.com",
    databaseURL: "https://chromechat-2d5d5-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "chromechat-2d5d5",
    storageBucket: "chromechat-2d5d5.appspot.com",
    messagingSenderId: "627408792415",
    appId: "1:627408792415:web:aab33f2343fcd94fbba4ea"
};

admin.initializeApp(firebaseConfig);

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