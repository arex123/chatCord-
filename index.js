const express = require("express");
const path = require("path");
const formatMessage = require("./util/message");

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./util/users");

const app = express();
var {Server} = require('socket.io')


const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`server started ${PORT}`));

// const io = socket(server);
const io = new Server(server);


app.use(express.static(path.join(__dirname, "public")));
const bot = "chadbox bot";


io.on("connection", (socket) => {
  // first code-> 
  console.log('New WS connection...');

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //broadcast when a user connects
    socket.emit("message", formatMessage(bot, "Welcome to chadbox!")); //it will emit/tell to only connected client

    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(bot, `${user.username} is connected!`)); //it will emit(tell) to everyone except himself

    //send users to room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //Listen to chatmessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(bot, `${user.username} has left the chat`)
      );

      //send users to room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });

  //io.emit() it will emit to everybody
});
