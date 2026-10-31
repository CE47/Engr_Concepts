import { clamp, easeInOutCubic, setRangeProgress } from "./util.js";

const art = `
<svg viewBox="0 0 320 160" aria-hidden="true">
  <defs>
    <linearGradient id="machineSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2a1f4f"/>
      <stop offset="1" stop-color="#0b2a47"/>
    </linearGradient>
    <linearGradient id="machineBeam" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffd166"/>
      <stop offset="1" stop-color="#ff9f1c"/>
    </linearGradient>
  </defs>
  <rect width="320" height="160" rx="18" fill="url(#machineSky)"/>
  <g class="art-gear" style="transform-origin:262px 48px" fill="none" stroke="#8ee7ff" stroke-width="7" opacity=".55">
    <circle cx="262" cy="48" r="20"/>
    <path d="M262 20v10M262 66v10M234 48h10M280 48h10M242 28l7 7M275 61l7 7M282 28l-7 7M249 61l-7 7"/>
  </g>
  <path d="M0 128h320v32H0z" fill="#102d3b"/>
  <path d="M0 128h320" stroke="#5ee7ff" stroke-width="2" opacity=".35"/>
  <g class="art-bob">
    <path d="M62 88h196l-8 16H70z" fill="url(#machineBeam)" stroke="#0b2c47" stroke-width="4"/>
    <path d="M160 104l26 30h-52z" fill="#5ee7ff" stroke="#0b2c47" stroke-width="4"/>
    <rect x="70" y="62" width="42" height="26" rx="5" fill="#ff8fab" stroke="#0b2c47" stroke-width="4"/>
    <path d="M77 62V50h28v12" fill="none" stroke="#ff8fab" stroke-width="4"/>
    <circle cx="232" cy="72" r="16" fill="#dff8ff" stroke="#0b2c47" stroke-width="4"/>
    <path d="M232 62v14M226 72h12" stroke="#ff6b6b" stroke-width="3" stroke-linecap="round"/>
    <path d="M210 88l12-10 12 10" fill="none" stroke="#dff8ff" stroke-width="4" stroke-linecap="round"/>
  </g>
  <path d="M34 46c8-8 20-8 28 0" fill="none" stroke="#ffd166" stroke-width="3" stroke-linecap="round" opacity=".7"/>
  <path d="M44 58c8-8 20-8 28 0" fill="none" stroke="#ffd166" stroke-width="3" stroke-linecap="round" opacity=".45"/>
</svg>`;

const leverPivotMin = 280;
const leverPivotMax = 700;
const leverBalance = 383;
const leverLoad = 60;
const leverEffort = 30;

