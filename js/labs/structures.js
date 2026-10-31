import { clamp, easeInOutCubic } from "./util.js";

const art = `
<svg viewBox="0 0 320 160" aria-hidden="true">
  <defs>
    <linearGradient id="bridgeSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#123a5e"/>
      <stop offset="1" stop-color="#0a4d66"/>
    </linearGradient>
    <linearGradient id="bridgeWater" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1a6f88"/>
      <stop offset="1" stop-color="#0a2f4a"/>
    </linearGradient>
  </defs>
  <rect width="320" height="160" rx="18" fill="url(#bridgeSky)"/>
  <circle cx="264" cy="36" r="20" fill="#ffd166" opacity=".85"/>
  <path d="M0 126h320v34H0z" fill="url(#bridgeWater)"/>
  <path d="M0 130q20-6 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0" fill="none" stroke="#8ee7ff" stroke-width="2" opacity=".35"/>
  <path d="M0 160V108c30 2 56 20 74 32h-74zM320 160V108c-30 2-56 20-74 32h74z" fill="#1a3a34"/>
  <g class="art-bridge">
    <path d="M74 108h172" stroke="#dff8ff" stroke-width="5" stroke-linecap="round"/>
    <path d="M74 84h172" stroke="#8ee7ff" stroke-width="3" opacity=".7"/>
    <path d="M74 108V84M131 108V84M188 108V84M246 108V84" stroke="#8ee7ff" stroke-width="2.5" opacity=".7"/>
    <path d="M74 108l57-24 57 24 58-24 0 24M74 84l57 24 57-24 58 24" stroke="#ffd166" stroke-width="2.4" fill="none" opacity=".9"/>
    <g class="art-truck">
      <rect x="152" y="85" width="46" height="18" rx="4" fill="#ff8fab"/>
      <rect x="188" y="91" width="17" height="12" rx="3" fill="#ffd166"/>
      <circle cx="166" cy="107" r="6" fill="#071426" stroke="#ffd166" stroke-width="2"/>
      <circle cx="198" cy="107" r="6" fill="#071426" stroke="#ffd166" stroke-width="2"/>
    </g>
  </g>
  <g fill="#dff8ff" opacity=".7">
    <circle cx="42" cy="36" r="2"/><circle cx="80" cy="22" r="1.5"/><circle cx="160" cy="40" r="1.8"/>
  </g>
</svg>`;

const panelStart = 180;
const panelWidth = 160;
const deckY = 340;
const topY = 250;

function panelMarkup(i) {
  const x = panelStart + i * panelWidth;
  return `
    <g class="brace-panel" data-panel="${i}" tabindex="0" role="button" aria-label="Brace panel ${i + 1}" aria-pressed="false">
      <rect class="panel-hit" x="${x}" y="${topY - 8}" width="${panelWidth}" height="${deckY - topY + 16}" rx="6"/>
      <g class="panel-braces">
        <line x1="${x}" y1="${deckY}" x2="${x + panelWidth}" y2="${topY}"/>
        <line x1="${x}" y1="${topY}" x2="${x + panelWidth}" y2="${deckY}"/>
      </g>
      <g class="panel-plus" transform="translate(${x + panelWidth / 2}, ${topY + (deckY - topY) / 2})">
        <circle r="15"/>
        <path d="M-6 0h12M0-6v12"/>
      </g>
    </g>`;
}

