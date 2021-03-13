chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(`request: ${JSON.stringify(request)}`)
        debugger;

        switch (request.request) {
            case "message":
                let messageObj = request.message;
                console.log(`Message: ${JSON.stringify(messageObj)}`)
                const time = new Date(messageObj.timestamp);
                const timeString = `${time.getHours()}:${time.getMinutes()} ${time.getDate()}`;
                box.addMessage(messageObj.username, timeString, messageObj.message);
                break;
            case "users-changed":

                break;
        }
    }
);




chrome.runtime.sendMessage({request: 'get-messages'}, function (messages) {
    messages.forEach(messageObj => {
        const time = new Date(messageObj.timestamp);
        const timeString = `${time.getHours()}:${time.getMinutes()} ${time.getDate()}`;
        box.addMessage(messageObj.username, timeString, messageObj.message);
    });
});



