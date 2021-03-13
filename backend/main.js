const admin = require('firebase-admin');
const app = require('express')();
const http = require('http').createServer(app);

const rooms = require("./rooms/rooms");
const io = require('socket.io')(http);

const path = require('path');

var serviceAccount = require("./firebase-config/chromechat-2d5d5-firebase-adminsdk-248o3-b99106582a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chromechat-2d5d5-default-rtdb.europe-west1.firebasedatabase.app"
});

var db = admin.database();
var ref = db.ref("/some_resource");
ref.once("value", function(snapshot) {
    console.log(snapshot.val());
})

var usersRef = ref.child("users")
usersRef.set({
    bruh: {
        date_of_birth: "June 23, 1912",
        full_name: "Alan Turing"
    }
})

app.get('/', (req, res) => {
    res.sendFile(path.resolve('temp.html'));
});


const PORT = 2000;

rooms.roomManagement(io);

http.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
});