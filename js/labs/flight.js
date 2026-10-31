import { clamp, setRangeProgress, setupCanvas } from "./util.js";

const art = `
<svg viewBox="0 0 320 160" aria-hidden="true">
  <defs>
    <linearGradient id="flightSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#123a5e"/>
      <stop offset="1" stop-color="#0b566c"/>
    </linearGradient>
    <linearGradient id="flightPlane" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#8ee7ff"/>
    </linearGradient>
  </defs>
  <rect width="320" height="160" rx="18" fill="url(#flightSky)"/>
  <circle cx="258" cy="34" r="19" fill="#ffd166" opacity=".8"/>
  <g fill="#dff8ff" opacity=".2">
    <ellipse cx="74" cy="44" rx="38" ry="12"/><ellipse cx="104" cy="38" rx="26" ry="15"/>
    <ellipse cx="222" cy="72" rx="34" ry="10"/><ellipse cx="246" cy="66" rx="22" ry="12"/>
  </g>
  <path d="M0 130h320v30H0z" fill="#0c3040"/>
  <path d="M0 132q40-12 80 0t80 0 80 0 80 0" fill="none" stroke="#8ee7ff" stroke-width="2" opacity=".35"/>
  <g class="art-ring" style="transform-origin:244px 80px" fill="none" stroke="#ffd166" stroke-width="6">
    <circle cx="244" cy="80" r="26"/>
    <circle cx="244" cy="80" r="34" stroke-width="2" opacity=".45"/>
  </g>
  <g class="art-plane">
    <path d="M38 94l78-28-34 32-6 26-12-18-26-12z" fill="url(#flightPlane)" stroke="#08243c" stroke-width="3" stroke-linejoin="round"/>
    <path d="M82 98l-6 26 14-22" fill="#5ee7ff" stroke="#08243c" stroke-width="2"/>
  </g>
  <path d="M20 116c40-22 88-24 132-6" fill="none" stroke="#ffd166" stroke-width="2.5" stroke-dasharray="5 7" opacity=".7"/>
  <g fill="#ffd166" opacity=".55">
    <circle cx="46" cy="24" r="1.6"/><circle cx="128" cy="42" r="1.4"/><circle cx="196" cy="22" r="1.8"/>
  </g>
</svg>`;

const START = { x: 120, y: 430 };
const RING = { x: 720, y: 230, r: 55 };
const GROUND = 490;
const GRAVITY = 250;

