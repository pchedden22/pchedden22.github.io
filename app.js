const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

// Resize the canvas to fill the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables for animation
let particles = [];
const particleCount = 100;

// Particle class
class Particle {
    constructor(x, y, speedX, speedY, radius, color) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.radius = radius;
        this.color = color;
    }

    // Draw the particle
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    // Update the particle position and behavior
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Make particles bounce off the edges
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.speedX = -this.speedX;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.speedY = -this.speedY;
        }

        this.draw();
    }
}

// Initialize particles
function createParticles() {
    for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 3 + 1; // Random size between 1 and 4
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const speedX = (Math.random() - 0.5) * 3; // Random horizontal speed
        const speedY = (Math.random() - 0.5) * 3; // Random vertical speed
        const color = 'rgba(255, 255, 255, 0.8)'; // White color for particles
        particles.push(new Particle(x, y, speedX, speedY, radius, color));
    }
}

// Animate the particles
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }
    requestAnimationFrame(animateParticles); // Keep animating
}

// Start the animation
createParticles();
animateParticles();

// Handle resizing the canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = []; // Clear existing particles
    createParticles(); // Recreate particles
});
