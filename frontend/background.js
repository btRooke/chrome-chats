const socket = io("http://chat-rooms.ddns.net:2000/")

console.log("hmmmm");

socket.on("ping", () => {
    console.log("connected");
})
