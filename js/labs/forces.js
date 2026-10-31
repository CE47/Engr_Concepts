import { clamp, setRangeProgress, setupCanvas } from "./util.js";

const art = `
<svg viewBox="0 0 320 160" aria-hidden="true">
  <defs>
    <linearGradient id="forceSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b2c4e"/>
      <stop offset="1" stop-color="#0b4d66"/>
    </linearGradient>
    <linearGradient id="forceBody" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7feff"/>
      <stop offset="1" stop-color="#8ee7ff"/>
    </linearGradient>
  </defs>
  <rect width="320" height="160" rx="18" fill="url(#forceSky)"/>
  <circle cx="255" cy="42" r="22" fill="#ffd166" opacity=".85"/>
  <path d="M0 126h320v34H0z" fill="#102d3b"/>
  <path d="M0 128h320" stroke="#5ee7ff" stroke-width="2" opacity=".4"/>
  <path d="M0 134h320" stroke="#ffd166" stroke-width="1.4" stroke-dasharray="10 10" opacity=".35"/>
  <g class="art-dash" stroke="#8ee7ff" stroke-width="3" stroke-linecap="round" opacity=".5">
    <path d="M36 78h40"/><path d="M20 94h34"/><path d="M48 110h26"/>
  </g>
  <g class="art-bob">
    <path d="M103 104h94c10 0 18-6 22-14l8-15-20-2-14-18h-58l-16 20-20 7z" fill="url(#forceBody)" stroke="#0b2c47" stroke-width="4"/>
    <path d="M135 58h42l10 15h-58z" fill="#173a5e"/>
    <circle cx="128" cy="108" r="12" fill="#0b2c47" stroke="#ffd166" stroke-width="4"/>
    <circle cx="128" cy="108" r="4" fill="#ffd166"/>
    <circle cx="184" cy="108" r="12" fill="#0b2c47" stroke="#ffd166" stroke-width="4"/>
    <circle cx="184" cy="108" r="4" fill="#ffd166"/>
    <path class="art-flame" d="M222 86c18 0 27-8 36-14-5 10-8 20-4 30-12-4-22-6-32-3z" fill="#ff9f1c"/>
    <path class="art-flame" d="M232 90c10 0 16-3 23-7-4 6-5 11-4 16-8-3-13-4-19-2z" fill="#ffd166"/>
    <path d="M104 76c-9 0-16-4-22-10 6 1 11 0 16-4-3 6-3 10 0 14z" fill="#ff8fab"/>
  </g>
  <g class="art-flag">
    <path d="M278 126V58" stroke="#dff8ff" stroke-width="4" stroke-linecap="round"/>
    <path d="M280 60l26 9-26 10z" fill="#ffd166"/>
  </g>
  <g fill="#ffd166" opacity=".7">
    <circle cx="42" cy="30" r="2"/><circle cx="80" cy="50" r="1.6"/><circle cx="148" cy="26" r="2"/>
  </g>
</svg>`;

