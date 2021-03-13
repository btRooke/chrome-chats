
function changeUserName(event) {
    chrome.runtime.sendMessage({request: 'change-username', username: event.target.value.trim()});
    event.target.value = "";
}

