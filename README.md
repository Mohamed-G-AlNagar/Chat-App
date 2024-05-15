Chat App
This is a real-time chat application built using Express.js and Socket.IO.

Features
Real-time Communication: Utilizes Socket.IO to enable real-time bidirectional event-based communication.
Room Functionality: Users can join different rooms to chat with specific groups of people.
User Activity Broadcasting: Broadcasts messages when a user joins or leaves a room.
Typing Indicator: Displays when a user is typing a message.
Technologies Used
Express.js: Used as the server-side framework to handle HTTP requests and routing.
Socket.IO: Provides real-time, bidirectional communication between web clients and servers.
Installation
Clone the repository:

git clone https://github.com/yourusername/chat-application.git
Navigate to the project directory:

cd chat-application
Install dependencies:

npm install
Start the server:

npm start
Usage
Open your browser and navigate to http://localhost:3000.
Enter your desired username and room name to join.
Start chatting with other users in the room!
To test the application with multiple users:

Open two or more browser tabs or windows.
In each tab/window, navigate to http://localhost:3000.
Enter different usernames and join the same room.
Start chatting with each other across the tabs/windows!
