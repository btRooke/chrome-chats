

document.querySelector("#username").addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        chrome.runtime.sendMessage({request: 'change-username', username: e.target.value.trim()});
    }
});