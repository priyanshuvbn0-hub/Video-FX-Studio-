// ==========================================
// AUDIO & BGM MIXER MODULE (audio.js)
// ==========================================

const AudioMixer = {
  audioCtx: null,
  bgmAudio: new Audio(),
  videoGain: null,
  bgmGain: null,
  mixedDestination: null,
  isInitialized: false,
  hasBgm: false,

  init(videoElement) {
    if (this.isInitialized) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    const videoSource = this.audioCtx.createMediaElementSource(videoElement);
    this.bgmAudio.crossOrigin = "anonymous";
    this.bgmAudio.loop = true;
    const bgmSource = this.audioCtx.createMediaElementSource(this.bgmAudio);

    this.videoGain = this.audioCtx.createGain();
    this.bgmGain = this.audioCtx.createGain();
    this.bgmGain.gain.value = 0.5;

    this.mixedDestination = this.audioCtx.createMediaStreamDestination();

    // Route both to speakers and export stream
    videoSource.connect(this.videoGain);
    this.videoGain.connect(this.audioCtx.destination);
    this.videoGain.connect(this.mixedDestination);

    bgmSource.connect(this.bgmGain);
    this.bgmGain.connect(this.audioCtx.destination);
    this.bgmGain.connect(this.mixedDestination);

    this.isInitialized = true;
  },

  loadBgmFile(file, videoElement) {
    this.init(videoElement);
    const url = URL.createObjectURL(file);
    this.bgmAudio.src = url;
    this.hasBgm = true;
    if (!videoElement.paused) {
      this.resumeContext();
      this.bgmAudio.play();
    }
  },

  resumeContext() {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  },

  syncPlay(isPlaying) {
    if (!this.hasBgm) return;
    this.resumeContext();
    if (isPlaying) {
      this.bgmAudio.play().catch(() => {});
    } else {
      this.bgmAudio.pause();
    }
  },

  setVideoVolume(val) {
    if (this.videoGain) {
      this.videoGain.gain.value = val / 100;
    }
  },

  setBgmVolume(val) {
    if (this.bgmGain) {
      this.bgmGain.gain.value = val / 100;
    }
  },

  getMixedAudioTracks() {
    if (this.isInitialized && this.mixedDestination) {
      return this.mixedDestination.stream.getAudioTracks();
    }
    return [];
  }
};
