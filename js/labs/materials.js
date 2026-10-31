import { clamp, setRangeProgress } from "./util.js";

const art = `
<svg viewBox="0 0 320 160" aria-hidden="true">
  <defs>
    <linearGradient id="matSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2b2149"/>
      <stop offset="1" stop-color="#0a2d45"/>
    </linearGradient>
    <radialGradient id="matEgg" cx=".35" cy=".3">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".55" stop-color="#fff1cf"/>
      <stop offset="1" stop-color="#ffd166"/>
    </radialGradient>
  </defs>
  <rect width="320" height="160" rx="18" fill="url(#matSky)"/>
  <circle cx="252" cy="32" r="18" fill="#ffd166" opacity=".8"/>
  <g stroke="#8ee7ff" stroke-width="2" opacity=".28">
    <path d="M50 34v96M70 34v96M250 28v102M270 28v102"/>
    <path d="M50 50h20M50 74h20M50 98h20M50 122h20M250 50h20M250 74h20M250 98h20M250 122h20"/>
  </g>
  <path d="M0 132h320v28H0z" fill="#0b2638"/>
  <g class="art-bob">
    <path d="M160 42c-25 0-42 24-42 50 0 28 18 46 42 46s42-18 42-46c0-26-17-50-42-50z" fill="url(#matEgg)" stroke="#8b5d00" stroke-width="3"/>
    <path d="M136 82c-10-8-16-16-16-26 0-10 8-16 18-12" fill="none" stroke="#dff8ff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
    <circle cx="148" cy="92" r="5" fill="#08243c"/>
    <circle cx="172" cy="92" r="5" fill="#08243c"/>
    <path d="M152 108q8 6 16 0" fill="none" stroke="#08243c" stroke-width="3" stroke-linecap="round"/>
    <path d="M126 68c14-10 54-10 68 0" fill="none" stroke="#5ee7ff" stroke-width="4" stroke-linecap="round"/>
    <path d="M122 68h76" stroke="#5ee7ff" stroke-width="4" stroke-linecap="round"/>
    <circle cx="132" cy="68" r="5" fill="#5ee7ff"/>
    <circle cx="188" cy="68" r="5" fill="#5ee7ff"/>
  </g>
  <path d="M88 136h144l-14 18H102z" fill="#7bf1a8" stroke="#08243c" stroke-width="3"/>
  <g fill="#ffd166" opacity=".55">
    <circle cx="46" cy="26" r="1.6"/><circle cx="102" cy="42" r="1.4"/><circle cx="210" cy="22" r="1.8"/>
  </g>
</svg>`;

const MATERIALS = {
  foam: {
    name: "Foam",
    icon: "🧊",
    impact: 18,
    note: "Soft & squishy",
    markup: `<g class="pad-material foam-pad">
      <rect x="350" y="444" width="300" height="46" rx="18" fill="#7bf1a8" stroke="#2b8a57" stroke-width="5"/>
      <path d="M370 460h44M430 472h60M510 458h52M580 472h40" stroke="#c7ffe0" stroke-width="4" stroke-linecap="round" opacity=".75"/>
      <circle cx="405" cy="480" r="5" fill="#3fbb78"/><circle cx="555" cy="462" r="4" fill="#3fbb78"/>
    </g>`,
  },
  rubber: {
    name: "Rubber",
    icon: "🔴",
    impact: 36,
    note: "Bouncy & springy",
    markup: `<g class="pad-material rubber-pad">
      <rect x="360" y="452" width="280" height="34" rx="16" fill="#ff8fab" stroke="#9d3351" stroke-width="5"/>
      <path d="M390 468h36M446 468h36M502 468h36M558 468h36" stroke="#ffd3df" stroke-width="5" stroke-linecap="round"/>
    </g>`,
  },
  wood: {
    name: "Wood",
    icon: "🪵",
    impact: 72,
    note: "Hard & stiff",
    markup: `<g class="pad-material wood-pad">
      <rect x="370" y="458" width="260" height="24" rx="6" fill="#b06b3c" stroke="#5d3218" stroke-width="5"/>
      <path d="M390 466c28 5 52-4 78 0s50-3 74 1M390 474c30 4 52-3 78 0s50-2 74 2" fill="none" stroke="#7a4528" stroke-width="3" stroke-linecap="round"/>
    </g>`,
  },
  metal: {
    name: "Metal",
    icon: "⚙️",
    impact: 92,
    note: "Hard & unforgiving",
    markup: `<g class="pad-material metal-pad">
      <rect x="370" y="460" width="260" height="20" rx="6" fill="#9fb7cc" stroke="#40576b" stroke-width="5"/>
      <path d="M392 470h216" stroke="#dff8ff" stroke-width="3" opacity=".65"/>
      <circle cx="400" cy="470" r="4" fill="#40576b"/><circle cx="600" cy="470" r="4" fill="#40576b"/>
    </g>`,
  },
};

