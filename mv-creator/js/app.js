import { loadAudioFile, getWaveformPeaks, drawWaveform, PlaybackController } from './audio.js';
import { transcribeAudioBuffer } from './transcribe.js';
import { TapSync, segmentIntoScenes } from './lyrics-sync.js';
import { SceneRenderer, THEMES } from './scene-renderer.js';
import { recordScenes, blobToObjectUrl } from './recorder.js';
import * as drive from './drive.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}

// ---------------------------------------------------------------- state ---
const state = {
  audio: null, // { file, audioBuffer, duration }
  lines: [],   // [{text, start, end}]
  scenes: [],
  scenesDirty: true,
  tapSync: null,
  previewPlayback: null,
  previewRafId: null,
  exportBlob: null,
  exportMimeType: '',
};

const $ = (id) => document.getElementById(id);

// ------------------------------------------------------------ step nav ---
function goToStep(n) {
  document.querySelectorAll('.step-panel').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.step-tab').forEach((el) => el.classList.remove('active'));
  $(`step-${n}`).classList.add('active');
  document.querySelector(`.step-tab[data-step="${n}"]`).classList.add('active');
  if (n === 3) { ensureScenes(); renderSceneList(); }
  if (n === 4) setupPreview();
}

document.querySelectorAll('.step-tab').forEach((tab) => {
  tab.addEventListener('click', () => goToStep(Number(tab.dataset.step)));
});

$('toStep2Btn').addEventListener('click', () => goToStep(2));
$('toStep1BackBtn').addEventListener('click', () => goToStep(1));
$('toStep3Btn').addEventListener('click', () => goToStep(3));
$('toStep2BackBtn').addEventListener('click', () => goToStep(2));
$('toStep4Btn').addEventListener('click', () => goToStep(4));
$('toStep3BackBtn').addEventListener('click', () => goToStep(3));

// ================================================================ STEP 1 ==
async function handleAudioFile(file) {
  if (!file) return;
  state.audio = await loadAudioFile(file);
  $('audioInfo').hidden = false;
  $('audioFileName').textContent = file.name;
  $('audioDuration').textContent = formatClock(state.audio.duration);
  const peaks = getWaveformPeaks(state.audio.audioBuffer, 400);
  drawWaveform($('waveformCanvas'), peaks);
  const player = $('audioPlayer');
  player.src = URL.createObjectURL(file);
  player.hidden = false;
  $('toStep2Btn').disabled = false;
}

$('wavFileInput').addEventListener('change', (e) => handleAudioFile(e.target.files[0]));

const dropZone = $('fileDropZone');
['dragenter', 'dragover'].forEach((evt) => dropZone.addEventListener(evt, (e) => {
  e.preventDefault(); dropZone.classList.add('dragover');
}));
['dragleave', 'drop'].forEach((evt) => dropZone.addEventListener(evt, (e) => {
  e.preventDefault(); dropZone.classList.remove('dragover');
}));
dropZone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  if (file) handleAudioFile(file);
});

$('pickFromDriveBtn').addEventListener('click', async () => {
  try {
    const file = await drive.pickFileFromDrive();
    await handleAudioFile(file);
    updateDriveBadge();
  } catch (err) {
    if (err.message !== 'cancelled') alert(`Google Driveからの読み込みに失敗しました: ${err.message}`);
  }
});

// ================================================================ STEP 2 ==
document.querySelectorAll('.lyrics-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.lyrics-tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.lyrics-mode-panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    $(`mode-${tab.dataset.mode}`).classList.add('active');
  });
});

$('startTranscribeBtn').addEventListener('click', async () => {
  if (!state.audio) { alert('先に①で音楽を読み込んでください'); return; }
  const wrap = $('transcribeProgressWrap');
  const fill = $('transcribeProgressFill');
  const text = $('transcribeProgressText');
  wrap.hidden = false;
  $('startTranscribeBtn').disabled = true;

  try {
    const chunks = await transcribeAudioBuffer(state.audio.audioBuffer, ({ stage, ratio, label }) => {
      if (stage === 'downloading-model') {
        fill.style.width = `${Math.round((ratio || 0) * 100)}%`;
        text.textContent = `モデルを取得中... ${Math.round((ratio || 0) * 100)}% ${label ? `(${label})` : ''}`;
      } else if (stage === 'transcribing') {
        fill.style.width = '100%';
        text.textContent = '音声を解析しています...';
      } else {
        text.textContent = stage;
      }
    });
    state.lines = chunks;
    state.scenesDirty = true;
    renderLyricsList();
    $('toStep3Btn').disabled = state.lines.length === 0;
    text.textContent = `完了: ${chunks.length}行を抽出しました`;
  } catch (err) {
    text.textContent = `エラー: ${err.message}`;
  } finally {
    $('startTranscribeBtn').disabled = false;
  }
});