export default {
  id: "machines",
  num: "03",
  title: "Machine Lab",
  icon: "⚖️",
  accent: "#b69cff",
  mission: "Master 3 machines!",
  tags: ["Simple machines", "Mechanics"],
  hint: "Slide the fulcrum, add pulleys, and lower the ramp. Each machine has a trick.",
  art,

  mount(root, api) {
    root.innerHTML = `
      <div class="lab-layout">
        <div class="lab-canvas-wrap">
          <div class="scene machine-scene" id="machineScene">
            <svg id="machineSvg" viewBox="0 0 1000 560" aria-label="Simple machines workshop">
              <defs>
                <linearGradient id="mSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#1a2148"/>
                  <stop offset=".62" stop-color="#0f3a5c"/>
                  <stop offset="1" stop-color="#082033"/>
                </linearGradient>
                <linearGradient id="mBeam" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stop-color="#ffe08a"/>
                  <stop offset=".55" stop-color="#ffd166"/>
                  <stop offset="1" stop-color="#ff9f1c"/>
                </linearGradient>
                <linearGradient id="mCrate" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#ffb3c6"/>
                  <stop offset="1" stop-color="#ff6b6b"/>
                </linearGradient>
                <linearGradient id="mRamp" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stop-color="#5ee7ff"/>
                  <stop offset="1" stop-color="#b69cff"/>
                </linearGradient>
                <filter id="mGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect width="1000" height="560" fill="url(#mSky)"/>

              <!-- workshop background -->
              <g opacity=".28" stroke="#8ee7ff" stroke-width="2" fill="none">
                <path d="M0 420h1000M0 470h1000M120 0v560M880 0v560"/>
                <path d="M120 90h760v330H120z" stroke-dasharray="10 12"/>
              </g>
              <g fill="#dff8ff" opacity=".55">
                <circle cx="88" cy="70" r="2"/><circle cx="210" cy="38" r="1.5"/><circle cx="760" cy="64" r="1.8"/>
                <circle cx="920" cy="120" r="1.3"/><circle cx="610" cy="34" r="1.4"/>
              </g>
              <g class="machine-hanging-lamp" transform="translate(500, 0)">
                <path d="M0 0v58" stroke="#8ee7ff" stroke-width="3" opacity=".5"/>
                <path d="M-28 58h56l-10 24h-36z" fill="#ffd166" opacity=".9"/>
                <ellipse cx="0" cy="84" rx="34" ry="8" fill="#ffd166" opacity=".18"/>
              </g>

              <!-- LEVER -->
              <g class="machine-scene-pane" data-pane="lever">
                <text x="500" y="120" text-anchor="middle" fill="#dff8ff" opacity=".65" font-family="Fredoka, sans-serif" font-size="23" letter-spacing="4">LEVER</text>
                <g id="leverFulcrum" transform="translate(383, 330)">
                  <path d="M0 0l70 140H-70z" fill="#5ee7ff" stroke="#08243c" stroke-width="5"/>
                  <circle cx="0" cy="4" r="11" fill="#ffd166" stroke="#08243c" stroke-width="4"/>
                </g>
                <g id="leverBeamGroup" transform="rotate(0 383 330)">
                  <rect x="150" y="316" width="700" height="28" rx="14" fill="url(#mBeam)" stroke="#08243c" stroke-width="5"/>
                  <g id="leverLoad" transform="translate(150, 316)">
                    <rect x="-42" y="-62" width="84" height="62" rx="8" fill="url(#mCrate)" stroke="#08243c" stroke-width="4"/>
                    <path d="M-30 -62v-10h20v10M10 -62v-10h20v10" fill="none" stroke="#ffd166" stroke-width="4"/>
                    <text x="0" y="-22" text-anchor="middle" fill="#3b1020" font-family="Fredoka, sans-serif" font-size="20" font-weight="600">60 N</text>
                  </g>
                  <g id="leverEffort" transform="translate(850, 316)">
                    <circle cx="0" cy="-42" r="27" fill="#dff8ff" stroke="#08243c" stroke-width="4"/>
                    <path d="M-10 -46h20M0 -56v20" stroke="#ff6b6b" stroke-width="4" stroke-linecap="round"/>
                    <text x="0" y="-84" text-anchor="middle" fill="#dff8ff" font-family="Fredoka, sans-serif" font-size="20" font-weight="600">30 N</text>
                  </g>
                </g>
                <path d="M150 470h700" stroke="#8ee7ff" stroke-width="2" opacity=".2" stroke-dasharray="8 10"/>
                <text x="500" y="510" text-anchor="middle" fill="#9bb7cc" font-family="Nunito, sans-serif" font-size="17" font-weight="800">load × distance = effort × distance</text>
              </g>

              <!-- PULLEY -->
              <g class="machine-scene-pane" data-pane="pulley" style="display:none">
                <text x="500" y="104" text-anchor="middle" fill="#dff8ff" opacity=".65" font-family="Fredoka, sans-serif" font-size="23" letter-spacing="4">PULLEY</text>
                <path d="M270 142h460" stroke="#8ee7ff" stroke-width="9" stroke-linecap="round"/>
                <path d="M300 142v-28M700 142v-28" stroke="#8ee7ff" stroke-width="5" opacity=".6"/>
                <g id="pulleyWheels"></g>
                <g id="pulleyRope" fill="none" stroke="#dff8ff" stroke-width="4" stroke-linecap="round"></g>
                <g id="pulleyCrate" transform="translate(500, 390)">
                  <rect x="-62" y="-60" width="124" height="84" rx="9" fill="url(#mCrate)" stroke="#08243c" stroke-width="5"/>
                  <path d="M-44 -60v-12h26v12M18 -60v-12h26v12" fill="none" stroke="#ffd166" stroke-width="4"/>
                  <text x="0" y="-10" text-anchor="middle" fill="#3b1020" font-family="Fredoka, sans-serif" font-size="25" font-weight="600">90 N</text>
                </g>
                <g transform="translate(745, 300)">
                  <circle r="28" fill="#dff8ff" stroke="#08243c" stroke-width="4"/>
                  <path d="M-11 -5h22M0 -16v22" stroke="#ff6b6b" stroke-width="4" stroke-linecap="round"/>
                </g>
                <path d="M270 500h460" stroke="#8ee7ff" stroke-width="2" opacity=".18" stroke-dasharray="8 10"/>
                <text x="500" y="528" text-anchor="middle" fill="#9bb7cc" font-family="Nunito, sans-serif" font-size="17" font-weight="800">more pulleys = less pull</text>
              </g>

              <!-- RAMP -->
              <g class="machine-scene-pane" data-pane="ramp" style="display:none">
                <text x="500" y="104" text-anchor="middle" fill="#dff8ff" opacity=".65" font-family="Fredoka, sans-serif" font-size="23" letter-spacing="4">RAMP</text>
                <path d="M180 470h640" stroke="#8ee7ff" stroke-width="2" opacity=".2" stroke-dasharray="8 10"/>
                <path id="rampSurface" d="M200 470L800 210" stroke="url(#mRamp)" stroke-width="18" stroke-linecap="round"/>
                <path id="rampTop" d="M200 470L800 210" stroke="#dff8ff" stroke-width="4" stroke-linecap="round" opacity=".4"/>
                <g id="rampCrate" transform="translate(238, 450) rotate(-24)">
                  <rect x="-38" y="-62" width="76" height="62" rx="8" fill="url(#mCrate)" stroke="#08243c" stroke-width="4"/>
                  <text x="0" y="-22" text-anchor="middle" fill="#3b1020" font-family="Fredoka, sans-serif" font-size="19" font-weight="600">90 N</text>
                </g>
                <g transform="translate(848, 260)">
                  <circle r="28" fill="#dff8ff" stroke="#08243c" stroke-width="4"/>
                  <path d="M-11 -5h22M0 -16v22" stroke="#ff6b6b" stroke-width="4" stroke-linecap="round"/>
                </g>
                <text x="500" y="528" text-anchor="middle" fill="#9bb7cc" font-family="Nunito, sans-serif" font-size="17" font-weight="800">steeper ramp = harder push</text>
              </g>

              <g id="machineSparkles"></g>
            </svg>
            <div class="scene-pill" id="machinePill"><span>⚖️</span> slide the fulcrum</div>
            <div class="scene-callout" id="machineCallout"></div>
          </div>
        </div>

        <aside class="control-panel">
          <div class="panel-head">
            <span class="panel-title"><span>⚙</span> Machines</span>
            <button class="mini-btn" id="machineReset" aria-label="Reset this machine">↺</button>
          </div>

          <div class="segmented machine-tabs" role="tablist" aria-label="Choose a simple machine">
            <button class="seg-btn active" data-machine="lever" role="tab" aria-selected="true">⚖️ LEVER</button>
            <button class="seg-btn" data-machine="pulley" role="tab" aria-selected="false">🪢 PULLEY</button>
            <button class="seg-btn" data-machine="ramp" role="tab" aria-selected="false">📐 RAMP</button>
          </div>

          <div class="machine-pane" data-pane="lever">
            <div class="control-group">
              <label class="control-label" for="leverRange">Fulcrum <span class="control-value" id="leverPos">320</span></label>
              <input type="range" id="leverRange" min="280" max="700" value="320">
            </div>
            <div class="torque-row">
              <div class="torque-bar"><span>LOAD</span><div class="torque-track"><i id="torqueLoad"></i></div><b id="torqueLoadVal">14.1k</b></div>
              <div class="torque-bar"><span>EFFORT</span><div class="torque-track"><i id="torqueEffort"></i></div><b id="torqueEffortVal">14.0k</b></div>
            </div>
            <div class="machine-readout" id="leverReadout">Slide until both bars match.</div>
            <div class="hint-chip"><span>💡</span><span>Move the fulcrum to balance the beam.</span></div>
          </div>

          <div class="machine-pane" data-pane="pulley" style="display:none">
            <div class="control-group">
              <span class="control-label">Pulleys <span class="control-value" id="pulleyCountVal">1</span></span>
              <div class="segmented pulley-seg" role="group" aria-label="Number of pulleys">
                <button class="seg-btn active" data-pulleys="1">1</button>
                <button class="seg-btn" data-pulleys="2">2</button>
                <button class="seg-btn" data-pulleys="3">3</button>
              </div>
            </div>
            <div class="effort-card">
              <div class="meter-label"><span>PULL NEEDED</span><b id="pulleyEffortVal">90 N</b></div>
              <div class="meter"><div class="meter-fill" id="pulleyEffortBar"></div></div>
              <div class="limit-line"><span>limit 30 N</span></div>
            </div>
            <button class="action-btn" id="pulleyLift">LIFT <span aria-hidden="true">↑</span></button>
            <div class="hint-chip"><span>💡</span><span>Lift 90 N with 30 N or less.</span></div>
          </div>

          <div class="machine-pane" data-pane="ramp" style="display:none">
            <div class="control-group">
              <label class="control-label" for="rampRange">Ramp angle <span class="control-value" id="rampAngleVal">40°</span></label>
              <input type="range" id="rampRange" min="10" max="50" value="40">
            </div>
            <div class="effort-card">
              <div class="meter-label"><span>PUSH NEEDED</span><b id="rampEffortVal">37 N</b></div>
              <div class="meter"><div class="meter-fill" id="rampEffortBar"></div></div>
              <div class="limit-line"><span>limit 50 N</span></div>
            </div>
            <button class="action-btn" id="rampPush">PUSH <span aria-hidden="true">↑</span></button>
            <div class="hint-chip"><span>💡</span><span>A gentle ramp needs less push.</span></div>
          </div>

          <div class="machine-progress" id="machineProgress" aria-label="Machine mastery">
            <span data-machine="lever">⚖️</span>
            <span data-machine="pulley">🪢</span>
            <span data-machine="ramp">📐</span>
          </div>
        </aside>
      </div>`;

    const svg = root.querySelector("#machineSvg");
    const tabs = [...root.querySelectorAll(".machine-tabs .seg-btn")];
    const panes = [...root.querySelectorAll(".machine-pane")];
    const scenePanes = [...root.querySelectorAll(".machine-scene-pane")];
    const pill = root.querySelector("#machinePill");
    const callout = root.querySelector("#machineCallout");
    const resetBtn = root.querySelector("#machineReset");
    const progressDots = [...root.querySelectorAll("#machineProgress span")];
    const sparkleLayer = root.querySelector("#machineSparkles");

    const leverRange = root.querySelector("#leverRange");
    const leverPos = root.querySelector("#leverPos");
    const leverReadout = root.querySelector("#leverReadout");
    const torqueLoad = root.querySelector("#torqueLoad");
    const torqueEffort = root.querySelector("#torqueEffort");
    const torqueLoadVal = root.querySelector("#torqueLoadVal");
    const torqueEffortVal = root.querySelector("#torqueEffortVal");
    const leverFulcrum = root.querySelector("#leverFulcrum");
    const leverBeamGroup = root.querySelector("#leverBeamGroup");

    const pulleyCountVal = root.querySelector("#pulleyCountVal");
    const pulleyEffortVal = root.querySelector("#pulleyEffortVal");
    const pulleyEffortBar = root.querySelector("#pulleyEffortBar");
    const pulleyLift = root.querySelector("#pulleyLift");
    const pulleyWheels = root.querySelector("#pulleyWheels");
    const pulleyRope = root.querySelector("#pulleyRope");
    const pulleyCrate = root.querySelector("#pulleyCrate");

    const rampRange = root.querySelector("#rampRange");
    const rampAngleVal = root.querySelector("#rampAngleVal");
    const rampEffortVal = root.querySelector("#rampEffortVal");
    const rampEffortBar = root.querySelector("#rampEffortBar");
    const rampPush = root.querySelector("#rampPush");
    const rampSurface = root.querySelector("#rampSurface");
    const rampTop = root.querySelector("#rampTop");
    const rampCrate = root.querySelector("#rampCrate");

    const ac = new AbortController();
    const signal = ac.signal;

    const state = {
      active: "lever",
      done: { lever: false, pulley: false, ramp: false },
      lever: { pivot: 320, balanced: false, timer: 0 },
      pulley: { count: 1, lifting: false, offset: 0 },
      ramp: { angle: 40, pushing: false, progress: 0 },
      raf: 0,
      calloutTimer: 0,
      sparkTimer: 0,
    };

    setRangeProgress(leverRange);
    setRangeProgress(rampRange);

    function showCallout(text, tone = "info") {
      callout.textContent = text;
      callout.className = `scene-callout show ${tone}`;
      clearTimeout(state.calloutTimer);
      state.calloutTimer = setTimeout(() => callout.classList.remove("show"), 2100);
    }

    function sparkleBurst(x, y, count = 14) {
      for (let i = 0; i < count; i++) {
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", x);
        dot.setAttribute("cy", y);
        dot.setAttribute("r", 3 + Math.random() * 5);
        dot.setAttribute("fill", i % 2 ? "#ffd166" : "#7bf1a8");
        sparkleLayer.appendChild(dot);
        const angle = Math.random() * Math.PI * 2;
        const dist = 35 + Math.random() * 90;
        dot.animate(
          [
            { transform: "translate(0,0)", opacity: 1 },
            { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`, opacity: 0 },
          ],
          { duration: 700 + Math.random() * 500, easing: "cubic-bezier(.2,.8,.3,1)" },
        ).onfinish = () => dot.remove();
      }
    }

    function markDone(machine, x, y, text) {
      if (state.done[machine]) return;
      state.done[machine] = true;
      const dot = progressDots.find((d) => d.dataset.machine === machine);
      dot?.classList.add("done");
      dot?.setAttribute("aria-label", `${machine} mastered`);
      sparkleBurst(x, y, 18);
      api.sfx.play("ding");
      showCallout(text, "good");
      const count = Object.values(state.done).filter(Boolean).length;
      api.setStatus(`${count} / 3`);
      if (count === 3) {
        setTimeout(() => {
          api.sfx.play("success");
          api.complete("Lever, pulley, ramp — you mastered all three!");
        }, 650);
      }
    }

    function updateProgress() {
      const count = Object.values(state.done).filter(Boolean).length;
      api.setStatus(`${count} / 3`);
      progressDots.forEach((dot) => {
        dot.classList.toggle("done", state.done[dot.dataset.machine]);
      });
    }

    function setActive(machine) {
      if (state.pulley.lifting || state.ramp.pushing) return;
      state.active = machine;
      tabs.forEach((tab) => {
        const on = tab.dataset.machine === machine;
        tab.classList.toggle("active", on);
        tab.setAttribute("aria-selected", String(on));
      });
      panes.forEach((pane) => {
        pane.style.display = pane.dataset.pane === machine ? "" : "none";
      });
      scenePanes.forEach((pane) => {
        pane.style.display = pane.dataset.pane === machine ? "" : "none";
      });
      const labels = {
        lever: "<span>⚖️</span> slide the fulcrum",
        pulley: "<span>🪢</span> pull with less force",
        ramp: "<span>📐</span> gentle ramp = easy push",
      };
      pill.innerHTML = labels[machine];
      callout.classList.remove("show");
      api.sfx.play("click");
    }

    /* ------------------------------ LEVER ------------------------------ */

    function updateLever() {
      const f = Number(leverRange.value);
      state.lever.pivot = f;
      leverPos.textContent = f;
      setRangeProgress(leverRange);
      const loadTorque = leverLoad * (f - 150);
      const effortTorque = leverEffort * (850 - f);
      const diff = effortTorque - loadTorque;
      const angle = clamp(diff / 1200, -14, 14);
      leverBeamGroup.setAttribute("transform", `rotate(${angle.toFixed(2)} ${f} 330)`);
      leverFulcrum.setAttribute("transform", `translate(${f}, 330)`);
      const maxTorque = leverLoad * 550;
      torqueLoad.style.width = `${clamp((loadTorque / maxTorque) * 100, 2, 100)}%`;
      torqueEffort.style.width = `${clamp((effortTorque / maxTorque) * 100, 2, 100)}%`;
      torqueLoadVal.textContent = `${(loadTorque / 1000).toFixed(1)}k`;
      torqueEffortVal.textContent = `${(effortTorque / 1000).toFixed(1)}k`;
      const balanced = Math.abs(diff) < 900;
      if (balanced) {
        leverReadout.textContent = "BALANCED! The beam is level.";
        leverReadout.classList.add("good");
        if (!state.done.lever) {
          clearTimeout(state.lever.timer);
          state.lever.timer = setTimeout(() => {
            markDone("lever", 383, 300, "BALANCED!");
          }, 650);
        }
      } else {
        clearTimeout(state.lever.timer);
        leverReadout.textContent =
          diff > 0 ? "Effort side is heavier. Slide right." : "Load side is heavier. Slide left.";
        leverReadout.classList.remove("good");
      }
    }

    leverRange.addEventListener("input", updateLever, { signal });

    /* ------------------------------ PULLEY ----------------------------- */

    function drawPulleys() {
      const n = state.pulley.count;
      pulleyCountVal.textContent = n;
      const positions = n === 1 ? [500] : n === 2 ? [430, 570] : [380, 500, 620];
      pulleyWheels.innerHTML = positions
        .map(
          (x) => `
          <g transform="translate(${x}, 142)">
            <circle r="31" fill="#0a2037" stroke="#8ee7ff" stroke-width="5"/>
            <circle r="12" fill="#ffd166" stroke="#08243c" stroke-width="4"/>
            <path d="M-31 0h-8M31 0h8" stroke="#dff8ff" stroke-width="4"/>
          </g>`,
        )
        .join("");
      const ropeParts = [];
      const left = positions[0];
      const right = positions[positions.length - 1];
      ropeParts.push(`<path d="M${left} 142V390M${right} 142V390"/>`);
      if (n > 1) {
        ropeParts.push(`<path d="M${left} 173c0 34 ${right - left} 34 ${right - left} 0" transform="translate(${left}, 0)"/>`);
      }
      if (n > 2) {
        ropeParts.push(`<path d="M${positions[1]} 173c0 26 ${positions[2] - positions[1]} 26 ${positions[2] - positions[1]} 0" transform="translate(${positions[1]}, 0)"/>`);
      }
      pulleyRope.innerHTML = ropeParts.join("");
      const effort = 90 / n;
      pulleyEffortVal.textContent = `${effort.toFixed(0)} N`;
      pulleyEffortBar.style.width = `${clamp((effort / 90) * 100, 5, 100)}%`;
      pulleyEffortBar.style.background =
        effort <= 30 ? "linear-gradient(90deg,#7bf1a8,#5ee7ff)" : "linear-gradient(90deg,#ffd166,#ff6b6b)";
    }

    root.querySelectorAll("[data-pulleys]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.pulley.lifting) return;
        state.pulley.count = Number(btn.dataset.pulleys);
        root.querySelectorAll("[data-pulleys]").forEach((b) => b.classList.toggle("active", b === btn));
        drawPulleys();
        api.sfx.play("pop");
      }, { signal });
    });

    function liftPulley() {
      if (state.pulley.lifting) return;
      const effort = 90 / state.pulley.count;
      if (effort > 30) {
        api.sfx.play("fail");
        showCallout("TOO HEAVY!", "bad");
        api.toast("Add another pulley.", "🪢");
        pulleyCrate.animate(
          [
            { transform: "translate(500px, 390px)" },
            { transform: "translate(500px, 402px)" },
            { transform: "translate(500px, 390px)" },
          ],
          { duration: 420, easing: "ease-out" },
        );
        return;
      }
      state.pulley.lifting = true;
      pulleyLift.disabled = true;
      pulleyLift.innerHTML = `LIFTING…`;
      api.sfx.play("whoosh");
      pulleyCrate.setAttribute("transform", "translate(500, 390)");
      const start = performance.now();
      const from = 390;
      const to = 220;
      function step(now) {
        const t = clamp((now - start) / 1800, 0, 1);
        const y = from + (to - from) * easeInOutCubic(t);
        pulleyCrate.setAttribute("transform", `translate(500, ${y})`);
        if (t < 1) {
          state.raf = requestAnimationFrame(step);
        } else {
          state.pulley.lifting = false;
          pulleyLift.disabled = false;
          pulleyLift.innerHTML = `LIFT AGAIN <span aria-hidden="true">↻</span>`;
          markDone("pulley", 500, 210, "EASY LIFT!");
        }
      }
      state.raf = requestAnimationFrame(step);
    }

    pulleyLift.addEventListener("click", liftPulley, { signal });

    /* ------------------------------- RAMP ------------------------------ */

    function drawRamp() {
      const angle = Number(rampRange.value);
      state.ramp.angle = angle;
      rampAngleVal.textContent = `${angle}°`;
      setRangeProgress(rampRange);
      const rad = (angle * Math.PI) / 180;
      const baseX = 200;
      const baseY = 470;
      const run = 600;
      const height = 260 * Math.tan(rad);
      const topX = baseX + run;
      const topY = baseY - height;
      rampSurface.setAttribute("d", `M${baseX} ${baseY}L${topX} ${topY}`);
      rampTop.setAttribute("d", `M${baseX} ${baseY}L${topX} ${topY}`);
      const effort = 90 * Math.sin(rad);
      rampEffortVal.textContent = `${effort.toFixed(0)} N`;
      rampEffortBar.style.width = `${clamp((effort / 90) * 100, 5, 100)}%`;
      rampEffortBar.style.background =
        effort <= 50 ? "linear-gradient(90deg,#7bf1a8,#5ee7ff)" : "linear-gradient(90deg,#ffd166,#ff6b6b)";
      if (!state.ramp.pushing) {
        const t = 0.06;
        const x = baseX + run * t;
        const y = baseY - height * t;
        rampCrate.setAttribute("transform", `translate(${x}, ${y - 2}) rotate(${-angle})`);
      }
    }

    rampRange.addEventListener("input", drawRamp, { signal });

    function pushRamp() {
      if (state.ramp.pushing) return;
      const angle = Number(rampRange.value);
      const effort = 90 * Math.sin((angle * Math.PI) / 180);
      if (effort > 50) {
        api.sfx.play("fail");
        showCallout("TOO STEEP!", "bad");
        api.toast("Lower the ramp angle.", "📐");
        const rad = (angle * Math.PI) / 180;
        const baseX = 200;
        const baseY = 470;
        const run = 600;
        const height = 260 * Math.tan(rad);
        rampCrate.animate(
          [
            { transform: `translate(${baseX + 26}px, ${baseY - 8}px) rotate(${-angle}deg)` },
            { transform: `translate(${baseX + 50}px, ${baseY - height * 0.08}px) rotate(${-angle}deg)` },
            { transform: `translate(${baseX + 26}px, ${baseY - 8}px) rotate(${-angle}deg)` },
          ],
          { duration: 620, easing: "ease-in-out" },
        );
        return;
      }
      state.ramp.pushing = true;
      rampPush.disabled = true;
      rampPush.innerHTML = `PUSHING…`;
      api.sfx.play("whoosh");
      const rad = (angle * Math.PI) / 180;
      const baseX = 200;
      const baseY = 470;
      const run = 600;
      const height = 260 * Math.tan(rad);
      const start = performance.now();
      function step(now) {
        const t = clamp((now - start) / 1700, 0, 1);
        const eased = easeInOutCubic(t);
        const x = baseX + run * (0.06 + eased * 0.84);
        const y = baseY - height * (0.06 + eased * 0.84);
        rampCrate.setAttribute("transform", `translate(${x}, ${y - 2}) rotate(${-angle})`);
        if (t < 1) {
          state.raf = requestAnimationFrame(step);
        } else {
          state.ramp.pushing = false;
          rampPush.disabled = false;
          rampPush.innerHTML = `PUSH AGAIN <span aria-hidden="true">↻</span>`;
          markDone("ramp", 760, 230, "EASY PUSH!");
        }
      }
      state.raf = requestAnimationFrame(step);
    }

    rampPush.addEventListener("click", pushRamp, { signal });

    /* ------------------------------ RESET ------------------------------ */

    function resetActive() {
      if (state.active === "lever") {
        state.done.lever = false;
        clearTimeout(state.lever.timer);
        leverRange.value = "320";
        updateLever();
        leverReadout.textContent = "Slide until both bars match.";
        leverReadout.classList.remove("good");
      } else if (state.active === "pulley") {
        state.done.pulley = false;
        state.pulley.count = 1;
        root.querySelectorAll("[data-pulleys]").forEach((b) => b.classList.toggle("active", b.dataset.pulleys === "1"));
        pulleyCrate.setAttribute("transform", "translate(500, 390)");
        pulleyLift.disabled = false;
        pulleyLift.innerHTML = `LIFT <span aria-hidden="true">↑</span>`;
        drawPulleys();
      } else {
        state.done.ramp = false;
        rampRange.value = "40";
        rampPush.disabled = false;
        rampPush.innerHTML = `PUSH <span aria-hidden="true">↑</span>`;
        drawRamp();
      }
      const dot = progressDots.find((d) => d.dataset.machine === state.active);
      dot?.classList.remove("done");
      updateProgress();
      callout.classList.remove("show");
      api.sfx.play("click");
    }

    tabs.forEach((tab) => tab.addEventListener("click", () => setActive(tab.dataset.machine), { signal }));
    resetBtn.addEventListener("click", resetActive, { signal });

    // initial paint
    updateLever();
    drawPulleys();
    drawRamp();
    updateProgress();

    return {
      hint: "Slide the fulcrum, add pulleys, and lower the ramp. Each machine has a trick.",
      destroy() {
        cancelAnimationFrame(state.raf);
        clearTimeout(state.calloutTimer);
        clearTimeout(state.lever.timer);
        ac.abort();
      },
    };
  },
};
