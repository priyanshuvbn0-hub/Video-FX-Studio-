// ==========================================
// MAIN APP CONTROLLER (app.js) - V5 PRO
// ==========================================

// Register PWA Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

const video = document.getElementById("sourceVideo");
const canvas = document.getElementById("fxCanvas");
const ctx = canvas.getContext("2d");

const videoInput = document.getElementById("videoInput");
const playPauseBtn = document.getElementById("playPauseBtn");
const muteBtn = document.getElementById("muteBtn");
const exportBtn = document.getElementById("exportBtn");
const statusText = document.getElementById("status");

// Sliders
const brightnessSlider = document.getElementById("brightness");
const contrastSlider = document.getElementById("contrast");
const saturationSlider = document.getElementById("saturation");
const speedSlider = document.getElementById("speed");

// Trim & Fade
const trimStartSlider = document.getElementById("trimStart");
const trimEndSlider = document.getElementById("trimEnd");
const fadeToggle = document.getElementById("fadeToggle");

// Text & Sticker Controls
const overlayText = document.getElementById("overlayText");
const overlayColor = document.getElementById("overlayColor");
const overlayPos = document.getElementById("overlayPos");
const overlaySize = document.getElementById("overlaySize");
const stickerSelect = document.getElementById("stickerSelect");
const stickerPos = document.getElementById("stickerPos");

// Audio & Visualizer Controls
const bgmInput = document.getElementById("bgmInput");
const vidVolumeSlider = document.getElementById("vidVolume");
const bgmVolumeSlider = document.getElementById("bgmVolume");
const vizStyle = document.getElementById("vizStyle");
const vizColor = document.getElementById("vizColor");

// Export Quality Controls
const exportRes = document.getElementById("exportRes");
const exportBitrate = document.getElementById("exportBitrate");

let currentEffect = "none";
let currentRatio = "original";
let isVideoMuted = false;

function updateCanvasDimensions() {
  if (!video.videoWidth) return;
  const maxDim = Number(exportRes.value) || 720;

  if (currentRatio === "9:16") {
    canvas.height = maxDim;
    canvas.width = Math.round((maxDim * 9) / 16);
  } else if (currentRatio === "16:9") {
    canvas.width = maxDim;
    canvas.height = Math.round((maxDim * 9) / 16);
  } else if (currentRatio === "1:1") {
    canvas.width = maxDim;
    canvas.height = maxDim;
  } else {
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.floor(video.videoWidth * scale);
    canvas.height = Math.floor(video.videoHeight * scale);
  }
  EffectsEngine.initMatrix(canvas.width);
}

exportRes.onchange = () => {
  updateCanvasDimensions();
  statusText.textContent = `Resolution set to ${exportRes.value}p`;
};

// Ratio Buttons
document.querySelectorAll(".ratio-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".ratio-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentRatio = btn.dataset.ratio;
    updateCanvasDimensions();
    statusText.textContent = "Ratio: " + btn.textContent;
  };
});

// Trim Sliders
trimStartSlider.oninput = () => {
  let start = parseFloat(trimStartSlider.value);
  let end = parseFloat(trimEndSlider.value);
  if (start >= end - 0.2) {
    start = Math.max(0, end - 0.2);
    trimStartSlider.value = start;
  }
  document.getElementById("trimStartVal").textContent = start.toFixed(1) + "s";
  video.currentTime = start;
};

trimEndSlider.oninput = () => {
  let start = parseFloat(trimStartSlider.value);
  let end = parseFloat(trimEndSlider.value);
  if (end <= start + 0.2) {
    end = Math.min(video.duration, start + 0.2);
    trimEndSlider.value = end;
  }
  document.getElementById("trimEndVal").textContent = end.toFixed(1) + "s";
};

// Color & Speed Sliders
brightnessSlider.oninput = () => document.getElementById("brightVal").textContent = brightnessSlider.value + "%";
contrastSlider.oninput = () => document.getElementById("contrastVal").textContent = contrastSlider.value + "%";
saturationSlider.oninput = () => document.getElementById("satVal").textContent = saturationSlider.value + "%";
speedSlider.oninput = () => {
  video.playbackRate = Number(speedSlider.value);
  document.getElementById("speedVal").textContent = speedSlider.value + "x";
};

overlaySize.oninput = () => document.getElementById("fontSizeVal").textContent = overlaySize.value + "px";

