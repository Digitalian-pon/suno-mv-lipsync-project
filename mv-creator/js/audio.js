// Audio loading, waveform extraction and a playback controller shared by the
// live preview and the final recording pass. Everything here runs purely in
// the browser (Web Audio API) - no server/API calls, so it is free to use.

let sharedAudioContext = null;

export function getAudioContext() {
  if (!sharedAudioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    sharedAudioContext = new Ctx();
  }
  return sharedAudioContext;
}

export async function loadAudioFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const ctx = getAudioContext();
  // decodeAudioData detaches the buffer in some browsers, so clone it first.
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
  return {
    file,
    arrayBuffer,
    audioBuffer,
    duration: audioBuffer.duration,
  };
}

// Downsample the (possibly stereo) audio into `numBuckets` peak values in
// range [0,1], used to draw a static waveform preview and as a fallback
// "audio-reactive" background driver when no live AnalyserNode data exists.
export function getWaveformPeaks(audioBuffer, numBuckets = 400) {
  const channelData = audioBuffer.getChannelData(0);
  const samplesPerBucket = Math.floor(channelData.length / numBuckets) || 1;
  const peaks = new Float32Array(numBuckets);
  for (let i = 0; i < numBuckets; i++) {
    const start = i * samplesPerBucket;
    let max = 0;
    for (let j = 0; j < samplesPerBucket; j++) {
      const v = Math.abs(channelData[start + j] || 0);
      if (v > max) max = v;
    }
    peaks[i] = max;
  }
  return peaks;
}

export function drawWaveform(canvas, peaks, color = '#a29bfe') {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);
  const barWidth = w / peaks.length;
  ctx.fillStyle = color;
  for (let i = 0; i < peaks.length; i++) {
    const barHeight = Math.max(2, peaks[i] * h);
    ctx.fillRect(i * barWidth, (h - barHeight) / 2, Math.max(1, barWidth - 1), barHeight);
  }
}

// Resample an AudioBuffer down to mono 16kHz Float32 PCM, the format Whisper
// (and most in-browser ASR models) expect.
export async function toMono16k(audioBuffer) {
  const targetRate = 16000;
  if (audioBuffer.sampleRate === targetRate && audioBuffer.numberOfChannels === 1) {
    return audioBuffer.getChannelData(0).slice();
  }
  const offlineCtx = new OfflineAudioContext(
    1,
    Math.ceil(audioBuffer.duration * targetRate),
    targetRate
  );
  const source = offlineCtx.createBufferSource();
  // Mix down to mono manually so we do not depend on channel-merger quirks.
  const monoBuffer = offlineCtx.createBuffer(1, audioBuffer.length, audioBuffer.sampleRate);
  const monoData = monoBuffer.getChannelData(0);
  const channels = audioBuffer.numberOfChannels;
  for (let i = 0; i < audioBuffer.length; i++) {
    let sum = 0;
    for (let c = 0; c < channels; c++) sum += audioBuffer.getChannelData(c)[i];
    monoData[i] = sum / channels;
  }
  source.buffer = monoBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);
  const rendered = await offlineCtx.startRendering();
  return rendered.getChannelData(0).slice();
}

// Playback controller used for both live preview and the real-time recording
// pass. Exposes an AnalyserNode (for audio-reactive backgrounds) and a
// MediaStreamDestination (so MediaRecorder can capture the exact audio being
// played).
export class PlaybackController {
  constructor(audioBuffer) {
    this.audioBuffer = audioBuffer;
    this.ctx = getAudioContext();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.streamDest = this.ctx.createMediaStreamDestination();
    this.source = null;
    this.startedAt = 0;
    this.startOffset = 0;
    this.playing = false;
    this.onEnded = null;
  }

  _connectGraph(source) {
    source.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    this.analyser.connect(this.streamDest);
  }

  play(fromSeconds = 0) {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.source) this.source.stop();
    const source = this.ctx.createBufferSource();
    source.buffer = this.audioBuffer;
    this._connectGraph(source);
    source.onended = () => {
      if (this.playing && this.getCurrentTime() >= this.audioBuffer.duration - 0.05) {
        this.playing = false;
        if (this.onEnded) this.onEnded();
      }
    };
    source.start(0, fromSeconds);
    this.source = source;
    this.startedAt = this.ctx.currentTime;
    this.startOffset = fromSeconds;
    this.playing = true;
  }

  pause() {
    if (this.source) {
      this.startOffset = this.getCurrentTime();
      this.source.stop();
      this.source = null;
    }
    this.playing = false;
  }

  getCurrentTime() {
    if (!this.playing) return this.startOffset;
    return this.startOffset + (this.ctx.currentTime - this.startedAt);
  }

  getFrequencyData() {
    this.analyser.getByteFrequencyData(this.freqData);
    return this.freqData;
  }

  get mediaStream() {
    return this.streamDest.stream;
  }
}
