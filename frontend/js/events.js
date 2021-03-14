chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(`request: ${JSON.stringify(request)}`)

        switch (request.request) {
            case "message":
                let messageObj = request.message;
                addMessage(messageObj);
                break;
            case "update-users":
                console.log("users updated!");
                box.updateNumberOfUsers(request.numUsers);
                break;
            case "add-messages":
                console.log(request.messages)
                request.messages.forEach(msg => {
                    addMessage(msg);
                });
        }
    }
);

function addMessage(messageObj) {
    const time = new Date(messageObj.timestamp);
    const timeString = `${time.getHours()}:${time.getMinutes()} ${time.getDate()}/${time.getMonth()}/${time.getFullYear()}`;

    console.log(`MESSAGE: ${JSON.stringify(messageObj)}`)

    if (!messageObj.isImage) {
        box.addMessage(messageObj.username, timeString, messageObj.message);
    } else {
        // Convert the image to base 64.
        blobFromBase64(messageObj.message).then(blob => {
            box.addImageMessage(messageObj.username, timeString, blob);
        });
    }
}


function sortByTimeStamp(o1, o2) {
    return -o1.timestamp.localeCompare(o2.timestamp);
}

chrome.runtime.sendMessage({request: 'request-data'}, function (resp) {
    box.updateNumberOfUsers(resp.numUsers);
    resp.messages = resp.messages.sort(sortByTimeStamp);
    resp.messages.forEach(messageObj => {
        addMessage(messageObj);
    });
});



