class MessageBox {

    constructor(messageBoxElement) {

        this.element = messageBoxElement;

        this.messagesElement = messageBoxElement.querySelector(".messages");
        this.messageBarElement = messageBoxElement.querySelector(".message_bar");
        this.sendButton = messageBoxElement.querySelector(".send_button");

        this.sendButton.addEventListener("click", () => this.sendMessage());

        this.messageBarElement.onkeypress = (e) => {
            if (e.keyCode === 13) {
                this.sendMessage();
            }
        }

        this.pageTitle = messageBoxElement.querySelector(".site_name");

        chrome.tabs.query(
            { active: true, currentWindow: true },
            (tabs) => { console.log(tabs[0]); this.pageTitle.innerHTML = tabs[0].title }
        );

        this.scrollToBottom();

    }

    sendMessage() {

        let message = this.messageBarElement.value.trim();

        if ("" === this.messageBarElement.value.trim()) {
            return;
        }

        chrome.runtime.sendMessage({request: "send-message", payload: message}, (resp) => console.log(resp));

        this.messageBarElement.value = "";
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
        content.innerHTML = contentString;

        meta.appendChild(name);
        meta.appendChild(time);

        message.appendChild(meta);
        message.appendChild(content);

        this.messagesElement.appendChild(message);

        this.scrollToBottom();

    }

    scrollToBottom() {
        this.messagesElement.scrollTop = this.messagesElement.scrollHeight; 
    }

}

const elem = document.querySelector(".popup");
const box = new MessageBox(elem);

