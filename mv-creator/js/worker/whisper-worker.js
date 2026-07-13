// Runs speech-to-text entirely inside the browser using transformers.js
// (Xenova/whisper-base, multilingual). No API key, no server, no per-request
// cost - the only cost is a one-time model download (~145MB) cached by the
// browser's HTTP cache after the first run.
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Keep everything client-side; do not try to load local ONNX files from the
// app's own origin.
env.allowLocalModels = false;

let transcriberPromise = null;

function getTranscriber() {
  if (!transcriberPromise) {
    transcriberPromise = pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
      progress_callback: (progress) => {
        self.postMessage({ type: 'progress', progress });
      },
    });
  }
  return transcriberPromise;
}

self.onmessage = async (event) => {
  const { type, audioData } = event.data;
  if (type !== 'transcribe') return;

  try {
    const transcriber = await getTranscriber();
    const output = await transcriber(audioData, {
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true,
    });

    const chunks = (output.chunks || []).map((chunk) => ({
      text: (chunk.text || '').trim(),
      start: chunk.timestamp?.[0] ?? 0,
      end: chunk.timestamp?.[1] ?? (chunk.timestamp?.[0] ?? 0) + 2,
    })).filter((c) => c.text.length > 0);

    self.postMessage({ type: 'result', chunks });
  } catch (err) {
    self.postMessage({ type: 'error', message: err?.message || String(err) });
  }
};
