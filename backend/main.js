// Firebase
const admin = require('firebase-admin');
const serviceAccount = require("./firebase-config/chromechat-2d5d5-firebase-adminsdk-248o3-b99106582a.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chromechat-2d5d5-default-rtdb.europe-west1.firebasedatabase.app"
});

// Express
const app = require('express')();
const bodyParser = require('body-parser')
const PORT = 2000;

require('./routes/routes')(app)

app.use(bodyParser)
app.listen(PORT);
app.get('/', (req, res) => {
    res.sendFile(path.resolve('temp.html'));
});

// http and socket.io
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

io.on('connection', (socket) => {
    console.log('A user connected!'); 
});

http.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
});