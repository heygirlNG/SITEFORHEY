const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const state = {
  running: true,
  score: 0,
  best: Number(localStorage.getItem("parol-best") || 0),
  obstacleTimer: 0,
  obstacleInterval: 110,
  player: {
    x: 90,
    y: 240,
    width: 38,
    height: 48,
    vy: 0,
    jumpStrength: 12.5,
    gravity: 0.7,
    grounded: true
  },
  obstacles: []
};

function reset() {
  state.score = 0;
  state.obstacleTimer = 0;
  state.obstacles = [];
  state.player.y = 240;
  state.player.vy = 0;
  state.player.grounded = true;
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    jump();
  }
});

canvas.addEventListener("pointerdown", jump);

function jump() {
  if (state.player.grounded) {
    state.player.vy = -state.player.jumpStrength;
    state.player.grounded = false;
  }
}

function spawnObstacle() {
  const height = 40 + Math.random() * 90;
  const width = 28 + Math.random() * 18;
  state.obstacles.push({
    x: canvas.width + 30,
    y: canvas.height - 70 - height,
    width,
    height
  });
}

function update() {
  if (!state.running) return;

  state.obstacleTimer += 1;

  if (state.obstacleTimer > state.obstacleInterval) {
    state.obstacleTimer = 0;
    spawnObstacle();
  }

  if (state.player.grounded) {
    state.player.vy = 0;
  } else {
    state.player.vy += state.player.gravity;
    state.player.y += state.player.vy;
  }

  if (state.player.y + state.player.height >= canvas.height - 50) {
    state.player.y = canvas.height - 50 - state.player.height;
    state.player.grounded = true;
  }

  for (const obstacle of state.obstacles) {
    obstacle.x -= 4;
  }

  state.obstacles = state.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -10);

  for (const obstacle of state.obstacles) {
    const collisionX = state.player.x + state.player.width > obstacle.x &&
      state.player.x < obstacle.x + obstacle.width;
    const collisionY = state.player.y + state.player.height > obstacle.y &&
      state.player.y < obstacle.y + obstacle.height;

    if (collisionX && collisionY) {
      state.running = false;
      state.best = Math.max(state.best, state.score);
      localStorage.setItem("parol-best", String(state.best));
      break;
    }
  }

  state.score += 0.08;
}

function drawBackground() {
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

  for (let i = 0; i < canvas.width; i += 45) {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(i, canvas.height - 48, 18, 2);
  }
}

function drawPlayer() {
  const { x, y, width, height } = state.player;

  ctx.fillStyle = "#22c55e";
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x + 10, y + 10, 8, 8);
  ctx.fillRect(x + 20, y + 10, 8, 8);
}

function drawObstacle(obstacle) {
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

function drawText() {
  ctx.fillStyle = "#eef4ff";
  ctx.font = "bold 22px Arial";
  ctx.fillText(`Score: ${Math.floor(state.score)}`, 18, 32);

  ctx.fillStyle = "#7dd3fc";
  ctx.font = "bold 16px Arial";
  ctx.fillText(`Best: ${Math.floor(state.best)}`, 18, 56);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#eef4ff";
  ctx.font = "bold 34px Arial";
  ctx.fillText("Game Over", 220, 190);

  ctx.fillStyle = "#7dd3fc";
  ctx.font = "bold 18px Arial";
  ctx.fillText("Tap or press space to retry", 220, 230);

  ctx.font = "bold 16px Arial";
  ctx.fillText("Final score: " + Math.floor(state.score), 220, 260);
}

function render() {
  drawBackground();
  drawPlayer();
  for (const obstacle of state.obstacles) drawObstacle(obstacle);
  drawText();

  if (!state.running) {
    drawGameOver();
  }
}

function tick() {
  update();
  render();
  requestAnimationFrame(tick);
}

canvas.addEventListener("pointerdown", () => {
  if (!state.running) {
    reset();
    state.running = true;
  }
});

requestAnimationFrame(tick);