export default {
  id: "structures",
  num: "02",
  title: "Bridge Builder",
  icon: "🌉",
  accent: "#ffd166",
  mission: "Get the truck across!",
  tags: ["Structures", "Triangles"],
  hint: "Tap every panel to add triangle braces. Triangles spread the load.",
  art,

  mount(root, api) {
    root.innerHTML = `
      <div class="lab-layout">
        <div class="lab-canvas-wrap">
          <div class="scene bridge-scene" id="bridgeScene">
            <svg id="bridgeSvg" viewBox="0 0 1000 560" aria-label="Bridge building scene">
              <defs>
                <linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#0d3557"/>
                  <stop offset=".65" stop-color="#11556c"/>
                  <stop offset="1" stop-color="#0a2d42"/>
                </linearGradient>
                <linearGradient id="bwater" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#1b7590"/>
                  <stop offset="1" stop-color="#082b45"/>
                </linearGradient>
                <linearGradient id="bcliff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#1d4d3d"/>
                  <stop offset="1" stop-color="#0b2a29"/>
                </linearGradient>
                <linearGradient id="btruck" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#ffd166"/>
                  <stop offset="1" stop-color="#ff9f1c"/>
                </linearGradient>
                <filter id="bglow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              <rect width="1000" height="560" fill="url(#bsky)"/>
              <circle cx="820" cy="82" r="44" fill="#ffd166" opacity=".82"/>
              <circle cx="820" cy="82" r="62" fill="#ffd166" opacity=".08"/>

              <g fill="#dff8ff" opacity=".7">
                <circle cx="130" cy="76" r="2"/><circle cx="250" cy="42" r="1.5"/><circle cx="470" cy="68" r="2"/>
                <circle cx="590" cy="34" r="1.4"/><circle cx="920" cy="150" r="1.7"/><circle cx="700" cy="118" r="1.2"/>
              </g>

              <g class="cloud cloud-one" fill="#dff8ff" opacity=".12">
                <ellipse cx="220" cy="110" rx="62" ry="18"/><ellipse cx="260" cy="100" rx="42" ry="22"/>
              </g>
              <g class="cloud cloud-two" fill="#dff8ff" opacity=".09">
                <ellipse cx="690" cy="160" rx="54" ry="16"/><ellipse cx="730" cy="150" rx="36" ry="19"/>
              </g>

              <path d="M0 560V318c42 0 76 6 110 14l70 16v212z" fill="url(#bcliff)"/>
              <path d="M0 318c42 0 76 6 110 14l70 16v22c-50-2-100-10-180-14z" fill="#2d6b4e" opacity=".55"/>
              <path d="M1000 560V318c-42 0-76 6-110 14l-70 16v212z" fill="url(#bcliff)"/>
              <path d="M1000 318c-42 0-76 6-110 14l-70 16v22c50-2 100-10 180-14z" fill="#2d6b4e" opacity=".55"/>

              <path d="M0 472h1000v88H0z" fill="url(#bwater)"/>
              <g class="river-waves" stroke="#8ee7ff" stroke-width="3" opacity=".32" fill="none">
                <path d="M-40 500q30-10 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0"/>
                <path d="M-40 528q30-10 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0" opacity=".6"/>
              </g>
              <g fill="#ffd166" opacity=".4">
                <circle cx="240" cy="514" r="3"/><circle cx="760" cy="536" r="2"/><circle cx="520" cy="548" r="2.5"/>
              </g>

              <g id="trussGroup">
                <path d="M180 340h640" stroke="#dff8ff" stroke-width="10" stroke-linecap="round"/>
                <path d="M180 340h640" stroke="#ffd166" stroke-width="3" stroke-linecap="round" opacity=".9"/>
                <path d="M180 250h640" stroke="#8ee7ff" stroke-width="7" stroke-linecap="round" opacity=".78"/>
                <g stroke="#8ee7ff" stroke-width="7" stroke-linecap="round" opacity=".82">
                  <path d="M180 340V250M340 340V250M500 340V250M660 340V250M820 340V250"/>
                </g>
                ${[0, 1, 2, 3].map(panelMarkup).join("")}
              </g>

              <g id="truckGroup" transform="translate(62, 0)">
                <g transform="translate(0, 330)">
                  <rect x="-52" y="-58" width="72" height="44" rx="6" fill="url(#btruck)" stroke="#08243c" stroke-width="4"/>
                  <rect x="20" y="-48" width="34" height="34" rx="7" fill="#ff8fab" stroke="#08243c" stroke-width="4"/>
                  <path d="M29 -38h15v13H29z" fill="#bff4ff" stroke="#08243c" stroke-width="2"/>
                  <path d="M-44 -58v-9M-20 -58v-9" stroke="#ff6b6b" stroke-width="4" stroke-linecap="round"/>
                  <circle cx="-28" cy="-8" r="15" fill="#071426" stroke="#dff8ff" stroke-width="4"/>
                  <circle cx="31" cy="-8" r="15" fill="#071426" stroke="#dff8ff" stroke-width="4"/>
                  <circle cx="-28" cy="-8" r="5" fill="#ffd166"/>
                  <circle cx="31" cy="-8" r="5" fill="#ffd166"/>
                </g>
              </g>

              <g class="finish-flag">
                <path d="M905 340V232" stroke="#dff8ff" stroke-width="5" stroke-linecap="round"/>
                <path d="M907 234l42 14-42 16z" fill="#7bf1a8"/>
              </g>

              <g id="sparkleLayer" opacity="0"></g>
            </svg>
            <div class="scene-pill"><span>🔺</span> triangles = tough</div>
            <div class="scene-callout" id="bridgeCallout"></div>
          </div>
        </div>

        <aside class="control-panel">
          <div class="panel-head">
            <span class="panel-title"><span>⚙</span> Controls</span>
            <button class="mini-btn" id="bridgeReset" aria-label="Reset bridge">↺</button>
          </div>

          <div class="strength-card">
            <div class="strength-top"><span>TRUSS POWER</span><span id="braceCount">0 / 4</span></div>
            <div class="strength-segments" id="strengthSegments">
              <i></i><i></i><i></i><i></i>
            </div>
            <div class="strength-note" id="strengthNote">Tap the glowing panels.</div>
          </div>

          <button class="action-btn warm" id="bridgeTest">TEST TRUCK <span aria-hidden="true">▶</span></button>
          <div class="hint-chip"><span>💡</span><span>Triangles make strong bridges. Tap each panel.</span></div>
          <div class="legend-row">
            <span><i class="legend-dot cyan"></i> beam</span>
            <span><i class="legend-dot yellow"></i> brace</span>
            <span><i class="legend-dot mint"></i> goal</span>
          </div>
        </aside>
      </div>`;

    const svg = root.querySelector("#bridgeSvg");
    const trussGroup = root.querySelector("#trussGroup");
    const truckGroup = root.querySelector("#truckGroup");
    const testBtn = root.querySelector("#bridgeTest");
    const resetBtn = root.querySelector("#bridgeReset");
    const braceCount = root.querySelector("#braceCount");
    const strengthSegments = [...root.querySelectorAll("#strengthSegments i")];
    const strengthNote = root.querySelector("#strengthNote");
    const callout = root.querySelector("#bridgeCallout");
    const scene = root.querySelector("#bridgeScene");
    const panels = [...root.querySelectorAll(".brace-panel")];

    const ac = new AbortController();
    const signal = ac.signal;

    const state = {
      braces: [false, false, false, false],
      testing: false,
      completed: false,
      truckX: 62,
      truckY: 0,
      truckRotate: 0,
      trussY: 0,
      trussRotate: 0,
      raf: 0,
      calloutTimer: 0,
      testStart: 0,
      phase: "idle",
    };

    function setTruck(x, y = state.truckY, rotate = state.truckRotate) {
      state.truckX = x;
      state.truckY = y;
      state.truckRotate = rotate;
      truckGroup.setAttribute("transform", `translate(${x}, ${y}) rotate(${rotate} 0 330)`);
    }

    function setTruss(y, rotate = 0) {
      state.trussY = y;
      state.trussRotate = rotate;
      trussGroup.setAttribute("transform", `translate(0, ${y}) rotate(${rotate} 500 340)`);
    }

    function showCallout(text, tone = "info") {
      callout.textContent = text;
      callout.className = `scene-callout show ${tone}`;
      clearTimeout(state.calloutTimer);
      state.calloutTimer = setTimeout(() => callout.classList.remove("show"), 2000);
    }

    function updateStrength() {
      const count = state.braces.filter(Boolean).length;
      braceCount.textContent = `${count} / 4`;
      strengthSegments.forEach((seg, i) => seg.classList.toggle("on", state.braces[i]));
      strengthNote.textContent =
        count === 4
          ? "Solid! Send the truck."
          : count === 0
            ? "Tap the glowing panels."
            : "More triangles = more strength.";
      panels.forEach((panel, i) => {
        panel.classList.toggle("active", state.braces[i]);
        panel.setAttribute("aria-pressed", String(state.braces[i]));
      });
      if (count === 4) api.sfx.play("ding");
    }

    function togglePanel(i) {
      if (state.testing) return;
      state.braces[i] = !state.braces[i];
      api.sfx.play("pop");
      updateStrength();
      const panel = panels[i];
      panel.classList.remove("tap");
      void panel.offsetWidth;
      panel.classList.add("tap");
    }

    panels.forEach((panel, i) => {
      panel.addEventListener("click", () => togglePanel(i), { signal });
      panel.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          togglePanel(i);
        }
      }, { signal });
    });

    function resetBridge(clearBraces = true) {
      cancelAnimationFrame(state.raf);
      state.testing = false;
      state.phase = "idle";
      if (clearBraces) state.braces = [false, false, false, false];
      setTruck(62, 0, 0);
      setTruss(0, 0);
      testBtn.disabled = false;
      testBtn.innerHTML = `TEST TRUCK <span aria-hidden="true">▶</span>`;
      callout.classList.remove("show");
      updateStrength();
      strengthNote.textContent = state.braces.filter(Boolean).length === 4 ? "Solid! Send the truck." : "Tap the glowing panels.";
    }

    function sparkleAt(x, y) {
      const layer = root.querySelector("#sparkleLayer");
      layer.setAttribute("opacity", "1");
      for (let i = 0; i < 16; i++) {
        const star = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        star.setAttribute("cx", x);
        star.setAttribute("cy", y);
        star.setAttribute("r", 3 + Math.random() * 4);
        star.setAttribute("fill", i % 2 ? "#ffd166" : "#7bf1a8");
        layer.appendChild(star);
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 70;
        star.animate(
          [
            { transform: "translate(0,0)", opacity: 1 },
            { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`, opacity: 0 },
          ],
          { duration: 700 + Math.random() * 500, easing: "cubic-bezier(.2,.8,.3,1)" },
        ).onfinish = () => star.remove();
      }
    }

    function successCross(now) {
      const t = clamp((now - state.testStart) / 3600, 0, 1);
      const eased = easeInOutCubic(t);
      const x = 62 + eased * 842;
      const wobble = Math.sin(t * Math.PI * 12) * (1 - t) * 2.2;
      setTruck(x, wobble, 0);
      setTruss(wobble * 0.4, 0);
      if (t < 1) {
        state.raf = requestAnimationFrame(successCross);
      } else {
        state.testing = false;
        state.phase = "done";
        state.completed = true;
        testBtn.disabled = false;
        testBtn.innerHTML = `TEST AGAIN <span aria-hidden="true">↻</span>`;
        setTruck(904, 0, 0);
        setTruss(0, 0);
        showCallout("TRUCK CROSSED!", "good");
        sparkleAt(904, 290);
        api.sfx.play("success");
        api.complete("Triangles spread the load. Strong work!");
      }
    }

    function failCross(now) {
      const elapsed = (now - state.testStart) / 1000;
      if (elapsed < 1.35) {
        const t = clamp(elapsed / 1.35, 0, 1);
        const x = 62 + easeInOutCubic(t) * 420;
        setTruck(x, Math.sin(t * Math.PI * 10) * 1.5, 0);
        setTruss(Math.sin(t * Math.PI * 10) * 1.2, 0);
        state.raf = requestAnimationFrame(failCross);
        return;
      }
      if (state.phase !== "collapsing") {
        state.phase = "collapsing";
        state.testStart = now;
        api.sfx.play("crack");
        showCallout("SNAP!", "bad");
        scene.classList.add("scene-shake");
        setTimeout(() => scene.classList.remove("scene-shake"), 650);
        state.raf = requestAnimationFrame(collapse);
      }
    }

    function collapse(now) {
      const t = clamp((now - state.testStart) / 850, 0, 1);
      const eased = t * t;
      setTruss(eased * 120, eased * 4);
      setTruck(482 + eased * 40, eased * 120, eased * 28);
      if (t < 1) {
        state.raf = requestAnimationFrame(collapse);
      } else {
        setTimeout(() => {
          if (state.phase === "collapsing") {
            state.phase = "idle";
            state.testing = false;
            setTruck(62, 0, 0);
            setTruss(0, 0);
            testBtn.disabled = false;
            testBtn.innerHTML = `TEST TRUCK <span aria-hidden="true">▶</span>`;
            api.toast("Add more triangles, then try again.", "🔺");
          }
        }, 1100);
      }
    }

    function testBridge() {
      if (state.testing) return;
      state.testing = true;
      state.phase = "testing";
      state.testStart = performance.now();
      testBtn.disabled = true;
      testBtn.innerHTML = `CROSSING…`;
      const strong = state.braces.every(Boolean);
      api.sfx.play("whoosh");
      state.raf = requestAnimationFrame(strong ? successCross : failCross);
    }

    testBtn.addEventListener("click", testBridge, { signal });
    resetBtn.addEventListener("click", () => resetBridge(true), { signal });

    updateStrength();
    setTruck(62, 0, 0);

    return {
      hint: "Tap every panel to add triangle braces. Triangles spread the load.",
      destroy() {
        cancelAnimationFrame(state.raf);
        clearTimeout(state.calloutTimer);
        ac.abort();
      },
    };
  },
};
