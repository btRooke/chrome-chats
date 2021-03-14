const urlRegex = /(?<url>https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g;

function processText(text) {
    text = text.replace(urlRegex, `<a class="popup_url" href="url">$<url></a>`);
    return text;

}

function blobToBase64(fileBlob) {

    return new Promise((resolve, reject) => {

        let reader = new FileReader();
        reader.readAsDataURL(fileBlob);

        reader.onloadend = function() {
            resolve(reader.result)
        }

    })

}

function blobFromBase64(dataurl) {

    return new Promise((resolve, reject) => {

        let arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);

        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }

        resolve(new File([u8arr], "file", {type:mime}));

    })

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

        // scroll listener

        this.messagesElement.addEventListener("scroll", () => this.scrollHandler());

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

        this.clearPrimedImage();
        this.scrollToBottom();

    }

    sendMessage() {

        let message = this.messageBarElement.value.trim();

        if (this.imagePrimed) {

            blobToBase64(this.primedImage).then(b => {

                chrome.runtime.sendMessage({
                    request: "send-image",
                    message: b
                }, (resp) => console.log(resp));

                this.clearPrimedImage();

            });

        }

        else {

            if ("" !== message) {
                chrome.runtime.sendMessage({
                    request: "send-message",
                    message: message
                }, (resp) => console.log(resp));

                this.messageBarElement.value = "";
            }

        }

    }

    addImageMessage(nameString, dateString, imageFileBlob) {

        const wasScrolledToBottom = this.isScrolledToBottom();

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
            if (wasScrolledToBottom) {
                this.scrollToBottom();
            }
        }

        reader.readAsDataURL(imageFileBlob);

        content.appendChild(image);

    }

    addMessage(nameString, dateString, contentString) {

        const wasScrolledToBottom = this.isScrolledToBottom();

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
                chrome.tabs.create({url: e.target.innerHTML});
            });

            window.close();

        }));


        meta.appendChild(name);
        meta.appendChild(time);

        message.appendChild(meta);
        message.appendChild(content);

        this.messagesElement.appendChild(message);

        if (wasScrolledToBottom) {
            this.scrollToBottom();
        }

    }

    isScrolledToBottom() {
        return box.messagesElement.scrollHeight - box.messagesElement.scrollTop - box.messagesElement.offsetHeight === 0
    }

    scrollToBottom() {
        if (this.messagesElement.scrollHeight) {
            this.messagesElement.scrollTop = this.messagesElement.scrollHeight;
        }
    }

    pasteHandler(e) {

        this.load();

        const data = e.clipboardData;
        console.log(data, data.types, data.files);

        if (data.files.length > 0 && data.files[0].type.match("image/.*")) {
            this.primeImage(data.files[0]);
            e.preventDefault();
        }

        else{
            this.clearPrimedImage();
        }

    }

    primeImage(imageFile) {

        if (!this.imagePrimed) {

            const wasScrolledToBottom = this.isScrolledToBottom();

            this.imagePrimed = true;
            this.primedImage = imageFile;
            console.log(this.primedImage);

            this.messageBarElement.disabled = true;
            this.messageBarElement.value = "";

            const reader = new FileReader();

            reader.onload = e => {
                this.primedImageElement.setAttribute("src", e.target.result);
            }

            reader.readAsDataURL(imageFile);

            if (wasScrolledToBottom) {
                this.scrollToBottom();
            }

        }

    }

    load() {
        this.primedImageElement.setAttribute("src", "assets/loading.gif");
        this.primedImageContainer.style.display = "flex";
    }

    clearPrimedImage() {
        this.messageBarElement.disabled = false;
        this.primedImageContainer.style.display = "none";
        this.imagePrimed = false;
    }

    updateNumberOfUsers(n) {
        this.onlineCounter.innerHTML = `${n}`;
    }

    scrollHandler() {

        if (this.messagesElement.scrollHeight > this.messagesElement.offsetHeight && this.messagesElement.scrollTop === 0) {
            chrome.runtime.sendMessage({
                request: "get-messages"
            }, (resp) => console.log(resp));
        }

    }

}

const elem = document.querySelector(".popup");
const box = new MessageBox(elem);