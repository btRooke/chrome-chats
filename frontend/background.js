const socket = io("http://chat-rooms.ddns.net:2000/")


let user = {
    "username": "default",
    "pagination": 50,
    "current_url": "chrome-chat.ddns.net",
    "messages": [],
    "numUsers": 0,
    "activeTab": 0
}

socket.on("ping", () => {
    console.log("connected");
})

socket.on('joined-room', url => {
    console.log(`room joined: ${JSON.stringify(url)}`);
    user.current_url = url;
});

socket.on("message", data => {
    console.log(`Message: ${data}`);
    // request is in the form: { request, payload }
    chrome.runtime.sendMessage({request: 'message', message: data})
    user.messages.push(data);
});

socket.on("users-changed", numUsers => {
    user.numUsers = numUsers;
    chrome.runtime.sendMessage({request: 'update-users', numUsers});
});

socket.on("get-history", messages => {
    messages.forEach(msg => {
        console.log(msg);
        user.messages.push(msg);
        chrome.runtime.sendMessage({request: "message", message: msg});
    });
});

// request is in the form: { request, payload }
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(`Request: ${JSON.stringify(request)}`);

        switch (request.request) {

            case "send-message":
                sendMessage(request.message);
                sendResponse("Message sent");
                break;

            case "send-image":
                sendImage(request.message);
                sendResponse("Image sent");
                break;

            case "change-username":
                user.username = request.username;
                break;

            case "get-messages":
                getMessages(request.message);
                break;

            case "request-data":
                sendResponse(user);
                break;

        }
    }
)

function sendImage(message) {
    socket.emit("send-image", {username: user.username, message, url: user.current_url});
}

function sendMessage(message) {
    console.log(user.current_url);
    socket.emit("send-message", {username: user.username, message, url: user.current_url});
}

function getMessages(currentTotal) {
    console.log(`Requesting ${user.pagination} items of pagination, currently have ${currentTotal}.`);
    socket.emit("get-messages", { url: user.current_url, totalMessages: currentTotal, pagination: user.pagination });
}

function joinRoom(url) {
    socket.emit("room-request", {username: user.username, url});
}

function leaveCurrentRoom() {
    socket.emit("leave-room", user.current_url);
    user.messages = [];
    user.numUsers = 0;
}

chrome.tabs.onActivated.addListener(function(tab){
    chrome.tabs.get(tab.tabId, (tabObj) => {
        let url = tabObj.url;
        user.activeTab = tab.tabId;
        if (url != user.current_url) {
            leaveCurrentRoom();
            joinRoom(url);
        }
    })
});

chrome.tabs.onUpdated.addListener(function(tabId){
    chrome.tabs.get(tabId, (tabObj) => {
        let url = tabObj.url;
        if (url != user.current_url && user.activeTab == tabId) {
            leaveCurrentRoom();
            joinRoom(url);
        }
    })
});
