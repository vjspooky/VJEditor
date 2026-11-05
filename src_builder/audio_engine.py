# src_builder/audio_engine.py

AUDIO_ENGINE_CONTENT = """
// Web Audio API Synthesis & Visualizer Engine
class VJAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentBgm = null;
    this.dataArray = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  // Real-time SFX Synthesis
  playSFX(type = 'whoosh', volume = 0.8) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const sfxGain = this.ctx.createGain();
    sfxGain.gain.setValueAtTime(volume, now);
    sfxGain.connect(this.masterGain);

    if (type === 'whoosh') {
      // Filtered White Noise Sweep
      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3.0;
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.35);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.75);

      sfxGain.gain.setValueAtTime(0.01, now);
      sfxGain.gain.linearRampToValueAtTime(volume, now + 0.3);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      noise.connect(filter);
      filter.connect(sfxGain);
      noise.start(now);
      noise.stop(now + 0.8);
    } else if (type === 'hit' || type === 'impact') {
      // Sub Bass Pitch Drop + Distorted Punch
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);

      oscGain.gain.setValueAtTime(volume * 1.2, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      // Noise click
      const click = this.ctx.createOscillator();
      click.type = 'sine';
      click.frequency.setValueAtTime(800, now);
      click.frequency.exponentialRampToValueAtTime(40, now + 0.08);
      const clickGain = this.ctx.createGain();
      clickGain.gain.setValueAtTime(volume, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      click.connect(clickGain);
      clickGain.connect(sfxGain);
      click.start(now);
      click.stop(now + 0.09);

      osc.connect(oscGain);
      oscGain.connect(sfxGain);
      osc.start(now);
      osc.stop(now + 0.9);
    } else if (type === 'pop') {
      // Clean high bubble blip
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(1150, now + 0.12);
      sfxGain.gain.setValueAtTime(volume, now);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(sfxGain);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'click' || type === 'ui') {
      // Short UI Click
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      sfxGain.gain.setValueAtTime(volume * 0.4, now);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(sfxGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'bell' || type === 'notification') {
      // Chime bell chord
      [880, 1320, 1760].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        g.gain.setValueAtTime(volume * 0.35, now + idx * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + idx * 0.06);
        osc.connect(g);
        g.connect(sfxGain);
        osc.start(now + idx * 0.06);
        osc.stop(now + 0.9 + idx * 0.06);
      });
    } else if (type === 'explosion') {
      // Low rumble explosion
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(450, now);
      lp.frequency.exponentialRampToValueAtTime(60, now + 1.2);
      sfxGain.gain.setValueAtTime(volume * 1.2, now);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      noise.connect(lp);
      lp.connect(sfxGain);
      noise.start(now);
      noise.stop(now + 1.5);
    }
  }

  // Procedural Music Synthesis Loop
  startMusicLoop(genre = 'cinematic', volume = 0.5) {
    this.init();
    if (!this.ctx) return;
    this.stopMusic();

    const now = this.ctx.currentTime;
    const bgmGain = this.ctx.createGain();
    bgmGain.gain.setValueAtTime(0.01, now);
    bgmGain.gain.linearRampToValueAtTime(volume * 0.6, now + 1.0);
    bgmGain.connect(this.masterGain);

    const chords = genre === 'lo-fi' 
      ? [ [261.63, 329.63, 392.00, 493.88], [220.00, 261.63, 329.63, 392.00] ] // Cmaj7, Am7
      : genre === 'cyberpunk'
      ? [ [110.00, 164.81, 220.00], [98.00, 146.83, 196.00] ] // A minor, G power
      : [ [130.81, 196.00, 261.63, 329.63], [146.83, 220.00, 293.66, 369.99] ]; // C, D chord

    const oscs = [];
    chords[0].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const oscG = this.ctx.createGain();
      osc.type = genre === 'lo-fi' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      oscG.gain.setValueAtTime(0.18, now);
      osc.connect(oscG);
      oscG.connect(bgmGain);
      osc.start(now);
      oscs.push(osc);
    });

    // LFO modulation for warm analog drift
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.4, now);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(3.5, now);
    lfo.connect(lfoGain);
    oscs.forEach(o => lfoGain.connect(o.frequency));
    lfo.start(now);

    this.currentBgm = { oscs, lfo, gain: bgmGain };
  }

  stopMusic() {
    if (this.currentBgm && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.currentBgm.gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        setTimeout(() => {
          if (this.currentBgm) {
            this.currentBgm.oscs.forEach(o => { try { o.stop(); } catch(e){} });
            try { this.currentBgm.lfo.stop(); } catch(e){}
            this.currentBgm = null;
          }
        }, 350);
      } catch(e) {
        this.currentBgm = null;
      }
    }
  }

  getAudioLevels() {
    if (!this.analyser || !this.dataArray) {
      return { left: 0, right: 0, peak: -60 };
    }
    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const avg = sum / (this.dataArray.length * 255);
    const left = Math.min(1, avg * 1.5);
    const right = Math.min(1, avg * 1.42 + (Math.random() * 0.05));
    const peakDb = avg > 0.01 ? Math.round(20 * Math.log10(avg)) : -60;
    return { left, right, peak: peakDb };
  }
}

const audioEngine = new VJAudioEngine();
"""
