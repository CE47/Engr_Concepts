import labs from "./labs/index.js";
import { SoundEngine } from "./sound.js";
import { createConfetti } from "./confetti.js";

const STORAGE_KEY = "engineer-playground-progress-v1";

/* ------------------------------- elements ------------------------------- */

const hubView = document.querySelector("#hubView");
const labView = document.querySelector("#labView");
const labGrid = document.querySelector("#labGrid");
const labStage = document.querySelector("#labStage");
const labTitle = document.querySelector("#labTitle");
const labIcon = document.querySelector("#labIcon");
const labKicker = document.querySelector("#labKicker");
const labMission = document.querySelector("#labMission");
const missionStatus = document.querySelector("#missionStatus");
const labStar = document.querySelector("#labStar");
const labHelpBtn = document.querySelector("#labHelpBtn");
const backBtn = document.querySelector("#backBtn");
const homeBtn = document.querySelector("#homeBtn");
const startBtn = document.querySelector("#startBtn");
const soundBtn = document.querySelector("#soundBtn");
const helpBtn = document.querySelector("#helpBtn");
const helpModal = document.querySelector("#helpModal");
const helpTipText = document.querySelector("#helpTipText");
const helpClose = document.querySelector("#helpClose");
const helpPlay = document.querySelector("#helpPlay");
const resetProgress = document.querySelector("#resetProgress");
const successModal = document.querySelector("#successModal");
const successMessage = document.querySelector("#successMessage");
const successStars = document.querySelector("#successStars");
const nextLabBtn = document.querySelector("#nextLabBtn");
const stayBtn = document.querySelector("#stayBtn");
const toastEl = document.querySelector("#toast");
const starCount = document.querySelector("#starCount");
const starCounter = document.querySelector("#starCounter");
const progressFill = document.querySelector("#progressFill");
const progressValue = document.querySelector("#progressValue");
const confettiCanvas = document.querySelector("#confettiCanvas");

const sfx = new SoundEngine();
const confetti = createConfetti(confettiCanvas);

/* -------------------------------- state --------------------------------- */

let earned = loadProgress();
let current = null; // { lab, instance }
let hubScroll = 0;
let toastTimer = 0;
let successTimer = 0;
let resetArmed = false;
let resetTimer = 0;
let lastFocused = null;
let nextLabId = null;

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    const stars = data && typeof data === "object" ? data.stars : null;
    return stars && typeof stars === "object" ? stars : {};
  } catch {
    return {};
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stars: earned }));
  } catch {
    /* Private browsing or storage full: play on without saving. */
  }
}

function starTotal() {
  return labs.filter((lab) => earned[lab.id]).length;
}

/* --------------------------------- hub ---------------------------------- */

function cardMarkup(lab, index) {
  const done = Boolean(earned[lab.id]);
  return `
    <button
      class="lab-card ${done ? "done" : ""}"
      type="button"
      data-lab="${lab.id}"
      style="--accent: ${lab.accent}; --i: ${index}"
      aria-label="${done ? "Replay" : "Play"} lab ${lab.num}: ${lab.title}"
    >
      <span class="card-top">
        <span class="card-num">LAB ${lab.num}</span>
        <span class="card-star" aria-hidden="true">★</span>
      </span>
      <span class="card-art" aria-hidden="true">${lab.art}</span>
      <span class="card-title">${lab.title}</span>
      <span class="card-tags">
        ${lab.tags.map((tag) => `<span class="card-tag">${tag}</span>`).join("")}
      </span>
      <span class="card-play">
        <span>${done ? "Mission complete" : "Play lab"}</span>
        <span class="play-arrow" aria-hidden="true">→</span>
      </span>
    </button>`;
}

function renderHub() {
  const grouped = new Map();
  labs.forEach((lab) => {
    if (!grouped.has(lab.section)) grouped.set(lab.section, []);
    grouped.get(lab.section).push(lab);
  });
  let index = 0;
  labGrid.innerHTML = [...grouped].map(([section, items]) => `
    <div class="lab-section-heading"><span class="section-mark">✦</span><h3>${section}</h3><span>${items.length} labs</span></div>
    ${items.map((lab) => cardMarkup(lab, index++)).join("")}
  `).join("");
  updateStarUI();
}

