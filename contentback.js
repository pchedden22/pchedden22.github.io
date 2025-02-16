// --- CONTENT BACKGROUND ANIMATION (Instance #2) ---

const contentCanvas = document.getElementById('contentBackground');
const contentCtx = contentCanvas.getContext('2d');
resizeContentCanvas();
let contentAnimationRequest;

function startContentAnimation() {
  animateContent();
}

function animateContent() {
  contentCtx.clearRect(0, 0, contentCanvas.width, contentCanvas.height);
  // Replace with your content animation logic:
  contentCtx.fillStyle = 'rgba(100, 255, 100, 0.2)';
  contentCtx.fillRect(0, 0, contentCanvas.width, contentCanvas.height);
  contentAnimationRequest = requestAnimationFrame(animateContent);
}

// Resize canvases on window resize
window.addEventListener('resize', () => {
  heroCanvas.width = window.innerWidth;
  heroCanvas.height = window.innerHeight;
  resizeContentCanvas();
});

function resizeContentCanvas() {
  contentCanvas.width = window.innerWidth;
  // Use the content-wrapper's height for the canvas height.
  const wrapper = document.querySelector('.content-wrapper');
  contentCanvas.height = wrapper ? wrapper.offsetHeight : window.innerHeight;
}