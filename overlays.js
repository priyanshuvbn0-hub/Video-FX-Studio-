// ==========================================
// TEXT & WATERMARK OVERLAY MODULE (overlays.js)
// ==========================================

const TextOverlayEngine = {
  draw(ctx, canvas, config) {
    const text = config.text.trim();
    if (!text) return;

    const w = canvas.width;
    const h = canvas.height;
    const size = Number(config.size) || 28;

    ctx.save();
    ctx.font = `bold ${size}px Arial, sans-serif`;
    ctx.fillStyle = config.color || "#ffffff";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
    ctx.lineWidth = Math.max(3, Math.floor(size / 8));

    let x = w / 2;
    let y = h - 30;
    ctx.textAlign = "center";

    if (config.position === "top") {
      y = size + 24;
    } else if (config.position === "center") {
      y = h / 2;
    } else if (config.position === "watermark") {
      ctx.textAlign = "right";
      ctx.globalAlpha = 0.75;
      x = w - 18;
      y = h - 18;
    }

    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
  }
};
