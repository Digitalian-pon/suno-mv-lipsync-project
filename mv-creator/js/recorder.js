// Captures the animated <canvas> + the exact audio being played into a
// single video file using MediaRecorder. This is a real-time capture (it
// takes as long as the song itself) rather than an offline render, which is
// what keeps it possible to do entirely in the browser with zero API cost.

const MIME_CANDIDATES = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
];

export function pickSupportedMimeType() {
  for (const type of MIME_CANDIDATES) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

/**
 * Runs the full real-time export pass: plays the audio, drives the canvas
 * render loop in sync with it, and records the result.
 *
 * @param {object} opts
 * @param {import('./scene-renderer.js').SceneRenderer} opts.renderer
 * @param {import('./audio.js').PlaybackController} opts.playback
 * @param {HTMLCanvasElement} opts.canvas
 * @param {(ratio:number) => void} [opts.onProgress]
 * @returns {Promise<{blob:Blob, mimeType:string}>}
 */
export function recordScenes({ renderer, playback, canvas, onProgress }) {
  return new Promise((resolve, reject) => {
    const mimeType = pickSupportedMimeType();
    if (!mimeType) {
      reject(new Error('このブラウザは動画の録画(MediaRecorder)に対応していません。Chrome/Edge/最新のSafariをお試しください。'));
      return;
    }

    const videoStream = canvas.captureStream(30);
    const audioTracks = playback.mediaStream.getAudioTracks();
    const combined = new MediaStream([...videoStream.getVideoTracks(), ...audioTracks]);

    const recorder = new MediaRecorder(combined, { mimeType, videoBitsPerSecond: 4_000_000 });
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    const duration = renderer.scenes.length
      ? Math.max(...renderer.scenes.map((s) => s.end))
      : playback.audioBuffer.duration;

    let rafId = null;
    const tick = () => {
      const t = playback.getCurrentTime();
      renderer.render(t, playback.getFrequencyData());
      onProgress?.(Math.min(1, t / duration));
      if (t < duration && playback.playing) {
        rafId = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(rafId);
      playback.pause();
      recorder.stop();
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      onProgress?.(1);
      resolve({ blob, mimeType });
    };
    recorder.onerror = (e) => reject(e.error || new Error('recording failed'));

    recorder.start(250);
    playback.play(0);
    rafId = requestAnimationFrame(tick);
  });
}

export function blobToObjectUrl(blob) {
  return URL.createObjectURL(blob);
}
