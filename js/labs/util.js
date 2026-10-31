export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const rand = (min, max) => min + Math.random() * (max - min);

export function setRangeProgress(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = Number(input.value);
  const pct = ((value - min) / (max - min)) * 100;
  input.style.setProperty("--range-progress", `${pct}%`);
}

export function formatNumber(value, digits = 0) {
  return Number(value).toFixed(digits);
}

/**
 * Keep a canvas crisp and give the draw callback a CSS-pixel-sized context.
 * Returns { resize, destroy, canvas, ctx }.
 */
export function setupCanvas(canvas, draw) {
  const ctx = canvas.getContext("2d");
  let raf = 0;
  let dpr = 1;
  let width = 0;
  let height = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, width, height);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  return {
    canvas,
    ctx,
    get width() { return width; },
    get height() { return height; },
    resize,
    redraw() { draw(ctx, width, height); },
    destroy() {
      ro.disconnect();
      cancelAnimationFrame(raf);
    },
  };
}

export function makeSvg(tag, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  return node;
}

export function addTapFeedback(node, className = "tap-pop") {
  node.classList.remove(className);
  void node.offsetWidth;
  node.classList.add(className);
}