// --- タップ同期 ---------------------------------------------------------
// スマートフォンにはスペースキーが無いため、画面上の大きな「マーク」ボタンを
// 主操作にし、PC向けにスペースキーも併用できるようにしている。
let tapSyncPlayback = null;
let tapSyncTotal = 0;
let tapSyncKeyHandler = null;

function updateTapSyncUI() {
  const sync = state.tapSync;
  if (!sync || sync.isDone) return;
  $('tapMarkLine').textContent = sync.currentLine.text;
  $('tapMarkCount').textContent = `${sync.cursor + 1} / ${tapSyncTotal}`;
}

function endTapSync({ completed }) {
  if (tapSyncKeyHandler) {
    document.removeEventListener('keydown', tapSyncKeyHandler);
    tapSyncKeyHandler = null;
  }
  if (tapSyncPlayback) tapSyncPlayback.pause();
  $('tapMarkBtn').hidden = true;
  $('stopTapSyncBtn').hidden = true;
  $('startTapSyncBtn').hidden = false;

  if (completed && state.tapSync) {
    state.lines = state.tapSync.finalize(state.audio.duration);
    state.scenesDirty = true;
    renderLyricsList();
    $('toStep3Btn').disabled = state.lines.length === 0;
    $('tapSyncHint').textContent = '同期が完了しました。下のリストで時間を微調整できます。';
  } else {
    $('tapSyncHint').textContent = '同期を中止しました。もう一度「タップ同期を開始」を押してください。';
  }
}

function markCurrentLine() {
  if (!state.tapSync || state.tapSync.isDone) return;
  state.tapSync.mark();
  if (state.tapSync.isDone) {
    endTapSync({ completed: true });
  } else {
    updateTapSyncUI();
  }
}

$('startTapSyncBtn').addEventListener('click', () => {
  if (!state.audio) { alert('先に①で音楽を読み込んでください'); return; }
  const raw = $('manualLyricsInput').value.split('\n').map((s) => s.trim()).filter(Boolean);
  if (!raw.length) { alert('歌詞を貼り付けてください'); return; }

  tapSyncPlayback = new PlaybackController(state.audio.audioBuffer);
  tapSyncTotal = raw.length;
  state.tapSync = new TapSync(raw, tapSyncPlayback);
  // 曲が終わっても未マークの行が残っている場合は、そこまでの結果を確定する。
  tapSyncPlayback.onEnded = () => endTapSync({ completed: true });
  tapSyncPlayback.play(0);

  $('startTapSyncBtn').hidden = true;
  $('stopTapSyncBtn').hidden = false;
  $('tapMarkBtn').hidden = false;
  $('tapSyncHint').textContent = '再生中... その行が始まる瞬間に下のボタン（またはスペースキー）を押してください。';
  updateTapSyncUI();

  tapSyncKeyHandler = (e) => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    markCurrentLine();
  };
  document.addEventListener('keydown', tapSyncKeyHandler);
});

$('tapMarkBtn').addEventListener('click', markCurrentLine);
$('stopTapSyncBtn').addEventListener('click', () => endTapSync({ completed: false }));

function renderLyricsList() {
  const list = $('lyricsList');
  list.innerHTML = '';
  state.lines.forEach((line, i) => {
    const row = document.createElement('div');
    row.className = 'lyric-row';
    row.innerHTML = `
      <input type="text" class="time-input start-input" value="${formatClock(line.start)}">
      <input type="text" class="time-input end-input" value="${formatClock(line.end)}">
      <input type="text" class="text-input" value="${escapeHtml(line.text)}">
      <button class="del-btn" type="button" title="削除">✕</button>
    `;
    row.querySelector('.start-input').addEventListener('change', (e) => {
      line.start = parseClock(e.target.value);
      state.scenesDirty = true;
    });
    row.querySelector('.end-input').addEventListener('change', (e) => {
      line.end = parseClock(e.target.value);
      state.scenesDirty = true;
    });
    row.querySelector('.text-input').addEventListener('change', (e) => {
      line.text = e.target.value;
      state.scenesDirty = true;
    });
    row.querySelector('.del-btn').addEventListener('click', () => {
      state.lines.splice(i, 1);
      state.scenesDirty = true;
      renderLyricsList();
    });
    list.appendChild(row);
  });
}

