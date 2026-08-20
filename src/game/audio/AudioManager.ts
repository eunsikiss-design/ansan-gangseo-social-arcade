export type AudioSettings = { bgm: boolean; sfx: boolean; bgmVolume: number; sfxVolume: number };

const STORAGE_KEY = "social-arcade-audio-v2";
const initialSettings: AudioSettings = { bgm: true, sfx: true, bgmVolume: 0.4, sfxVolume: 0.6 };

type BgmTrack = "main_hub" | "mission_map" | "investigation" | "zero_challenge" | "certificate" | "academy" | "webtoon_opening" | "debate";


class ArcadeAudioManager {
  settings: AudioSettings = initialSettings;
  private context: AudioContext | null = null;
  private isLooping = false;
  private currentTrack: BgmTrack | null = null;
  private timerId: number | null = null;
  private masterGain: GainNode | null = null;

  load() {
    if (typeof window === "undefined") return this.settings;
    try {
      this.settings = { ...initialSettings, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
    } catch {
      this.settings = initialSettings;
    }
    return this.settings;
  }

  async unlock() {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.context) {
        this.context = new AudioCtx();
      }
      if (this.context.state === "suspended") {
        await this.context.resume();
      }
    } catch {
      /* audio unlock fallback */
    }
  }

  update(next: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...next };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    }
    if (!this.settings.bgm) {
      this.stopBgm();
    } else if (this.currentTrack && !this.isLooping) {
      void this.playBgm(this.currentTrack);
    }
    if (this.masterGain && this.context) {
      this.masterGain.gain.setValueAtTime(this.settings.bgmVolume * 0.1, this.context.currentTime);
    }
  }

  async playSfx(name: string) {
    if (!this.settings.sfx) return;
    await this.unlock();
    if (!this.context) return;

    try {
      const now = this.context.currentTime;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      const tones: Record<string, { f: number[]; type: OscillatorType; dur: number }> = {
        ui_click: { f: [520, 640], type: "sine", dur: 0.08 },
        case_open: { f: [320, 480, 640], type: "triangle", dur: 0.18 },
        evidence_found: { f: [440, 554, 659, 880], type: "sine", dur: 0.3 },
        decision_submit: { f: [300, 450, 600], type: "triangle", dur: 0.25 },
        zero_appear: { f: [130, 95, 70], type: "sawtooth", dur: 0.4 },
        success: { f: [523, 659, 784, 1046], type: "triangle", dur: 0.35 },
        error: { f: [240, 180, 120], type: "sawtooth", dur: 0.25 },
        mission_complete: { f: [440, 554, 659, 880, 1108], type: "sine", dur: 0.5 },
        cert_fanfare: { f: [523, 659, 784, 1046, 1318], type: "triangle", dur: 0.6 },
      };

      const sfx = tones[name] ?? { f: [440], type: "sine", dur: 0.1 };
      osc.type = sfx.type;

      sfx.f.forEach((freq, idx) => {
        osc.frequency.setValueAtTime(freq, now + (idx * sfx.dur) / sfx.f.length);
      });

      gain.gain.setValueAtTime(this.settings.sfxVolume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + sfx.dur);

      osc.connect(gain);
      gain.connect(this.context.destination);

      osc.start(now);
      osc.stop(now + sfx.dur + 0.02);
    } catch {
      /* ignore audio error */
    }
  }

  async playBgm(trackName: BgmTrack | string = "main_hub") {
    const validTrack = (trackName as BgmTrack) || "main_hub";
    if (this.currentTrack === validTrack && this.isLooping) return;
    this.currentTrack = validTrack;

    if (!this.settings.bgm) return;
    await this.unlock();
    if (!this.context) return;

    this.stopBgm(false);
    this.isLooping = true;
    this.startBgmSequencer(validTrack);
  }

  private startBgmSequencer(track: BgmTrack) {
    if (!this.context || !this.isLooping) return;

    // Track melody note definitions (Hz) & tempo
    const tracks: Record<BgmTrack, { notes: number[]; interval: number; type: OscillatorType; baseOctave: number }> = {
      main_hub: {
        notes: [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 329.63, 293.66], // C-E-G-C-A-G-E-D (Bright Adventure)
        interval: 320,
        type: "triangle",
        baseOctave: 1,
      },
      mission_map: {
        notes: [293.66, 349.23, 440.0, 523.25, 440.0, 392.0, 349.23, 329.63], // D Dorian (Ocean voyage)
        interval: 360,
        type: "sine",
        baseOctave: 1,
      },
      investigation: {
        notes: [220.0, 261.63, 329.63, 392.0, 329.63, 261.63, 246.94, 196.0], // A minor Lo-fi detective
        interval: 420,
        type: "sine",
        baseOctave: 1,
      },
      zero_challenge: {
        notes: [130.81, 164.81, 196.0, 246.94, 261.63, 246.94, 196.0, 164.81], // Fast C-minor battle synth
        interval: 190,
        type: "sawtooth",
        baseOctave: 0.8,
      },
      certificate: {
        notes: [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 783.99], // Grand Fanfare celebration
        interval: 380,
        type: "triangle",
        baseOctave: 1.2,
      },
      academy: {
        notes: [261.63, 293.66, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66], // Study calm melody
        interval: 350,
        type: "sine",
        baseOctave: 1,
      },
      webtoon_opening: {
        notes: [329.63, 392.0, 440.0, 523.25, 659.25, 523.25, 440.0, 392.0], // Cheerful comics intro
        interval: 280,
        type: "triangle",
        baseOctave: 1.1,
      },
      debate: {
        notes: [220.0, 246.94, 261.63, 293.66, 329.63, 293.66, 261.63, 246.94], // Tense structured debate
        interval: 380,
        type: "sine",
        baseOctave: 0.9,
      },
    };


    const currentData = tracks[track] || tracks.main_hub;
    let step = 0;

    const playStep = () => {
      if (!this.isLooping || !this.context || !this.settings.bgm) return;

      try {
        const now = this.context.currentTime;
        const noteFreq = currentData.notes[step % currentData.notes.length];
        const osc = this.context.createOscillator();
        const noteGain = this.context.createGain();

        osc.type = currentData.type;
        osc.frequency.setValueAtTime(noteFreq * currentData.baseOctave, now);

        const vol = this.settings.bgmVolume * (track === "zero_challenge" ? 0.025 : 0.045);
        noteGain.gain.setValueAtTime(vol, now);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + (currentData.interval / 1000) * 0.85);

        osc.connect(noteGain);
        noteGain.connect(this.context.destination);

        osc.start(now);
        osc.stop(now + currentData.interval / 1000);

        step++;
      } catch {
        /* skip tick */
      }

      if (this.isLooping) {
        this.timerId = window.setTimeout(playStep, currentData.interval);
      }
    };

    playStep();
  }

  stopBgm(resetTrack = true) {
    this.isLooping = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (resetTrack) {
      this.currentTrack = null;
    }
  }
}

export const audioManager = new ArcadeAudioManager();
export const defaultAudioSettings = initialSettings;
