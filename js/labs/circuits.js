const art = `
<svg viewBox="0 0 320 160" aria-hidden="true">
  <defs>
    <linearGradient id="circuitSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#102b45"/>
      <stop offset="1" stop-color="#081a2d"/>
    </linearGradient>
    <radialGradient id="circuitBulb" cx=".4" cy=".35">
      <stop offset="0" stop-color="#fff8ce"/>
      <stop offset=".45" stop-color="#ffd166"/>
      <stop offset="1" stop-color="#ff9f1c"/>
    </radialGradient>
  </defs>
  <rect width="320" height="160" rx="18" fill="url(#circuitSky)"/>
  <g stroke="#5ee7ff" stroke-width="3" fill="none" opacity=".32">
    <path d="M38 118h62V50h58v68h62v-42h62"/>
    <path d="M38 134h86V66h44v68h72"/>
    <circle cx="70" cy="80" r="3" fill="#5ee7ff" stroke="none"/>
    <circle cx="244" cy="108" r="3" fill="#ffd166" stroke="none"/>
  </g>
  <g class="art-bob">
    <rect x="40" y="56" width="28" height="54" rx="7" fill="#dff8ff" stroke="#08243c" stroke-width="4"/>
    <path d="M48 66h12M54 60v12" stroke="#ff6b6b" stroke-width="3" stroke-linecap="round"/>
    <path d="M48 96h12" stroke="#5ee7ff" stroke-width="3" stroke-linecap="round"/>
    <path d="M68 84h40" stroke="#ffd166" stroke-width="3" stroke-dasharray="5 5"/>
    <path d="M168 84h40" stroke="#ffd166" stroke-width="3" stroke-dasharray="5 5"/>
    <circle cx="232" cy="84" r="23" fill="url(#circuitBulb)" filter="drop-shadow(0 0 14px #ffd166)"/>
    <path d="M222 84h20M232 74v20" stroke="#fff8ce" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="222" y="104" width="20" height="12" rx="3" fill="#dff8ff"/>
  </g>
  <g stroke="#ffd166" stroke-width="3" stroke-linecap="round" opacity=".8">
    <path d="M132 44l8-14M146 42l4-16M120 48l-4-14"/>
  </g>
  <g fill="#5ee7ff" opacity=".6">
    <circle cx="96" cy="128" r="2"/><circle cx="140" cy="118" r="1.5"/><circle cx="196" cy="128" r="1.8"/>
  </g>
</svg>`;

const MATERIALS = {
  wire: { name: "Copper wire", icon: "🔌", conductive: true },
  coin: { name: "Coin", icon: "🪙", conductive: true },
  rubber: { name: "Rubber", icon: "🧽", conductive: false },
  wood: { name: "Wood", icon: "🪵", conductive: false },
};

