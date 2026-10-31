import { clamp, easeOutCubic } from "./util.js";

const art = `
<svg viewBox="0 0 320 160" aria-hidden="true">
  <defs>
    <linearGradient id="boatSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#123a5e"/>
      <stop offset="1" stop-color="#0b5167"/>
    </linearGradient>
    <linearGradient id="boatWater" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1d7d99"/>
      <stop offset="1" stop-color="#07304a"/>
    </linearGradient>
    <linearGradient id="boatHull" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff8fab"/>
      <stop offset="1" stop-color="#ff6b6b"/>
    </linearGradient>
  </defs>
  <rect width="320" height="160" rx="18" fill="url(#boatSky)"/>
  <circle cx="258" cy="34" r="19" fill="#ffd166" opacity=".8"/>
  <path d="M0 110h320v50H0z" fill="url(#boatWater)"/>
  <path d="M0 112q20-8 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0" fill="none" stroke="#8ee7ff" stroke-width="2.4" opacity=".45"/>
  <g class="art-bob">
    <path d="M92 94h136l-18 32H110z" fill="url(#boatHull)" stroke="#08243c" stroke-width="4"/>
    <rect x="126" y="66" width="48" height="28" rx="4" fill="#dff8ff" stroke="#08243c" stroke-width="4"/>
    <rect x="136" y="74" width="28" height="12" rx="2" fill="#173a5e"/>
    <rect x="182" y="66" width="22" height="28" rx="3" fill="#ffd166" stroke="#08243c" stroke-width="3"/>
    <rect x="208" y="72" width="18" height="22" rx="3" fill="#ffd166" stroke="#08243c" stroke-width="3"/>
    <path d="M160 66V38" stroke="#dff8ff" stroke-width="3"/>
    <path d="M162 40l24 8-24 8z" fill="#7bf1a8"/>
  </g>
  <g fill="#ffd166" opacity=".55">
    <circle cx="48" cy="30" r="1.6"/><circle cx="112" cy="46" r="1.4"/><circle cx="202" cy="24" r="1.8"/>
  </g>
</svg>`;

const MAX_CRATES = 8;
const CAPACITY = 6;

function crateMarkup(x, y, size = 30, extra = "") {
  return `<g class="crate-svg ${extra}" transform="translate(${x}, ${y})">
    <rect width="${size}" height="${size}" rx="4" fill="#ffd166" stroke="#7a4a00" stroke-width="2.5"/>
    <path d="M4 4l${size - 8} ${size - 8}M${size - 4} 4l-${size - 8} ${size - 8}" stroke="#c98400" stroke-width="2" stroke-linecap="round"/>
    <rect x="${size * 0.3}" y="2" width="${size * 0.4}" height="3" fill="#ff9f1c"/>
  </g>`;
}

