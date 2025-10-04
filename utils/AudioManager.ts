export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private musicSource: OscillatorNode | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
      }
    }
  }
  
  public updateSettings(sfxEnabled: boolean, musicEnabled: boolean) {
    this.sfxEnabled = sfxEnabled;
    this.musicEnabled = musicEnabled;

    if (this.musicEnabled) {
      this.playMusic();
    } else {
      this.stopMusic();
    }
  }

  public playSound(type: 'place' | 'clear' | 'gameOver') {
    if (!this.sfxEnabled || !this.audioContext) return;
    this.initAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);
    oscillator.connect(gainNode);

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.2, now);

    switch (type) {
      case 'place':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        break;
      case 'clear':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        break;
      case 'gameOver':
         oscillator.type = 'sawtooth';
         oscillator.frequency.setValueAtTime(150, now);
         oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.5);
         gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        break;
    }

    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }

  public playMusic() {
    if (this.musicSource || !this.audioContext) return;
    this.initAudioContext();
    if (!this.audioContext) return;
    
    this.musicSource = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    this.musicSource.type = 'sine';
    this.musicSource.frequency.value = 50; 
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.03, this.audioContext.currentTime + 1);

    this.musicSource.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    this.musicSource.start();
  }

  public stopMusic() {
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource = null;
    }
  }
}
