const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameRunning = false;
let speed = 6;
let gravity = 0.6;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

class Player {
  constructor() {
    this.width = 50;
    this.height = 50;
    this.x = canvas.width / 2 - 25;
    this.y = canvas.height - 120;
    this.dy = 0;
    this.grounded = true;
    this.lane = 1; // 0 left, 1 center, 2 right
  }

  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.dy += gravity;
    this.y += this.dy;

    if (this.y >= canvas.height - 120) {
      this.y = canvas.height - 120;
      this.dy = 0;
      this.grounded = true;
    }

    this.x = (canvas.width / 3) * this.lane + canvas.width / 6 - this.width / 2;
  }

  jump() {
    if (this.grounded) {
      this.dy = -12;
      this.grounded = false;
    }
  }

  slide() {
    this.height = 25;
    setTimeout(() => this.height = 50, 500);
  }
}

class Obstacle {
  constructor() {
    this.width = 50;
    this.height = 50;
    this.lane = Math.floor(Math.random() * 3);
    this.x = (canvas.width / 3) * this.lane + canvas.width / 6 - 25;
    this.y = -50;
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
let obstacles = [];

function spawnObstacle() {
  if (Math.random() < 0.02) {
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
  ctx.fillText("Score: " + score, 20, 40);

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

// Controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && player.lane > 0) player.lane--;
  if (e.key === "ArrowRight" && player.lane < 2) player.lane++;
  if (e.key === " " || e.key === "ArrowUp") player.jump();
  if (e.key === "ArrowDown") player.slide();
});

// Touch Controls
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - touchStartX;
  let dy = e.changedTouches[0].clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 50 && player.lane < 2) player.lane++;
    if (dx < -50 && player.lane > 0) player.lane--;
  } else {
    if (dy < -50) player.jump();
    if (dy > 50) player.slide();
  }
});