export default {
  id: "forces",
  num: "01",
  title: "Rocket Sled",
  icon: "🚀",
  accent: "#5ee7ff",
  mission: "Stop at the flag!",
  tags: ["Forces", "Friction"],
  hint: "Push gives speed. Grip takes it away. Find the combo that stops at 50 m.",
  art,

  mount(root, api) {
    root.innerHTML = `
      <div class="lab-layout">
        <div class="lab-canvas-wrap">
          <div class="scene forces-scene">
            <canvas id="sledCanvas" aria-label="Rocket sled test track"></canvas>
            <div class="scene-pill"><span>🎯</span> 50 m</div>
            <div class="scene-callout" id="sledCallout"></div>
          </div>
        </div>
        <aside class="control-panel">
          <div class="panel-head">
            <span class="panel-title"><span>⚙</span> Controls</span>
            <button class="mini-btn" id="sledReset" aria-label="Reset test">↺</button>
          </div>
          <div class="control-group">
            <label class="control-label" for="pushRange">Push <span class="control-value" id="pushVal">55</span></label>
            <input type="range" id="pushRange" min="20" max="100" value="55">
          </div>
          <div class="control-group">
            <label class="control-label" for="gripRange">Grip <span class="control-value" id="gripVal">25</span></label>
            <input type="range" id="gripRange" min="10" max="90" value="25">
          </div>
          <div class="stat-row">
            <div class="stat"><span class="stat-label">Speed</span><span class="stat-value" id="speedStat">0</span></div>
            <div class="stat"><span class="stat-label">Distance</span><span class="stat-value" id="distStat">0 m</span></div>
          </div>
          <button class="action-btn warm" id="sledGo">TEST <span aria-hidden="true">▶</span></button>
          <div class="hint-chip"><span>💡</span><span>Push hard, then let grip stop you at the flag.</span></div>
          <div class="attempt-strip" id="attemptStrip" aria-label="Previous attempts"></div>
        </aside>
      </div>`;

    const canvas = root.querySelector("#sledCanvas");
    const pushRange = root.querySelector("#pushRange");
    const gripRange = root.querySelector("#gripRange");
    const pushVal = root.querySelector("#pushVal");
    const gripVal = root.querySelector("#gripVal");
    const speedStat = root.querySelector("#speedStat");
    const distStat = root.querySelector("#distStat");
    const goBtn = root.querySelector("#sledGo");
    const resetBtn = root.querySelector("#sledReset");
    const callout = root.querySelector("#sledCallout");
    const attemptStrip = root.querySelector("#attemptStrip");

    const ac = new AbortController();
    const signal = ac.signal;

    const state = {
      push: 55,
      grip: 25,
      phase: "idle", // idle | running | done
      frames: [],
      frameIndex: 0,
      sim: null,
      attempts: [],
      calloutTimer: 0,
      raf: 0,
      startTime: 0,
    };

    setRangeProgress(pushRange);
    setRangeProgress(gripRange);

    function syncRanges() {
      state.push = Number(pushRange.value);
      state.grip = Number(gripRange.value);
      pushVal.textContent = state.push;
      gripVal.textContent = state.grip;
      setRangeProgress(pushRange);
      setRangeProgress(gripRange);
      if (state.phase === "idle") stage.redraw();
    }

    function simulate(pushPct, gripPct) {
      const mass = 2;
      const g = 9.8;
      const burnTime = 1.2;
      const force = 10 + pushPct * 0.3;
      const mu = 0.05 + gripPct * 0.0045;
      const dt = 1 / 120;
      let x = 0;
      let v = 0;
      let t = 0;
      const frames = [{ x, v, t, burning: true }];
      while (t < 10) {
        const burning = t < burnTime;
        const accel = burning ? (force - mu * mass * g) / mass : -mu * g;
        v += accel * dt;
        if (v < 0) v = 0;
        x += v * dt;
        t += dt;
        frames.push({ x, v, t, burning });
        if (!burning && v <= 0.001) break;
      }
      return { frames, distance: x, force, mu };
    }

    function currentFrame() {
      if (!state.frames.length) return { x: 0, v: 0, burning: false };
      const idx = clamp(Math.floor(state.frameIndex), 0, state.frames.length - 1);
      return state.frames[idx];
    }

    function drawScene(ctx, w, h) {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#082844");
      sky.addColorStop(0.55, "#0b4260");
      sky.addColorStop(1, "#0c3548");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // stars
      ctx.fillStyle = "rgba(255, 241, 190, .72)";
      for (let i = 0; i < 26; i++) {
        const sx = ((i * 83.7) % w);
        const sy = ((i * 47.3) % (h * 0.55));
        const r = i % 5 === 0 ? 1.8 : 1;
        ctx.globalAlpha = 0.35 + (i % 4) * 0.14;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // distant hills
      ctx.fillStyle = "#0a2b3f";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.66);
      ctx.quadraticCurveTo(w * 0.18, h * 0.52, w * 0.38, h * 0.65);
      ctx.quadraticCurveTo(w * 0.56, h * 0.76, w * 0.74, h * 0.6);
      ctx.quadraticCurveTo(w * 0.9, h * 0.48, w, h * 0.64);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      const groundY = h * 0.77;
      const trackX0 = w * 0.075;
      const trackX1 = w * 0.925;
      const trackW = trackX1 - trackX0;
      const mapX = (m) => trackX0 + (clamp(m, 0, 100) / 100) * trackW;

      // ground
      const ground = ctx.createLinearGradient(0, groundY, 0, h);
      ground.addColorStop(0, "#123f3c");
      ground.addColorStop(1, "#071c28");
      ctx.fillStyle = ground;
      ctx.fillRect(0, groundY, w, h - groundY);

      // track
      ctx.strokeStyle = "rgba(142, 231, 255, .18)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trackX0, groundY);
      ctx.lineTo(trackX1, groundY);
      ctx.stroke();

      // success zone
      const zoneStart = mapX(42);
      const zoneEnd = mapX(58);
      const zoneGrad = ctx.createLinearGradient(zoneStart, 0, zoneEnd, 0);
      zoneGrad.addColorStop(0, "rgba(123, 241, 168, 0)");
      zoneGrad.addColorStop(0.5, "rgba(123, 241, 168, .22)");
      zoneGrad.addColorStop(1, "rgba(123, 241, 168, 0)");
      ctx.fillStyle = zoneGrad;
      ctx.fillRect(zoneStart, groundY - 48, zoneEnd - zoneStart, 48);

      // distance ticks
      ctx.font = `700 ${Math.max(9, h * 0.021)}px Nunito, sans-serif`;
      ctx.textAlign = "center";
      for (let m = 0; m <= 100; m += 10) {
        const x = mapX(m);
        const major = m % 50 === 0;
        ctx.strokeStyle = major ? "rgba(223, 248, 255, .5)" : "rgba(142, 231, 255, .18)";
        ctx.lineWidth = major ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x, groundY + (major ? 15 : 7));
        ctx.stroke();
        if (major) {
          ctx.fillStyle = "rgba(155, 183, 204, .85)";
          ctx.fillText(`${m} m`, x, groundY + 31);
        }
      }

      // flag
      const flagX = mapX(50);
      const flagBase = groundY;
      ctx.strokeStyle = "#dff8ff";
      ctx.lineWidth = Math.max(2, h * 0.006);
      ctx.beginPath();
      ctx.moveTo(flagX, flagBase);
      ctx.lineTo(flagX, flagBase - h * 0.2);
      ctx.stroke();
      const flagWave = Math.sin(performance.now() / 260) * 3;
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.moveTo(flagX, flagBase - h * 0.2);
      ctx.lineTo(flagX + w * 0.052, flagBase - h * 0.18 + flagWave);
      ctx.lineTo(flagX, flagBase - h * 0.13);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(223, 248, 255, .9)";
      ctx.font = `700 ${Math.max(10, h * 0.025)}px Fredoka, sans-serif`;
      ctx.fillText("STOP HERE", flagX, flagBase - h * 0.235);

      // previous attempts
      state.attempts.forEach((a, i) => {
        const x = mapX(a.distance);
        const ok = a.distance >= 42 && a.distance <= 58;
        ctx.fillStyle = ok ? "rgba(123, 241, 168, .8)" : "rgba(155, 183, 204, .5)";
        ctx.beginPath();
        ctx.arc(x, groundY + 7, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = ok ? "rgba(123, 241, 168, .4)" : "rgba(155, 183, 204, .25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, groundY - 3);
        ctx.lineTo(x, groundY + 17);
        ctx.stroke();
      });

      const frame = currentFrame();
      const sledX = mapX(frame.x);
      const scale = h / 560;

      // speed lines
      if (state.phase === "running" && frame.v > 2) {
        ctx.strokeStyle = "rgba(142, 231, 255, .4)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const offset = (performance.now() / 2 + i * 32) % 70;
          const ly = groundY - 42 - i * 15;
          const lx = sledX - 75 - offset;
          ctx.globalAlpha = 0.25 + i * 0.12;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx + 38, ly);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // sled body
      ctx.save();
      ctx.translate(sledX, groundY);
      ctx.scale(scale, scale);
      const bounce = state.phase === "running" ? Math.sin(performance.now() / 60) * 1.5 : 0;
      ctx.translate(0, bounce);

      // flame
      if (state.phase === "running" && frame.burning) {
        const flick = 1 + Math.random() * 0.35;
        const flame = ctx.createLinearGradient(28, 0, 92, 0);
        flame.addColorStop(0, "rgba(255, 209, 102, 0)");
        flame.addColorStop(0.45, "#ff9f1c");
        flame.addColorStop(1, "#ff6b6b");
        ctx.fillStyle = flame;
        ctx.beginPath();
        ctx.moveTo(30, -32);
        ctx.quadraticCurveTo(65 * flick, -54, 94 * flick, -32);
        ctx.quadraticCurveTo(64 * flick, -8, 30, -32);
        ctx.fill();
      }

      // body
      const bodyGrad = ctx.createLinearGradient(-45, -52, 42, -14);
      bodyGrad.addColorStop(0, "#f7feff");
      bodyGrad.addColorStop(1, "#79dff7");
      ctx.fillStyle = bodyGrad;
      ctx.strokeStyle = "#08243c";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-50, -30);
      ctx.quadraticCurveTo(-44, -55, -8, -56);
      ctx.lineTo(34, -50);
      ctx.quadraticCurveTo(54, -45, 61, -31);
      ctx.lineTo(55, -20);
      ctx.lineTo(-50, -20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // window
      ctx.fillStyle = "#123a5a";
      ctx.beginPath();
      ctx.ellipse(-4, -39, 18, 10, -0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(142, 231, 255, .75)";
      ctx.beginPath();
      ctx.ellipse(-10, -42, 6, 3.4, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // stripe
      ctx.fillStyle = "#ff6b6b";
      ctx.beginPath();
      ctx.moveTo(-34, -20);
      ctx.lineTo(42, -20);
      ctx.lineTo(46, -12);
      ctx.lineTo(-34, -12);
      ctx.closePath();
      ctx.fill();

      // wheels
      [-26, 24].forEach((wx) => {
        ctx.fillStyle = "#071426";
        ctx.beginPath();
        ctx.arc(wx, -7, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffd166";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(wx, -7, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#ffd166";
        ctx.beginPath();
        ctx.arc(wx, -7, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // arrows above sled
      const forceLen = 34 + state.push * 0.75;
      const frictionLen = 22 + state.grip * 0.65;
      const arrowY = groundY - h * 0.29;
      drawArrow(ctx, sledX - 78, arrowY, forceLen, "#7bf1a8", "PUSH", false);
      drawArrow(ctx, sledX + 84, arrowY, frictionLen, "#ff8fab", "GRIP", true);

      // top HUD
      const speedKmh = frame.v * 3.6 * 2.4;
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(155, 183, 204, .85)";
      ctx.font = `800 ${Math.max(9, h * 0.019)}px Nunito, sans-serif`;
      ctx.fillText("SPEED", w * 0.04, h * 0.09);
      ctx.fillStyle = "#dff8ff";
      ctx.font = `600 ${Math.max(18, h * 0.055)}px Fredoka, sans-serif`;
      ctx.fillText(`${speedKmh.toFixed(0)}`, w * 0.04, h * 0.145);
      ctx.fillStyle = "rgba(155, 183, 204, .7)";
      ctx.font = `700 ${Math.max(8, h * 0.018)}px Nunito, sans-serif`;
      ctx.fillText("km/h", w * 0.04 + 4, h * 0.168);

      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(155, 183, 204, .85)";
      ctx.font = `800 ${Math.max(9, h * 0.019)}px Nunito, sans-serif`;
      ctx.fillText("DISTANCE", w * 0.96, h * 0.09);
      ctx.fillStyle = "#ffd166";
      ctx.font = `600 ${Math.max(18, h * 0.055)}px Fredoka, sans-serif`;
      ctx.fillText(`${frame.x.toFixed(1)} m`, w * 0.96, h * 0.145);

      if (state.phase === "idle" && state.attempts.length === 0) {
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(223, 248, 255, .7)";
        ctx.font = `700 ${Math.max(10, h * 0.023)}px Nunito, sans-serif`;
        ctx.fillText("Tune it. Test it. Tweak it.", w / 2, h * 0.25);
      }
    }

    function drawArrow(ctx, x, y, len, color, label, left) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      const dir = left ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len * dir, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + len * dir, y);
      ctx.lineTo(x + (len - 10) * dir, y - 6);
      ctx.lineTo(x + (len - 10) * dir, y + 6);
      ctx.closePath();
      ctx.fill();
      ctx.font = "800 9px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, x + (len / 2) * dir, y - 9);
      ctx.restore();
    }

    const stage = setupCanvas(canvas, drawScene);

    function updateAttempts() {
      attemptStrip.innerHTML = state.attempts
        .slice(-6)
        .map((a) => {
          const ok = a.distance >= 42 && a.distance <= 58;
          return `<span class="attempt-dot ${ok ? "good" : ""}" title="${a.distance.toFixed(1)} m">${a.distance.toFixed(0)}</span>`;
        })
        .join("");
    }

    function showCallout(text, tone = "info") {
      callout.textContent = text;
      callout.className = `scene-callout show ${tone}`;
      clearTimeout(state.calloutTimer);
      state.calloutTimer = setTimeout(() => {
        callout.classList.remove("show");
      }, 2100);
    }

    function finishRun() {
      const sim = state.sim;
      state.phase = "done";
      const distance = sim.distance;
      state.attempts.push({ distance, push: state.push, grip: state.grip });
      updateAttempts();
      distStat.textContent = `${distance.toFixed(1)} m`;
      speedStat.textContent = "0";
      const inZone = distance >= 42 && distance <= 58;
      if (inZone) {
        api.sfx.play("success");
        showCallout("PERFECT STOP!", "good");
        api.complete("You found the sweet spot between push and grip.");
      } else if (distance < 42) {
        api.sfx.play("fail");
        showCallout("Too short!", "bad");
        api.toast("More push or less grip.", "💡");
      } else {
        api.sfx.play("fail");
        showCallout("Too far!", "bad");
        api.toast("Less push or more grip.", "💡");
      }
      goBtn.disabled = false;
      goBtn.innerHTML = `TEST <span aria-hidden="true">▶</span>`;
      stage.redraw();
    }

    function animate(now) {
      if (state.phase !== "running") return;
      const elapsed = (now - state.startTime) / 1000;
      const dt = 1 / 120;
      state.frameIndex = Math.floor(elapsed / dt);
      const frame = currentFrame();
      distStat.textContent = `${frame.x.toFixed(1)} m`;
      speedStat.textContent = (frame.v * 3.6 * 2.4).toFixed(0);
      stage.redraw();
      if (state.frameIndex >= state.frames.length - 1) {
        state.phase = "done";
        finishRun();
        return;
      }
      state.raf = requestAnimationFrame(animate);
    }

    function runTest() {
      if (state.phase === "running") return;
      const sim = simulate(state.push, state.grip);
      state.sim = sim;
      state.frames = sim.frames;
      state.frameIndex = 0;
      state.phase = "running";
      state.startTime = performance.now();
      goBtn.disabled = true;
      goBtn.innerHTML = `RUNNING…`;
      callout.classList.remove("show");
      api.sfx.play("whoosh");
      state.raf = requestAnimationFrame(animate);
    }

    function resetTest() {
      cancelAnimationFrame(state.raf);
      state.phase = "idle";
      state.frames = [];
      state.sim = null;
      state.frameIndex = 0;
      state.attempts = [];
      updateAttempts();
      speedStat.textContent = "0";
      distStat.textContent = "0 m";
      goBtn.disabled = false;
      goBtn.innerHTML = `TEST <span aria-hidden="true">▶</span>`;
      callout.classList.remove("show");
      stage.redraw();
    }

    pushRange.addEventListener("input", syncRanges, { signal });
    gripRange.addEventListener("input", syncRanges, { signal });
    goBtn.addEventListener("click", runTest, { signal });
    resetBtn.addEventListener("click", resetTest, { signal });

    stage.redraw();

    return {
      hint: "Push gives speed. Grip takes it away. Find the combo that stops at 50 m.",
      destroy() {
        cancelAnimationFrame(state.raf);
        clearTimeout(state.calloutTimer);
        ac.abort();
        stage.destroy();
      },
    };
  },
};