function updateStarUI() {
  const total = starTotal();
  starCount.textContent = String(total);
  starCounter.setAttribute("aria-label", `${total} of ${labs.length} stars earned`);
  progressFill.style.width = `${(total / labs.length) * 100}%`;
  progressValue.textContent = `${total} / ${labs.length}`;

  labs.forEach((lab) => {
    const card = labGrid.querySelector(`[data-lab="${lab.id}"]`);
    if (!card) return;
    const done = Boolean(earned[lab.id]);
    card.classList.toggle("done", done);
    card.setAttribute("aria-label", `${done ? "Replay" : "Play"} lab ${lab.num}: ${lab.title}`);
    const playLabel = card.querySelector(".card-play > span:first-child");
    if (playLabel) playLabel.textContent = done ? "Mission complete" : "Play lab";
  });

  if (current) labStar.classList.toggle("earned", Boolean(earned[current.lab.id]));
}

/* ------------------------------- opening -------------------------------- */

function openLab(id, { fromHash = false } = {}) {
  const lab = labs.find((item) => item.id === id);
  if (!lab) return;

  closeModals({ restoreFocus: false });
  if (current?.instance?.destroy) current.instance.destroy();

  if (!current) hubScroll = window.scrollY;
  current = { lab, instance: null };

  hubView.classList.add("hidden");
  labView.classList.remove("hidden");
  document.body.classList.add("in-lab");

  labIcon.textContent = lab.icon;
  labTitle.textContent = lab.title;
  labKicker.textContent = `LAB ${lab.num}`;
  labMission.textContent = lab.mission;
  missionStatus.textContent = "";
  labStar.classList.toggle("earned", Boolean(earned[lab.id]));
  labStar.title = earned[lab.id] ? "Mission star earned" : "Mission star";
  labStage.innerHTML = "";

  const api = {
    sfx,
    toast,
    complete: (message) => completeLab(lab, message),
    setStatus: (text) => {
      if (current?.lab.id === lab.id) missionStatus.textContent = text || "";
    },
  };

  try {
    current.instance = lab.mount(labStage, api);
  } catch (error) {
    console.error(`Could not start lab "${lab.id}"`, error);
    labStage.innerHTML = `
      <div class="lab-error">
        <span class="lab-error-icon" aria-hidden="true">🔧</span>
        <h3>Bolt is fixing this lab.</h3>
        <p>Something got tangled. Head back and try another lab.</p>
      </div>`;
  }

  if (!fromHash) {
    try {
      history.replaceState(null, "", `#lab-${lab.id}`);
    } catch {}
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  labStage.setAttribute("tabindex", "-1");
  requestAnimationFrame(() => labStage.focus({ preventScroll: true }));
}

function closeLab({ restoreScroll = true } = {}) {
  if (current?.instance?.destroy) current.instance.destroy();
  current = null;
  labStage.innerHTML = "";
  labView.classList.add("hidden");
  hubView.classList.remove("hidden");
  document.body.classList.remove("in-lab");
  closeModals({ restoreFocus: false });

  try {
    history.replaceState(null, "", location.pathname + location.search);
  } catch {}

  updateStarUI();
  if (restoreScroll) {
    requestAnimationFrame(() => window.scrollTo({ top: hubScroll, behavior: "smooth" }));
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}

/* ------------------------------- success -------------------------------- */

function markCardDone(lab) {
  const card = labGrid.querySelector(`[data-lab="${lab.id}"]`);
  if (card) card.classList.add("done");
}

function completeLab(lab, message) {
  const isNew = !earned[lab.id];
  const isActive = current?.lab.id === lab.id;

  if (isNew) {
    earned[lab.id] = true;
    saveProgress();
    updateStarUI();
    markCardDone(lab);
  }

  if (isActive) {
    labStar.classList.add("earned");
    labStar.title = "Mission star earned";
    missionStatus.textContent = "★ STAR!";
  }

  if (!isActive) {
    if (isNew) toast(`Star earned in ${lab.title}!`, "★");
    return;
  }

  if (isNew) {
    confetti.burst({ count: 150, y: window.innerHeight * 0.36 });
    setTimeout(() => confetti.rain({ count: 45 }), 260);
  }

  clearTimeout(successTimer);
  successTimer = setTimeout(() => showSuccess(lab, message, isNew), isNew ? 420 : 120);
}

function showSuccess(lab, message, isNew) {
  const index = labs.findIndex((item) => item.id === lab.id);
  const next = labs[index + 1] || null;
  nextLabId = next ? next.id : null;

  successMessage.textContent = message || "You did the thing!";
  successStars.textContent = isNew ? "★ NEW STAR ★" : "★ NICE RETRY ★";
  nextLabBtn.innerHTML = next
    ? `Next lab <span aria-hidden="true">→</span>`
    : `Back to labs <span aria-hidden="true">→</span>`;

  lastFocused = document.activeElement;
  successModal.classList.remove("hidden");
  requestAnimationFrame(() => nextLabBtn.focus({ preventScroll: true }));
  sfx.play("spark");
}

function closeSuccess() {
  successModal.classList.add("hidden");
  if (lastFocused && typeof lastFocused.focus === "function") {
    lastFocused.focus({ preventScroll: true });
  }
  lastFocused = null;
}

/* -------------------------------- help ---------------------------------- */

function openHelp(lab = null) {
  helpTipText.textContent =
    lab?.hint || "Pick a lab, change one thing, and press the big button.";
  lastFocused = document.activeElement;
  helpModal.classList.remove("hidden");
  requestAnimationFrame(() => helpPlay.focus({ preventScroll: true }));
}

function closeHelp() {
  helpModal.classList.add("hidden");
  if (lastFocused && typeof lastFocused.focus === "function") {
    lastFocused.focus({ preventScroll: true });
  }
  lastFocused = null;
}

function closeModals({ restoreFocus = true } = {}) {
  const hadFocus = lastFocused;
  helpModal.classList.add("hidden");
  successModal.classList.add("hidden");
  lastFocused = null;
  if (restoreFocus && hadFocus && typeof hadFocus.focus === "function") {
    hadFocus.focus({ preventScroll: true });
  }
}

/* -------------------------------- toast --------------------------------- */

function toast(text, icon = "💡") {
  toastEl.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon}</span><span>${text}</span>`;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2500);
}

/* -------------------------------- sound --------------------------------- */

function syncSoundButton() {
  document.body.classList.toggle("is-muted", !sfx.enabled);
  soundBtn.setAttribute("aria-label", sfx.enabled ? "Mute sound" : "Unmute sound");
  soundBtn.title = sfx.enabled ? "Sound on" : "Sound off";
}

/* ------------------------------- events --------------------------------- */

labGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".lab-card");
  if (!card) return;
  openLab(card.dataset.lab);
});

startBtn.addEventListener("click", () => {
  const next = labs.find((lab) => !earned[lab.id]) || labs[0];
  openLab(next.id);
});

backBtn.addEventListener("click", () => closeLab());
homeBtn.addEventListener("click", () => {
  if (current) closeLab();
  else window.scrollTo({ top: 0, behavior: "smooth" });
});

soundBtn.addEventListener("click", () => {
  sfx.toggle();
  syncSoundButton();
});

helpBtn.addEventListener("click", () => openHelp(current?.lab || null));
labHelpBtn.addEventListener("click", () => openHelp(current?.lab || null));
helpClose.addEventListener("click", closeHelp);
helpPlay.addEventListener("click", closeHelp);

helpModal.addEventListener("click", (event) => {
  if (event.target === helpModal) closeHelp();
});
successModal.addEventListener("click", (event) => {
  if (event.target === successModal) closeSuccess();
});

stayBtn.addEventListener("click", closeSuccess);
nextLabBtn.addEventListener("click", () => {
  const target = nextLabId;
  closeSuccess();
  if (target) openLab(target);
  else closeLab();
});

resetProgress.addEventListener("click", () => {
  if (!resetArmed) {
    resetArmed = true;
    resetProgress.textContent = "Tap again to reset";
    resetProgress.classList.add("danger");
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      resetArmed = false;
      resetProgress.textContent = "Reset progress";
      resetProgress.classList.remove("danger");
    }, 3200);
    return;
  }

  clearTimeout(resetTimer);
  resetArmed = false;
  resetProgress.textContent = "Reset progress";
  resetProgress.classList.remove("danger");
  earned = {};
  saveProgress();
  updateStarUI();
  if (current) labStar.classList.remove("earned");
  toast("Fresh start! All stars cleared.", "🧹");
  sfx.play("pop");
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  if (button.closest("#labStage") || button.id === "soundBtn") return;
  sfx.play("click");
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!successModal.classList.contains("hidden")) closeSuccess();
  else if (!helpModal.classList.contains("hidden")) closeHelp();
  else if (current) closeLab();
});

window.addEventListener("hashchange", () => {
  const match = location.hash.match(/^#lab-([a-z0-9-]+)$/i);
  if (match) {
    if (current?.lab.id !== match[1]) openLab(match[1], { fromHash: true });
  } else if (current) {
    closeLab({ restoreScroll: false });
  }
});

/* --------------------------------- init --------------------------------- */

syncSoundButton();
renderHub();

const initial = location.hash.match(/^#lab-([a-z0-9-]+)$/i);
if (initial) {
  const lab = labs.find((item) => item.id === initial[1]);
  if (lab) openLab(lab.id, { fromHash: true });
}

// Expose a tiny debug handle for curious builders (and easy console testing).
window.engineerPlayground = {
  labs,
  open: openLab,
  close: closeLab,
  get stars() {
    return { ...earned };
  },
};
