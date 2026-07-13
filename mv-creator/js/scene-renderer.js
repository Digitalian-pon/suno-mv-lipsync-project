// Draws each animated MV frame onto a <canvas> using only 2D canvas
// primitives - gradients, particles and an audio-reactive bar visualizer.
// No image/video generation API is called, so there is no per-frame or
// per-second cost; the only "AI" involved is the optional local lyric
// transcription, which also runs for free in the browser.

export const THEMES = {
  sunset: { a: '#6C5CE7', b: '#fd9644', text: '#ffffff', dim: 'rgba(255,255,255,0.35)' },
  ocean: { a: '#0984e3', b: '#00cec9', text: '#ffffff', dim: 'rgba(255,255,255,0.35)' },
  neon: { a: '#e84393', b: '#00b894', text: '#ffffff', dim: 'rgba(255,255,255,0.35)' },
  mono: { a: '#2d3436', b: '#636e72', text: '#ffffff', dim: 'rgba(255,255,255,0.35)' },
};

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export class SceneRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scenes = [];
    this.themeName = 'sunset';
    this.particles = null;
    this._initParticles();
  }

  setScenes(scenes) { this.scenes = scenes; }
  setTheme(themeName) { this.themeName = themeName; }

  _initParticles() {
    const count = 60;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
    }));
  }

  getSceneAt(t) {
    return this.scenes.find((s) => t >= s.start && t < s.end) || this.scenes[this.scenes.length - 1];
  }

  getLineAt(scene, t) {
    if (!scene) return null;
    return scene.lines.find((l) => t >= l.start && t < l.end) || null;
  }

  render(t, freqData) {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    const scene = this.getSceneAt(t);
    const theme = THEMES[scene?.background?.theme || this.themeName] || THEMES.sunset;

    ctx.clearRect(0, 0, w, h);

    if (scene?.background?.type === 'image' && scene.background.image) {
      this._drawImageBG(scene, t, w, h);
    } else if (scene?.background?.type === 'waveform') {
      this._drawWaveformBG(theme, freqData, w, h);
    } else if (scene?.background?.type === 'particles') {
      this._drawGradientBG(theme, t, w, h);
      this._drawParticlesBG(theme, freqData, w, h);
    } else {
      this._drawGradientBG(theme, t, w, h);
    }

    // Subtle vignette so captions stay legible regardless of background.
    const grad = ctx.createRadialGradient(w / 2, h / 2, h / 3, w / 2, h / 2, h);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (scene) this._drawCaption(scene, t, theme, w, h);
  }

  _drawGradientBG(theme, t, w, h) {
    const { ctx } = this;
    const angle = t * 0.15;
    const x1 = w / 2 + Math.cos(angle) * w;
    const y1 = h / 2 + Math.sin(angle) * h;
    const x2 = w / 2 - Math.cos(angle) * w;
    const y2 = h / 2 - Math.sin(angle) * h;
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, theme.a);
    grad.addColorStop(1, theme.b);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  _drawParticlesBG(theme, freqData, w, h) {
    const { ctx } = this;
    const amp = freqData ? avg(freqData) / 255 : 0.3;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (const p of this.particles) {
      p.x += p.vx * (1 + amp);
      p.y += p.vy * (1 + amp);
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.r * (1 + amp), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawWaveformBG(theme, freqData, w, h) {
    const { ctx } = this;
    this._drawGradientBG(theme, performance.now() / 1000, w, h);
    if (!freqData) return;
    const barCount = 64;
    const step = Math.floor(freqData.length / barCount);
    const barWidth = w / barCount;
    const rgb = hexToRgb('#ffffff');
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.85)`;
    for (let i = 0; i < barCount; i++) {
      const v = freqData[i * step] / 255;
      const barHeight = v * h * 0.5;
      ctx.fillRect(i * barWidth, h - barHeight, barWidth - 2, barHeight);
      ctx.fillRect(i * barWidth, 0, barWidth - 2, barHeight * 0.4);
    }
  }

  _drawImageBG(scene, t, w, h) {
    const { ctx } = this;
    const img = scene.background.image;
    const progress = clamp01((t - scene.start) / Math.max(0.001, scene.end - scene.start));
    const zoom = 1 + 0.15 * progress;
    const panX = (progress - 0.5) * w * 0.08;
    const panY = (progress - 0.5) * h * 0.05;

    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let drawW, drawH;
    if (imgRatio > canvasRatio) {
      drawH = h * zoom;
      drawW = drawH * imgRatio;
    } else {
      drawW = w * zoom;
      drawH = drawW / imgRatio;
    }
    const x = (w - drawW) / 2 + panX;
    const y = (h - drawH) / 2 + panY;
    ctx.drawImage(img, x, y, drawW, drawH);
  }

  _drawCaption(scene, t, theme, w, h) {
    const { ctx } = this;
    const line = this.getLineAt(scene, t);
    if (!line) return;

    const fontSize = Math.round(h * 0.07);
    ctx.font = `bold ${fontSize}px "Hiragino Sans", "Noto Sans JP", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cx = w / 2;
    const cy = h * 0.82;

    // Fade in/out at the edges of the line's time window.
    const fadeDur = 0.25;
    const inFade = clamp01((t - line.start) / fadeDur);
    const outFade = clamp01((line.end - t) / fadeDur);
    const alpha = Math.min(inFade, outFade);

    const progress = clamp01((t - line.start) / Math.max(0.001, line.end - line.start));
    const textWidth = ctx.measureText(line.text).width;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 12;

    // Base (dim) text.
    ctx.fillStyle = theme.dim;
    ctx.fillText(line.text, cx, cy);

    // Karaoke-style sweep highlight over the already-sung portion.
    ctx.save();
    const clipWidth = textWidth * progress;
    ctx.beginPath();
    ctx.rect(cx - textWidth / 2, cy - fontSize, clipWidth, fontSize * 2);
    ctx.clip();
    ctx.fillStyle = theme.text;
    ctx.fillText(line.text, cx, cy);
    ctx.restore();

    ctx.restore();
  }
}

function avg(arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
