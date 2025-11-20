// Shooting Target Game with requestAnimationFrame
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let gameOver = false;
let score = 0;
let timeLeft = 60;
let lastTime = 0;
let animationId;

// Targets array
let targets = [];
const TARGET_COUNT = 4;

// Target data with names and images
const targetData = [
    { name: 'เสี่ยปู', image: './user.png', color: '#FF6B6B' },
    { name: 'เสี่ยจิ', image: './user2.png', color: '#4ECDC4' },
    { name: 'เสี่ยก้อง', image: './user3.png', color: '#FFD93D' },
    { name: 'ตั้ม ราบ 11', image: './user4.png', color: '#af95e1' }
];

// Score tracking per target name
let targetScores = {};
targetData.forEach(target => {
    targetScores[target.name] = 0;
});

// Bullet effects
let bulletEffects = [];

// Click effects
let clickEffects = [];

// DOM elements
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const ammoElement = document.getElementById('ammo');

// Target class
class Target {
    constructor(id) {
        this.id = id;
        this.width = 120;
        this.height = 190;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.height - this.height);
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        const data = targetData[id % targetData.length];
        this.name = data.name;
        this.color = data.color;
        this.image = new Image();
        this.image.src = data.image;
        this.visible = true;
        this.hitAnimation = 0;
    }

    update() {
        if (!this.visible) return;

        // Move target
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off walls
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.speedX *= -1;
            this.x = Math.max(0, Math.min(this.x, canvas.width - this.width));
        }
        if (this.y <= 0 || this.y + this.height >= canvas.height) {
            this.speedY *= -1;
            this.y = Math.max(0, Math.min(this.y, canvas.height - this.height));
        }
    }

    draw() {
        if (!this.visible) return;

        ctx.save();

        // Draw name label above target
        ctx.fillStyle = this.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(this.name, this.x + this.width / 2, this.y - 10);
        ctx.shadowBlur = 0;

        // Hit animation
        if (this.hitAnimation > 0) {
            const scale = 1 + (this.hitAnimation / 10);
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            ctx.translate(centerX, centerY);
            ctx.scale(scale, scale);
            ctx.translate(-centerX, -centerY);
            this.hitAnimation--;
        }

        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height + 5, 
                    this.width / 2.5, this.height / 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw target with circular clip
        ctx.save();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const radius = Math.min(this.width, this.height) / 2;
        
      //   ctx.beginPath();
      //   ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      //   ctx.closePath();
      //   ctx.clip();

        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback circle
            ctx.fillStyle = '#FF6B6B';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        ctx.restore();

        // Draw border circle
      //   ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      //   ctx.lineWidth = 3;
      //   ctx.beginPath();
      //   ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      //   ctx.stroke();

        ctx.restore();
    }

    checkHit(mouseX, mouseY) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const radius = Math.min(this.width, this.height) / 2;
        const distance = Math.sqrt((mouseX - centerX) ** 2 + (mouseY - centerY) ** 2);
        return distance <= radius;
    }

    onHit() {
        this.visible = false;
        createExplosion(this.x + this.width / 2, this.y + this.height / 2);
        
        // Update score for this target name
        targetScores[this.name]++;
        
        // Respawn after delay
        setTimeout(() => {
            this.respawn();
        }, 1000);
    }

    respawn() {
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.height - this.height);
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.visible = true;
        this.hitAnimation = 0;
    }
}

