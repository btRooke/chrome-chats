

document.querySelector("#username-text-box").addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        console.log(e.target.value.trim());
        chrome.runtime.sendMessage({request: 'change-username', username: e.target.value.trim()});
        e.target.value = "";
    }

});
