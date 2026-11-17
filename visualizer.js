// ==========================================
// REAL-TIME AUDIO VISUALIZER MODULE (visualizer.js)
// ==========================================

const AudioVisualizer = {
  analyser: null,
  dataArray: null,
  isConnected: false,

  setup() {
    if (this.isConnected || !AudioMixer.audioCtx || !AudioMixer.mixedDestination) return;

    this.analyser = AudioMixer.audioCtx.createAnalyser();
    this.analyser.fftSize = 64;
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    // Connect mixed audio output to analyser
    AudioMixer.videoGain.connect(this.analyser);
    AudioMixer.bgmGain.connect(this.analyser);
    this.isConnected = true;
  },

  draw(ctx, canvas, style, color) {
    if (style === "none") return;
    if (!this.isConnected) this.setup();
    if (!this.analyser) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    const w = canvas.width;
    const h = canvas.height;

    ctx.save();

    if (style === "bars") {
      const barCount = 24;
      const barWidth = (w * 0.7) / barCount;
      const startX = (w - barCount * barWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        const val = this.dataArray[i] || 0;
        const barHeight = (val / 255) * (h * 0.25);

        ctx.fillStyle = color || "#a78bfa";
        ctx.shadowColor = color || "#a78bfa";
        ctx.shadowBlur = 10;
        ctx.fillRect(
          startX + i * barWidth + 2,
          h - barHeight - 18,
          barWidth - 4,
          Math.max(4, barHeight)
        );
      }
    } else if (style === "circle") {
      const avg = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length;
      const radius = 35 + (avg / 255) * 45;

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
      ctx.strokeStyle = color || "#34d399";
      ctx.lineWidth = 5;
      ctx.shadowColor = color || "#34d399";
      ctx.shadowBlur = 15;
      ctx.stroke();
    }

    ctx.restore();
  }
};
