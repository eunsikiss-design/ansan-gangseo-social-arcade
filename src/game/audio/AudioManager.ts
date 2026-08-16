export type AudioSettings = { bgm: boolean; sfx: boolean; bgmVolume: number; sfxVolume: number };

const STORAGE_KEY = "social-arcade-audio-v1";
const initialSettings: AudioSettings = { bgm: true, sfx: true, bgmVolume: 0.35, sfxVolume: 0.6 };

class ArcadeAudioManager {
  settings: AudioSettings = initialSettings;
  private context: AudioContext | null = null;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;

  load() {
    if (typeof window === "undefined") return this.settings;
    try { this.settings = { ...initialSettings, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") }; } catch { this.settings = initialSettings; }
    return this.settings;
  }

  async unlock() {
    if (typeof window === "undefined") return;
    this.context ??= new AudioContext();
    if (this.context.state === "suspended") await this.context.resume();
  }

  update(next: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...next };
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    if (!this.settings.bgm) this.stopBgm();
    if (this.bgmGain) this.bgmGain.gain.value = this.settings.bgmVolume * 0.035;
  }

  async playSfx(name: string) {
    if (!this.settings.sfx) return;
    await this.unlock();
    if (!this.context) return;
    const tones: Record<string, number> = { success: 740, error: 190, zero_appear: 105, decision_submit: 520, evidence_found: 660, mission_complete: 880, ui_click: 420 };
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = name === "zero_appear" ? "sawtooth" : "sine";
    oscillator.frequency.value = tones[name] ?? 440;
    gain.gain.setValueAtTime(this.settings.sfxVolume * 0.08, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.14);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start();
    oscillator.stop(this.context.currentTime + 0.15);
  }

  async playBgm(name = "main_hub") {
    if (!this.settings.bgm || this.bgmOscillator) return;
    await this.unlock();
    if (!this.context) return;
    this.bgmOscillator = this.context.createOscillator();
    this.bgmGain = this.context.createGain();
    this.bgmOscillator.type = name === "zero_challenge" ? "triangle" : "sine";
    this.bgmOscillator.frequency.value = name === "zero_challenge" ? 82 : 110;
    this.bgmGain.gain.value = this.settings.bgmVolume * 0.035;
    this.bgmOscillator.connect(this.bgmGain).connect(this.context.destination);
    this.bgmOscillator.start();
  }

  stopBgm() {
    try { this.bgmOscillator?.stop(); } catch { /* already stopped */ }
    this.bgmOscillator = null;
    this.bgmGain = null;
  }
}

export const audioManager = new ArcadeAudioManager();
export const defaultAudioSettings = initialSettings;
