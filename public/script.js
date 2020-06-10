const socket = io();

const messageform = document.getElementById("send-container");
const messagecontainer = document.getElementById("message-container");
const messageinput = document.getElementById("message-input");

const name = prompt("Input your username: ");
const channel = prompt(
  "Input your channel name: (leave empty for global channel)"
);
const zeroPad = (num, places) => String(num).padStart(places, "0");

socket.emit("fetchinfo", channel);
socket.on("getinfo", text => {
  let msgs = text.split("\n");
  for (let i = 0; i < msgs.length - 1; i++) {
    appendmessage(
      msgs[i].slice(0, msgs[i].length - 20),
      msgs[i].slice(msgs[i].length - 20, msgs[i].length)
    );
  }
  window.scrollTo(0, document.body.scrollHeight);
});
function gettime() {
  let d = new Date();
  return (
    zeroPad(d.getDate().toString(), 2) +
    "/" +
    zeroPad(d.getMonth().toString(), 2) +
    "/" +
    d.getFullYear().toString() +
    "  " +
    zeroPad(d.getHours(), 2) +
    ":" +
    zeroPad(d.getMinutes(), 2) +
    ":" +
    zeroPad(d.getSeconds(), 2)
  );
}
appendmessage("you joined", gettime());
socket.emit("new-user", { name: name, channel: channel });

socket.on("chat-message", data => {
  console.log(data);
  if (data.channel != channel) return;
  let idx = data.message.length - 20;
  let msg = data.message.slice(0, idx);
  let ti = data.message.slice(idx, data.message.length);
  appendmessage(`${data.name} : ${msg}`, ti);
});
socket.on("user-connected", data => {
  if (data.channel != channel) return;
  var d = new Date();
  appendmessage(
    `${data.name} connected`,
    zeroPad(d.getDate().toString(), 2) +
      "/" +
      zeroPad(d.getMonth().toString(), 2) +
      "/" +
      d.getFullYear().toString() +
      "  " +
      zeroPad((d.getHours() + 8) % 24, 2) +
      ":" +
      zeroPad(d.getMinutes(), 2) +
      ":" +
      zeroPad(d.getSeconds(), 2)
  );
});

socket.on("user-disconnected", data => {
  if (data.channel != channel) return;
  appendmessage(`${data.name} disconnected`, gettime());
});

messageform.addEventListener("submit", e => {
  console.log("submitted");
  e.preventDefault();
  let message = messageinput.value;
  var d = new Date();
  message +=
    zeroPad(d.getDate().toString(), 2) +
    "/" +
    zeroPad(d.getMonth().toString(), 2) +
    "/" +
    d.getFullYear().toString() +
    "  " +
    zeroPad(d.getHours(), 2) +
    ":" +
    zeroPad(d.getMinutes(), 2) +
    ":" +
    zeroPad(d.getSeconds(), 2);
  let idx = message.length - 20;
  let msg = message.slice(0, idx);
  let ti = message.slice(idx, message.length);
  appendmessage(
    `You: ${message.slice(0, idx)}`,
    message.slice(idx, message.length)
  );
  socket.emit("send-chat-message", message);
  messageinput.value = "";
  window.scrollTo(0, document.body.scrollHeight);
});

function appendmessage(message, ti) {
  const messageelement = document.createElement("div");
  messageelement.className = "container";
  let pelement = document.createElement("p");
  pelement.innerText = message;
  let tielement = document.createElement("p");
  let spanelement = document.createElement("span");
  spanelement.className = "time-right";
  spanelement.innerText = ti;
  tielement.appendChild(spanelement);
  messageelement.appendChild(pelement);
  messageelement.appendChild(tielement);
  messagecontainer.append(messageelement);
}
