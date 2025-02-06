console.log("JavaScript loaded!");

// Set up canvas
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

// Resize the canvas to fill the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Mesh grid settings
const ROWS = 100; // Number of rows in the grid
const COLS = 100; // Number of columns in the grid
const GRID_SPACING = 60; // Distance between points
const HEIGHT_FACTOR = 80; // Controls how high the grid points can go
const MOUSE_SENSITIVITY = 0.01; // Controls how strongly the points react to the mouse
let mouse = { x: undefined, y: undefined }; // Track mouse position
const grid = [];
const ripples = [];

// Create a grid of points
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

// Update the heights of the points in the grid based on mouse proximity and ripple propagation
function updateGrid() {
    // Apply ripples (ring effect)
    for (let ripple of ripples) {
        for (let i = 0; i < grid.length; i++) {
            const dx = ripple.x - grid[i].x;
            const dy = ripple.y - grid[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if the point is close to the edge of the ripple (ring)
            const rippleEdge = ripple.radius;
            const distanceToEdge = Math.abs(distance - rippleEdge);

            // If the point is near the edge of the ripple (within a certain threshold)
            if (distanceToEdge < 10) { // Adjust the threshold for the thickness of the ring
                const force = (rippleEdge - distance) * MOUSE_SENSITIVITY * 4;
                grid[i].z = Math.sin(force) * HEIGHT_FACTOR; // Apply the wave-like effect to the ring
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

    // Apply the mouse proximity effect to raise/lower points (hover effect)
    for (let i = 0; i < grid.length; i++) {
        const dx = mouse.x - grid[i].x;
        const dy = mouse.y - grid[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If the point is within a certain distance from the mouse
        if (distance < 150) {
            const force = (150 - distance) * MOUSE_SENSITIVITY;
            grid[i].z = force * HEIGHT_FACTOR; // Raise or lower the point
        } else if (grid[i].z > 0) {
            // Slowly reset back to 0 if no longer affected by mouse
            grid[i].z -= 0.1;
        }
    }
}

// Draw the grid and create the 3D effect
function drawGrid() {
    for (let i = 0; i < grid.length; i++) {
        const { x, y, z } = grid[i];

        // Draw the points as circles
        ctx.beginPath();
        ctx.arc(x, y + z, 3, 0, Math.PI * 2); // Add z to y to create the 3D effect
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();

        // Optionally connect the points with lines (to form the grid)
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

// Track mouse position
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// Mouse click event to generate a ripple
window.addEventListener('click', () => {
    // Add a new ripple at the current mouse position
    ripples.push({
        x: mouse.x,
        y: mouse.y,
        radius: 0,  // Start with a radius of 0
        decay: 1    // Initial decay factor
    });
});

// Main animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    updateGrid(); // Update the grid based on mouse position and ripples
    drawGrid();   // Draw the grid with the updated heights
    requestAnimationFrame(animate); // Keep animating
}

// Initialize the grid and start animation
createGrid();
animate();

// Handle resizing the canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createGrid(); // Recreate grid on resize
});