export default {
  id: "materials",
  num: "07",
  title: "Egg Drop",
  icon: "🥚",
  accent: "#ff8fab",
  mission: "Save the egg!",
  tags: ["Materials", "Impact"],
  hint: "Soft materials spread the impact. Find a landing pad that protects the egg.",
  art,

  mount(root, api) {
    root.innerHTML = `
      <div class="lab-layout">
        <div class="lab-canvas-wrap">
          <div class="scene material-scene" id="materialScene">
            <svg id="materialSvg" viewBox="0 0 1000 560" aria-label="Egg drop material test">
              <defs>
                <linearGradient id="msky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#2a204e"/>
                  <stop offset=".62" stop-color="#103752"/>
                  <stop offset="1" stop-color="#081d2e"/>
                </linearGradient>
                <linearGradient id="mfloor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#173d3a"/>
                  <stop offset="1" stop-color="#071c28"/>
                </linearGradient>
                <radialGradient id="megg" cx=".35" cy=".3">
                  <stop offset="0" stop-color="#ffffff"/>
                  <stop offset=".55" stop-color="#fff1cf"/>
                  <stop offset="1" stop-color="#ffd166"/>
                </radialGradient>
                <filter id="mglow2" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect width="1000" height="560" fill="url(#msky)"/>
              <circle cx="852" cy="78" r="44" fill="#ffd166" opacity=".8"/>
              <g fill="#dff8ff" opacity=".6">
                <circle cx="110" cy="66" r="2"/><circle cx="210" cy="34" r="1.4"/><circle cx="330" cy="82" r="1.7"/>
                <circle cx="500" cy="40" r="1.3"/><circle cx="680" cy="70" r="1.6"/><circle cx="930" cy="150" r="1.4"/>
              </g>

              <path d="M0 470h1000v90H0z" fill="url(#mfloor)"/>
              <path d="M0 470h1000" stroke="#8ee7ff" stroke-width="2" opacity=".2"/>
              <g stroke="#8ee7ff" stroke-width="2" opacity=".14">
                <path d="M0 500h1000M0 530h1000M120 470v90M260 470v90M400 470v90M540 470v90M680 470v90M820 470v90"/>
              </g>

              <!-- height ruler -->
              <g class="height-ruler" transform="translate(92, 0)">
                <path d="M0 132v136" stroke="#8ee7ff" stroke-width="3" opacity=".38"/>
                <g fill="#9bb7cc" font-family="Nunito, sans-serif" font-size="14" font-weight="900">
                  <path d="M0 140h18M0 168h18M0 196h18M0 224h18M0 252h18" stroke="#8ee7ff" stroke-width="2" opacity=".45"/>
                  <text x="28" y="145">5 m</text><text x="28" y="173">4 m</text><text x="28" y="201">3 m</text>
                  <text x="28" y="229">2 m</text><text x="28" y="257">1 m</text>
                </g>
                <g id="heightMarker" transform="translate(0, 196)">
                  <path d="M-10 0l14-8v16z" fill="#ffd166"/>
                  <circle cx="-16" cy="0" r="4" fill="#ffd166"/>
                </g>
              </g>

              <!-- drop tower -->
              <g stroke="#8ee7ff" stroke-width="7" stroke-linecap="round" opacity=".35">
                <path d="M300 142V470M700 142V470"/>
                <path d="M300 170h400M300 400h400" stroke-width="4" opacity=".6"/>
              </g>
              <g fill="#5ee7ff" opacity=".55">
                <circle cx="300" cy="142" r="7"/><circle cx="700" cy="142" r="7"/>
              </g>

              <g id="padGroup"></g>
              <g id="eggSplat" opacity="0">
                <ellipse cx="500" cy="476" rx="72" ry="16" fill="#ffb703"/>
                <ellipse cx="474" cy="474" rx="18" ry="8" fill="#ffd166"/>
                <ellipse cx="530" cy="478" rx="24" ry="9" fill="#ffd166"/>
              </g>

              <g id="eggGroup" transform="translate(500, 300)">
                <ellipse id="eggShadow" cx="0" cy="42" rx="34" ry="8" fill="#03101f" opacity=".24"/>
                <path id="eggShell" d="M0-40c-27 0-45 26-45 54 0 29 19 48 45 48s45-19 45-48c0-28-18-54-45-54z" fill="url(#megg)" stroke="#8b5d00" stroke-width="4"/>
                <path d="M-26 0c-11-9-18-18-18-29 0-11 9-18 20-13" fill="none" stroke="#dff8ff" stroke-width="3.5" stroke-linecap="round" opacity=".85"/>
                <g id="eggFace">
                  <circle cx="-14" cy="10" r="5.5" fill="#08243c"/>
                  <circle cx="14" cy="10" r="5.5" fill="#08243c"/>
                  <circle cx="-12" cy="8" r="1.8" fill="#ffffff"/>
                  <circle cx="16" cy="8" r="1.8" fill="#ffffff"/>
                  <path d="M-9 28q9 7 18 0" fill="none" stroke="#08243c" stroke-width="3.5" stroke-linecap="round"/>
                  <circle cx="-27" cy="18" r="5" fill="#ff8fab" opacity=".65"/>
                  <circle cx="27" cy="18" r="5" fill="#ff8fab" opacity=".65"/>
                </g>
                <g id="eggGoggles">
                  <path d="M-31-18c16-11 46-11 62 0" fill="none" stroke="#5ee7ff" stroke-width="5" stroke-linecap="round"/>
                  <path d="M-34-18h68" stroke="#5ee7ff" stroke-width="5" stroke-linecap="round"/>
                  <circle cx="-23" cy="-18" r="6" fill="#5ee7ff" stroke="#08243c" stroke-width="2"/>
                  <circle cx="23" cy="-18" r="6" fill="#5ee7ff" stroke="#08243c" stroke-width="2"/>
                </g>
                <g id="eggCracks" opacity="0" stroke="#7a4a00" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M-18-28l12 16-9 12 14 10M22-20l-12 16 9 12-12 8M-40 12l16-4-8 14"/>
                </g>
              </g>

              <g id="impactSpark" opacity="0"></g>
              <g id="materialSparkles"></g>
            </svg>

            <div class="scene-pill"><span>🪂</span> soft landing = happy egg</div>
            <div class="scene-callout" id="materialCallout"></div>
          </div>
        </div>

        <aside class="control-panel">
          <div class="panel-head">
            <span class="panel-title"><span>⚙</span> Test rig</span>
            <button class="mini-btn" id="materialReset" aria-label="Reset egg drop">↺</button>
          </div>

          <div class="control-group">
            <label class="control-label" for="heightRange">Drop height <span class="control-value" id="heightVal">3 m</span></label>
            <input type="range" id="heightRange" min="1" max="5" value="3">
          </div>

          <div class="control-group">
            <span class="control-label">Landing pad</span>
            <div class="material-grid">
              <button class="material-btn" data-pad="foam"><span class="material-icon">🧊</span>Foam</button>
              <button class="material-btn" data-pad="rubber"><span class="material-icon">🔴</span>Rubber</button>
              <button class="material-btn active" data-pad="wood"><span class="material-icon">🪵</span>Wood</button>
              <button class="material-btn" data-pad="metal"><span class="material-icon">⚙️</span>Metal</button>
            </div>
          </div>

          <div class="impact-card">
            <div class="meter-label"><span>IMPACT</span><b id="impactVal">—</b></div>
            <div class="meter"><div class="meter-fill" id="impactBar"></div></div>
            <div class="limit-line"><span>egg-safe limit</span></div>
          </div>

          <button class="action-btn warm" id="dropBtn">DROP <span aria-hidden="true">↓</span></button>
          <div class="hint-chip"><span>💡</span><span>Soft materials spread the impact. Choose wisely.</span></div>
        </aside>
      </div>`;

    const scene = root.querySelector("#materialScene");
    const padGroup = root.querySelector("#padGroup");
    const eggGroup = root.querySelector("#eggGroup");
    const eggShadow = root.querySelector("#eggShadow");
    const eggFace = root.querySelector("#eggFace");
    const eggCracks = root.querySelector("#eggCracks");
    const eggSplat = root.querySelector("#eggSplat");
    const heightRange = root.querySelector("#heightRange");
    const heightVal = root.querySelector("#heightVal");
    const heightMarker = root.querySelector("#heightMarker");
    const dropBtn = root.querySelector("#dropBtn");
    const resetBtn = root.querySelector("#materialReset");
    const impactVal = root.querySelector("#impactVal");
    const impactBar = root.querySelector("#impactBar");
    const callout = root.querySelector("#materialCallout");
    const impactSpark = root.querySelector("#impactSpark");
    const sparkleLayer = root.querySelector("#materialSparkles");
    const padBtns = [...root.querySelectorAll("[data-pad]")];

    const ac = new AbortController();
    const signal = ac.signal;

    const state = {
      pad: "wood",
      height: 3,
      dropping: false,
      safe: false,
      raf: 0,
      calloutTimer: 0,
      resetTimer: 0,
      sparkTimer: 0,
    };

    setRangeProgress(heightRange);

    function eggYForHeight(height) {
      return 280 - height * 28;
    }

    function startY() {
      return eggYForHeight(state.height);
    }

    function impactFor(pad, height) {
      return MATERIALS[pad].impact * (0.7 + height * 0.1);
    }

    function showCallout(text, tone = "info") {
      callout.textContent = text;
      callout.className = `scene-callout show ${tone}`;
      clearTimeout(state.calloutTimer);
      state.calloutTimer = setTimeout(() => callout.classList.remove("show"), 2300);
    }

    function updatePad() {
      padGroup.innerHTML = MATERIALS[state.pad].markup;
      padGroup.classList.remove("pad-pop");
      void padGroup.offsetWidth;
      padGroup.classList.add("pad-pop");
      const impact = impactFor(state.pad, state.height);
      impactVal.textContent = `${impact.toFixed(0)}`;
      impactBar.style.width = `${clamp(impact, 3, 100)}%`;
      impactBar.style.background =
        impact < 55 ? "linear-gradient(90deg,#7bf1a8,#5ee7ff)" : "linear-gradient(90deg,#ffd166,#ff6b6b)";
      padBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.pad === state.pad));
    }

    function resetEgg() {
      cancelAnimationFrame(state.raf);
      clearTimeout(state.resetTimer);
      state.dropping = false;
      state.safe = false;
      eggGroup.classList.remove("cracked");
      eggCracks.setAttribute("opacity", "0");
      eggSplat.setAttribute("opacity", "0");
      eggFace.style.display = "";
      eggGroup.style.transform = "";
      eggGroup.setAttribute("transform", `translate(500, ${startY()})`);
      eggShadow.setAttribute("opacity", ".24");
      dropBtn.disabled = false;
      dropBtn.innerHTML = `DROP <span aria-hidden="true">↓</span>`;
      impactVal.textContent = "—";
      impactBar.style.width = "0%";
      callout.classList.remove("show");
      scene.classList.remove("scene-shake");
    }

    function updateHeight() {
      state.height = Number(heightRange.value);
      heightVal.textContent = `${state.height} m`;
      setRangeProgress(heightRange);
      const y = eggYForHeight(state.height);
      heightMarker.setAttribute("transform", `translate(0, ${y})`);
      if (!state.dropping) {
        eggGroup.setAttribute("transform", `translate(500, ${y})`);
        updatePad();
      }
    }

    function sparkleAt(x, y, count = 16, colors = ["#ffd166", "#7bf1a8", "#ff8fab"]) {
      for (let i = 0; i < count; i++) {
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", x);
        dot.setAttribute("cy", y);
        dot.setAttribute("r", 3 + Math.random() * 5);
        dot.setAttribute("fill", colors[i % colors.length]);
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

    function drop() {
      if (state.dropping) return;
      state.dropping = true;
      dropBtn.disabled = true;
      dropBtn.innerHTML = `FALLING…`;
      api.sfx.play("whoosh");
      const from = startY();
      const to = 430;
      const start = performance.now();
      const duration = 760 + (state.height - 1) * 55;
      function step(now) {
        const t = clamp((now - start) / duration, 0, 1);
        const eased = t * t;
        const y = from + (to - from) * eased;
        eggGroup.setAttribute("transform", `translate(500, ${y})`);
        const shadowOpacity = 0.1 + t * 0.35;
        eggShadow.setAttribute("opacity", String(shadowOpacity));
        if (t < 1) {
          state.raf = requestAnimationFrame(step);
        } else {
          impact();
        }
      }
      state.raf = requestAnimationFrame(step);
    }

    function impact() {
      state.dropping = false;
      const impact = impactFor(state.pad, state.height);
      impactVal.textContent = `${impact.toFixed(0)}`;
      impactBar.style.width = `${clamp(impact, 3, 100)}%`;
      impactBar.style.background =
        impact < 55 ? "linear-gradient(90deg,#7bf1a8,#5ee7ff)" : "linear-gradient(90deg,#ffd166,#ff6b6b)";
      const safe = impact < 55;
      state.safe = safe;

      // squash the pad
      if (padGroup.firstElementChild) {
        padGroup.animate(
          [
            { transform: "scaleY(1)" },
            { transform: "scaleY(.45)" },
            { transform: "scaleY(1)" },
          ],
          { duration: 330, easing: "cubic-bezier(.2,.8,.3,1)" },
        );
      }

      if (safe) {
        api.sfx.play("bounce");
        showCallout("SAFE!", "good");
        sparkleAt(500, 430, 18);
        eggGroup.animate(
          [
            { transform: "translate(500px, 430px) scaleY(.82)" },
            { transform: "translate(500px, 388px) scaleY(1.05)" },
            { transform: "translate(500px, 430px) scaleY(.96)" },
          ],
          { duration: 650, easing: "cubic-bezier(.2,.8,.3,1)" },
        );
        setTimeout(() => {
          api.sfx.play("success");
          api.complete(`${MATERIALS[state.pad].name} spread the impact. Egg saved!`);
        }, 700);
      } else {
        api.sfx.play("crack");
        showCallout("CRACK!", "bad");
        scene.classList.add("scene-shake");
        setTimeout(() => scene.classList.remove("scene-shake"), 600);
        eggGroup.classList.add("cracked");
        eggCracks.setAttribute("opacity", "1");
        eggSplat.setAttribute("opacity", "1");
        eggFace.style.display = "none";
        eggGroup.animate(
          [
            { transform: "translate(500px, 430px) scaleY(.7) scaleX(1.16)" },
            { transform: "translate(500px, 430px) scaleY(1) scaleX(1)" },
          ],
          { duration: 360, easing: "ease-out" },
        );
        api.toast("Too hard! Try a softer material.", "🥚");
        state.resetTimer = setTimeout(resetEgg, 2200);
      }

      dropBtn.disabled = false;
      dropBtn.innerHTML = `DROP AGAIN <span aria-hidden="true">↻</span>`;
    }

    function resetAll() {
      resetEgg();
      updateHeight();
      updatePad();
      api.sfx.play("click");
    }

    heightRange.addEventListener("input", () => {
      if (state.dropping) return;
      updateHeight();
    }, { signal });

    padBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.dropping) return;
        state.pad = btn.dataset.pad;
        updatePad();
        api.sfx.play("pop");
      }, { signal });
    });

    dropBtn.addEventListener("click", drop, { signal });
    resetBtn.addEventListener("click", resetAll, { signal });

    updateHeight();
    resetEgg();

    return {
      hint: "Soft materials spread the impact. Find a landing pad that protects the egg.",
      destroy() {
        cancelAnimationFrame(state.raf);
        clearTimeout(state.calloutTimer);
        clearTimeout(state.resetTimer);
        ac.abort();
      },
    };
  },
};
