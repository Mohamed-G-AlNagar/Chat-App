import express from 'express';
import {Server} from 'socket.io'
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN = "Admin"

const app = express();

//? to make the front files in public folder and to run on same server
app.use(express.static(path.join(__dirname,'public')))

const PORT = process.env.PORT || 3000;
const expressServer = app.listen(PORT, () => {
    console.log(`listening on :${PORT}`);
});

// state 
const UsersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray
    }
}

const io = new Server(expressServer,{
    cors: {
        // origin: 'http://localhost:3000'
        // origin: '*'
        origin: process.env.NODE_ENV === "production" ? false :  ['http://localhost:3001','http://127.0.0.1:3001']
    }
});

io.on('connection', socket => {
    console.log(`a user ${socket.id} connected`);
    
    //? emit the welcome message to all connected in the client side even me (upon connection - not inside listener)
    socket.emit('message',buildMsg(ADMIN,"WelcomeTo Chat App"))


    socket.on('enterRoom',({name,room})=>{
        //1- leave prev room if exist 

        const prevRoom  = getUser(socket.id)?.room;
        if(prevRoom){
            socket.leave(prevRoom)
            io.to(prevRoom).emit('message',buildMsg(ADMIN,`${name} left the room`))
        }
        //2-remove the old user if exist and add the new user data to the active users array
        const user = addActiveUser(socket.id,name,room)

        //3- update the users list in the prev room by sending the new list to the front
        if (prevRoom){
            io.to(prevRoom).emit('userList',{
                users:getUsersInRoom(prevRoom)
            })
        }

        //4- join the new room
        socket.join(user.room)

        //5- to the user that who joined the room
        socket.emit('message',buildMsg(ADMIN,`You have joined chat room ${user.room}`))

        //6- To everyone else in the room
        socket.broadcast.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has joined the room`))

        //7- update the users list in the new room by sending the new list to the front
        io.to(user.room).emit('userList',{
            users:getUsersInRoom(user.room)
        })

        //update the rooms list for every one
        io.to('roomList',{
            rooms:getAllActiveRooms()
        })
    })


    //? listen to event called message coming from the client side with the user message
    socket.on('message', ({name,text}) => {
        const room = getUser(socket.id)?.room
        if (room) {
            //? emit the coming message to all connected clients in this room even me
            io.to(room).emit('message', buildMsg(name, text))
        }
    });

    
    //? listen to event called activity coming from the client side with the user Id
    socket.on('activity',(name)=>{
        //? send the activity user (writing )to all other users ()
        const room = getUser(socket.id)?.room
        if (room) {
            socket.broadcast.to(room).emit('activity', name)
        }    
    })

    socket.on('disconnect', () => {
        console.log(`user ${socket.id} disconnected`);
        const user = getUser(socket.id)
        userLeaveApp(socket.id)
        if (user) {
            io.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has left the room`))

            io.to(user.room).emit('userList', {
                users: getUsersInRoom(user.room)
            })

            io.emit('roomList', {
                rooms: getAllActiveRooms()
            })
        }
});
})
function buildMsg (name,text){
    return {
        name,
        text,
        time:new Intl.DateTimeFormat('default',{
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        }).format(new Date())
    }
}

//? users functions
function getUser(id){
    return UsersState.users.find(user => user.id === id);
}

function addActiveUser(id,name,room){
    const user = {id,name,room}
    UsersState.setUsers([
        ...UsersState.users.filter(user=>user.id !== id),
        user
    ])
    return user
}

function userLeaveApp(id){
    UsersState.setUsers(UsersState.users.filter(user=>user.id !== id))
}

function getUsersInRoom(room) {
    return UsersState.users.filter(user => user.room === room)
}

function getAllActiveRooms() {
    return Array.from(new Set(UsersState.users.map(user => user.room)))
}