document.getElementById("resetAdjustBtn").onclick = () => {
  brightnessSlider.value = 100;
  contrastSlider.value = 100;
  saturationSlider.value = 100;
  speedSlider.value = 1.0;
  video.playbackRate = 1.0;

  document.getElementById("brightVal").textContent = "100%";
  document.getElementById("contrastVal").textContent = "100%";
  document.getElementById("satVal").textContent = "100%";
  document.getElementById("speedVal").textContent = "1.0x";
};

// Visual Effects Selection
document.querySelectorAll(".fx-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".fx-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentEffect = btn.dataset.fx;
    statusText.textContent = "Filter: " + btn.textContent;
  };
});

// Background Music Upload & Volume
bgmInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById("bgmFileName").textContent = "✓ " + file.name;
  AudioMixer.loadBgmFile(file, video);
  AudioVisualizer.setup();
  statusText.textContent = "🎵 Music track loaded!";
};

vidVolumeSlider.oninput = () => {
  document.getElementById("vidVolVal").textContent = vidVolumeSlider.value + "%";
  if (!isVideoMuted) AudioMixer.setVideoVolume(vidVolumeSlider.value);
};

bgmVolumeSlider.oninput = () => {
  document.getElementById("bgmVolVal").textContent = bgmVolumeSlider.value + "%";
  AudioMixer.setBgmVolume(bgmVolumeSlider.value);
};

// Video Upload Handler
videoInput.onchange = function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  video.src = url;

  video.onloadedmetadata = () => {
    updateCanvasDimensions();

    const dur = video.duration;
    trimStartSlider.max = dur;
    trimEndSlider.max = dur;
    trimStartSlider.value = 0;
    trimEndSlider.value = dur;
    trimStartSlider.disabled = false;
    trimEndSlider.disabled = false;
    document.getElementById("trimStartVal").textContent = "0.0s";
    document.getElementById("trimEndVal").textContent = dur.toFixed(1) + "s";

    playPauseBtn.disabled = false;
    muteBtn.disabled = false;
    exportBtn.disabled = false;

    AudioMixer.init(video);
    AudioVisualizer.setup();
    AudioMixer.resumeContext();
    video.play();
    AudioMixer.syncPlay(true);

    playPauseBtn.textContent = "⏸ Pause";
    statusText.textContent = "✓ Ready! Use bottom dock to edit";
    animationLoop();
  };
};

// Play / Pause Control
playPauseBtn.onclick = () => {
  AudioMixer.init(video);
  AudioVisualizer.setup();
  AudioMixer.resumeContext();
  if (video.paused) {
    video.play();
    AudioMixer.syncPlay(true);
    playPauseBtn.textContent = "⏸ Pause";
  } else {
    video.pause();
    AudioMixer.syncPlay(false);
    playPauseBtn.textContent = "▶ Play";
  }
};

// Mute / Unmute Video Audio
muteBtn.onclick = () => {
  isVideoMuted = !isVideoMuted;
  AudioMixer.setVideoVolume(isVideoMuted ? 0 : vidVolumeSlider.value);
  muteBtn.textContent = isVideoMuted ? "🔇 Off" : "🔊 On";
};

// Export Video Button
exportBtn.onclick = () => {
  VideoRecorder.toggle(
    canvas,
    video,
    exportBtn,
    playPauseBtn,
    statusText,
    () => currentEffect,
    parseFloat(trimStartSlider.value),
    exportBitrate.value
  );
};

// Main Render Loop
function animationLoop() {
  if (video.readyState >= 2) {
    const start = parseFloat(trimStartSlider.value);
    const end = parseFloat(trimEndSlider.value);

    if (!video.paused && video.currentTime >= end) {
      if (VideoRecorder.isRecording) {
        VideoRecorder.stop(exportBtn);
        video.pause();
        AudioMixer.syncPlay(false);
        playPauseBtn.textContent = "▶ Play";
      } else {
        video.currentTime = start;
      }
    }

    EffectsEngine.renderFrame(ctx, video, canvas, currentEffect, {
      brightness: brightnessSlider.value,
      contrast: contrastSlider.value,
      saturation: saturationSlider.value
    });

    AudioVisualizer.draw(ctx, canvas, vizStyle.value, vizColor.value);

    TextOverlayEngine.draw(ctx, canvas, {
      text: overlayText.value,
      color: overlayColor.value,
      position: overlayPos.value,
      size: overlaySize.value
    });

    StickerEngine.drawSticker(ctx, canvas, stickerSelect.value, stickerPos.value);

    StickerEngine.applyFade(ctx, canvas, video, start, end, fadeToggle.checked);
  }
  requestAnimationFrame(animationLoop);
}

// Bottom Navigation Tabs Switching
document.querySelectorAll(".nav-tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.target).classList.add("active");
  };
});
