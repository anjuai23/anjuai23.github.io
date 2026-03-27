const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Chess } = require("chess.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = new Chess();
    }

    socket.emit("boardState", rooms[roomId].fen());
  });

  socket.on("move", ({ roomId, move }) => {
    const game = rooms[roomId];

    try {
      game.move(move);
      io.to(roomId).emit("boardState", game.fen());
    } catch (err) {
      console.log("Invalid move");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
