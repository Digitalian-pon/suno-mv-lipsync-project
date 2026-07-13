// Google Drive import/export using Google Identity Services (OAuth token
// client) + the Picker API + Drive REST v3. Uses the narrow `drive.file`
// scope: the app can only see files the user explicitly picks or files it
// created itself - it never gets blanket access to the whole Drive.
//
// Requires the user's own OAuth Client ID + API key (see README.md - these
// cannot be provisioned by this app, they come from the user's own free
// Google Cloud project).

const SCOPE = 'https://www.googleapis.com/auth/drive.file';

let accessToken = null;
let tokenClient = null;
let pickerLoaded = false;

export function getConfig() {
  return {
    clientId: localStorage.getItem('mv_drive_client_id') || '',
    apiKey: localStorage.getItem('mv_drive_api_key') || '',
  };
}

export function saveConfig({ clientId, apiKey }) {
  localStorage.setItem('mv_drive_client_id', clientId || '');
  localStorage.setItem('mv_drive_api_key', apiKey || '');
}

export function isConfigured() {
  const { clientId, apiKey } = getConfig();
  return Boolean(clientId && apiKey);
}

export function isSignedIn() {
  return Boolean(accessToken);
}

function waitFor(check, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function poll() {
      if (check()) return resolve();
      if (Date.now() - start > timeoutMs) return reject(new Error('Google APIの読み込みがタイムアウトしました'));
      setTimeout(poll, 100);
    })();
  });
}

export async function signIn() {
  const { clientId } = getConfig();
  if (!clientId) throw new Error('先に設定画面でOAuthクライアントIDを入力してください');
  await waitFor(() => window.google?.accounts?.oauth2);

  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp) => {
        if (resp.error) { reject(new Error(resp.error)); return; }
        accessToken = resp.access_token;
        resolve(accessToken);
      },
      error_callback: (err) => reject(new Error(err?.message || 'Google認証に失敗しました')),
    });
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

export function signOut() {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
}

async function ensurePicker() {
  if (pickerLoaded) return;
  await waitFor(() => window.gapi);
  await new Promise((resolve, reject) => {
    window.gapi.load('picker', { callback: resolve, onerror: reject });
  });
  pickerLoaded = true;
}

/**
 * Opens the Google Picker so the user can choose a WAV file from their own
 * Drive, then downloads it and returns a File object.
 */
export async function pickFileFromDrive() {
  const { apiKey } = getConfig();
  if (!apiKey) throw new Error('先に設定画面でAPIキーを入力してください');
  if (!isSignedIn()) await signIn();
  await ensurePicker();

  const fileId = await new Promise((resolve, reject) => {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
      .setMimeTypes('audio/wav,audio/x-wav,audio/wave')
      .setIncludeFolders(true);

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          resolve(data.docs[0].id);
        } else if (data.action === window.google.picker.Action.CANCEL) {
          reject(new Error('cancelled'));
        }
      })
      .build();
    picker.setVisible(true);
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Driveからのダウンロードに失敗しました (${res.status})`);
  const blob = await res.blob();
  return new File([blob], 'from-drive.wav', { type: 'audio/wav' });
}

/**
 * Uploads a Blob (the exported music video) to the user's Google Drive
 * "My Drive" root via a simple multipart upload.
 */
export async function uploadFileToDrive(blob, filename, mimeType) {
  if (!isSignedIn()) await signIn();

  const metadata = { name: filename, mimeType };
  const boundary = 'mvcreator' + Math.random().toString(16).slice(2);
  const bodyParts = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
  ];
  const closing = `\r\n--${boundary}--`;

  const body = new Blob([bodyParts[0], bodyParts[1], blob, closing]);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!res.ok) throw new Error(`Driveへのアップロードに失敗しました (${res.status})`);
  return res.json();
}
