

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(`request: ${JSON.stringify(request)}`)
        debugger;

        switch (request.request) {
            case "message":
                let messageObj = request.payload;
                let time = new Date();
                box.addMessage(messageObj.username, time.setTime(messageObj.timestamp), messageObj.message)
        }

    }
)