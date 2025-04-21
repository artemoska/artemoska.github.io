 const canvas = document.getElementById("heartCanvas");
        const ctx = canvas.getContext("2d");
        let hearts = [];
        let animationFrame;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class PixelHeart {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.floor(Math.random() * 3 + 2) * 4;
                this.speedY = Math.random() * 0.7 + 0.3;
            }

            draw() {
                ctx.fillStyle = "#ff66b2";
                const s = this.size;
                const px = this.x;
                const py = this.y;
                const block = s / 4;
                const pattern = [
                    [0,1,0,1,0],
                    [1,1,1,1,1],
                    [1,1,1,1,1],
                    [0,1,1,1,0],
                    [0,0,1,0,0]
                ];
                pattern.forEach((row, i) => {
                    row.forEach((cell, j) => {
                        if (cell) {
                            ctx.fillRect(px + j * block, py + i * block, block, block);
                        }
                    });
                });
            }

            update() {
                this.y -= this.speedY;
                if (this.y < -this.size * 2) {
                    this.y = canvas.height + this.size;
                    this.x = Math.random() * canvas.width;
                }
            }
        }

        function createHearts() {
            hearts = [];
            for (let i = 0; i < 80; i++) {
                hearts.push(new PixelHeart());
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
                document.body.style.background = "#2c003e";
                document.body.style.color = "#fff";
            } else {
                document.body.style.background = "linear-gradient(135deg, #ff99cc, #ffccff)";
                document.body.style.color = "#222";
            }
        }

        function revealOnScroll() {
            const reveals = document.querySelectorAll('.reveal');
            for (let i = 0; i < reveals.length; i++) {
                const windowHeight = window.innerHeight;
                const revealTop = reveals[i].getBoundingClientRect().top;
                const revealPoint = 150;
                if (revealTop < windowHeight - revealPoint) {
                    reveals[i].classList.add('active');
                }
            }
        }

        window.addEventListener('scroll', revealOnScroll);

        createHearts();
        animateHearts();
        revealOnScroll();
    </script>
</body>
</html>