// ================================================================ STEP 3 ==
// シーンの再分割はユーザーが設定した背景（画像・テーマ）を破棄するため、
// 歌詞が変わったとき(scenesDirty)と明示的な「再分割する」操作のときだけ行う。
// 画面遷移のたびに再分割すると設定が毎回消えてしまう。
function segmentScenes() {
  const maxLines = Number($('maxLinesPerScene').value) || 4;
  state.scenes = segmentIntoScenes(state.lines, { maxLinesPerScene: maxLines, minGapForNewScene: 2.5 });
  state.scenesDirty = false;
}

function ensureScenes() {
  if (state.scenesDirty || !state.scenes.length) segmentScenes();
}

$('resegmentBtn').addEventListener('click', () => {
  segmentScenes();
  renderSceneList();
});

function renderSceneList() {
  const list = $('sceneList');
  list.innerHTML = '';
  state.scenes.forEach((scene) => {
    const card = document.createElement('div');
    card.className = 'scene-card';
    const preview = scene.lines.map((l) => l.text).join(' / ');
    card.innerHTML = `
      <div class="scene-card-header">
        <strong>シーン ${scene.index + 1}</strong>
        <span class="note">${formatClock(scene.start)} - ${formatClock(scene.end)}</span>
      </div>
      <p class="scene-lines">${escapeHtml(preview)}</p>
      <div class="scene-controls">
        <select class="bg-type-select">
          <option value="gradient">グラデーション</option>
          <option value="particles">パーティクル</option>
          <option value="waveform">波形ビジュアライザー</option>
          <option value="image">画像をアップロード</option>
        </select>
        <select class="bg-theme-select">
          <option value="">(共通テーマを使用)</option>
          ${Object.keys(THEMES).map((k) => `<option value="${k}">${k}</option>`).join('')}
        </select>
        <input type="file" class="bg-image-input" accept="image/*" hidden>
        <button class="btn btn-outline bg-image-btn" type="button" hidden>🖼️ 画像を選ぶ</button>
        <img class="scene-image-thumb" hidden>
      </div>
    `;

    const typeSelect = card.querySelector('.bg-type-select');
    const themeSelect = card.querySelector('.bg-theme-select');
    const imageBtn = card.querySelector('.bg-image-btn');
    const imageInput = card.querySelector('.bg-image-input');
    const thumb = card.querySelector('.scene-image-thumb');

    // 再描画してもユーザーの設定内容（背景種別・テーマ・選択済み画像）が
    // UI上に反映され続けるよう、scene.backgroundから毎回復元する
    typeSelect.value = scene.background.type;
    themeSelect.value = scene.background.theme || '';
    imageBtn.hidden = scene.background.type !== 'image';
    if (scene.background.image) {
      thumb.src = scene.background.image.src;
      thumb.hidden = false;
    }

    typeSelect.addEventListener('change', () => {
      scene.background.type = typeSelect.value;
      imageBtn.hidden = typeSelect.value !== 'image';
      if (typeSelect.value === 'image') imageInput.click();
    });
    imageBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', async () => {
      const file = imageInput.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await img.decode();
      scene.background.image = img;
      thumb.src = url;
      thumb.hidden = false;
    });
    themeSelect.addEventListener('change', (e) => {
      scene.background.theme = e.target.value || undefined;
    });

    list.appendChild(card);
  });
}

// ================================================================ STEP 4 ==
let renderer = null;

function setupPreview() {
  ensureScenes();
  const canvas = $('previewCanvas');
  renderer = new SceneRenderer(canvas);
  renderer.setScenes(state.scenes);
  renderer.setTheme($('colorTheme').value);
  renderer.render(0, null);
}

$('colorTheme').addEventListener('change', () => {
  if (renderer) renderer.setTheme($('colorTheme').value);
});

let isPreviewPlaying = false;
$('previewPlayBtn').addEventListener('click', () => {
  if (!state.audio) { alert('先に①で音楽を読み込んでください'); return; }
  if (isPreviewPlaying) {
    state.previewPlayback.pause();
    cancelAnimationFrame(state.previewRafId);
    isPreviewPlaying = false;
    $('previewPlayBtn').textContent = '▶ プレビュー再生';
    return;
  }
  if (!state.previewPlayback) state.previewPlayback = new PlaybackController(state.audio.audioBuffer);
  state.previewPlayback.play(state.previewPlayback.getCurrentTime() >= state.audio.duration - 0.1 ? 0 : state.previewPlayback.getCurrentTime());
  isPreviewPlaying = true;
  $('previewPlayBtn').textContent = '⏸ 一時停止';

  const loop = () => {
    const t = state.previewPlayback.getCurrentTime();
    renderer.render(t, state.previewPlayback.getFrequencyData());
    $('previewTime').textContent = `${formatClock(t)} / ${formatClock(state.audio.duration)}`;
    if (isPreviewPlaying && t < state.audio.duration) {
      state.previewRafId = requestAnimationFrame(loop);
    } else {
      isPreviewPlaying = false;
      $('previewPlayBtn').textContent = '▶ プレビュー再生';
    }
  };
  state.previewRafId = requestAnimationFrame(loop);
});

