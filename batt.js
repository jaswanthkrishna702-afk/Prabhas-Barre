// ===== CANVAS SETUP =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// Prevent mobile scrolling
canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
}, { passive: false });


// ===== GAME VARIABLES =====
let bird = {
    x: 80,
    y: 250,
    width: 40,
    height: 40,
    velocity: 0,
    gravity: 0.4,
    jump: -7
};

let pipes = [];
let pipeWidth = 80;
let pipeGap = 170; // good starting gap
let pipeSpeed = 2.5;
let pipeDistance = 220;

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameStarted = false;


// ===== LOAD IMAGES =====
const birdImg = new Image();
birdImg.src = "ball.jpeg";

const pipeImages = [
    "pic 1.jpeg",
    "pic 2.jpeg",
    "pic 3.jpeg",
    "pic 4.jpeg",
    "pic 5.jpeg"
];


// ===== LOAD AUDIO =====
const jumpSound = new Audio("jump.mp3");
const crashSound = new Audio("crash.mp3");


// ===== CONTROLS =====
document.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
        if (!gameStarted) startGame();
        bird.velocity = bird.jump;
        jumpSound.play();
    }
});

canvas.addEventListener("touchstart", function () {
    if (!gameStarted) startGame();
    bird.velocity = bird.jump;
    jumpSound.play();
});


// ===== START GAME =====
function startGame() {
    gameStarted = true;
    bird.y = 250;
    bird.velocity = 0;
    pipes = [];
    score = 0;
}


// ===== CREATE PIPE =====
function createPipe() {
    let topHeight = Math.random() * 200 + 100;

    let img = new Image();
    img.src = pipeImages[Math.floor(Math.random() * pipeImages.length)];

    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: topHeight + pipeGap,
        img: img
    });
}


// ===== GAME LOOP =====
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ===== COVER PAGE =====
    if (!gameStarted) {
        ctx.fillStyle = "red";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("BATTA BOSS", canvas.width / 2, 200);

        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText("Tap to Start", canvas.width / 2, 250);

        requestAnimationFrame(update);
        return;
    }

    // ===== BIRD PHYSICS =====
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // ===== CREATE PIPES =====
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - pipeDistance) {
        createPipe();
    }

    // ===== DRAW PIPES =====
    for (let i = 0; i < pipes.length; i++) {
        let pipe = pipes[i];
        pipe.x -= pipeSpeed;

        // Top pipe
        ctx.drawImage(pipe.img, pipe.x, 0, pipeWidth, pipe.top);

        // Bottom pipe
        ctx.drawImage(
            pipe.img,
            pipe.x,
            pipe.bottom,
            pipeWidth,
            canvas.height - pipe.bottom
        );

        // Collision
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top ||
                bird.y + bird.height > pipe.bottom)
        ) {
            crashSound.play();
            gameStarted = false;

            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
            }
        }

        // Score increase
        if (pipe.x + pipeWidth === bird.x) {
            score++;
        }
    }

    // Remove old pipes
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

    // ===== DRAW BIRD =====
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // ===== SCORE BOX (SHIFTED RIGHT) =====
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(50, 20, 190, 70);

    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "left";

    ctx.fillText("High Score: " + highScore, 65, 50);
    ctx.fillText("Score: " + score, 65, 75);

    requestAnimationFrame(update);
}

update();
