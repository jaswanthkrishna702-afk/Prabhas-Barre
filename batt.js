const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

let gameStarted = false;
let gameOver = false;

let gravity = 0.5;
let velocity = 0;
let jumpPower = -8;

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

let pillarWidth = 80;
let pillarGap = 170;   // good gap
let pillarSpacing = 240;
let pillarSpeed = 2.5;

let pillars = [];

// ================= IMAGES =================
const ballImg = new Image();
ballImg.src = "ball.jpeg";

const coverImg = new Image();
coverImg.src = "cover.jpeg";

const pipeImages = [];
for (let i = 1; i <= 5; i++) {
  const img = new Image();
  img.src = `pic ${i}.jpeg`;
  pipeImages.push(img);
}

// ================= AUDIO =================
const jumpSound = new Audio("jump.mp3");
const crashSound = new Audio("crash.mp3");

// ================= PLAYER =================
let player = {
  x: 100,
  y: 250,
  width: 40,
  height: 40
};

// ================= CREATE PILLAR =================
function createPillar() {
  let height = Math.random() * 200 + 150;
  let img = pipeImages[Math.floor(Math.random() * pipeImages.length)];

  pillars.push({
    x: canvas.width,
    topHeight: height - pillarGap,
    bottomY: height,
    image: img,
    passed: false
  });
}

// ================= DRAW COVER =================
function drawCover() {
  ctx.drawImage(coverImg, 0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("BATTA BOSS", canvas.width / 2, 200);

  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Tap to Start", canvas.width / 2, 300);
  ctx.fillText("High Score: " + highScore, canvas.width / 2, 350);
}

// ================= RESET =================
function resetGame() {
  pillars = [];
  score = 0;
  velocity = 0;
  player.y = 250;
  gameOver = false;
}

// ================= UPDATE =================
function update() {

  if (!gameStarted) {
    drawCover();
    return;
  }

  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  velocity += gravity;
  player.y += velocity;

  // Create pillars
  if (pillars.length === 0 || pillars[pillars.length - 1].x < canvas.width - pillarSpacing) {
    createPillar();
  }

  for (let i = 0; i < pillars.length; i++) {
    let p = pillars[i];
    p.x -= pillarSpeed;

    // Draw top
    ctx.drawImage(
      p.image,
      p.x,
      0,
      pillarWidth,
      p.topHeight
    );

    // Draw bottom
    ctx.drawImage(
      p.image,
      p.x,
      p.bottomY,
      pillarWidth,
      canvas.height - p.bottomY
    );

    // Collision
    if (
      player.x < p.x + pillarWidth &&
      player.x + player.width > p.x &&
      (player.y < p.topHeight || player.y + player.height > p.bottomY)
    ) {
      crashSound.play();
      gameOver = true;
    }

    // Score
    if (!p.passed && p.x + pillarWidth < player.x) {
      score++;
      p.passed = true;

      if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
      }
    }
  }

  // Remove old pillars
  if (pillars.length && pillars[0].x < -pillarWidth) {
    pillars.shift();
  }

  // Ground collision
  if (player.y + player.height > canvas.height || player.y < 0) {
    crashSound.play();
    gameOver = true;
  }

  if (gameOver) {
    resetGame();
    gameStarted = false;
    return;
  }

  // Draw player
  ctx.drawImage(ballImg, player.x, player.y, player.width, player.height);

  // Draw score
  ctx.fillStyle = "black";
  ctx.font = "18px Arial";
  ctx.fillText("High Score: " + highScore, 10, 25);
  ctx.fillText("Score: " + score, 10, 50);
}

// ================= CONTROLS =================
function jump() {
  if (!gameStarted) {
    gameStarted = true;
    resetGame();
    return;
  }

  velocity = jumpPower;
  jumpSound.play();
}

document.addEventListener("keydown", function(e) {
  if (e.code === "Space") {
    jump();
  }
});

canvas.addEventListener("touchstart", function() {
  jump();
});

// ================= GAME LOOP =================
function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

gameLoop();