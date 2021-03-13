const admin = require('firebase-admin');

// Your web app's Firebase configuration
var admin = require("firebase-admin");

var serviceAccount = require("path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chromechat-2d5d5-default-rtdb.europe-west1.firebasedatabase.app"
});

