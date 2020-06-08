var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;
var fs = require("fs");
app.use(express.static("public"));
server.listen(port, function() {
  console.log("Server listening at port %d", port);
});

const username = {};
const channels = {};
io.on("connection", socket => {
  socket.on("fetchinfo", channel => {
    fs.appendFileSync("r" + channel + ".txt", "");
    io.to(socket.id).emit("getinfo", fs.readFileSync("r" + channel + ".txt", "utf8"))
  });
  socket.on("new-user", data => {
    username[socket.id] = data.name;
    channels[socket.id] = data.channel;
    socket.broadcast.emit("user-connected", {
      name: data.name,
      channel: data.channel
    });
    fs.appendFileSync("r" + data.channel + ".txt", data.name + " connected\n");
  });
  socket.on("send-chat-message", message => {
    socket.broadcast.emit("chat-message", {
      message: message,
      name: username[socket.id],
      channel: channels[socket.id]
    });
    fs.appendFileSync("r" + channels[socket.id] + ".txt", username[socket.id] + ": " + message + "\n");
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", {
      name: username[socket.id],
      channel: channels[socket.id]
    });
    fs.appendFileSync(
      "r" + channels[socket.id] + ".txt",
      username[socket.id] + " disconnected\n"
    );
    delete username[socket.id];
    delete channels[socket.id];
  });
});
