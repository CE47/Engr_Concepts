/* Tiny synthesized sound engine — no audio files needed. */

const STORAGE_KEY = "engineer-playground-sound";

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    try {
      this.enabled = localStorage.getItem(STORAGE_KEY) !== "off";
    } catch {
      this.enabled = true;
    }
  }

  ensure() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem(STORAGE_KEY, this.enabled ? "on" : "off");
    } catch {}
    if (this.enabled) {
      this.ensure();
      this.play("ding");
    }
    return this.enabled;
  }

  tone({ freq = 440, endFreq = freq, type = "sine", duration = 0.14, volume = 0.5, delay = 0 }) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  noise({ duration = 0.18, volume = 0.35, delay = 0, filterFreq = 900 }) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(now);
  }

  play(name) {
    if (!this.enabled) return;
    switch (name) {
      case "click":
        this.tone({ freq: 620, endFreq: 760, type: "sine", duration: 0.055, volume: 0.16 });
        break;
      case "pop":
        this.tone({ freq: 280, endFreq: 760, type: "triangle", duration: 0.11, volume: 0.32 });
        break;
      case "ding":
        this.tone({ freq: 880, endFreq: 1320, type: "sine", duration: 0.2, volume: 0.28 });
        this.tone({ freq: 1320, endFreq: 1320, type: "sine", duration: 0.18, volume: 0.12, delay: 0.05 });
        break;
      case "success":
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          this.tone({ freq, type: "triangle", duration: 0.34, volume: 0.3, delay: i * 0.09 });
          this.tone({ freq: freq * 2, type: "sine", duration: 0.22, volume: 0.08, delay: i * 0.09 });
        });
        this.tone({ freq: 1568, type: "sine", duration: 0.5, volume: 0.16, delay: 0.4 });
        break;
      case "fail":
        this.tone({ freq: 260, endFreq: 110, type: "sawtooth", duration: 0.3, volume: 0.16 });
        this.tone({ freq: 190, endFreq: 90, type: "triangle", duration: 0.35, volume: 0.12, delay: 0.08 });
        break;
      case "whoosh":
        this.noise({ duration: 0.4, volume: 0.22, filterFreq: 1600 });
        this.tone({ freq: 180, endFreq: 420, type: "sine", duration: 0.38, volume: 0.08 });
        break;
      case "splash":
        this.noise({ duration: 0.55, volume: 0.3, filterFreq: 700 });
        this.tone({ freq: 180, endFreq: 70, type: "sine", duration: 0.4, volume: 0.14 });
        break;
      case "crack":
        this.noise({ duration: 0.22, volume: 0.4, filterFreq: 2400 });
        this.tone({ freq: 160, endFreq: 60, type: "square", duration: 0.2, volume: 0.16 });
        break;
      case "bounce":
        this.tone({ freq: 320, endFreq: 640, type: "sine", duration: 0.16, volume: 0.22 });
        break;
      case "spark":
        this.tone({ freq: 1040, endFreq: 1560, type: "sine", duration: 0.12, volume: 0.2 });
        break;
      case "switch":
        this.tone({ freq: 420, endFreq: 310, type: "square", duration: 0.06, volume: 0.12 });
        break;
      default:
        this.tone({ freq: 520, type: "sine", duration: 0.08, volume: 0.15 });
    }
  }
}
