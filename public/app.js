const socket = io('ws://localhost:3000')

const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')
const chatDisplay = document.querySelector('.chat-display')
const activity = document.querySelector('.activity')
const usersList = document.querySelector('.user-list')
const roomList = document.querySelector('.room-list')

function sendMessage(e) {
    e.preventDefault()
    if (nameInput.value && msgInput.value && chatRoom.value) {
        socket.emit('message',{
            name: nameInput.value,
            text: msgInput.value,
            room: chatRoom.value
        }) //? to send the values to the backend socket
        msgInput.value = ""
    }
    msgInput.focus()
}

function enterRoom(e){
    e.preventDefault()
    if (nameInput.value && chatRoom.value) {
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        })
    }
}

document.querySelector('.form-msg')
    .addEventListener('submit', sendMessage)

document.querySelector('.form-join')
    .addEventListener('submit', enterRoom)

//? send the userId to backend that this user start activity (write event) to broadcast it to all users
msgInput.addEventListener("keypress", () => {
    socket.emit('activity',nameInput.value)
})


//? Listen for messages that may receive from the server
socket.on("message", (data ) => {
    activity.textContent = ""
    const { name, text, time } = data
    const li = document.createElement('li')

    li.className = 'post' //? class given to the admin messages
    //? Current user classes for styling purposes
    if (name === nameInput.value) li.className = 'post post--left'
    //? not the current user and not admin classes
    if (name !== nameInput.value && name !== 'Admin') li.className = 'post post--right'

    if (name !== 'Admin') {
        li.innerHTML = `<div class="post__header ${name === nameInput.value
            ? 'post__header--user'
            : 'post__header--reply'
            }">
        <span class="post__header--name">${name}</span> 
        <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>`
    } else {
        li.innerHTML = `<div class="post__text">${text}</div>`
    }
    document.querySelector('.chat-display').appendChild(li)

    chatDisplay.scrollTop = chatDisplay.scrollHeight
})


//? listen for the activity event coming from the backend (who is writing)
let activityTimer
socket.on('activity',(activityUserId)=>{
    activity.textContent = `${activityUserId} is typing....`;
        // Clear after 3 seconds 
        clearTimeout(activityTimer)
        activityTimer = setTimeout(() => {
            activity.textContent = ""
        }, 3000)
})


socket.on('userList', ({ users }) => {
    showUsers(users)
})

socket.on('roomList', ({ rooms }) => {
    showRooms(rooms)
})

function showUsers(users) {
    usersList.textContent = ''
    if (users) {
        usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`
        users.forEach((user, i) => {
            usersList.textContent += ` ${user.name}`
            if (users.length > 1 && i !== users.length - 1) {
                usersList.textContent += ","
            }
        })
    }
}

function showRooms(rooms) {
    roomList.textContent = ''
    if (rooms) {
        roomList.innerHTML = '<em>Active Rooms:</em>'
        rooms.forEach((room, i) => {
            roomList.textContent += ` ${room}`
            if (rooms.length > 1 && i !== rooms.length - 1) {
                roomList.textContent += ","
            }
        })
    }
}