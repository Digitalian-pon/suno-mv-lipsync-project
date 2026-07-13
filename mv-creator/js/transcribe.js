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
        w.removeEventListener('message', handleMessage);
        resolve(msg.chunks);
      } else if (msg.type === 'error') {
        w.removeEventListener('message', handleMessage);
        reject(new Error(msg.message));
      }
    };

    w.addEventListener('message', handleMessage);
    onProgress?.({ stage: 'transcribing' });
    // Float32Array is transferable-friendly via structured clone of its buffer.
    w.postMessage({ type: 'transcribe', audioData: pcm }, [pcm.buffer]);
  });
}
