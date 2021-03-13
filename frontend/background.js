const socket = io("http://chat-rooms.ddns.net:2000/")


let user = {
    "username": "default",
    "pagination": 50,
    "current_url": undefined,
    "messages": []
}

socket.on("ping", () => {
    console.log("connected");
})

socket.on('joined-room', room => {
    console.log(`room joined: ${JSON.stringify(room)}`);
});

socket.on("message", data => {
    console.log(`Message: ${data}`);
    // request is in the form: { request, payload }
    chrome.runtime.sendMessage({request: 'message', message: data})
    user.messages.push(data);
});

// request is in the form: { request, payload }
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(`Request: ${JSON.stringify(request)}`);

        switch (request.request) {
            case "send-message":
                sendMessage(request.payload);
                sendResponse("Message sent");
                break;
            case "change-username":
                user.username = request.username;
                break;
            case "get-messages":
                sendResponse(user.messages);
                break;
        }
    }
)

function sendMessage(payload) {
    socket.emit("send-message", {username: user.username, message: payload});
}

function joinRoom(url) {
    socket.emit("room-request", {username: user.username, url});
}

function leaveCurrentRoom() {
    socket.emit("leave-room");
    user.messages = [];
}

chrome.tabs.onActivated.addListener(function(tab){
    chrome.tabs.get(tab.tabId, (tabObj) => {
        let url = tabObj.url;
        leaveCurrentRoom();
        joinRoom(url);
    })
});


