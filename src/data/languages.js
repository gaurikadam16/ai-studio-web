// Languages the prompt box supports
export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
];

export const languageName = (code) => LANGUAGES.find((l) => l.code === code)?.native || 'English';

// Devanagari letters = Hindi / Marathi text
export const hasDevanagari = (text) => /[\u0900-\u097F]/.test(text);
// Has English letters?
export const hasLatin = (text) => /[A-Za-z]{2,}/.test(text);

// Does this text need translating into the chosen language?
export function needsTranslation(text, to) {
  if (!text.trim()) return false;
  return to === 'en' ? hasDevanagari(text) : hasLatin(text);
}