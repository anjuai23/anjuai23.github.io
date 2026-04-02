const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Fix canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let gameRunning = false;
let speed = 6;
let gravity = 0.6;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

class Player {
  constructor() {
    this.width = 50;
    this.height = 50;
    this.lane = 1;
    this.y = 0;
    this.dy = 0;
    this.grounded = false;
  }

  get x() {
    return (canvas.width / 3) * this.lane + canvas.width / 6 - this.width / 2;
  }

  get groundY() {
    return canvas.height - 100;
  }

  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.dy += gravity;
    this.y += this.dy;

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.dy = 0;
      this.grounded = true;
    }
  }

  jump() {
    if (this.grounded) {
      this.dy = -12;
      this.grounded = false;
    }
  }

  slide() {
    this.height = 25;
    setTimeout(() => this.height = 50, 400);
  }
}

class Obstacle {
  constructor() {
    this.width = 50;
    this.height = 50;
    this.lane = Math.floor(Math.random() * 3);
    this.y = -60;
  }

  get x() {
    return (canvas.width / 3) * this.lane + canvas.width / 6 - this.width / 2;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += speed;
  }
}

let player = new Player();
player.y = canvas.height - 100;

let obstacles = [];

function spawnObstacle() {
  if (Math.random() < 0.03) {
    obstacles.push(new Obstacle());
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "green";
  ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

  player.update();
  player.draw();

  spawnObstacle();

  obstacles.forEach((obs, i) => {
    obs.update();
    obs.draw();

    if (detectCollision(player, obs)) {
      endGame();
    }

    if (obs.y > canvas.height) {
      obstacles.splice(i, 1);
      score++;
    }
  });

  speed += 0.002;

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);

  requestAnimationFrame(gameLoop);
}

function startGame() {
  document.getElementById("startScreen").style.display = "none";
  gameRunning = true;
  gameLoop();
}

function endGame() {
  gameRunning = false;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  document.getElementById("gameOverScreen").style.display = "block";
  document.getElementById("finalScore").innerText = "Score: " + score;
  document.getElementById("highScore").innerText = "High Score: " + highScore;
}

function restartGame() {
  location.reload();
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;

  if (e.key === "ArrowLeft" && player.lane > 0) player.lane--;
  if (e.key === "ArrowRight" && player.lane < 2) player.lane++;
  if (e.key === " " || e.key === "ArrowUp") player.jump();
  if (e.key === "ArrowDown") player.slide();
});

// Touch controls
let startX = 0;
let startY = 0;

document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

document.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - startX;
  let dy = e.changedTouches[0].clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 50 && player.lane < 2) player.lane++;
    if (dx < -50 && player.lane > 0) player.lane--;
  } else {
    if (dy < -50) player.jump();
    if (dy > 50) player.slide();
  }
});
