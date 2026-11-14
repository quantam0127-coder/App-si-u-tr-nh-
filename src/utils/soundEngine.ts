class GameShowSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted = false;
  private musicIntervalId: number | null = null;
  private musicStep = 0;
  private isMusicPlaying = false;
  private musicMode: 'lobby' | 'arena' = 'lobby';

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.85;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.22;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.65;
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    return this.ctx;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.03);
    }
    if (muted) {
      this.stopMusic();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType,
    targetGain: GainNode | null,
    volume = 0.3,
    delay = 0,
    slideToFreq?: number
  ): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !targetGain) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideToFreq, now + duration);
    }

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(volume, now + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(env);
    env.connect(targetGain);

    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  public startMusic(mode: 'lobby' | 'arena'): void {
    this.musicMode = mode;
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (this.isMusicPlaying && this.musicIntervalId !== null) {
      return;
    }

    this.isMusicPlaying = true;
    this.musicStep = 0;

    // Playful upbeat TV game-show pentatonic groove (C major / G mixolydian feel)
    const lobbyLead = [523.25, 0, 659.25, 783.99, 659.25, 0, 880.0, 783.99, 659.25, 0, 587.33, 659.25, 523.25, 0, 392.0, 0];
    const arenaLead = [523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 783.99, 587.33, 698.46, 880.0, 783.99, 659.25, 587.33, 523.25, 659.25];
    const bassLine = [130.81, 0, 196.0, 0, 146.83, 0, 196.0, 0, 164.81, 0, 196.0, 0, 174.61, 0, 196.0, 0];

    const stepMs = 220;
    this.musicIntervalId = window.setInterval(() => {
      if (this.isMuted || !this.isMusicPlaying) return;
      const pattern = this.musicMode === 'arena' ? arenaLead : lobbyLead;
      const idx = this.musicStep % pattern.length;
      const leadNote = pattern[idx];
      const bassNote = bassLine[idx];

      if (leadNote > 0) {
        this.playTone(leadNote, 0.16, 'triangle', this.musicGain, this.musicMode === 'arena' ? 0.22 : 0.16);
      }
      if (bassNote > 0) {
        this.playTone(bassNote, 0.18, 'sine', this.musicGain, 0.28);
      }

      this.musicStep += 1;
    }, stepMs);
  }

  public stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      window.clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  public playIntroBeep(finalGo = false): void {
    if (this.isMuted) return;
    if (finalGo) {
      this.playTone(523.25, 0.12, 'triangle', this.sfxGain, 0.35, 0);
      this.playTone(659.25, 0.12, 'triangle', this.sfxGain, 0.35, 0.08);
      this.playTone(1046.5, 0.32, 'triangle', this.sfxGain, 0.42, 0.16);
    } else {
      this.playTone(587.33, 0.14, 'sine', this.sfxGain, 0.32);
    }
  }

  public playTick(urgent: boolean): void {
    if (this.isMuted) return;
    if (urgent) {
      // Double sharp studio urgency pulse for final 3 seconds
      this.playTone(987.77, 0.08, 'square', this.sfxGain, 0.18, 0);
      this.playTone(1174.66, 0.09, 'triangle', this.sfxGain, 0.24, 0.12);
    } else {
      // Crisp studio clock tick
      this.playTone(740, 0.045, 'sine', this.sfxGain, 0.14);
    }
  }

  public playCorrect(streak = 1): void {
    if (this.isMuted) return;
    // Bright rising game-show chime
    this.playTone(523.25, 0.12, 'triangle', this.sfxGain, 0.38, 0);
    this.playTone(659.25, 0.12, 'triangle', this.sfxGain, 0.38, 0.07);
    this.playTone(783.99, 0.18, 'triangle', this.sfxGain, 0.42, 0.14);
    this.playTone(1046.5, 0.32, 'sine', this.sfxGain, 0.45, 0.21);

    if (streak >= 3) {
      this.playTone(1318.5, 0.25, 'triangle', this.sfxGain, 0.28, 0.3);
    }
  }

  public playWrong(): void {
    if (this.isMuted) return;
    // Classic gentle game-show descending buzz
    this.playTone(260, 0.18, 'sawtooth', this.sfxGain, 0.18, 0, 210);
    this.playTone(185, 0.28, 'sawtooth', this.sfxGain, 0.2, 0.16, 130);
  }

  public playTimeout(): void {
    if (this.isMuted) return;
    // Distinct 2-pulse time-up studio buzzer
    this.playTone(311.13, 0.16, 'sawtooth', this.sfxGain, 0.22, 0);
    this.playTone(233.08, 0.38, 'sawtooth', this.sfxGain, 0.24, 0.18, 146.83);
  }

  public playVictory(isPerfect = true): void {
    if (this.isMuted) return;
    if (isPerfect) {
      // Triumphant TV game-show championship fanfare for 100% absolute victory
      const notes = [
        { f: 523.25, d: 0.14, t: 0 },
        { f: 659.25, d: 0.14, t: 0.11 },
        { f: 783.99, d: 0.14, t: 0.22 },
        { f: 1046.5, d: 0.24, t: 0.34 },
        { f: 783.99, d: 0.14, t: 0.56 },
        { f: 1046.5, d: 0.55, t: 0.7 },
      ];
      for (const n of notes) {
        this.playTone(n.f, n.d, 'triangle', this.sfxGain, 0.38, n.t);
        this.playTone(n.f * 0.5, n.d, 'sine', this.sfxGain, 0.25, n.t);
      }
    } else {
      // Warm encouraging completion chime when < 100%
      const notes = [
        { f: 523.25, d: 0.14, t: 0 },
        { f: 587.33, d: 0.14, t: 0.12 },
        { f: 659.25, d: 0.18, t: 0.24 },
        { f: 783.99, d: 0.36, t: 0.38 },
      ];
      for (const n of notes) {
        this.playTone(n.f, n.d, 'triangle', this.sfxGain, 0.32, n.t);
      }
    }
  }
}

export const soundEngine = new GameShowSoundEngine();
