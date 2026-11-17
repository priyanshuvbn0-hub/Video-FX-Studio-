// ==========================================
// EFFECTS & ASPECT RATIO MODULE (effects.js)
// ==========================================

const EffectsEngine = {
  matrixColumns: [],
  matrixChars: "01アイウエオカキクケコサシスセソタチツテト",

  initMatrix(canvasWidth) {
    const cols = Math.floor(canvasWidth / 16);
    this.matrixColumns = Array(cols).fill(1);
  },

  // Center-crop calculation for 9:16, 16:9, 1:1
  getCropRect(videoW, videoH, canvasW, canvasH) {
    const targetRatio = canvasW / canvasH;
    const sourceRatio = videoW / videoH;

    let sx = 0, sy = 0, sw = videoW, sh = videoH;

    if (sourceRatio > targetRatio) {
      sw = videoH * targetRatio;
      sx = (videoW - sw) / 2;
    } else if (sourceRatio < targetRatio) {
      sh = videoW / targetRatio;
      sy = (videoH - sh) / 2;
    }
    return { sx, sy, sw, sh };
  },

  renderFrame(ctx, video, canvas, effect, adjustments) {
    const w = canvas.width;
    const h = canvas.height;
    const { brightness, contrast, saturation } = adjustments;
    const crop = this.getCropRect(video.videoWidth, video.videoHeight, w, h);

    let baseFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    if (effect === "neon") {
      baseFilter += " hue-rotate(290deg) contrast(135%) saturate(180%)";
    } else if (effect === "vhs") {
      baseFilter += " sepia(45%) contrast(115%) brightness(105%)";
    } else if (effect === "noir") {
      baseFilter += " grayscale(100%) contrast(150%)";
    } else if (effect === "dreamy") {
      baseFilter += " brightness(115%) contrast(90%) saturate(130%) blur(0.6px)";
    } else if (effect === "matrix") {
      baseFilter += " hue-rotate(85deg) contrast(130%) saturate(160%)";
    }

    ctx.save();
    ctx.filter = baseFilter;

    if (effect === "mirror") {
      ctx.drawImage(video, crop.sx, crop.sy, crop.sw / 2, crop.sh, 0, 0, w / 2, h);
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, crop.sx, crop.sy, crop.sw / 2, crop.sh, 0, 0, w / 2, h);
    } else if (effect === "glitch") {
      ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);

      if (Math.random() > 0.45) {
        const sliceY = Math.random() * h;
        const sliceH = 10 + Math.random() * 40;
        const offsetX = (Math.random() - 0.5) * 35;

        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = "rgba(255, 0, 80, 0.25)";
        ctx.fillRect(0, sliceY, w, sliceH);
        ctx.drawImage(canvas, 0, sliceY, w, sliceH, offsetX, sliceY, w, sliceH);
      }
    } else {
      ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
    }

    ctx.restore();
    this.drawOverlays(ctx, w, h, effect);
  },

  drawOverlays(ctx, w, h, effect) {
    if (effect === "vhs") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 2);
      }
      ctx.fillStyle = "#fde047";
      ctx.font = "bold 16px monospace";
      ctx.fillText("PLAY ▶  VHS-1998", 18, 30);
    } else if (effect === "matrix") {
      ctx.fillStyle = "rgba(0, 255, 70, 0.75)";
      ctx.font = "14px monospace";
      for (let i = 0; i < this.matrixColumns.length; i++) {
        const char = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
        const x = i * 16;
        const y = this.matrixColumns[i] * 16;
        ctx.fillText(char, x, y);
        if (y > h && Math.random() > 0.96) {
          this.matrixColumns[i] = 0;
        }
        this.matrixColumns[i]++;
      }
    } else if (effect === "neon") {
      ctx.strokeStyle = "rgba(167, 139, 250, 0.6)";
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, w - 8, h - 8);
    }
  }
};