$('recordBtn').addEventListener('click', async () => {
  if (!state.audio || !state.scenes.length) { alert('先に音楽と歌詞を用意してください'); return; }
  if (isPreviewPlaying) { state.previewPlayback.pause(); isPreviewPlaying = false; cancelAnimationFrame(state.previewRafId); }

  const wrap = $('recordProgressWrap');
  const fill = $('recordProgressFill');
  const text = $('recordProgressText');
  wrap.hidden = false;
  $('recordBtn').disabled = true;

  try {
    const recordPlayback = new PlaybackController(state.audio.audioBuffer);
    const { blob, mimeType } = await recordScenes({
      renderer,
      playback: recordPlayback,
      canvas: $('previewCanvas'),
      onProgress: (ratio) => {
        fill.style.width = `${Math.round(ratio * 100)}%`;
        text.textContent = `録画中... ${Math.round(ratio * 100)}%`;
      },
    });
    state.exportBlob = blob;
    state.exportMimeType = mimeType;
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const url = blobToObjectUrl(blob);
    $('resultVideo').src = url;
    $('downloadResultBtn').href = url;
    $('downloadResultBtn').download = `music-video.${ext}`;
    $('exportResult').hidden = false;
    text.textContent = '完了しました！';
  } catch (err) {
    text.textContent = `エラー: ${err.message}`;
  } finally {
    $('recordBtn').disabled = false;
  }
});

$('uploadDriveBtn').addEventListener('click', async () => {
  if (!state.exportBlob) return;
  try {
    $('uploadDriveBtn').textContent = 'アップロード中...';
    const ext = state.exportMimeType.includes('mp4') ? 'mp4' : 'webm';
    await drive.uploadFileToDrive(state.exportBlob, `music-video.${ext}`, state.exportMimeType);
    updateDriveBadge();
    $('uploadDriveBtn').textContent = '✅ Google Driveに保存しました';
  } catch (err) {
    alert(`アップロードに失敗しました: ${err.message}`);
    $('uploadDriveBtn').textContent = '☁️ Google Driveに保存';
  }
});

// ============================================================ Settings ===
const modal = $('settingsModal');
$('openSettingsBtn').addEventListener('click', () => {
  const cfg = drive.getConfig();
  $('driveClientId').value = cfg.clientId;
  $('driveApiKey').value = cfg.apiKey;
  modal.showModal();
});
$('saveSettingsBtn').addEventListener('click', () => {
  drive.saveConfig({ clientId: $('driveClientId').value.trim(), apiKey: $('driveApiKey').value.trim() });
  modal.close();
  updateDriveBadge();
});

function updateDriveBadge() {
  const dot = $('driveStatusDot');
  const text = $('driveStatusText');
  if (drive.isSignedIn()) {
    dot.className = 'dot dot-on';
    text.textContent = 'Google Drive 接続済み';
  } else if (drive.isConfigured()) {
    dot.className = 'dot dot-off';
    text.textContent = 'Google Drive 未接続（クリックで接続）';
  } else {
    dot.className = 'dot dot-off';
    text.textContent = 'Google Drive 未設定';
  }
}

$('driveStatusBtn').addEventListener('click', async () => {
  if (drive.isSignedIn()) {
    drive.signOut();
    updateDriveBadge();
    return;
  }
  if (!drive.isConfigured()) {
    modal.showModal();
    return;
  }
  try {
    await drive.signIn();
    updateDriveBadge();
  } catch (err) {
    alert(`Google Driveへの接続に失敗しました: ${err.message}`);
  }
});

updateDriveBadge();

// ============================================================== utils ====
function formatClock(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return '00:00.0';
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(1).padStart(4, '0');
  return `${String(m).padStart(2, '0')}:${s}`;
}

function parseClock(str) {
  const parts = str.split(':');
  if (parts.length === 2) return Number(parts[0]) * 60 + Number(parts[1]);
  return Number(str) || 0;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
