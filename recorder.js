// ==========================================
// VIDEO RECORDER & EXPORT MODULE (recorder.js)
// ==========================================

const VideoRecorder = {
  isRecording: false,
  mediaRecorder: null,
  recordedChunks: [],

  toggle(canvas, video, exportBtn, playPauseBtn, statusText, getEffectName, trimStart, qualityMbps) {
    if (!this.isRecording) {
      this.start(canvas, video, exportBtn, playPauseBtn, statusText, getEffectName, trimStart, qualityMbps);
    } else {
      this.stop(exportBtn);
    }
  },

  start(canvas, video, exportBtn, playPauseBtn, statusText, getEffectName, trimStart, qualityMbps) {
    this.recordedChunks = [];
    AudioMixer.init(video);
    AudioMixer.resumeContext();

    const canvasStream = canvas.captureStream(30);
    const mixedTracks = AudioMixer.getMixedAudioTracks();

    if (mixedTracks.length > 0) {
      canvasStream.addTrack(mixedTracks[0]);
    }

    const bps = (Number(qualityMbps) || 5) * 1000000;
    const mimeCandidates = [
      "video/mp4;codecs=avc1",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm"
    ];

    let selectedMime = "";
    for (const mime of mimeCandidates) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    const options = { videoBitsPerSecond: bps };
    if (selectedMime) options.mimeType = selectedMime;

    try {
      this.mediaRecorder = new MediaRecorder(canvasStream, options);
    } catch (e) {
      this.mediaRecorder = new MediaRecorder(canvasStream);
    }

    const isMp4 = (this.mediaRecorder.mimeType || "").includes("mp4");
    const ext = isMp4 ? "mp4" : "webm";

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.recordedChunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.getElementById("downloadLink");
      a.href = url;
      a.download = `VideoFX_${getEffectName()}_${Date.now()}.${ext}`;
      a.click();
      statusText.textContent = `✅ Exported (${ext.toUpperCase()})! Saved to Downloads.`;
    };

    video.currentTime = trimStart;
    if (AudioMixer.hasBgm) {
      AudioMixer.bgmAudio.currentTime = 0;
    }

    video.play();
    AudioMixer.syncPlay(true);
    playPauseBtn.textContent = "⏸ Pause";

    this.mediaRecorder.start();
    this.isRecording = true;
    exportBtn.textContent = "⏹ Stop & Save Video";
    exportBtn.classList.remove("green");
    exportBtn.classList.add("red");
    statusText.textContent = `🔴 Rendering ${qualityMbps} Mbps (${ext.toUpperCase()})...`;
  },

  stop(exportBtn) {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      exportBtn.textContent = "Export Final Video";
      exportBtn.classList.remove("red");
      exportBtn.classList.add("green");
    }
  }
};
