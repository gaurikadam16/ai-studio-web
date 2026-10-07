/**
 * API layer – the ONLY file that talks to the backend.
 * Sends the login token with every request, so the server knows who you are.
 *
 * ✅ Accounts (sign up, log in, profile)   ✅ Credits (kept on the server)
 * ✅ Images: fal.ai Nano Banana 2 (+ your photos)   ✅ Videos: fal.ai Kling (+ your photos)
 * ✅ AI ideas for your photos                       ✅ Real "Improve my prompt"
 * ✅ Languages: English / हिंदी / मराठी (typing, pasting, translating)
 */
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const TOKEN_KEY = 'ai-studio-token';

// ---------------- Login token (kept in this browser) ----------------
export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* storage blocked */ }
};

// If the server says "please log in again", the app calls this (set in App.jsx)
let onLoggedOut = () => {};
export const whenLoggedOut = (fn) => { onLoggedOut = fn; };

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error("Can't reach the server. Is the backend running (npm start in the server folder)?");
  }
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && token) onLoggedOut();
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.credits = data.credits; // the server sends the latest balance even on errors
    throw err;
  }
  return data;
}

// ---------------- ACCOUNTS ----------------
export const signup = (name, email, password) => request('/auth/signup', { method: 'POST', body: { name, email, password } });
export const login = (email, password) => request('/auth/login', { method: 'POST', body: { email, password } });
export const getMe = () => request('/auth/me');
export const updateMe = (name) => request('/auth/me', { method: 'PATCH', body: { name } });

// ---------------- IMAGES ----------------
/** imageUrls = your uploaded photos (optional). -> { images: [{ id, url }], description, credits } */
export function generateImages(params) {
  return request('/images', {
    method: 'POST',
    body: { prompt: params.prompt, count: params.count, aspectRatio: params.aspectRatio, imageUrls: params.imageUrls || [] },
  });
}

// ---------------- PHOTO UPLOAD (one photo) ----------------
const MAX_SIDE = 2048; // bigger photos are made smaller (faster upload, same AI quality)
const MIN_SIDE = 512;  // smaller photos are made bigger (video AI needs at least 300 x 300)

// Read a file as a "data:image/...;base64,..." text
function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Couldn't read the photo."));
    reader.readAsDataURL(file);
  });
}

// Resize the photo so it is between 512 px (shortest side) and 2048 px (longest side)
async function preparePhoto(file, quality = 0.9) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Couldn't read the photo."));
      el.src = objectUrl;
    });
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) throw new Error("Couldn't read the photo size.");

    let scale = 1;
    if (Math.max(w, h) > MAX_SIDE) scale = MAX_SIDE / Math.max(w, h); // too big -> smaller
    if (Math.min(w, h) * scale < MIN_SIDE) scale = MIN_SIDE / Math.min(w, h); // too small -> bigger
    // Very long, thin pictures can't fit both rules; keep the shortest side readable
    if (Math.max(w, h) * scale > MAX_SIDE * 2) scale = (MAX_SIDE * 2) / Math.max(w, h);

    // Right size and light already? Send it as it is.
    if (scale === 1 && file.size < 2 * 1024 * 1024) return await readAsDataUrl(file);

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#ffffff'; // transparent PNGs get a white background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Uploads one photo (resized first if needed). -> { url } */
export async function uploadPhoto(file) {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error('Please choose a PNG, JPG or WEBP image.');
  if (file.size > 20 * 1024 * 1024) throw new Error('The photo is too big. Use one under 20 MB.');
  const dataUrl = await preparePhoto(file);
  return request('/uploads', { method: 'POST', body: { dataUrl } });
}

// ---------------- VIDEOS ----------------
/** imageUrls: 0 = from text, 1 = first frame, 2–4 = references. -> { jobId, credits } */
export function startVideo(params) {
  return request('/videos', {
    method: 'POST',
    body: {
      prompt: params.prompt,
      seconds: params.length,
      aspectRatio: params.aspectRatio,
      sound: params.sound,
      imageUrls: params.imageUrls || [],
    },
  });
}

/** -> { status: 'running'|'done'|'failed', progress, url, error, credits? } */
export function getVideoStatus(jobId) {
  return request(`/videos/${encodeURIComponent(jobId)}`);
}

// ---------------- SMART HELPERS (free for users) ----------------
/** The AI looks at your photos and suggests 4 ideas (in your language). -> { suggestions: [{ title, prompt }] } */
export function getSuggestions(mode, imageUrls, text = '', language = 'en') {
  return request('/suggest', { method: 'POST', body: { mode, imageUrls, text, language } });
}

/** The AI rewrites your idea into a richer prompt (uses your photos too, if any). -> { prompt } */
export function improvePrompt(prompt, mode, imageUrls = [], language = 'en') {
  return request('/prompt/improve', { method: 'POST', body: { prompt, mode, imageUrls, language } });
}

// ---------------- LANGUAGES ----------------
/** Translate text into 'en' | 'hi' | 'mr'. -> { text } */
export function translateText(text, to) {
  return request('/translate', { method: 'POST', body: { text, to } });
}

/** One English-letters word -> Marathi/Hindi letters (e.g. "namaskar" -> "नमस्कार"). -> { text } */
export function transliterate(text, lang) {
  return request('/transliterate', { method: 'POST', body: { text, lang } });
}