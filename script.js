/*
original (with js): https://codepen.io/THEORLAN2/pen/xEOxEB
*/

// Create and append canvas to the DOM
const canvas = document.createElement('canvas');
canvas.classList.add('us-canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const TWO_PI = Math.PI * 2;

// Resize canvas to fit the window
const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Particle class with reset functionality for reusability
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 5 + 1;
    this.speedX = Math.random() * 1 - 0.5; // Reduced from 2 to 1
    this.speedY = Math.random() * 1 - 0.5; // Reduced from 2 to 1
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.size = Math.max(this.size - 0.1, 0.2);
    if (this.size <= 0.2) this.reset();
  }

  draw() {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, TWO_PI);
    ctx.fill();
  }
}

// Initialize a pool of particles
const MAX_PARTICLES = 100;
const particlePool = Array.from({ length: MAX_PARTICLES }, () => new Particle());

// Animation loop
const animate = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlePool.forEach(particle => {
    particle.update();
    particle.draw();
  });
  requestAnimationFrame(animate);
};

animate();

// Initialize UnicornStudio with the canvas
UnicornStudio.init().then(([scene]) => {
  const layer = scene.layers[1];
  layer.getPlane().loadCanvas(canvas, {
    premultipliedAlpha: true,
    sampler: 'uTexture',
  }).then(tex => {
    layer.preloadedCanvasTexture = tex;
  });
});

// Prevent scrolling for a fluid experience
window.addEventListener('scroll', event => {
  event.preventDefault();
  window.scrollTo(0, 0);
});
