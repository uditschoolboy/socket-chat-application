const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const socket = io();

//Get username and room from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

//Join chatRoom
socket.emit('joinRoom', {username, room});


//Message from server
socket.on('message', message => {
    outputMessage(message);

    //scroll Down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});


//Get room info
socket.on('roomUsers', roomInfo => {
    //Setting room name
    const roomName = document.getElementById('room-name');
    roomName.innerHTML = roomInfo.room;
    
    //Setting room members
    const users = document.getElementById('users');
    users.innerHTML = roomInfo.users.map(user => {
        return `<li>${user.username}</li>`
    }).join('');
});


//Message Submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Get msg text
    const msg = e.target.elements.msg.value;

    //Emitting a message to server
    socket.emit('chatMessage', msg);

    //clear the text-feild
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});


//Output message to dom 
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}