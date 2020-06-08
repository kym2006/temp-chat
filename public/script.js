
const socket = io()

const messageform = document.getElementById("send-container")
const messagecontainer = document.getElementById("message-container")
const messageinput = document.getElementById("message-input")

const name = prompt('Input your username: ')
const channel = prompt("Input your channel name: (leave empty for global channel)")


socket.emit("fetchinfo", channel)
socket.on("getinfo", text => {
  let msgs = text.split('\n')
  for(let i = 0; i<msgs.length-1; i++) {
    appendmessage(msgs[i])
  }
})
appendmessage('you joined')
socket.emit('new-user', {name : name, channel : channel})

socket.on("chat-message", data => {
  console.log(data)
  if(data.channel != channel)return;
  appendmessage(`${data.name} : ${data.message}`)

})
socket.on("user-connected", data => {
    if(data.channel != channel)return;
    appendmessage(`${data.name} connected`)

})

socket.on('user-disconnected', data => {
    if(data.channel != channel)return;
    appendmessage(`${data.name} disconnected`)

})

messageform.addEventListener('submit', e =>{
    console.log('submitted')
    e.preventDefault()
    const message = messageinput.value 
    appendmessage(`You: ${message}`)
    socket.emit('send-chat-message', message)
    messageinput.value = ''
})

function appendmessage(message){
    const messageelement = document.createElement("div")
    messageelement.className = 'container'
    let pelement = document.createElement('p')
    pelement.innerText = message
    messageelement.appendChild(pelement)
    messagecontainer.append(messageelement)
}