let animationRequest; // To store the current animation frame request

// Set up canvas
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

// Resize the canvas to fill the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Mouse tracking
let mouse = { x: undefined, y: undefined };

// Particle-related variables for hover animation
let particles = [];
const particleCount = 200;
const MAX_SPEED = 5; // Set a max speed for the particles
const VELOCITY_DAMPENING = 0.99; // Factor by which speed reduces over time
const REPEL_RADIUS = 100; // Distance for particles to be affected by click
const REPEL_FORCE_SCALE = 0.5; // Factor to control the strength of the repulsion
let isRepelling = false; // Track whether the mouse button is held down
const FORCE_SCALING_FACTOR = 0.2; // Change this to control attraction strength


// Mesh grid variables
const ROWS = 100; // Number of rows in the grid
const COLS = 100; // Number of columns in the grid
const GRID_SPACING = 60; // Distance between points
const HEIGHT_FACTOR = 80; // Controls how high the grid points can go
const MOUSE_SENSITIVITY = 0.01; // Controls how strongly the points react to the mouse
const grid = [];
const ripples = [];

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
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        if (!isRepelling) {
            // Apply mouse interaction to particles when the mouse is not clicked (attraction)
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Ensure interaction happens when particles are within a threshold (150px)
            if (distance < 150) {
                const force = (150 - distance) / 150; // Calculate force based on proximity
                this.speedX += (dx / distance) * force * FORCE_SCALING_FACTOR; // Apply force towards the mouse
                this.speedY += (dy / distance) * force * FORCE_SCALING_FACTOR;
            }
        }

        // Limit the speed to the maximum defined speed
        const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        if (speed > MAX_SPEED) {
            this.speedX = (this.speedX / speed) * MAX_SPEED;
            this.speedY = (this.speedY / speed) * MAX_SPEED;
        }

        // Reduce velocity over time (dampen speed)
        this.speedX *= VELOCITY_DAMPENING;
        this.speedY *= VELOCITY_DAMPENING;

        // Update position
        this.x += this.speedX;
        this.y += this.speedY;

        // Make particles bounce off the edges
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.speedX = -this.speedX;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.speedY = -this.speedY;
        }

        // Simulate fluid-like motion with smooth randomness
        this.speedX += (Math.random() - 0.5) * 0.05;
        this.speedY += (Math.random() - 0.5) * 0.05;

        // Fade the particle over time
        this.alpha -= 0.01;
        if (this.alpha <= 0) {
            this.alpha = 0;
        }

        this.draw();
    }

    connect(particles) {
        for (let i = 0; i < particles.length; i++) {
            const dx = this.x - particles[i].x;
            const dy = this.y - particles[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) { // Distance threshold for drawing lines
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(particles[i].x, particles[i].y);
                ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`; // White line color with transparency
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
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
        const color = `rgba(255, 255, 255, 0.8)`; 
        particles.push(new LiquidParticle(x, y, speedX, speedY, radius, color));
    }
}

// Animate hover particles with fluid-like movement
function animateHoverParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].connect(particles);
    }

    animationRequest = requestAnimationFrame(animateHoverParticles);
}

// Create grid for mesh animation
function createGrid() {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const x = j * GRID_SPACING;
            const y = i * GRID_SPACING;
            const z = 0; // Initial height is flat (0)
            grid.push({ x, y, z });
        }
    }
}

// Mouse down event listener to enable repulsion
window.addEventListener('mousedown', () => {
    isRepelling = true; // Start repelling when the mouse button is pressed
});

// Mouse up event listener to disable repulsion
window.addEventListener('mouseup', () => {
    isRepelling = false; // Stop repelling when the mouse button is released
});

// Click event listener on window to apply repulsion
window.addEventListener('click', () => {
    console.log(`Click!`);
    for (let i = 0; i < particles.length; i++) {
        const dx = mouse.x - particles[i].x;
        const dy = mouse.y - particles[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Repel particles that are within the REPEL_RADIUS distance if button is held
        if (isRepelling && distance < REPEL_RADIUS) {
            const repelForce = (REPEL_RADIUS - distance) / REPEL_RADIUS; // Calculate force based on proximity
            // Apply repulsion force away from the cursor, scaled by REPEL_FORCE_SCALE
            particles[i].speedX -= (dx / distance) * repelForce * REPEL_FORCE_SCALE;  
            particles[i].speedY -= (dy / distance) * repelForce * REPEL_FORCE_SCALE;
        }
    }
});

// Update grid heights based on mouse proximity and ripple
function updateGrid() {
    for (let ripple of ripples) {
        for (let i = 0; i < grid.length; i++) {
            const dx = ripple.x - grid[i].x;
            const dy = ripple.y - grid[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const rippleEdge = ripple.radius;
            const distanceToEdge = Math.abs(distance - rippleEdge);

            if (distanceToEdge < 10) {
                const rippleForce = (rippleEdge - distance) * MOUSE_SENSITIVITY * 4;
                grid[i].z = Math.sin(rippleForce) * HEIGHT_FACTOR;
            }
        }
    }

    // Update the ripples
    for (let i = 0; i < ripples.length; i++) {
        ripples[i].radius += 2; // Increase the radius of the ripple over time
        ripples[i].decay -= 0.001; // Decay the ripple effect (fade out)
        if (ripples[i].decay <= 0) {
            ripples.splice(i, 1); // Remove the ripple when it's fully decayed
            i--;
        }
    }

    for (let i = 0; i < grid.length; i++) {
        const dx = mouse.x - grid[i].x;
        const dy = mouse.y - grid[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
            const rippleForce = (150 - distance) * MOUSE_SENSITIVITY;
            grid[i].z = rippleForce * HEIGHT_FACTOR;
        } else if (grid[i].z > 0) {
            grid[i].z -= 0.1;
        }
    }
}

// Draw grid
function drawGrid() {
    for (let i = 0; i < grid.length; i++) {
        const { x, y, z } = grid[i];

        ctx.beginPath();
        ctx.arc(x, y + z, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();

        if (i + 1 < grid.length && (i + 1) % COLS !== 0) {
            const next = grid[i + 1];
            ctx.beginPath();
            ctx.moveTo(x, y + z);
            ctx.lineTo(next.x, next.y + next.z);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        if (i + COLS < grid.length) {
            const down = grid[i + COLS];
            ctx.beginPath();
            ctx.moveTo(x, y + z);
            ctx.lineTo(down.x, down.y + down.z);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }
}

// Main animation loop for mesh
function animateMeshGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateGrid();
    drawGrid();
    animationRequest = requestAnimationFrame(animateMeshGrid);
}

// Mouse event listeners
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

window.addEventListener('click', () => {
    ripples.push({
        x: mouse.x,
        y: mouse.y,
        radius: 0,
        decay: 1
    });
});

// Function to switch between animations
function switchToHover() {
    cancelAnimationFrame(animationRequest);
    particles = [];
    createParticles();
    animateHoverParticles();
}

function switchToMesh() {
    cancelAnimationFrame(animationRequest);
    grid.length = 0;
    createGrid();
    animateMeshGrid();
}

// Initial animation (default hover)
switchToHover();

// Handle resizing the canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    grid.length = 0;
    createParticles();
    createGrid();
});
