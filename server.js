const express = require('express');
const app = express();
const color = require('colors');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

//server
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));


//run when client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {

        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        
        //Welcome current User
        console.log("new websocket connection...".blue);
        socket.emit('message', formatMessage('Admin', 'Welcome to ChatCord!'));

        //Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage('Admin', `${user.username} has joined the chat`));

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });



    //Listen for chat Message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });


    //Runs when client disconnects
    socket.on('disconnect', () => {
        const user = getCurrentUser(socket.id);
        if(user) {
            userLeave(socket.id);
            io.to(user.room).emit('message', formatMessage('Admin', `${user.username} has left the chat`));

            //Send room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});


const PORT = 3000;

server.listen(PORT, () => console.log(`Server Started at PORT ${PORT}`.yellow.bold));