const { Server } = require("socket.io");
const express = require("express");
const http = require("http")


const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*'
    },
})

const userSocketMap = {}; 
const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];


io.on("connection", (socket) => {
    console.log("connecting socket");
    const userId = socket.handshake.query.userId;
  
    if (userId) {
      userSocketMap[userId] = socket.id;
    }
  
    console.log("userSocketMap", userSocketMap);
  
    socket.on("disconnect", () => {
      // userSocketMap.forEach((value, key) => {
      //   if (value === socket.id) {
      //     userSocketMap.delete(key);
      //   }
      // });
      console.log("Client disconnected");
    });
  
  
  });

module.exports = { app, server, io, getReceiverSocketId };