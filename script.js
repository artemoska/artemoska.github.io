const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");
let hearts = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Heart {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 2;
        this.speedY = Math.random() * 1 + 0.5;
    }
    draw() {
        ctx.fillStyle = "rgba(255, 50, 50, 0.8)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    update() {
        this.y -= this.speedY;
        if (this.y < 0) {
            this.y = canvas.height;
            this.x = Math.random() * canvas.width;
        }
    }
}

function createHearts() {
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
    requestAnimationFrame(animateHearts);
}

createHearts();
animateHearts();

function toggleHearts() {
    hearts = hearts.length ? [] : createHearts();
}

function changeTheme() {
    document.body.classList.toggle("dark-theme");
}
