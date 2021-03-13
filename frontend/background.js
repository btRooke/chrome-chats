const socket = io.connect("http://chat-rooms.ddns.net:2000/")

io.on("ping", () => {
    console.log("Connected to server!");
});