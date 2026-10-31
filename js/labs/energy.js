import { clamp, easeInOutCubic, setRangeProgress } from "./util.js";

const art = `
<svg viewBox="0 0 320 160" aria-hidden="true">
  <defs>
    <linearGradient id="energySky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2b1c55"/>
      <stop offset="1" stop-color="#0b3e5c"/>
    </linearGradient>
    <linearGradient id="energyTrack" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#5ee7ff"/>
      <stop offset="1" stop-color="#b69cff"/>
    </linearGradient>
    <radialGradient id="energyBall" cx=".35" cy=".3">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".35" stop-color="#ffe08a"/>
      <stop offset="1" stop-color="#ff9f1c"/>
    </radialGradient>
  </defs>
  <rect width="320" height="160" rx="18" fill="url(#energySky)"/>
  <circle cx="250" cy="34" r="18" fill="#ffd166" opacity=".8"/>
  <path d="M0 138h320v22H0z" fill="#0c2638"/>
  <path d="M42 126V76c0-30 40-44 62-20 20 22 6 52-24 54-20 2-32-16-24-32 8-14 28-14 34 2 5 14-8 24-18 18" fill="none" stroke="url(#energyTrack)" stroke-width="8" stroke-linecap="round"/>
  <path d="M42 126h18" stroke="#dff8ff" stroke-width="3" opacity=".5"/>
  <g class="art-bob">
    <circle cx="84" cy="62" r="9" fill="url(#energyBall)" filter="drop-shadow(0 0 8px #ffd166)"/>
  </g>
  <path d="M122 126h130" stroke="#8ee7ff" stroke-width="2" opacity=".25" stroke-dasharray="6 8"/>
  <g fill="#ffd166" opacity=".55">
    <circle cx="42" cy="26" r="1.6"/><circle cx="102" cy="44" r="1.4"/><circle cx="190" cy="24" r="1.8"/>
  </g>
</svg>`;