export default {
  id: "flight",
  num: "08",
  title: "Glider Launch",
  icon: "✈️",
  accent: "#5ee7ff",
  mission: "Fly through the ring!",
  tags: ["Flight", "Motion"],
  hint: "Launch angle and power both matter. Watch your ghost trails and tweak one thing.",
  art,

  mount(root, api) {
    root.innerHTML = `
      <div class="lab-layout">
        <div class="lab-canvas-wrap">
          <div class="scene flight-scene">
            <canvas id="flightCanvas" aria-label="Glider launch scene"></canvas>
            <div class="scene-pill"><span>🎯</span> ring target</div>
            <div class="scene-callout" id="flightCallout"></div>
          </div>
        </div>

        <aside class="control-panel">
          <div class="panel-head">
            <span class="panel-title"><span>⚙</span> Launch</span>
            <button class="mini-btn" id="flightReset" aria-label="Reset launch">↺</button>
          </div>

          <div class="control-group">
            <label class="control-label" for="angleRange">Angle <span class="control-value" id="angleVal">35°</span></label>
            <input type="range" id="angleRange" min="15" max="55" value="35">
          </div>
          <div class="control-group">
            <label class="control-label" for="powerRange">Power <span class="control-value" id="powerVal">45</span></label>
            <input type="range" id="powerRange" min="20" max="100" value="45">
          </div>

          <div class="stat-row">
            <div class="stat"><span class="stat-label">Attempts</span><span class="stat-value" id="attemptCount">0</span></div>
            <div class="stat"><span class="stat-label">Best</span><span class="stat-value" id="bestDistance">—</span></div>
          </div>

          <button class="action-btn" id="flightGo">LAUNCH <span aria-hidden="true">▶</span></button>
          <div class="hint-chip"><span>💡</span><span>More power = faster. Angle = arc. Find the ring.</span></div>
          <div class="ghost-note"><span>👻</span> Ghost trails show past tries.</div>
        </aside>
      </div>`;

    const canvas = root.querySelector("#flightCanvas");
    const angleRange = root.querySelector("#angleRange");
    const powerRange = root.querySelector("#powerRange");
    const angleVal = root.querySelector("#angleVal");
    const powerVal = root.querySelector("#powerVal");
    const goBtn = root.querySelector("#flightGo");
    const resetBtn = root.querySelector("#flightReset");
    const callout = root.querySelector("#flightCallout");
    const attemptCount = root.querySelector("#attemptCount");
    const bestDistance = root.querySelector("#bestDistance");

    const ac = new AbortController();
    const signal = ac.signal;

    const state = {
      angle: 35,
      power: 45,
      running: false,
      points: [],
      ghostTrails: [],
      trail: [],
      index: 0,
      startTime: 0,
      raf: 0,
      hit: false,
      completed: false,
      attempts: 0,
      best: null,
      calloutTimer: 0,
      last: 0,
      ringFlash: 0,
    };

    setRangeProgress(angleRange);
    setRangeProgress(powerRange);

    function syncControls() {
      state.angle = Number(angleRange.value);
      state.power = Number(powerRange.value);
      angleVal.textContent = `${state.angle}°`;
      powerVal.textContent = state.power;
      setRangeProgress(angleRange);
      setRangeProgress(powerRange);
      if (!state.running) draw();
    }

    function buildTrajectory(angle, power) {
      const rad = (angle * Math.PI) / 180;
      const v0 = 300 + power * 3.5;
      const points = [];
      let hit = false;
      const dt = 1 / 120;
      for (let t = 0; t < 6; t += dt) {
        const x = START.x + v0 * Math.cos(rad) * t;
        const y = START.y - v0 * Math.sin(rad) * t + 0.5 * GRAVITY * t * t;
        points.push({ x, y, t });
        if (!hit && Math.hypot(x - RING.x, y - RING.y) < RING.r) hit = true;
        if (y > GROUND || x > 1100) break;
      }
      return { points, hit };
    }

    function showCallout(text, tone = "info") {
      callout.textContent = text;
      callout.className = `scene-callout show ${tone}`;
      clearTimeout(state.calloutTimer);
      state.calloutTimer = setTimeout(() => callout.classList.remove("show"), 2200);
    }

    function draw() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const ctx = canvas.getContext("2d");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const scale = Math.min(w / 1000, h / 560);
      const ox = (w - 1000 * scale) / 2;
      const oy = (h - 560 * scale) / 2;
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(scale, scale);

      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, 560);
      sky.addColorStop(0, "#0c3153");
      sky.addColorStop(0.55, "#0f536c");
      sky.addColorStop(1, "#0a2c40");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 1000, 560);

      // sun
      ctx.fillStyle = "rgba(255, 209, 102, .85)";
      ctx.beginPath();
      ctx.arc(852, 80, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 209, 102, .08)";
      ctx.beginPath();
      ctx.arc(852, 80, 78, 0, Math.PI * 2);
      ctx.fill();

      // stars
      ctx.fillStyle = "rgba(223, 248, 255, .65)";
      for (let i = 0; i < 20; i++) {
        ctx.globalAlpha = 0.3 + (i % 4) * 0.14;
        ctx.beginPath();
        ctx.arc((i * 97) % 1000, (i * 43) % 250, i % 6 === 0 ? 1.8 : 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // clouds
      drawCloud(ctx, 190, 120, 1);
      drawCloud(ctx, 610, 150, 0.8);
      drawCloud(ctx, 880, 120, 0.6);

      // hills + ground
      ctx.fillStyle = "#0b3040";
      ctx.beginPath();
      ctx.moveTo(0, 470);
      ctx.quadraticCurveTo(160, 420, 320, 466);
      ctx.quadraticCurveTo(480, 510, 650, 460);
      ctx.quadraticCurveTo(820, 414, 1000, 466);
      ctx.lineTo(1000, 560);
      ctx.lineTo(0, 560);
      ctx.fill();
      const groundGrad = ctx.createLinearGradient(0, GROUND, 0, 560);
      groundGrad.addColorStop(0, "#17413c");
      groundGrad.addColorStop(1, "#071c28");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, GROUND, 1000, 70);
      ctx.strokeStyle = "rgba(142, 231, 255, .28)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND);
      ctx.lineTo(1000, GROUND);
      ctx.stroke();

      // launch pad
      ctx.fillStyle = "#123a4a";
      ctx.fillRect(82, 452, 92, 10);
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.moveTo(120, 430);
      ctx.lineTo(150, 452);
      ctx.lineTo(120, 452);
      ctx.closePath();
      ctx.fill();

      // ghost trails
      state.ghostTrails.forEach((ghost) => {
        ctx.beginPath();
        ghost.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = "rgba(182, 156, 255, .24)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 7]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // current trail
      if (state.trail.length > 1) {
        ctx.beginPath();
        state.trail.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = "rgba(255, 209, 102, .65)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // ring
      const pulse = 1 + Math.sin(performance.now() / 300) * 0.035 + state.ringFlash * 0.25;
      ctx.save();
      ctx.translate(RING.x, RING.y);
      ctx.scale(pulse, pulse);
      ctx.strokeStyle = state.hit ? "#7bf1a8" : "#ffd166";
      ctx.lineWidth = 10;
      ctx.shadowColor = state.hit ? "#7bf1a8" : "#ffd166";
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(0, 0, RING.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(223, 248, 255, .65)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, RING.r + 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // target stand
      ctx.strokeStyle = "rgba(142, 231, 255, .3)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(RING.x, RING.y + RING.r);
      ctx.lineTo(RING.x, GROUND);
      ctx.stroke();

      // plane
      const p = state.points[state.index] || state.points[state.points.length - 1] || { x: START.x, y: START.y };
      const prev = state.points[Math.max(0, state.index - 2)] || p;
      const angle = Math.atan2(p.y - prev.y, p.x - prev.x);
      drawPlane(ctx, p.x, p.y, angle, state.running ? 1 : 0.9);

      // angle / power HUD
      ctx.fillStyle = "rgba(223, 248, 255, .7)";
      ctx.font = "800 16px Nunito, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("ANGLE", 40, 52);
      ctx.fillStyle = "#ffd166";
      ctx.font = "600 32px Fredoka, sans-serif";
      ctx.fillText(`${state.angle}°`, 40, 84);
      ctx.fillStyle = "rgba(223, 248, 255, .7)";
      ctx.font = "800 16px Nunito, sans-serif";
      ctx.fillText("POWER", 40, 118);
      ctx.fillStyle = "#5ee7ff";
      ctx.font = "600 32px Fredoka, sans-serif";
      ctx.fillText(`${state.power}`, 40, 150);

      ctx.restore();
    }

    function drawCloud(ctx, x, y, s) {
      ctx.fillStyle = "rgba(223, 248, 255, .13)";
      ctx.beginPath();
      ctx.ellipse(x, y, 58 * s, 16 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 34 * s, y - 8 * s, 34 * s, 18 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(x - 30 * s, y - 5 * s, 28 * s, 14 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawPlane(ctx, x, y, angle, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.shadowColor = "rgba(94, 231, 255, .8)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#dff8ff";
      ctx.strokeStyle = "#08243c";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(24, 0);
      ctx.lineTo(-20, -15);
      ctx.lineTo(-9, 0);
      ctx.lineTo(-20, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#5ee7ff";
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(-20, 15);
      ctx.lineTo(-28, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    function launch() {
      if (state.running) return;
      state.running = true;
      state.completed = false;
      state.hit = false;
      state.ringFlash = 0;
      state.trail = [];
      state.index = 0;
      state.attempts += 1;
      attemptCount.textContent = state.attempts;
      const { points, hit } = buildTrajectory(state.angle, state.power);
      state.points = points;
      state.hit = hit;
      state.startTime = performance.now();
      state.last = state.startTime;
      goBtn.disabled = true;
      goBtn.innerHTML = `FLYING…`;
      api.sfx.play("whoosh");
      state.raf = requestAnimationFrame(step);
    }

    function step(now) {
      if (!state.running) return;
      const dt = Math.min(0.05, (now - state.last) / 1000);
      state.last = now;
      state.index += dt * 120;
      const idx = clamp(Math.floor(state.index), 0, state.points.length - 1);
      state.trail.push(state.points[idx]);
      if (state.trail.length > 260) state.trail.shift();
      if (state.hit && idx > 0 && Math.hypot(state.points[idx].x - RING.x, state.points[idx].y - RING.y) < RING.r) {
        state.ringFlash = 1;
      }
      draw();

      if (idx >= state.points.length - 1) {
        state.running = false;
        goBtn.disabled = false;
        goBtn.innerHTML = `LAUNCH AGAIN <span aria-hidden="true">↻</span>`;
        state.ghostTrails.push(state.points.map((p) => ({ ...p })));
        if (state.ghostTrails.length > 4) state.ghostTrails.shift();
        if (state.hit) {
          api.sfx.play("success");
          showCallout("THROUGH THE RING!", "good");
          api.complete("Angle + power = a perfect flight path.");
          state.completed = true;
        } else {
          api.sfx.play("fail");
          showCallout("MISSED!", "bad");
          const last = state.points[state.points.length - 1];
          const dist = Math.hypot(last.x - RING.x, last.y - RING.y);
          state.best = state.best === null ? dist : Math.min(state.best, dist);
          bestDistance.textContent = `${state.best.toFixed(0)} px`;
          api.toast("Tweak the angle or power.", "✈️");
        }
        return;
      }
      state.raf = requestAnimationFrame(step);
    }

    function reset() {
      cancelAnimationFrame(state.raf);
      state.running = false;
      state.points = [];
      state.trail = [];
      state.ghostTrails = [];
      state.index = 0;
      state.hit = false;
      state.completed = false;
      state.attempts = 0;
      state.best = null;
      attemptCount.textContent = "0";
      bestDistance.textContent = "—";
      goBtn.disabled = false;
      goBtn.innerHTML = `LAUNCH <span aria-hidden="true">▶</span>`;
      callout.classList.remove("show");
      draw();
      api.sfx.play("click");
    }

    angleRange.addEventListener("input", syncControls, { signal });
    powerRange.addEventListener("input", syncControls, { signal });
    goBtn.addEventListener("click", launch, { signal });
    resetBtn.addEventListener("click", reset, { signal });

    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    syncControls();

    return {
      hint: "Launch angle and power both matter. Watch your ghost trails and tweak one thing.",
      destroy() {
        cancelAnimationFrame(state.raf);
        clearTimeout(state.calloutTimer);
        ro.disconnect();
        ac.abort();
      },
    };
  },
};
