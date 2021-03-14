chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(`request: ${JSON.stringify(request)}`)
        debugger;

        switch (request.request) {
            case "message":
                let messageObj = request.message;
                console.log(`Message: ${JSON.stringify(messageObj)}`)
                const time = new Date(messageObj.timestamp);
                const timeString = `${time.getHours()}:${time.getMinutes()} ${time.getDate()}/${time.getMonth()}/${time.getFullYear()}`;
                box.addMessage(messageObj.username, timeString, messageObj.message);
                break;
            case "update-users":
                console.log("users updated!");
                box.updateNumberOfUsers(request.numUsers);
                break;
        }
    }
);


chrome.runtime.sendMessage({request: 'request-data'}, function (resp) {
    box.updateNumberOfUsers(resp.numUsers);
    resp.messages.forEach(messageObj => {
        const time = new Date(messageObj.timestamp);
        const timeString = `${time.getHours()}:${time.getMinutes()} ${time.getDate()}/${time.getMonth()}/${time.getFullYear()}`;
        box.addMessage(messageObj.username, timeString, messageObj.message);
    });
});



