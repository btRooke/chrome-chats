

document.querySelector("#username-text-box").addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        console.log(e.target.value.trim());
        chrome.runtime.sendMessage({request: 'change-username', username: e.target.value.trim()});
        e.target.value = "";
    }
});

// https://developer.chrome.com/docs/extensions/mv2/options/
// Saves options to chrome.storage
function save_options() {
    var username = document.getElementById('username-text-box').value;
    var colour = document.getElementById('colour').value;
    // var pagination = document.getElementById('pagination').value; // deprecated
    chrome.storage.sync.set({
        username: username,
        colour: colour
        // pagination: pagination // deprecated
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value colour = 'Red'.
    chrome.storage.sync.get({
        username: '',
        colour: 'Red',
        // pagination: 100 // deprecated
    }, function(items) {
        document.getElementById('username-text-box').value = items.username;
        document.getElementById('colour').value = items.colour;
        // document.getElementById('pagination').value = items.pagination; // deprecated
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
                                                 save_options);
