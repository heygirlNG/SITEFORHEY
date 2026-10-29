const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const table = {
  width: canvas.width,
  height: canvas.height,
  pocketRadius: 16
};

const COLORS = [
  "#facc15", "#f87171", "#60a5fa", "#a78bfa",
  "#34d399", "#f59e0b", "#fb7185", "#f9a8d4",
  "#fef3c7", "#d1d3d8", "#cbd5e1", "#d6d6d6",
  "#fca5a5", "#5eead4", "#93c5fd", "#7dd3fc"
];

const balls = [];
const holePositions = [
  { x: 20, y: 20 },
  { x: canvas.width / 2, y: 20 },
  { x: canvas.width - 20, y: 20 },
  { x: 20, y: canvas.height - 20 },
  { x: canvas.width / 2, y: canvas.height - 20 },
  { x: canvas.width - 20, y: canvas.height - 20 }
];

const state = {
  aimX: canvas.width * 0.75,
  aimY: canvas.height / 2,
  shooting: false,
  cuePower: 20,
  active: true
};

function makeBall(index, x, y, number) {
  return {
    x,
    y,
    radius: 13,
    vx: 0,
    vy: 0,
    color: number === 0 ? "#fef3c7" : COLORS[number % COLORS.length],
    number,
    active: true
  };
}

function initBalls() {
  const positions = [
    { x: 220, y: 250, n: 1 },
    { x: 248, y: 240, n: 2 },
    { x: 248, y: 260, n: 3 },
    { x: 248, y: 230, n: 4 },
    { x: 248, y: 270, n: 5 },
    { x: 252, y: 210, n: 6 },
    { x: 252, y: 290, n: 7 },
    { x: 252, y: 250, n: 8 },
    { x: 228, y: 250, n: 9 },
    { x: 228, y: 220, n: 10 },
    { x: 228, y: 280, n: 11 },
    { x: 228, y: 190, n: 12 },
    { x: 228, y: 310, n: 13 },
    { x: 228, y: 210, n: 14 },
    { x: 228, y: 290, n: 15 }
  ];

  balls.length = 0;
  balls.push(makeBall(0, 680, 250, 0));
  for (const pos of positions) {
    balls.push(makeBall(pos.n, pos.x, pos.y, pos.n));
  }
}

function reset() {
  initBalls();
  state.shooting = false;
  state.cuePower = 20;
  state.active = true;
}

function updatePhysics() {
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    if (!b.active) continue;

    b.x += b.vx;
    b.y += b.vy;

    b.vx *= 0.992;
    b.vy *= 0.992;

    if (Math.abs(b.vx) < 0.04) b.vx = 0;
    if (Math.abs(b.vy) < 0.04) b.vy = 0;

    if (b.x - b.radius < 0) {
      b.x = b.radius;
      b.vx *= -0.92;
    }
    if (b.x + b.radius > table.width) {
      b.x = table.width - b.radius;
      b.vx *= -0.92;
    }
    if (b.y - b.radius < 0) {
      b.y = b.radius;
      b.vy *= -0.92;
    }
    if (b.y + b.radius > table.height) {
      b.y = table.height - b.radius;
      b.vy *= -0.92;
    }
  }

  for (let i = 0; i < balls.length; i++) {
    const a = balls[i];
    if (!a.active) continue;

    for (let j = i + 1; j < balls.length; j++) {
      const b = balls[j];
      if (!b.active) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.radius + b.radius;

      if (dist < minDist) {
        const overlap = (minDist - dist) / 2;
        const nx = dist === 0 ? 1 : dx / dist;
        const ny = dist === 0 ? 0 : dy / dist;

        a.x -= nx * overlap;
        b.x += nx * overlap;
        a.y -= ny * overlap;
        b.y += ny * overlap;

        const relVelX = b.vx - a.vx;
        const relVelY = b.vy - a.vy;

        const impulse = 0.18;
        a.vx += (relVelX * nx) * impulse;
        b.vx -= (relVelX * nx) * impulse;
        a.vy += (relVelY * ny) * impulse;
        b.vy -= (relVelY * ny) * impulse;
      }
    }
  }
}

function drawTable() {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0b6b3d";
  ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(30, 30, canvas.width - 60, canvas.height - 60);

  for (let i = 0; i < holePositions.length; i++) {
    const p = holePositions[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, table.pocketRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
  }
}

function drawBall(ball) {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();

  if (ball.number > 0) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(ball.number), ball.x, ball.y);
  }
}

function drawCue() {
  const cueBall = balls[0];
  const angle = Math.atan2(state.aimY - cueBall.y, state.aimX - cueBall.x);
  const dx = Math.cos(angle) * 60;
  const dy = Math.sin(angle) * 60;

  ctx.beginPath();
  ctx.moveTo(cueBall.x, cueBall.y);
  ctx.lineTo(cueBall.x + dx, cueBall.y + dy);
  ctx.strokeStyle = "#fef3c7";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cueBall.x, cueBall.y);
  ctx.lineTo(state.aimX, state.aimY);
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawHud() {
  ctx.fillStyle = "#eef4ff";
  ctx.font = "bold 18px Arial";
  ctx.fillText("Classic Pool", 30, 32);
}

function render() {
  drawTable();
  for (const ball of balls) drawBall(ball);
  drawCue();
  drawHud();
}

function shootBall() {
  const cueBall = balls[0];
  const angle = Math.atan2(state.aimY - cueBall.y, state.aimX - cueBall.x);
  const strength = 30;
  cueBall.vx = Math.cos(angle) * strength;
  cueBall.vy = Math.sin(angle) * strength;
  state.shooting = true;
}

canvas.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  state.aimX = x;
  state.aimY = y;
});

canvas.addEventListener("pointerdown", () => {
  if (state.shooting) return;

  const cueBall = balls[0];
  const angle = Math.atan2(state.aimY - cueBall.y, state.aimX - cueBall.x);

  const dx = cueBall.x - state.aimX;
  const dy = cueBall.y - state.aimY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 90) {
    shootBall();
  }
});

function tick() {
  updatePhysics();
  render();
  requestAnimationFrame(tick);
}

reset();
requestAnimationFrame(tick);
