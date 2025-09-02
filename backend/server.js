const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { getChatId } = require("../src/common/utils/getChatId");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chatly backend (private chat) server is running....");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
   origin: ["http://localhost:5173", "http://192.168.1.101:5173"],
    methods: ["GET", "POST"],
  },
});

// store mapping { userId: socketId }
let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // user comes online
  socket.on("userOnline", (userId) => {
    onlineUsers[userId] = socket.id; // map userId to socketId
    io.emit("onlineUsers", Object.keys(onlineUsers).map(Number)); // send userIds only
    console.log("Online users from server:", onlineUsers);
  });
  socket.on("userLogout", (userId,ack) => {
    if (onlineUsers[userId]) {
      console.log(`User ${userId} logged out`);
      delete onlineUsers[userId];
      io.emit("onlineUsers", Object.keys(onlineUsers).map(Number));
    }
  // console.log('logged out');
  if (typeof ack === "function") {
  ack("ok");
}
  
  });

  // private message
socket.on("privateMessage", ({ senderId, receiverId, message, messageId, timestamp }) => {
  const receiverSocketId = onlineUsers[receiverId];

  const msgObj = { senderId, receiverId, message, messageId, timestamp: timestamp || new Date() };

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("privateMessage", msgObj);
  }

  // also send back to sender
  socket.emit("privateMessage", msgObj);
});


// update message
socket.on("updateMessage", ({ chatId, senderId, receiverId, messageId, message }) => {
  const updatedMsg = { chatId, messageId,message, updatedAt: new Date() };

  const senderSocketId = onlineUsers[senderId];
  const receiverSocketId = onlineUsers[receiverId];

  if (senderSocketId) io.to(senderSocketId).emit("updateMessage", updatedMsg);
  if (receiverSocketId) io.to(receiverSocketId).emit("updateMessage", updatedMsg);

  console.log("Updated message emitted:", updatedMsg);
});






  // typing indicator
  socket.on("typing", ({ senderId, receiverId, typing }) => {
    //  console.log("inside typing serveris"+senderId);
  const receiverSocketId = onlineUsers[receiverId];
  if (receiverSocketId) {
    // console.log('inside'+receiverSocketId);
    io.to(receiverSocketId).emit("typing", { userId: senderId, typing });
    
  }
});


  // user disconnects

socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        console.log(`Removing user ${userId} from onlineUsers`);
        delete onlineUsers[userId];
      }
    }
    io.emit("onlineUsers", Object.keys(onlineUsers).map(Number));
    console.log("Online users after disconnect:", onlineUsers);
  });
});

// start server
const PORT = 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Chatly backend server running at http://192.168.1.101:${PORT}`);
});
