// 1. การตั้งค่าเริ่มต้น
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // ใช้ 2D context ในการวาด

// ตัวแปรสำหรับไม้ตี (Paddle)
const paddleWidth = 10;
const paddleHeight = 60;
let paddleY = (canvas.height - paddleHeight) / 2;
const paddleSpeed = 5;

// ตัวแปรสำหรับลูกบอล (Ball)
const ballRadius = 5;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballDX = 2; // ความเร็วในแกน X
let ballDY = 2; // ความเร็วในแกน Y

// สถานะการควบคุม
let upPressed = false;
let downPressed = false;

// 2. ฟังก์ชันวาดวัตถุ

// วาดไม้ตี
function drawPaddle() {
    ctx.fillStyle = 'white';
    ctx.fillRect(5, paddleY, paddleWidth, paddleHeight); // x=5 คือตำแหน่งซ้ายสุด
}

// วาดลูกบอล
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}

// 3. ฟังก์ชันอัปเดตตรรกะของเกม (Game Logic)

function update() {
    // 3.1 การเคลื่อนที่ของไม้ตี
    if (upPressed && paddleY > 0) {
        paddleY -= paddleSpeed;
    } else if (downPressed && paddleY < canvas.height - paddleHeight) {
        paddleY += paddleSpeed;
    }

    // 3.2 การเคลื่อนที่ของลูกบอล
    ballX += ballDX;
    ballY += ballDY;

    // 3.3 การชนขอบบน/ล่าง
    if (ballY + ballDY > canvas.height - ballRadius || ballY + ballDY < ballRadius) {
        ballDY = -ballDY; // กลับทิศทาง Y
    }

    // 3.4 การชนไม้ตี (อย่างง่าย)
    // ตรวจสอบการชนด้านซ้าย (ผู้เล่น)
    if (ballX - ballRadius <= paddleWidth + 5) {
        if (ballY > paddleY && ballY < paddleY + paddleHeight) {
            ballDX = -ballDX; // กลับทิศทาง X
        } else if (ballX < 0) {
            // ลูกบอลหลุดออกซ้าย (Game Over/Reset)
            alert('Game Over! (Ball missed)');
            document.location.reload();
        }
    }
    
    // 3.5 การชนขอบขวา (อย่างง่าย - ให้เด้งกลับ)
    if (ballX + ballDX > canvas.width - ballRadius) {
        ballDX = -ballDX;
    }
}

// 4. ฟังก์ชัน Game Loop (หลักการทำงานซ้ำ)
function draw() {
    // ล้าง Canvas ในทุกเฟรม
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    update(); // อัปเดตตำแหน่งและการชน
    drawPaddle(); // วาดไม้ตี
    drawBall(); // วาดลูกบอล

    // เรียกฟังก์ชัน draw ซ้ำๆ ทุกเฟรม
    requestAnimationFrame(draw); 
}

// 5. การจัดการ Input (Keyboard Events)
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        upPressed = true;
    } else if (event.key === 'ArrowDown') {
        downPressed = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp') {
        upPressed = false;
    } else if (event.key === 'ArrowDown') {
        downPressed = false;
    }
});

// เริ่มเกม!
draw();