export default {
  id: "circuits",
  num: "05",
  title: "Circuit Lab",
  icon: "💡",
  accent: "#ff9f1c",
  mission: "Light the bulb!",
  tags: ["Electricity", "Circuits"],
  hint: "Pick something that lets electricity flow, then close the switch.",
  art,

  mount(root, api) {
    root.innerHTML = `
      <div class="lab-layout">
        <div class="lab-canvas-wrap">
          <div class="scene circuit-scene" id="circuitScene">
            <svg id="circuitSvg" viewBox="0 0 1000 560" aria-label="Electrical circuit board">
              <defs>
                <linearGradient id="cboard" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#0c2a40"/>
                  <stop offset="1" stop-color="#061725"/>
                </linearGradient>
                <linearGradient id="cwire" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stop-color="#5ee7ff"/>
                  <stop offset=".5" stop-color="#7bf1a8"/>
                  <stop offset="1" stop-color="#5ee7ff"/>
                </linearGradient>
                <radialGradient id="cbulb" cx=".4" cy=".32">
                  <stop offset="0" stop-color="#fffbe0"/>
                  <stop offset=".35" stop-color="#ffe08a"/>
                  <stop offset="1" stop-color="#ff9f1c"/>
                </radialGradient>
                <filter id="cglow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="18" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="csoftglow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="8" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              <rect width="1000" height="560" fill="url(#cboard)"/>
              <g stroke="#5ee7ff" stroke-width="2" fill="none" opacity=".1">
                <path d="M0 120h1000M0 240h1000M0 360h1000M0 480h1000"/>
                <path d="M120 0v560M260 0v560M400 0v560M540 0v560M680 0v560M820 0v560"/>
              </g>
              <g fill="#5ee7ff" opacity=".22">
                <circle cx="120" cy="120" r="4"/><circle cx="400" cy="240" r="4"/><circle cx="680" cy="360" r="4"/>
                <circle cx="260" cy="480" r="4"/><circle cx="820" cy="120" r="4"/><circle cx="540" cy="480" r="4"/>
              </g>

              <path id="circuitLoop" d="M150 300V190H780V430H150Z" fill="none" stroke="none"/>
              <path d="M150 300V190H780V430H150Z" fill="none" stroke="#08243c" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M150 300V190H780V430H150Z" fill="none" stroke="url(#cwire)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>

              <!-- battery -->
              <g transform="translate(150, 300)">
                <rect x="-58" y="-62" width="116" height="124" rx="18" fill="#dff8ff" stroke="#08243c" stroke-width="6"/>
                <rect x="-44" y="-48" width="88" height="40" rx="10" fill="#173a5e"/>
                <path d="M-20 -30h40M0 -50v40" stroke="#ff6b6b" stroke-width="6" stroke-linecap="round"/>
                <rect x="-34" y="16" width="68" height="20" rx="10" fill="#7bf1a8" opacity=".8"/>
                <text x="0" y="72" text-anchor="middle" fill="#9bb7cc" font-family="Nunito, sans-serif" font-size="16" font-weight="900" letter-spacing="2">BATTERY</text>
              </g>

              <!-- switch -->
              <g id="switchHit" class="switch-hit" tabindex="0" role="button" aria-label="Toggle switch" aria-pressed="false">
                <rect x="372" y="146" width="150" height="98" rx="14" fill="transparent"/>
                <rect x="400" y="164" width="90" height="52" rx="10" fill="#0a2037" stroke="#8ee7ff" stroke-width="3" opacity=".85"/>
                <circle cx="400" cy="190" r="10" fill="#ffd166" stroke="#08243c" stroke-width="3"/>
                <circle cx="480" cy="190" r="10" fill="#ffd166" stroke="#08243c" stroke-width="3"/>
                <g id="switchLever" class="switch-lever">
                  <line x1="400" y1="190" x2="480" y2="190" stroke="#dff8ff" stroke-width="8" stroke-linecap="round"/>
                  <circle cx="400" cy="190" r="5" fill="#ff6b6b"/>
                </g>
                <text x="445" y="236" text-anchor="middle" fill="#9bb7cc" font-family="Nunito, sans-serif" font-size="15" font-weight="900" letter-spacing="2">SWITCH</text>
              </g>

              <!-- gap + material -->
              <g id="gapGroup" transform="translate(450, 430)">
                <rect x="-62" y="-28" width="124" height="56" rx="14" fill="#061725" stroke="#8ee7ff" stroke-width="3" stroke-dasharray="7 7" opacity=".75"/>
                <circle cx="-62" cy="0" r="8" fill="#ffd166"/>
                <circle cx="62" cy="0" r="8" fill="#ffd166"/>
                <text x="0" y="50" text-anchor="middle" fill="#9bb7cc" font-family="Nunito, sans-serif" font-size="15" font-weight="900" letter-spacing="2">MATERIAL GAP</text>
              </g>
              <g id="gapMaterial"></g>

              <!-- bulb -->
              <g id="bulbGroup" transform="translate(780, 300)">
                <circle id="bulbHalo" r="88" fill="#ffd166" opacity="0"/>
                <g id="bulbRays" stroke="#ffd166" stroke-width="6" stroke-linecap="round" opacity="0">
                  <path d="M0 -84v-26M0 84v26M-84 0h-26M84 0h26M-58 -58l-18-18M58 58l18 18M58 -58l18-18M-58 58l-18 18"/>
                </g>
                <circle r="48" fill="url(#cbulb)" stroke="#fff8ce" stroke-width="4" opacity=".28" id="bulbGlass"/>
                <path d="M-14 30c-10-9-16-22-16-35 0-17 13-30 30-30s30 13 30 30c0 13-6 26-16 35z" fill="none" stroke="#dff8ff" stroke-width="4" opacity=".65"/>
                <path d="M-8 4l8 12 8-12" fill="none" stroke="#ffd166" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" id="filament"/>
                <rect x="-22" y="30" width="44" height="20" rx="5" fill="#dff8ff" stroke="#08243c" stroke-width="3"/>
                <path d="M-14 50h28M-10 58h20" stroke="#8ee7ff" stroke-width="4" stroke-linecap="round"/>
                <text x="0" y="88" text-anchor="middle" fill="#9bb7cc" font-family="Nunito, sans-serif" font-size="16" font-weight="900" letter-spacing="2">BULB</text>
              </g>

              <g id="electronLayer" opacity="0"></g>
            </svg>
            <div class="scene-pill"><span>⚡</span> closed loop = power</div>
            <div class="scene-callout" id="circuitCallout"></div>
          </div>
        </div>

        <aside class="control-panel">
          <div class="panel-head">
            <span class="panel-title"><span>⚙</span> Circuit</span>
            <button class="mini-btn" id="circuitReset" aria-label="Reset circuit">↺</button>
          </div>

          <div class="toggle-row">
            <span>Switch</span>
            <button class="toggle" id="switchToggle" aria-pressed="false" aria-label="Switch"></button>
          </div>

          <div class="control-group">
            <span class="control-label">Fill the gap</span>
            <div class="material-grid">
              <button class="material-btn" data-material="wire"><span class="material-icon">🔌</span>Copper</button>
              <button class="material-btn" data-material="coin"><span class="material-icon">🪙</span>Coin</button>
              <button class="material-btn" data-material="rubber"><span class="material-icon">🧽</span>Rubber</button>
              <button class="material-btn" data-material="wood"><span class="material-icon">🪵</span>Wood</button>
            </div>
          </div>

          <div class="circuit-status" id="circuitStatus">
            <span class="status-dot"></span>
            <span>Add a conductor.</span>
          </div>
          <div class="hint-chip"><span>💡</span><span>Electricity needs a full loop and a conductor.</span></div>
          <div class="conductor-note">Some materials let electrons zoom. Some block them.</div>
        </aside>
      </div>`;

    const scene = root.querySelector("#circuitScene");
    const loop = root.querySelector("#circuitLoop");
    const switchLever = root.querySelector("#switchLever");
    const switchHit = root.querySelector("#switchHit");
    const switchToggle = root.querySelector("#switchToggle");
    const gapMaterial = root.querySelector("#gapMaterial");
    const electronLayer = root.querySelector("#electronLayer");
    const bulbHalo = root.querySelector("#bulbHalo");
    const bulbRays = root.querySelector("#bulbRays");
    const bulbGlass = root.querySelector("#bulbGlass");
    const filament = root.querySelector("#filament");
    const statusEl = root.querySelector("#circuitStatus");
    const callout = root.querySelector("#circuitCallout");
    const resetBtn = root.querySelector("#circuitReset");
    const materialBtns = [...root.querySelectorAll("[data-material]")];

    const ac = new AbortController();
    const signal = ac.signal;

    const state = {
      switchOn: false,
      material: null,
      lit: false,
      completed: false,
      flow: 0,
      raf: 0,
      last: 0,
      pathLen: 0,
      electrons: [],
      calloutTimer: 0,
    };

    state.pathLen = loop.getTotalLength();
    for (let i = 0; i < 14; i++) {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("r", i % 3 === 0 ? 5 : 3.5);
      dot.setAttribute("fill", i % 2 ? "#ffd166" : "#7bf1a8");
      dot.setAttribute("filter", "url(#csoftglow)");
      electronLayer.appendChild(dot);
      state.electrons.push(dot);
    }

    function showCallout(text, tone = "info") {
      callout.textContent = text;
      callout.className = `scene-callout show ${tone}`;
      clearTimeout(state.calloutTimer);
      state.calloutTimer = setTimeout(() => callout.classList.remove("show"), 2200);
    }

    function materialMarkup(name) {
      if (name === "wire") {
        return `<g class="material-pop"><rect x="402" y="421" width="96" height="18" rx="9" fill="#ff9f1c" stroke="#7a3d00" stroke-width="2"/><circle cx="402" cy="430" r="10" fill="#ffd166"/><circle cx="498" cy="430" r="10" fill="#ffd166"/></g>`;
      }
      if (name === "coin") {
        return `<g class="material-pop"><circle cx="450" cy="430" r="25" fill="#ffd166" stroke="#a45d00" stroke-width="3"/><circle cx="450" cy="430" r="17" fill="none" stroke="#ffb703" stroke-width="2"/><text x="450" y="436" text-anchor="middle" fill="#8b4c00" font-family="Fredoka, sans-serif" font-size="18">$</text></g>`;
      }
      if (name === "rubber") {
        return `<g class="material-pop"><rect x="412" y="412" width="76" height="36" rx="12" fill="#ff8fab" stroke="#9d3351" stroke-width="3"/><path d="M424 424h52M424 436h52" stroke="#ffc2d4" stroke-width="3" stroke-linecap="round"/></g>`;
      }
      return `<g class="material-pop"><rect x="406" y="412" width="88" height="36" rx="8" fill="#b06b3c" stroke="#5d3218" stroke-width="3"/><path d="M418 422c12 4 22-4 34 0s22-2 32 2M418 436c12 4 22-4 34 0s22-2 32 2" fill="none" stroke="#7a4528" stroke-width="2.5" stroke-linecap="round"/></g>`;
    }

    function updateStatus() {
      const conductive = state.material ? MATERIALS[state.material].conductive : false;
      const closed = state.switchOn && conductive;
      state.lit = closed;
      scene.classList.toggle("lit", closed);
      switchLever.style.transform = state.switchOn ? "rotate(0deg)" : "rotate(-34deg)";
      switchToggle.setAttribute("aria-pressed", String(state.switchOn));
      switchHit.setAttribute("aria-pressed", String(state.switchOn));
      electronLayer.setAttribute("opacity", closed ? "1" : "0");
      bulbHalo.setAttribute("opacity", closed ? "0.42" : "0");
      bulbRays.setAttribute("opacity", closed ? "0.85" : "0");
      bulbGlass.setAttribute("opacity", closed ? "1" : "0.28");
      filament.setAttribute("stroke", closed ? "#fff8ce" : "#ffd166");

      if (closed) {
        statusEl.className = "circuit-status good";
        statusEl.innerHTML = `<span class="status-dot"></span><span>CLOSED LOOP! Electricity is flowing.</span>`;
        api.setStatus("LIT!");
        if (!state.completed) {
          state.completed = true;
          api.sfx.play("success");
          showCallout("LIGHT ON!", "good");
          setTimeout(() => api.complete("A closed loop + a conductor = light!"), 650);
        }
        if (!state.raf) {
          state.last = performance.now();
          state.raf = requestAnimationFrame(flowStep);
        }
      } else {
        statusEl.className = "circuit-status";
        if (!state.material) {
          statusEl.innerHTML = `<span class="status-dot"></span><span>Add a conductor to the gap.</span>`;
          api.setStatus("Fill the gap");
        } else if (!conductive) {
          statusEl.innerHTML = `<span class="status-dot"></span><span>That blocks electricity. Try another material.</span>`;
          api.setStatus("No flow");
        } else {
          statusEl.innerHTML = `<span class="status-dot"></span><span>Conductor ready. Close the switch!</span>`;
          api.setStatus("Close switch");
        }
        cancelAnimationFrame(state.raf);
        state.raf = 0;
      }
    }

    function flowStep(now) {
      if (!state.lit) {
        state.raf = 0;
        return;
      }
      const dt = Math.min(0.05, (now - state.last) / 1000);
      state.last = now;
      state.flow = (state.flow + dt * 145) % state.pathLen;
      state.electrons.forEach((dot, i) => {
        const dist = (state.flow + (i / state.electrons.length) * state.pathLen) % state.pathLen;
        const p = loop.getPointAtLength(dist);
        dot.setAttribute("cx", p.x);
        dot.setAttribute("cy", p.y);
      });
      state.raf = requestAnimationFrame(flowStep);
    }

    function toggleSwitch() {
      state.switchOn = !state.switchOn;
      api.sfx.play("switch");
      updateStatus();
    }

    switchHit.addEventListener("click", toggleSwitch, { signal });
    switchHit.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleSwitch();
      }
    }, { signal });
    switchToggle.addEventListener("click", toggleSwitch, { signal });

    materialBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.material = btn.dataset.material;
        materialBtns.forEach((b) => b.classList.toggle("active", b === btn));
        gapMaterial.innerHTML = materialMarkup(state.material);
        api.sfx.play(MATERIALS[state.material].conductive ? "spark" : "pop");
        updateStatus();
        if (!MATERIALS[state.material].conductive) {
          api.sfx.play("fail");
          showCallout("NO FLOW!", "bad");
          api.toast("That material blocks electricity.", "🧽");
        }
      }, { signal });
    });

    function resetCircuit() {
      state.switchOn = false;
      state.material = null;
      state.completed = false;
      state.flow = 0;
      cancelAnimationFrame(state.raf);
      state.raf = 0;
      gapMaterial.innerHTML = "";
      materialBtns.forEach((b) => b.classList.remove("active"));
      switchLever.style.transform = "rotate(-34deg)";
      updateStatus();
      callout.classList.remove("show");
      api.sfx.play("click");
    }

    resetBtn.addEventListener("click", resetCircuit, { signal });

    updateStatus();

    return {
      hint: "Pick something that lets electricity flow, then close the switch.",
      destroy() {
        cancelAnimationFrame(state.raf);
        clearTimeout(state.calloutTimer);
        ac.abort();
      },
    };
  },
};
