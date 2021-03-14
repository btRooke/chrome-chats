chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(`request: ${JSON.stringify(request)}`)

        switch (request.request) {
            case "message":
                let messageObj = request.message;
                console.log(`Message: ${JSON.stringify(messageObj)}`)
                const time = new Date(messageObj.timestamp);
                const timeString = `${time.getHours()}:${time.getMinutes()} ${time.getDate()}/${time.getMonth()}/${time.getFullYear()}`;

                if (!messageObj.isImage) {
                    box.addMessage(messageObj.username, timeString, messageObj.message);
                } else {
                    // Convert the image to base 64.
                    console.log(`${JSON.stringify(messageObj)}`);
                    blobFromBase64(messageObj.message).then(blob => {
                        box.addImageMessage(messageObj.username, timeString, blob);
                    });
                }

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



