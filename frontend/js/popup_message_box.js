const urlRegex = /(?<url>https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g

function processText(text) {
    text = text.replace(urlRegex, `<a class="popup_url" href="url">$<url></a>`);
    return text

}

class MessageBox {

    constructor(messageBoxElement) {

        this.imagePrimed = false;
        this.primedImage = undefined;


        // get elements

        this.element = messageBoxElement;
        this.messagesElement = messageBoxElement.querySelector(".messages");
        this.messageBarElement = messageBoxElement.querySelector(".message_bar");
        this.sendButton = messageBoxElement.querySelector(".send_button");
        this.primedImageElement = messageBoxElement.querySelector(".primed");
        this.primedImageContainer = messageBoxElement.querySelector(".primed_image_container");
        this.unprime = messageBoxElement.querySelector(".unprime");
        this.onlineCounter = messageBoxElement.querySelector(".online_counter");

        // send button listeners

        this.sendButton.addEventListener("click", () => this.sendMessage());

        document.onkeypress = (e) => {
            if (e.keyCode === 13) {
                this.sendMessage();
            }
        }

        // unprime listener

        this.unprime.addEventListener("click", () => this.clearPrimedImage());

        // set the title to be the title

        this.pageTitle = messageBoxElement.querySelector(".site_name");

        chrome.tabs.query(
            { active: true, currentWindow: true },
            (tabs) => { this.pageTitle.innerHTML = tabs[0].title }
        );

        // paste listener

        this.messageBarElement.addEventListener("paste", (e) => this.pasteHandler(e));

        this.scrollToBottom();

    }

    sendMessage() {

        let message = this.messageBarElement.value.trim();

        if (this.imagePrimed) {
            chrome.runtime.sendMessage({
               request: "send-image",
               payload: this.primedImage
            }, (resp) => console.log(resp));
            this.clearPrimedImage();
        }

        else {

            if ("" !== this.messageBarElement.value.trim()) {
                chrome.runtime.sendMessage({request: "send-message", payload: message}, (resp) => console.log(resp));
                this.messageBarElement.value = "";
            }
        }

    }

    addImageMessage(nameString, dateString, imageFileBlob) {

        const message = document.createElement("div");
        message.setAttribute("class", "message");

        const meta = document.createElement("div");
        meta.setAttribute("class", "msg_meta");

        const name = document.createElement("div");
        name.setAttribute("class", "sender_name");
        name.innerHTML = nameString;

        const time = document.createElement("div");
        time.setAttribute("class", "time");
        time.innerHTML = dateString;

        const content = document.createElement("div");
        content.setAttribute("class", "content");

        const image = document.createElement("img");
        image.setAttribute("class", "content_image");

        meta.appendChild(name);
        meta.appendChild(time);

        message.appendChild(meta);
        message.appendChild(content);

        this.messagesElement.appendChild(message);

        const reader = new FileReader();

        reader.onload = e => {
            image.setAttribute("src", e.target.result);
        }

        reader.readAsDataURL(imageFileBlob);

        content.appendChild(image);

        this.scrollToBottom();

    }

    addMessage(nameString, dateString, contentString) {

        const message = document.createElement("div");
        message.setAttribute("class", "message");

        const meta = document.createElement("div");
        meta.setAttribute("class", "msg_meta");

        const name = document.createElement("div");
        name.setAttribute("class", "sender_name");
        name.innerHTML = nameString;

        const time = document.createElement("div");
        time.setAttribute("class", "time");
        time.innerHTML = dateString;

        const content = document.createElement("div");
        content.setAttribute("class", "content");
        content.innerHTML = processText(contentString);
        content.querySelectorAll("a").forEach(a => a.addEventListener("click", async (e) => {

            e.preventDefault();
            
            chrome.tabs.query({currentWindow: true, active: true}, (tab) => {
                chrome.tabs.update(tab.id, {url: e.target.innerHTML});
            });

            window.close();

        }));


        meta.appendChild(name);
        meta.appendChild(time);

        message.appendChild(meta);
        message.appendChild(content);

        this.messagesElement.appendChild(message);

        this.scrollToBottom();

    }

    scrollToBottom() {
        if (this.messagesElement.scrollHeight) {
            this.messagesElement.scrollTop = this.messagesElement.scrollHeight;
        }
    }

    pasteHandler(e) {

        const data = e.clipboardData;

        if (data.types[0] === "Files" && data.files[0].type.match("image/.*")) {
            this.primeImage(data.files[0]);
            e.preventDefault();

        }

    }

    primeImage(imageFile) {

        if (!this.imagePrimed) {

            this.imagePrimed = true;
            this.primedImage = imageFile;

            this.messageBarElement.disabled = true;
            this.messageBarElement.value = "";

            const reader = new FileReader();

            reader.onload = e => {
                this.primedImageElement.setAttribute("src", e.target.result);
            }

            reader.readAsDataURL(imageFile);

            this.primedImageContainer.style.display = "flex";

            this.scrollToBottom();

        }

    }

    clearPrimedImage() {
        this.messageBarElement.disabled = false;
        this.primedImageContainer.style.display = "none";
        this.imagePrimed = false;
    }

    updateNumberOfUsers(n) {
        this.onlineCounter.innerHTML = `${n}`;
    }

}

const elem = document.querySelector(".popup");
const box = new MessageBox(elem);

console.log("eekek");
chrome.runtime.sendMessage({request: 'get-messages'}, function (messages) {
    messages.forEach(messageObj => {
        const time = new Date(messageObj.timestamp);
        const timeString = `${time.getHours()}:${time.getMinutes()} ${time.getDate()}`;
        box.addMessage(messageObj.username, timeString, messageObj.message);
    });
});
