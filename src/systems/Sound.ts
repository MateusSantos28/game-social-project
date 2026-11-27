class SoundSystem {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private bgmMode: 'explore' | 'battle' | null = null;
  private bgmTimer: ReturnType<typeof setInterval> | null = null;
  private bgmStep: number = 0;

  private exploreMelody: number[] = [
    330, 392, 440, 494, 523, 494, 440, 392,
    330, 349, 392, 440, 392, 349, 330, 294,
    330, 392, 523, 659, 587, 523, 494, 440,
    392, 440, 494, 523, 587, 494, 523, 0
  ];

  private exploreBass: number[] = [
    131, 196, 131, 196, 175, 220, 175, 220,
    147, 220, 147, 220, 196, 247, 196, 247,
    131, 196, 131, 196, 175, 220, 175, 220,
    196, 247, 196, 247, 131, 196, 131, 0
  ];

  private battleMelody: number[] = [
    294, 330, 349, 392, 440, 440, 523, 440,
    392, 349, 392, 440, 349, 330, 294, 261,
    294, 294, 349, 349, 440, 440, 587, 523,
    440, 392, 349, 330, 294, 330, 294, 0
  ];

  private battleBass: number[] = [
    73, 147, 73, 147, 87, 175, 87, 175,
    98, 196, 98, 196, 73, 147, 73, 147,
    73, 147, 73, 147, 87, 175, 87, 175,
    110, 220, 110, 220, 73, 147, 73, 0
  ];

  public init(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public tone(
    freq: number,
    dur: number = 0.08,
    type: OscillatorType = 'square',
    vol: number = 0.06,
    delay: number = 0
  ): void {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + dur);
    } catch {
      // Ignora erro de áudio
    }
  }

  public beep(): void {
    this.tone(660, 0.06, 'square', 0.05);
  }

  public select(): void {
    this.tone(880, 0.07, 'square', 0.05);
  }

  public door(): void {
    this.tone(320, 0.07, 'triangle', 0.07, 0);
    this.tone(480, 0.09, 'triangle', 0.07, 0.07);
  }

  public hit(): void {
    this.tone(180, 0.09, 'sawtooth', 0.08, 0);
    this.tone(110, 0.12, 'square', 0.07, 0.06);
  }

  public crit(): void {
    this.tone(520, 0.06, 'square', 0.08, 0);
    this.tone(780, 0.06, 'square', 0.08, 0.06);
    this.tone(1040, 0.14, 'square', 0.09, 0.12);
  }

  public error(): void {
    this.tone(200, 0.12, 'sawtooth', 0.07, 0);
    this.tone(140, 0.16, 'sawtooth', 0.07, 0.11);
  }

  public heal(): void {
    const notes = [523, 523, 523, 659, 784];
    notes.forEach((n, i) => this.tone(n, 0.11, 'triangle', 0.08, i * 0.11));
  }

  public success(): void {
    const notes = [523, 659, 784, 1046];
    notes.forEach((n, i) => this.tone(n, 0.11, 'square', 0.06, i * 0.09));
  }

  public fanfare(): void {
    const notes = [523, 659, 784, 659, 784, 1046];
    notes.forEach((n, i) => this.tone(n, 0.14, 'square', 0.07, i * 0.12));
  }

  private playBgmStep(): void {
    if (!this.enabled || !this.bgmMode) return;
    const isBattle = this.bgmMode === 'battle';
    const melody = isBattle ? this.battleMelody : this.exploreMelody;
    const bass = isBattle ? this.battleBass : this.exploreBass;
    const step = this.bgmStep % melody.length;
    const mFreq = melody[step];
    const bFreq = bass[step];
    const dur = isBattle ? 0.12 : 0.18;
    if (mFreq > 0) {
      this.tone(mFreq, dur, isBattle ? 'sawtooth' : 'square', isBattle ? 0.025 : 0.018);
    }
    if (bFreq > 0) {
      this.tone(bFreq, dur, 'triangle', 0.035);
    }
    this.bgmStep++;
  }

  public setBgm(mode: 'explore' | 'battle' | null): void {
    if (this.bgmMode === mode) return;
    this.stopBgm();
    if (!mode || !this.enabled) return;
    this.bgmMode = mode;
    this.bgmStep = 0;
    const interval = mode === 'battle' ? 140 : 210;
    this.bgmTimer = setInterval(() => this.playBgmStep(), interval);
  }

  public stopBgm(): void {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.bgmMode = null;
    this.bgmStep = 0;
  }
}

export const Sound = new SoundSystem();