// Click effect class
class ClickEffect {
    constructor(x, y, hit = false) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.maxRadius = hit ? 30 : 20;
        this.alpha = 1;
        this.hit = hit;
    }

    update() {
        this.radius += 2;
        this.alpha -= 0.05;
        return this.alpha > 0;
    }

    draw() {
        ctx.save();
        ctx.strokeStyle = this.hit ? `rgba(76, 175, 80, ${this.alpha})` : `rgba(255, 255, 255, ${this.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Crosshair
        ctx.beginPath();
        ctx.moveTo(this.x - this.radius - 5, this.y);
        ctx.lineTo(this.x - this.radius - 15, this.y);
        ctx.moveTo(this.x + this.radius + 5, this.y);
        ctx.lineTo(this.x + this.radius + 15, this.y);
        ctx.moveTo(this.x, this.y - this.radius - 5);
        ctx.lineTo(this.x, this.y - this.radius - 15);
        ctx.moveTo(this.x, this.y + this.radius + 5);
        ctx.lineTo(this.x, this.y + this.radius + 15);
        ctx.stroke();
        ctx.restore();
    }
}

// Particle class for explosion
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.radius = Math.random() * 4 + 2;
        this.color = `hsl(${Math.random() * 60 + 10}, 100%, 50%)`;
        this.alpha = 1;
        this.gravity = 0.2;
    }

    update() {
        this.vx *= 0.98;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.02;
        this.radius *= 0.97;
        return this.alpha > 0 && this.radius > 0.5;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Create explosion effect
function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        bulletEffects.push(new Particle(x, y));
    }
}

// Mouse click handler
canvas.addEventListener('click', (e) => {
    if (!gameRunning || gameOver) {
        if (!gameRunning) {
            startGame();
        }
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let hit = false;
    
    // Check if any target was hit
    for (let target of targets) {
        if (target.visible && target.checkHit(mouseX, mouseY)) {
            target.onHit();
            score += 10;
            hit = true;
            updateScore();
            break;
        }
    }

    // Add click effect
    clickEffects.push(new ClickEffect(mouseX, mouseY, hit));
});

// Start game
function startGame() {
    gameRunning = true;
    gameOver = false;
    score = 0;
    timeLeft = 15;
    targets = [];
    bulletEffects = [];
    clickEffects = [];
    
    // Reset target scores
    Object.keys(targetScores).forEach(key => {
        targetScores[key] = 0;
    });
    
    // Create targets
    for (let i = 0; i < TARGET_COUNT; i++) {
        targets.push(new Target(i));
    }
    
    updateScore();
    lastTime = performance.now();
    gameLoop(lastTime);
}

// Update score display
function updateScore() {
    scoreElement.textContent = `คะแนน: ${score}`;
    timerElement.textContent = `เวลา: ${Math.ceil(timeLeft)}s`;
}

// Draw start screen
function drawStartScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 เกมยิงเป้า 🎯', canvas.width / 2, canvas.height / 2 - 60);
    
    ctx.font = '24px Arial';
    ctx.fillText('คลิกที่เป้าเคลื่อนไหวเพื่อยิง', canvas.width / 2, canvas.height / 2);
    ctx.fillText('เป้าแต่ละอัน = 10 คะแนน', canvas.width / 2, canvas.height / 2 + 40);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('คลิกเพื่อเริ่มเกม', canvas.width / 2, canvas.height / 2 + 100);
}

// Draw scoreboard
function drawScoreboard() {
    const boardX = canvas.width - 200;
    const boardY = 10;
    const boardWidth = 190;
    const rowHeight = 35;
    const headerHeight = 40;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(boardX, boardY, boardWidth, headerHeight + (Object.keys(targetScores).length * rowHeight) + 10);
    
    // Border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(boardX, boardY, boardWidth, headerHeight + (Object.keys(targetScores).length * rowHeight) + 10);
    
    // Header
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 สถิติหมั่นไส้', boardX + boardWidth / 2, boardY + 25);
    
    // Scores
    let yPos = boardY + headerHeight + 5;
    const sortedScores = Object.entries(targetScores).sort((a, b) => b[1] - a[1]);
    
    sortedScores.forEach(([name, count], index) => {
        const targetInfo = targetData.find(t => t.name === name);
        
        // Background for each row
        if (index % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(boardX + 5, yPos - 20, boardWidth - 10, rowHeight - 5);
        }
        
        // Name
        ctx.fillStyle = targetInfo.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(name, boardX + 15, yPos);
        
        // Score
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(`${count} ครั้ง`, boardX + boardWidth - 15, yPos);
        
        yPos += rowHeight;
    });
}

// Draw game over screen
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('เกมจบแล้ว!', canvas.width / 2, 100);
    
    ctx.font = '36px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`คะแนนรวม: ${score}`, canvas.width / 2, 160);
    
    // Detailed scoreboard
    const startY = 220;
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('📊 สรุปความหมั่นไส้', canvas.width / 2, startY);
    
    const sortedScores = Object.entries(targetScores).sort((a, b) => b[1] - a[1]);
    let yPos = startY + 50;
    
    sortedScores.forEach(([name, count], index) => {
        const targetInfo = targetData.find(t => t.name === name);
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
        
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = targetInfo.color;
        ctx.textAlign = 'left';
        ctx.fillText(`${medal} ${name}`, canvas.width / 2 - 150, yPos);
        
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(`${count} ครั้ง (${count * 10} คะแนน)`, canvas.width / 2 + 150, yPos);
        
        yPos += 40;
    });
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.fillText('คลิกเพื่อเล่นอีกครั้ง', canvas.width / 2, canvas.height - 40);
}

// Main game loop
function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!gameRunning && !gameOver) {
        drawStartScreen();
        return;
    }

    if (gameRunning && !gameOver) {
        // Update timer
        timeLeft -= deltaTime;
        if (timeLeft <= 0) {
            timeLeft = 0;
            gameOver = true;
            gameRunning = false;
        }
        updateScore();

        // Update and draw targets
        for (let target of targets) {
            target.update();
            target.draw();
        }

        // Update and draw bullet effects
        bulletEffects = bulletEffects.filter(particle => {
            particle.update();
            particle.draw();
            return particle.alpha > 0;
        });

        // Update and draw click effects
        clickEffects = clickEffects.filter(effect => {
            const alive = effect.update();
            effect.draw();
            return alive;
        });

        // Draw scoreboard
        drawScoreboard();

        // Continue loop
        animationId = requestAnimationFrame(gameLoop);
    } else if (gameOver) {
        // Draw final state
        for (let target of targets) {
            target.draw();
        }
        drawGameOver();
    }
}

// Initialize
drawStartScreen();