export default {
  id: "buoyancy",
  num: "06",
  title: "Cargo Boat",
  icon: "⛵",
  accent: "#5aa9ff",
  mission: "Float with 6 crates!",
  tags: ["Buoyancy", "Fluids"],
  hint: "Each crate adds weight. Fill the boat to 6 — but the 7th will sink it.",
  art,

  mount(root, api) {
    root.innerHTML = `
      <div class="lab-layout">
        <div class="lab-canvas-wrap">
          <div class="scene boat-scene" id="boatScene">
            <svg id="boatSvg" viewBox="0 0 1000 560" aria-label="Cargo boat buoyancy scene">
              <defs>
                <linearGradient id="btsky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#103a5f"/>
                  <stop offset=".65" stop-color="#0e566f"/>
                  <stop offset="1" stop-color="#0a3349"/>
                </linearGradient>
                <linearGradient id="btwater" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#1d8aa6"/>
                  <stop offset="1" stop-color="#062b45"/>
                </linearGradient>
                <linearGradient id="bthull" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#ff9fb6"/>
                  <stop offset="1" stop-color="#ff6b6b"/>
                </linearGradient>
                <linearGradient id="btdock" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#b4784a"/>
                  <stop offset="1" stop-color="#5e3b21"/>
                </linearGradient>
                <filter id="btglow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              <rect width="1000" height="560" fill="url(#btsky)"/>
              <circle cx="852" cy="78" r="46" fill="#ffd166" opacity=".82"/>
              <circle cx="852" cy="78" r="70" fill="#ffd166" opacity=".07"/>

              <g fill="#dff8ff" opacity=".65">
                <circle cx="100" cy="70" r="2"/><circle cx="210" cy="38" r="1.5"/><circle cx="330" cy="82" r="1.8"/>
                <circle cx="470" cy="40" r="1.4"/><circle cx="640" cy="64" r="1.6"/><circle cx="930" cy="150" r="1.5"/>
              </g>
              <g class="cloud cloud-one" fill="#dff8ff" opacity=".1">
                <ellipse cx="260" cy="108" rx="66" ry="18"/><ellipse cx="304" cy="98" rx="42" ry="22"/>
              </g>

              <g id="dockCrates"></g>
              <path d="M0 324h185v64H0z" fill="url(#btdock)"/>
              <path d="M0 324h185" stroke="#ffd166" stroke-width="4" opacity=".45"/>
              <path d="M20 388v24M160 388v24" stroke="#4a2c18" stroke-width="10"/>

              <g id="boatBob" class="boat-bob">
                <g id="boatLoad">
                  <g id="boatBody" transform="translate(585, 320)">
                    <path d="M-172 0h344l-38 62c-10 16-30 26-54 26H-80c-24 0-44-10-54-26z" fill="url(#bthull)" stroke="#08243c" stroke-width="6"/>
                    <path d="M-150 20h300" stroke="#dff8ff" stroke-width="4" opacity=".35"/>
                    <path d="M-120 44h240" stroke="#dff8ff" stroke-width="3" opacity=".2"/>
                    <rect x="-146" y="-62" width="74" height="62" rx="8" fill="#dff8ff" stroke="#08243c" stroke-width="5"/>
                    <rect x="-132" y="-48" width="46" height="26" rx="5" fill="#173a5e"/>
                    <path d="M-24 -70V-150" stroke="#dff8ff" stroke-width="5"/>
                    <path d="M-22 -148l58 18-58 20z" fill="#7bf1a8"/>
                    <text x="70" y="44" text-anchor="middle" fill="#ffd166" font-family="Fredoka, sans-serif" font-size="20" font-weight="600">CARGO</text>
                  </g>
                  <g id="boatCrates"></g>
                </g>
              </g>

              <rect x="0" y="360" width="1000" height="200" fill="url(#btwater)" opacity=".92"/>
              <g class="river-waves" stroke="#8ee7ff" stroke-width="3" opacity=".35" fill="none">
                <path d="M-40 380q30-10 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0"/>
                <path d="M-40 410q30-10 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0" opacity=".55"/>
                <path d="M-40 444q30-10 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0" opacity=".28"/>
              </g>
              <g fill="#dff8ff" opacity=".18">
                <circle cx="180" cy="470" r="4"/><circle cx="800" cy="500" r="3"/><circle cx="600" cy="530" r="2.5"/>
              </g>
              <g id="bubbleLayer"></g>

              <g class="buoyancy-arrow" transform="translate(815, 260)">
                <path d="M0 80V0" stroke="#7bf1a8" stroke-width="6" stroke-linecap="round"/>
                <path d="M0 0l-12 20h24z" fill="#7bf1a8"/>
                <text x="0" y="104" text-anchor="middle" fill="#7bf1a8" font-family="Nunito, sans-serif" font-size="15" font-weight="900">BUOYANCY</text>
              </g>
              <g class="weight-arrow" transform="translate(585, 430)">
                <path d="M0 0v70" stroke="#ff8fab" stroke-width="5" stroke-linecap="round" opacity=".7"/>
                <path d="M0 70l-10-16h20z" fill="#ff8fab" opacity=".7"/>
              </g>
            </svg>
            <div class="scene-pill"><span>⚖️</span> weight vs. buoyancy</div>
            <div class="scene-callout" id="boatCallout"></div>
          </div>
        </div>

        <aside class="control-panel">
          <div class="panel-head">
            <span class="panel-title"><span>⚙</span> Cargo</span>
            <button class="mini-btn" id="boatReset" aria-label="Reset boat">↺</button>
          </div>

          <div class="load-card">
            <div class="load-top"><span>CRATES</span><b id="crateCount">0 / 6</b></div>
            <div class="crate-pips" id="cratePips"></div>
            <div class="load-note" id="loadNote">Tap crates on the dock.</div>
          </div>

          <div class="capacity-card">
            <div class="meter-label"><span>WEIGHT</span><b id="weightVal">60 kg</b></div>
            <div class="meter"><div class="meter-fill" id="weightBar"></div></div>
            <div class="meter-label small"><span>MAX FLOAT</span><span>120 kg</span></div>
          </div>

          <button class="action-btn" id="unloadBtn">UNLOAD ONE <span aria-hidden="true">↓</span></button>
          <div class="hint-chip"><span>💡</span><span>Load 6 crates. The 7th is too heavy.</span></div>
        </aside>
      </div>`;

    const svg = root.querySelector("#boatSvg");
    const dockCrates = root.querySelector("#dockCrates");
    const boatCrates = root.querySelector("#boatCrates");
    const boatLoad = root.querySelector("#boatLoad");
    const boatBob = root.querySelector("#boatBob");
    const bubbleLayer = root.querySelector("#bubbleLayer");
    const crateCount = root.querySelector("#crateCount");
    const cratePips = root.querySelector("#cratePips");
    const loadNote = root.querySelector("#loadNote");
    const weightVal = root.querySelector("#weightVal");
    const weightBar = root.querySelector("#weightBar");
    const unloadBtn = root.querySelector("#unloadBtn");
    const resetBtn = root.querySelector("#boatReset");
    const callout = root.querySelector("#boatCallout");

    const ac = new AbortController();
    const signal = ac.signal;

    const state = {
      load: 0,
      sinking: false,
      completed: false,
      dockUsed: new Set(),
      raf: 0,
      calloutTimer: 0,
    };

    function showCallout(text, tone = "info") {
      callout.textContent = text;
      callout.className = `scene-callout show ${tone}`;
      clearTimeout(state.calloutTimer);
      state.calloutTimer = setTimeout(() => callout.classList.remove("show"), 2200);
    }

    function buildDock() {
      dockCrates.innerHTML = "";
      for (let i = 0; i < MAX_CRATES; i++) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 18 + col * 41;
        const y = 282 - row * 38;
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.innerHTML = crateMarkup(x, y, 34);
        group.classList.add("dock-crate");
        group.dataset.crate = i;
        group.setAttribute("tabindex", "0");
        group.setAttribute("role", "button");
        group.setAttribute("aria-label", `Load crate ${i + 1}`);
        group.addEventListener("click", () => loadCrate(i), { signal });
        group.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            loadCrate(i);
          }
        }, { signal });
        dockCrates.appendChild(group);
      }
    }

    function buildPips() {
      cratePips.innerHTML = Array.from({ length: CAPACITY }, (_, i) => `<i class="${i < state.load ? "on" : ""}"></i>`).join("");
    }

    function boatCratePosition(index) {
      const col = index % 3;
      const row = Math.floor(index / 3);
      return { x: 585 - 55 + col * 38, y: 290 - row * 34 };
    }

    function renderBoatCrates() {
      boatCrates.innerHTML = "";
      for (let i = 0; i < state.load; i++) {
        const pos = boatCratePosition(i);
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.innerHTML = crateMarkup(pos.x, pos.y, 30);
        group.classList.add("boat-crate", "crate-drop");
        boatCrates.appendChild(group);
      }
    }

    function updateUI() {
      crateCount.textContent = `${state.load} / ${CAPACITY}`;
      buildPips();
      const weight = 60 + state.load * 10;
      weightVal.textContent = `${weight} kg`;
      weightBar.style.width = `${clamp((weight / 120) * 100, 5, 100)}%`;
      weightBar.style.background =
        state.load >= CAPACITY
          ? "linear-gradient(90deg,#7bf1a8,#5ee7ff)"
          : "linear-gradient(90deg,#5ee7ff,#ffd166)";
      loadNote.textContent =
        state.load === CAPACITY
          ? "Perfect load! The boat is at its limit."
          : state.load > CAPACITY
            ? "Too heavy!"
            : `${CAPACITY - state.load} more crate${CAPACITY - state.load === 1 ? "" : "s"} to go.`;
      unloadBtn.disabled = state.load === 0 || state.sinking;
      const sink = (Math.min(state.load, CAPACITY) / CAPACITY) * 40;
      boatLoad.setAttribute("transform", `translate(0, ${sink})`);
      api.setStatus(`${state.load} / ${CAPACITY}`);
    }

    function loadCrate(index) {
      if (state.sinking) return;
      if (state.dockUsed.has(index)) return;
      if (state.load >= CAPACITY + 1) return;
      state.dockUsed.add(index);
      const dockCrate = dockCrates.querySelector(`[data-crate="${index}"]`);
      dockCrate?.classList.add("gone");
      state.load += 1;
      renderBoatCrates();
      updateUI();
      api.sfx.play("pop");

      if (state.load === CAPACITY) {
        if (!state.completed) {
          state.completed = true;
          api.sfx.play("success");
          showCallout("PERFECT FLOAT!", "good");
          setTimeout(() => api.complete("Six crates: buoyancy balances the weight."), 600);
        }
      } else if (state.load > CAPACITY) {
        sinkBoat();
      } else {
        showCallout(`+1 CRATE`, "info");
      }
    }

    function unloadCrate() {
      if (state.sinking || state.load === 0) return;
      const used = [...state.dockUsed];
      const last = used[used.length - 1];
      if (last !== undefined) {
        state.dockUsed.delete(last);
        const dockCrate = dockCrates.querySelector(`[data-crate="${last}"]`);
        dockCrate?.classList.remove("gone");
      }
      state.load -= 1;
      renderBoatCrates();
      updateUI();
      api.sfx.play("click");
    }

    function sinkBoat() {
      state.sinking = true;
      boatBob.style.animationPlayState = "paused";
      unloadBtn.disabled = true;
      api.sfx.play("splash");
      showCallout("TOO HEAVY!", "bad");
      api.toast("The boat needs less cargo.", "🌊");
      const start = performance.now();
      const startY = 40;
      function step(now) {
        const t = clamp((now - start) / 1200, 0, 1);
        const eased = easeOutCubic(t);
        boatLoad.setAttribute("transform", `translate(0, ${startY + eased * 150}) rotate(${eased * 10} 585 370)`);
        if (t < 1) {
          state.raf = requestAnimationFrame(step);
        } else {
          spawnBubbles();
          setTimeout(resetBoat, 1200);
        }
      }
      state.raf = requestAnimationFrame(step);
    }

    function spawnBubbles() {
      for (let i = 0; i < 14; i++) {
        const bubble = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        bubble.setAttribute("cx", 500 + Math.random() * 180);
        bubble.setAttribute("cy", 390 + Math.random() * 80);
        bubble.setAttribute("r", 3 + Math.random() * 6);
        bubble.setAttribute("fill", "none");
        bubble.setAttribute("stroke", "#bff4ff");
        bubble.setAttribute("stroke-width", "2");
        bubble.setAttribute("opacity", "0.7");
        bubble.classList.add("bubble-rise");
        bubble.style.animationDelay = `${Math.random() * 0.5}s`;
        bubbleLayer.appendChild(bubble);
        setTimeout(() => bubble.remove(), 1800);
      }
    }

    function resetBoat() {
      cancelAnimationFrame(state.raf);
      state.load = 0;
      state.sinking = false;
      state.completed = false;
      state.dockUsed.clear();
      boatBob.style.animationPlayState = "";
      boatLoad.setAttribute("transform", "translate(0, 0)");
      bubbleLayer.innerHTML = "";
      buildDock();
      renderBoatCrates();
      updateUI();
      callout.classList.remove("show");
      api.sfx.play("click");
    }

    unloadBtn.addEventListener("click", unloadCrate, { signal });
    resetBtn.addEventListener("click", resetBoat, { signal });

    buildDock();
    renderBoatCrates();
    updateUI();

    return {
      hint: "Each crate adds weight. Fill the boat to 6 — but the 7th will sink it.",
      destroy() {
        cancelAnimationFrame(state.raf);
        clearTimeout(state.calloutTimer);
        ac.abort();
      },
    };
  },
};