export default {
  id: "energy",
  num: "04",
  title: "Coaster Energy",
  icon: "🎢",
  accent: "#7bf1a8",
  mission: "Complete the loop!",
  tags: ["Energy", "Motion"],
  hint: "Higher hill = more stored energy. Give the ball enough to loop the loop.",
  art,

  mount(root, api) {
    root.innerHTML = `
      <div class="lab-layout">
        <div class="lab-canvas-wrap">
          <div class="scene energy-scene" id="energyScene">
            <svg id="coasterSvg" viewBox="0 0 1000 560" aria-label="Roller coaster energy scene">
              <defs>
                <linearGradient id="esky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#201b4a"/>
                  <stop offset=".52" stop-color="#123f60"/>
                  <stop offset="1" stop-color="#0a2537"/>
                </linearGradient>
                <linearGradient id="eground" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#173d3a"/>
                  <stop offset="1" stop-color="#071c28"/>
                </linearGradient>
                <linearGradient id="etrack" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stop-color="#5ee7ff"/>
                  <stop offset=".55" stop-color="#7bf1a8"/>
                  <stop offset="1" stop-color="#b69cff"/>
                </linearGradient>
                <radialGradient id="eball" cx=".35" cy=".3">
                  <stop offset="0" stop-color="#ffffff"/>
                  <stop offset=".28" stop-color="#ffe08a"/>
                  <stop offset="1" stop-color="#ff9f1c"/>
                </radialGradient>
                <filter id="eglow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="9" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect width="1000" height="560" fill="url(#esky)"/>
              <circle cx="850" cy="84" r="44" fill="#ffd166" opacity=".8"/>
              <circle cx="850" cy="84" r="70" fill="#ffd166" opacity=".07"/>

              <g fill="#dff8ff" opacity=".72">
                <circle cx="90" cy="80" r="2"/><circle cx="170" cy="44" r="1.5"/><circle cx="280" cy="92" r="1.7"/>
                <circle cx="390" cy="38" r="1.3"/><circle cx="600" cy="66" r="1.6"/><circle cx="710" cy="34" r="1.4"/>
                <circle cx="930" cy="160" r="1.7"/><circle cx="470" cy="110" r="1.2"/>
              </g>

              <path d="M0 430c80-34 150-20 220 6s140 22 220-8 170-20 250 10 190 12 310-14v136H0z" fill="#0b3041" opacity=".8"/>
              <path d="M0 468c120-26 210-12 300 8s180 12 270-8 180-18 260 4 140 14 170 4v84H0z" fill="url(#eground)"/>
              <g fill="#7bf1a8" opacity=".45">
                <path d="M60 468l12-22 12 22zM150 476l10-18 10 18zM880 462l12-24 12 24z"/>
              </g>

              <g id="coasterSupports" stroke="#8ee7ff" stroke-width="3" opacity=".22"></g>
              <g id="coasterTies" stroke="#8ee7ff" stroke-width="3" opacity=".36"></g>
              <path id="coasterShadow" fill="none" stroke="#03101f" stroke-width="18" stroke-linecap="round" opacity=".5"/>
              <path id="coasterPath" fill="none" stroke="url(#etrack)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
              <path id="coasterShine" fill="none" stroke="#dff8ff" stroke-width="2" stroke-linecap="round" opacity=".7"/>

              <g id="startGate">
                <path id="startTower" stroke="#8ee7ff" stroke-width="5" opacity=".55"/>
                <rect id="startPlatform" width="74" height="12" rx="6" fill="#dff8ff" opacity=".8"/>
                <path id="startLadder" stroke="#8ee7ff" stroke-width="3" opacity=".4" stroke-dasharray="4 6"/>
              </g>

              <polyline id="coasterTrail" fill="none" stroke="#ffd166" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/>

              <g id="coasterBall" filter="url(#eglow)">
                <circle r="18" fill="url(#eball)" stroke="#fff4c2" stroke-width="2"/>
                <circle cx="-5" cy="-6" r="5" fill="#ffffff" opacity=".8"/>
              </g>

              <g class="finish-flag">
                <path d="M930 360V248" stroke="#dff8ff" stroke-width="5" stroke-linecap="round"/>
                <path d="M932 250l38 13-38 15z" fill="#7bf1a8"/>
              </g>
            </svg>

            <div class="energy-hud">
              <div class="energy-bar-row">
                <span class="energy-label">POTENTIAL</span>
                <div class="energy-track"><i id="peBar" class="pe"></i></div>
                <b id="peVal">0%</b>
              </div>
              <div class="energy-bar-row">
                <span class="energy-label">KINETIC</span>
                <div class="energy-track"><i id="keBar" class="ke"></i></div>
                <b id="keVal">0%</b>
              </div>
            </div>
            <div class="scene-callout" id="energyCallout"></div>
          </div>
        </div>

        <aside class="control-panel">
          <div class="panel-head">
            <span class="panel-title"><span>⚙</span> Controls</span>
            <button class="mini-btn" id="energyReset" aria-label="Reset coaster">↺</button>
          </div>
          <div class="control-group">
            <label class="control-label" for="hillRange">Hill height <span class="control-value" id="hillVal">30</span></label>
            <input type="range" id="hillRange" min="0" max="100" value="30">
          </div>
          <div class="stat-row">
            <div class="stat"><span class="stat-label">Speed</span><span class="stat-value" id="coasterSpeed">0</span></div>
            <div class="stat"><span class="stat-label">Energy</span><span class="stat-value" id="coasterEnergy">100%</span></div>
          </div>
          <button class="action-btn warm" id="coasterGo">LAUNCH <span aria-hidden="true">▶</span></button>
          <div class="hint-chip"><span>💡</span><span>Raise the hill until the ball can make the loop.</span></div>
          <div class="energy-note"><span>⚡</span> Energy changes form — it never disappears.</div>
        </aside>
      </div>`;

    const svg = root.querySelector("#coasterSvg");
    const path = root.querySelector("#coasterPath");
    const shadow = root.querySelector("#coasterShadow");
    const shine = root.querySelector("#coasterShine");
    const ties = root.querySelector("#coasterTies");
    const supports = root.querySelector("#coasterSupports");
    const startTower = root.querySelector("#startTower");
    const startPlatform = root.querySelector("#startPlatform");
    const startLadder = root.querySelector("#startLadder");
    const ball = root.querySelector("#coasterBall");
    const trail = root.querySelector("#coasterTrail");
    const hillRange = root.querySelector("#hillRange");
    const hillVal = root.querySelector("#hillVal");
    const goBtn = root.querySelector("#coasterGo");
    const resetBtn = root.querySelector("#energyReset");
    const peBar = root.querySelector("#peBar");
    const keBar = root.querySelector("#keBar");
    const peVal = root.querySelector("#peVal");
    const keVal = root.querySelector("#keVal");
    const speedEl = root.querySelector("#coasterSpeed");
    const energyEl = root.querySelector("#coasterEnergy");
    const callout = root.querySelector("#energyCallout");

    const ac = new AbortController();
    const signal = ac.signal;

    const BOTTOM_Y = 440;
    const GRAVITY = 760;
    const FRICTION = 0.018;
    const BALL_R = 18;

    const state = {
      hill: 30,
      startY: 240,
      running: false,
      done: false,
      dist: 0,
      total: 0,
      speed: 0,
      startHeight: 1,
      raf: 0,
      lastTime: 0,
      trail: [],
      calloutTimer: 0,
      failed: false,
    };

    function pathFor(hill) {
      const startY = 300 - hill * 2;
      return {
        startY,
        d: `M90 ${startY} C190 ${startY} 250 ${BOTTOM_Y} 360 ${BOTTOM_Y} L520 ${BOTTOM_Y} C420 ${BOTTOM_Y} 420 240 520 240 C620 240 620 ${BOTTOM_Y} 520 ${BOTTOM_Y} L700 ${BOTTOM_Y} C790 ${BOTTOM_Y} 840 360 930 360`,
      };
    }

    function pointAt(dist) {
      const d = clamp(dist, 0, state.total);
      const p = path.getPointAtLength(d);
      return { x: p.x, y: p.y };
    }

    function updateTrack(hill) {
      const { startY, d } = pathFor(hill);
      state.hill = hill;
      state.startY = startY;
      state.startHeight = BOTTOM_Y - startY;
      path.setAttribute("d", d);
      shadow.setAttribute("d", d);
      shine.setAttribute("d", d);
      state.total = path.getTotalLength();

      // Start tower and platform
      startTower.setAttribute("d", `M90 ${startY}V468`);
      startPlatform.setAttribute("x", 53);
      startPlatform.setAttribute("y", startY - 8);
      startLadder.setAttribute("d", `M74 ${startY + 4}V462M106 ${startY + 4}V462`);

      // Ties
      ties.innerHTML = "";
      const tieCount = 54;
      for (let i = 0; i <= tieCount; i++) {
        const dist = (i / tieCount) * state.total;
        const p = path.getPointAtLength(dist);
        const p2 = path.getPointAtLength(clamp(dist + 1, 0, state.total));
        const angle = Math.atan2(p2.y - p.y, p2.x - p.x) + Math.PI / 2;
        const len = 13;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p.x - Math.cos(angle) * len);
        line.setAttribute("y1", p.y - Math.sin(angle) * len);
        line.setAttribute("x2", p.x + Math.cos(angle) * len);
        line.setAttribute("y2", p.y + Math.sin(angle) * len);
        ties.appendChild(line);
      }

      // Supports under the high track sections
      supports.innerHTML = "";
      for (let i = 0; i < 9; i++) {
        const dist = (i / 8) * state.total;
        const p = path.getPointAtLength(dist);
        if (p.y < 420 && p.x < 700) {
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", p.x);
          line.setAttribute("y1", p.y + 7);
          line.setAttribute("x2", p.x);
          line.setAttribute("y2", 468);
          supports.appendChild(line);
        }
      }

      const start = pointAt(0);
      setBall(start.x, start.y);
      resetBallVisual();
      updateEnergy(0, state.startHeight);
    }

    function setBall(x, y) {
      ball.setAttribute("transform", `translate(${x}, ${y})`);
    }

    function resetBallVisual() {
      state.dist = 0;
      state.speed = 0;
      state.trail = [];
      trail.setAttribute("points", "");
      speedEl.textContent = "0";
      energyEl.textContent = "100%";
      const start = pointAt(0);
      setBall(start.x, start.y);
    }

    function updateEnergy(currentHeight, startHeight, speed = state.speed) {
      const pe = clamp((currentHeight / startHeight) * 100, 0, 100);
      const ke = clamp((speed * speed) / (2 * GRAVITY * startHeight) * 100, 0, 100);
      peBar.style.width = `${pe}%`;
      keBar.style.width = `${ke}%`;
      peVal.textContent = `${pe.toFixed(0)}%`;
      keVal.textContent = `${ke.toFixed(0)}%`;
      energyEl.textContent = `${(pe + ke).toFixed(0)}%`;
    }

    function showCallout(text, tone = "info") {
      callout.textContent = text;
      callout.className = `scene-callout show ${tone}`;
      clearTimeout(state.calloutTimer);
      state.calloutTimer = setTimeout(() => callout.classList.remove("show"), 2200);
    }

    function setHill(value) {
      state.hill = value;
      hillVal.textContent = value;
      setRangeProgress(hillRange);
      updateTrack(value);
    }

    function launch() {
      if (state.running) return;
      resetBallVisual();
      state.running = true;
      state.done = false;
      state.failed = false;
      state.lastTime = performance.now();
      goBtn.disabled = true;
      goBtn.innerHTML = `ROLLING…`;
      api.sfx.play("whoosh");
      state.raf = requestAnimationFrame(step);
    }

    function step(now) {
      if (!state.running) return;
      const dt = Math.min(0.032, (now - state.lastTime) / 1000);
      state.lastTime = now;

      const p = pointAt(state.dist);
      const currentHeight = Math.max(0, BOTTOM_Y - p.y);
      const available = state.startHeight - currentHeight - FRICTION * state.dist;
      const initialPush = state.dist < 14 ? 36 : 0;
      const speed = Math.sqrt(Math.max(0, 2 * GRAVITY * available)) + initialPush;
      state.speed = speed;
      const nextDist = state.dist + speed * dt;
      const nextPoint = pointAt(nextDist);

      // Trail
      state.trail.push(`${nextPoint.x.toFixed(1)},${nextPoint.y.toFixed(1)}`);
      if (state.trail.length > 120) state.trail.shift();
      trail.setAttribute("points", state.trail.join(" "));

      state.dist = nextDist;
      setBall(nextPoint.x, nextPoint.y);
      updateEnergy(Math.max(0, BOTTOM_Y - nextPoint.y), state.startHeight, speed);
      speedEl.textContent = (speed * 0.12).toFixed(0);

      if (state.dist > 20 && speed < 8) {
        state.running = false;
        state.failed = true;
        goBtn.disabled = false;
        goBtn.innerHTML = `LAUNCH <span aria-hidden="true">▶</span>`;
        api.sfx.play("fail");
        showCallout("NEED MORE HEIGHT!", "bad");
        api.toast("Raise the hill and try again.", "⛰️");
        return;
      }

      if (state.dist >= state.total - 0.5) {
        state.running = false;
        state.done = true;
        goBtn.disabled = false;
        goBtn.innerHTML = `RIDE AGAIN <span aria-hidden="true">↻</span>`;
        setBall(930, 360);
        api.sfx.play("success");
        showCallout("LOOP COMPLETE!", "good");
        api.complete("Potential energy became kinetic energy — and back again!");
        return;
      }

      state.raf = requestAnimationFrame(step);
    }

    function reset() {
      cancelAnimationFrame(state.raf);
      state.running = false;
      state.failed = false;
      goBtn.disabled = false;
      goBtn.innerHTML = `LAUNCH <span aria-hidden="true">▶</span>`;
      callout.classList.remove("show");
      updateTrack(state.hill);
    }

    hillRange.addEventListener("input", () => {
      if (state.running) return;
      setHill(Number(hillRange.value));
    }, { signal });
    goBtn.addEventListener("click", launch, { signal });
    resetBtn.addEventListener("click", reset, { signal });

    setHill(30);

    return {
      hint: "Higher hill = more stored energy. Give the ball enough to loop the loop.",
      destroy() {
        cancelAnimationFrame(state.raf);
        clearTimeout(state.calloutTimer);
        ac.abort();
      },
    };
  },
};
