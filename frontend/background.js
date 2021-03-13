const socket = io("http://chat-rooms.ddns.net:2000/")

console.log("hmmmm");

class User {
    constructor(username, url) {
        this.username = username;
        this.url = url;
    }
}

let user = new User("tim", "https://www.google.co.uk");

socket.on("ping", () => {
    console.log("connected");
})


socket.emit('room-request', {username: "tim", url: "http://google.com"});

socket.on('joined-room', room => {
    console.log(`room joined: ${JSON.stringify(room)}`);
});

socket.on("message", data => {
    console.log(`Message: ${data}`);
    // request is in the form: { request, payload }
    chrome.runtime.sendMessage({request: 'message', message: data})
});

// request is in the form: { request, payload }
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(`Request: ${JSON.stringify(request)}`);

        switch (request.request) {
            case "send-message":
                sendMessage(request.payload);
                sendResponse("Message sent");
        }
    }
)

function sendMessage(payload) {
    socket.emit("send-message", {message: payload});
}

