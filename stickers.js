// ==========================================
// ANIMATED STICKERS & TRANSITIONS MODULE (stickers.js)
// ==========================================

const StickerEngine = {
  drawSticker(ctx, canvas, stickerType, pos) {
    if (!stickerType || stickerType === "none") return;

    const w = canvas.width;
    const h = canvas.height;
    const time = Date.now() * 0.005;
    const bounce = Math.sin(time) * 8;
    const scale = 1 + Math.sin(time * 1.5) * 0.08;

    let x = w - 65;
    let y = 65;

    if (pos === "top-left") {
      x = 65;
      y = 65;
    } else if (pos === "bottom-left") {
      x = 65;
      y = h - 55;
    } else if (pos === "center") {
      x = w / 2;
      y = h / 2;
    }

    ctx.save();
    ctx.translate(x, y + bounce);
    ctx.scale(scale, scale);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (stickerType === "subscribe") {
      // Animated YouTube-style Subscribe Badge
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.roundRect(-62, -18, 124, 36, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Arial, sans-serif";
      ctx.fillText("🔔 SUBSCRIBE", 0, 1);
    } else {
      ctx.font = "44px Arial";
      ctx.fillText(stickerType, 0, 0);
    }

    ctx.restore();
  },

  applyFade(ctx, canvas, video, trimStart, trimEnd, fadeEnabled) {
    if (!fadeEnabled) return;

    const current = video.currentTime;
    const fadeDur = 0.8; // 0.8 second smooth fade
    let alpha = 0;

    if (current - trimStart < fadeDur) {
      alpha = 1 - (current - trimStart) / fadeDur;
    } else if (trimEnd - current < fadeDur) {
      alpha = 1 - (trimEnd - current) / fadeDur;
    }

    if (alpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, Math.max(0, alpha))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }
};
