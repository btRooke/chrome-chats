

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(`request: ${JSON.stringify(request)}`)
        debugger;

        switch (request.request) {
            case "message":
                let messageObj = request.payload;
                box.addMessage(messageObj.username, (new Date()).getDate(), messageObj.message)
        }

    }
)