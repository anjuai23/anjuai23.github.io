const socket = io();

const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

socket.emit("joinRoom", roomId);

let board = Chessboard("board", {
  draggable: true,
  position: "start",
  onDrop: onDrop
});

function onDrop(source, target) {
  socket.emit("move", {
    roomId: roomId,
    move: {
      from: source,
      to: target,
      promotion: "q"
    }
  });
}

socket.on("boardState", (fen) => {
  board.position(fen);
});
