// Premium Particle System
class ParticleSystem {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
  }

  init() {
    // Create canvas if it doesn't exist
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'particleCanvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '9999';
      document.body.appendChild(this.canvas);
      
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      
      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticle(x, y, color) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 8 + 2;
    
    return {
      x: x,
      y: y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - Math.random() * 3,
      life: 1,
      decay: Math.random() * 0.02 + 0.01,
      size: Math.random() * 8 + 3,
      color: color,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2
    };
  }

  explode(x, y, count = 50, colors = null) {
    this.init();
    
    const defaultColors = [
      '#3b82f6', // Blue
      '#10b981', // Green
      '#f59e0b', // Orange
      '#ef4444', // Red
      '#8b5cf6', // Purple
      '#ec4899', // Pink
      '#06b6d4'  // Cyan
    ];
    
    const colorPalette = colors || defaultColors;
    
    for (let i = 0; i < count; i++) {
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      this.particles.push(this.createParticle(x, y, color));
    }
    
    if (!this.animationId) {
      this.animate();
    }
  }

  confetti(duration = 3000) {
    this.init();
    
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const startTime = Date.now();
    
    const createConfetti = () => {
      if (Date.now() - startTime < duration) {
        for (let i = 0; i < 3; i++) {
          const x = Math.random() * this.canvas.width;
          const particle = this.createParticle(x, -20, colors[Math.floor(Math.random() * colors.length)]);
          particle.vy = Math.random() * 2 + 2; // Fall down
          particle.vx = (Math.random() - 0.5) * 2;
          particle.decay = 0.005;
          this.particles.push(particle);
        }
        setTimeout(createConfetti, 50);
      }
    };
    
    createConfetti();
    
    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // Gravity
      p.vx *= 0.99; // Air resistance
      p.rotation += p.rotationSpeed;
      
      // Update life
      p.life -= p.decay;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Draw particle
      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      
      // Draw as square or circle randomly
      if (Math.random() > 0.5) {
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      }
      
      this.ctx.restore();
    }
    
    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
      // Remove canvas if no particles
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
        this.canvas = null;
      }
    }
  }

  clear() {
    this.particles = [];
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }
  }
}

// Create global instance
const particleSystem = new ParticleSystem();

// Helper function to get element position
function getElementCenter(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}
