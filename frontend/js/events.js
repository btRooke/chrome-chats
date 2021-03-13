

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(`request: ${JSON.stringify(request)}`)
        debugger;

        switch (request.request) {
            case "message":
                let messageObj = request.message;
                let time = new Date();
                console.log(`Message: ${JSON.stringify(messageObj)}`)
                box.addMessage(messageObj.username, new Date(messageObj.timestamp), messageObj.message)
        }
    }
)