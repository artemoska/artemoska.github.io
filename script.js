const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");
let hearts = [];
let animationFrame;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Heart {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 10 + 5;
        this.speedY = Math.random() * 1 + 0.5;
    }
    draw() {
        ctx.fillStyle = "rgba(255, 50, 50, 0.8)";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.bezierCurveTo(this.x - this.size, this.y - this.size, this.x - this.size * 2, this.y + this.size / 2, this.x, this.y + this.size);
        ctx.bezierCurveTo(this.x + this.size * 2, this.y + this.size / 2, this.x + this.size, this.y - this.size, this.x, this.y);
        ctx.fill();
    }
    update() {
        this.y -= this.speedY;
        if (this.y < -this.size) {
            this.y = canvas.height;
            this.x = Math.random() * canvas.width;
        }
    }
}

function createHearts() {
    hearts = [];
    for (let i = 0; i < 100; i++) {
        hearts.push(new Heart());
    }
}

function animateHearts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hearts.forEach(heart => {
        heart.update();
        heart.draw();
    });
    animationFrame = requestAnimationFrame(animateHearts);
}

function toggleHearts() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
        createHearts();
        animateHearts();
    }
}

function changeTheme() {
    document.body.classList.toggle("dark-theme");
    if (document.body.classList.contains("dark-theme")) {
        document.body.style.background = "#222";
        document.body.style.color = "#fff";
    } else {
        document.body.style.background = "linear-gradient(135deg, #ff9a9e, #fad0c4)";
        document.body.style.color = "#333";
    }
}

createHearts();
animateHearts();
