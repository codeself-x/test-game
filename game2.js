// Dino Jump Game with requestAnimationFrame
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let gameOver = false;
let score = 0;
let highScore = 0;
let animationId;

// Dino object
const dino = {
    x: 70,
    y: canvas.height - 70,
    width: 70,
    height: 140,
    velocityY: 0,
    gravity: 0.6,
    jumpPower: -17,
    isJumping: false,
    groundY: canvas.height - 150
};

// Obstacles array
let obstacles = [];
const obstacleWidth = 70;
const obstacleHeight = 70; 
const obstacleSpeed = 5;
let obstacleTimer = 0;
let obstacleInterval = 100; // frames between obstacles

// Image for obstacle (you can replace with your own image URL)
const userImage = new Image();
userImage.src = './user.png';



// Keyboard input
let keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!gameRunning && !gameOver) {
            startGame();
        } else if (gameOver) {
            resetGame();
            startGame();
        } else if (!dino.isJumping) {
            jump();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Click to start/restart
canvas.addEventListener('click', () => {
    if (!gameRunning && !gameOver) {
        startGame();
    } else if (gameOver) {
        resetGame();
        startGame();
    } else if (!dino.isJumping) {
        jump();
    }
});

// Functions
function jump() {
    if (!dino.isJumping) {
        dino.velocityY = dino.jumpPower;
        dino.isJumping = true;
    }
}

function startGame() {
    gameRunning = true;
    gameOver = false;
    score = 0;
    obstacles = [];
    obstacleTimer = 0;
    gameLoop();
}

function resetGame() {
    dino.y = dino.groundY;
    dino.velocityY = 0;
    dino.isJumping = false;
    obstacles = [];
    obstacleTimer = 0;
    score = 0;
    gameOver = false;
}

function updateDino() {
    // Apply gravity
    dino.velocityY += dino.gravity;
    dino.y += dino.velocityY;
    
    // Check ground collision
    if (dino.y >= dino.groundY) {
        dino.y = dino.groundY;
        dino.velocityY = 0;
        dino.isJumping = false;
    }
}

function updateObstacles() {
    // Spawn new obstacles
    obstacleTimer++;
    if (obstacleTimer > obstacleInterval) {

         const obstacleImage = new Image();
         const randomNum = Math.floor(Math.random() * 3) + 1;
         obstacleImage.src = `./obj/${randomNum}.png`;

         obstacles.push({
               x: canvas.width,
               y: canvas.height - obstacleHeight - 10,
               width: obstacleWidth,
               height: obstacleHeight,
               image: obstacleImage
         });
         obstacleTimer = 0;
         // Gradually increase difficulty
         if (obstacleInterval > 60) {
               obstacleInterval -= 0.5;
         }
    }
    
    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacleSpeed;
        
        // Remove off-screen obstacles
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
            if (score > highScore) {
                highScore = score;
            }

        }
    }
}

function checkCollision() {
    for (let obstacle of obstacles) {
        if (dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y) {
            return true;
        }
    }
    return false;
}

function drawDino() {
   ctx.drawImage(userImage, dino.x, dino.y, dino.width, dino.height);

   // ctx.fillStyle = '#4CAF50';
   // ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
   
   // // Draw simple dino details
   // ctx.fillStyle = '#fff';
   // ctx.fillRect(dino.x + 25, dino.y + 10, 8, 8); // Eye
   
   // // Legs (animated based on score for running effect)
   // if (Math.floor(score / 5) % 2 === 0) {
   //    ctx.fillRect(dino.x + 5, dino.y + dino.height - 15, 10, 15);
   //    ctx.fillRect(dino.x + 25, dino.y + dino.height - 15, 10, 15);
   // } else {
   //    ctx.fillRect(dino.x + 10, dino.y + dino.height - 15, 10, 15);
   //    ctx.fillRect(dino.x + 20, dino.y + dino.height - 15, 10, 15);
   // }
}

function drawObstacles() {

   for (let obstacle of obstacles) {
      ctx.save();
      // Try to draw image, fallback to rectangle if image not loaded
      if (obstacle.image.complete) {
         ctx.drawImage(obstacle.image , obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else {
         ctx.fillStyle = '#FF5722';
         ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
   }
}

function drawGround() {
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 10);
    ctx.lineTo(canvas.width, canvas.height - 10);
    ctx.stroke();
    
    // Draw dashed ground line for effect
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 5);
    ctx.lineTo(canvas.width, canvas.height - 5);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, canvas.width - 10, 30);
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 10, 55);
}

function drawStartScreen() {
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('IT BTV Jump Project', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '20px Arial';
    ctx.fillText('Press SPACE or Click to Start', canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('Press SPACE to Jump', canvas.width / 2, canvas.height / 2 + 40);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '25px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 45);
    ctx.font = '20px Arial';
    ctx.fillText('Press SPACE or Click to Restart', canvas.width / 2, canvas.height / 2 + 85);
}

function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
    
    if (!gameRunning && !gameOver) {
        drawStartScreen();
        return;
    }
    
    if (gameRunning && !gameOver) {
        // Update game objects
        updateDino();
        updateObstacles();
        
        // Check for collision
        if (checkCollision()) {
            gameOver = true;
            gameRunning = false;
        }
        
        // Draw everything
        drawGround();
        drawDino();
        drawObstacles();
        drawScore();
        
        // Continue game loop
        animationId = requestAnimationFrame(gameLoop);
    } else if (gameOver) {
        // Draw final state
        drawGround();
        drawDino();
        drawObstacles();
        drawScore();
        drawGameOver();
    }
}

// Initialize game
drawStartScreen();
