const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

// Resize the canvas to fill the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const particleCount = 100;
let mouse = { x: undefined, y: undefined }; // Track cursor position

// Mouse move event listener to update the mouse position
canvas.addEventListener('mousemove', (event) => {
    console.log(`Mouse X: ${event.x}, Mouse Y: ${event.y}`);
    mouse.x = event.x;
    mouse.y = event.y;
});


// Liquid particle class
class LiquidParticle {
    constructor(x, y, speedX, speedY, radius, color) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.radius = radius;
        this.color = color;
        this.alpha = 1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Simulate fluid-like motion with smooth randomness
        this.speedX += (Math.random() - 0.5) * 0.05;
        this.speedY += (Math.random() - 0.5) * 0.05;

        // Add attraction/repulsion effect with mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Ensure interaction happens when particles are within a threshold (150px)
        if (distance < 150) {
            const force = (150 - distance) / 150; // Calculate force based on proximity
            this.speedX += (dx / distance) * force * 0.5; // Apply force towards the mouse
            this.speedY += (dy / distance) * force * 0.5;
        }

        // Fade the particle over time
        this.alpha -= 0.01;
        if (this.alpha <= 0) {
            this.alpha = 0;
        }

        this.draw();
    }
}

// Create random particles
function createParticles() {
    for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 3 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const speedX = (Math.random() - 0.5) * 2;
        const speedY = (Math.random() - 0.5) * 2;
        const color = `rgba(255, 255, 255, 0.8)`; // White particles
        particles.push(new LiquidParticle(x, y, speedX, speedY, radius, color));
    }
}

// Animate particles with fluid-like movement
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }
    requestAnimationFrame(animateParticles);
}

// Initialize particles and start animation
createParticles();
animateParticles();

// Handle resizing the canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    createParticles();
});
