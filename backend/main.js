const admin = require('firebase-admin');

var serviceAccount = require("./chromechat-2d5d5-firebase-adminsdk-248o3-b99106582a.json");

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
        date_of_bith: "June 23, 1912",
        full_name: "Alan Turing"
    }
})