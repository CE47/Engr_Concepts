/* Lightweight canvas confetti. */

const COLORS = ["#5ee7ff", "#ffd166", "#ff8fab", "#7bf1a8", "#b69cff", "#ff9f1c", "#ffffff"];

export function createConfetti(canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];
  let raf = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });

  function makeParticle(x, y, opts = {}) {
    const angle = opts.angle ?? Math.random() * Math.PI * 2;
    const speed = opts.speed ?? 4 + Math.random() * 8;
    const size = 4 + Math.random() * 7;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed * (0.4 + Math.random() * 0.8),
      vy: Math.sin(angle) * speed - (opts.up ?? 3 + Math.random() * 5),
      gravity: opts.gravity ?? 0.16 + Math.random() * 0.1,
      drag: 0.988,
      size,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      shape: Math.random() < 0.28 ? "circle" : Math.random() < 0.4 ? "star" : "rect",
      life: 1,
      decay: 0.006 + Math.random() * 0.007,
      wobble: Math.random() * Math.PI * 2,
    };
  }

  function burst(opts = {}) {
    const count = opts.count ?? 130;
    const x = opts.x ?? window.innerWidth / 2;
    const y = opts.y ?? window.innerHeight * 0.42;
    for (let i = 0; i < count; i++) {
      particles.push(makeParticle(x, y, opts));
    }
    if (!raf) loop();
  }

  function drawStar(p) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const r = i === 0 ? p.size : p.size * 0.55;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function loop() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;
      p.wobble += 0.12;
      p.life -= p.decay;

      if (p.life <= 0 || p.y > window.innerHeight + 80) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      const wobbleScale = 0.65 + Math.abs(Math.sin(p.wobble)) * 0.35;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "star") {
        drawStar(p);
      } else {
        ctx.scale(wobbleScale, 1);
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }

    if (particles.length) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = 0;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function rain(opts = {}) {
    const count = opts.count ?? 60;
    for (let i = 0; i < count; i++) {
      particles.push(
        makeParticle(Math.random() * window.innerWidth, -20, {
          angle: Math.PI / 2,
          speed: 2 + Math.random() * 5,
          up: -2,
          gravity: 0.12,
          ...opts,
        }),
      );
    }
    if (!raf) loop();
  }

  return { burst, rain, resize };
}
