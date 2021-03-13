const socket = io("http://chat-rooms.ddns.net:2000/")


let user = {
    "username": "default",
    "pagination": 50
}

socket.on("ping", () => {
    console.log("connected");
})

socket.emit('room-request', {username: user.username, url: "http://google.com"});

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
            case "change-username":
                user.username = request.username;
        }
    }
)

function sendMessage(payload) {
    socket.emit("send-message", {message: payload});
}


