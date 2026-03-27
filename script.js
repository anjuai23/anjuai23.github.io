let game = new Chess();

const params = new URLSearchParams(window.location.search);
const level = params.get("level");

let board = Chessboard('board', {
  draggable: true,
  position: 'start',
  onDrop: onDrop
});

function onDrop(source, target) {

  let move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  updateStatus();

  setTimeout(makeAIMove, 300);
}

function makeAIMove() {
  let move;

  if (level === "easy") {
    let moves = game.moves();
    move = moves[Math.floor(Math.random() * moves.length)];
  }

  else if (level === "medium") {
    move = minimaxRoot(1, game, true);
  }

  else {
    move = minimaxRoot(2, game, true);
  }

  game.move(move);
  board.position(game.fen());

  updateStatus();
}

function minimaxRoot(depth, game, isMaximisingPlayer) {
  let moves = game.moves();
  let bestMove = -9999;
  let bestMoveFound;

  for (let i = 0; i < moves.length; i++) {
    let move = moves[i];
    game.move(move);
    let value = minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer);
    game.undo();

    if (value >= bestMove) {
      bestMove = value;
      bestMoveFound = move;
    }
  }

  return bestMoveFound;
}

function minimax(depth, game, alpha, beta, isMaximisingPlayer) {
  if (depth === 0) {
    return evaluateBoard(game);
  }

  let moves = game.moves();

  if (isMaximisingPlayer) {
    let bestMove = -9999;
    for (let i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      bestMove = Math.max(bestMove, minimax(depth - 1, game, alpha, beta, false));
      game.undo();
      alpha = Math.max(alpha, bestMove);
      if (beta <= alpha) return bestMove;
    }
    return bestMove;
  } else {
    let bestMove = 9999;
    for (let i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      bestMove = Math.min(bestMove, minimax(depth - 1, game, alpha, beta, true));
      game.undo();
      beta = Math.min(beta, bestMove);
      if (beta <= alpha) return bestMove;
    }
    return bestMove;
  }
}

function evaluateBoard(game) {
  const values = {
    p: 10,
    n: 30,
    b: 30,
    r: 50,
    q: 90,
    k: 900
  };

  let total = 0;

  game.board().forEach(row => {
    row.forEach(piece => {
      if (piece) {
        let value = values[piece.type];
        total += piece.color === 'w' ? value : -value;
      }
    });
  });

  return total;
}

function updateStatus() {
  let status = '';

  if (game.in_checkmate()) {
    status = "Game Over";
  } else {
    status = (game.turn() === 'w' ? 'Your Turn' : 'Computer Thinking...');
  }

  document.getElementById('status').innerText = status;
}
