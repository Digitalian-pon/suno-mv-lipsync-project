// Orchestrates the whisper-worker: sends 16kHz mono PCM audio, surfaces
// download/inference progress, and resolves with timestamped lyric lines.
import { toMono16k } from './audio.js';

let worker = null;

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./worker/whisper-worker.js', import.meta.url), { type: 'module' });
  }
  return worker;
}

function resetWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}

/**
 * @param {AudioBuffer} audioBuffer
 * @param {(info:{stage:string, ratio?:number, label?:string}) => void} onProgress
 * @returns {Promise<Array<{text:string, start:number, end:number}>>}
 */
export async function transcribeAudioBuffer(audioBuffer, onProgress) {
  onProgress?.({ stage: 'resampling' });
  const pcm = await toMono16k(audioBuffer);

  return new Promise((resolve, reject) => {
    const w = getWorker();

    const cleanup = () => {
      w.removeEventListener('message', handleMessage);
      w.removeEventListener('error', handleError);
    };

    const handleMessage = (event) => {
      const msg = event.data;
      if (msg.type === 'progress') {
        const p = msg.progress || {};
        if (p.status === 'progress' && p.total) {
          onProgress?.({ stage: 'downloading-model', ratio: p.loaded / p.total, label: p.file });
        } else if (p.status) {
          onProgress?.({ stage: p.status, label: p.file });
        }
      } else if (msg.type === 'result') {
        cleanup();
        resolve(msg.chunks);
      } else if (msg.type === 'error') {
        cleanup();
        reject(new Error(msg.message));
      }
    };

    // Worker側モジュールのimport失敗（CDNに到達できない等）はmessageではなく
    // errorイベントで通知される。捕捉しないと進捗表示のままUIが固まる。
    const handleError = (event) => {
      cleanup();
      // 使えなくなったWorkerを破棄し、次回の実行で作り直せるようにする
      resetWorker();
      reject(new Error(
        '音声認識モジュールの読み込みに失敗しました。ネットワーク接続を確認するか、「歌詞を貼り付けて同期」をご利用ください。'
        + (event.message ? ` (${event.message})` : '')
      ));
    };

    w.addEventListener('message', handleMessage);
    w.addEventListener('error', handleError);
    onProgress?.({ stage: 'transcribing' });
    // Float32Array is transferable-friendly via structured clone of its buffer.
    w.postMessage({ type: 'transcribe', audioData: pcm }, [pcm.buffer]);
  });
}
