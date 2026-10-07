import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Icon from './Icons.jsx';
import { transliterate, translateText } from '../api/client.js';
import { LANGUAGES, languageName, needsTranslation } from '../data/languages.js';

/**
 * The big box where you type your idea.
 * - Text only, photos only, or text + photos: all work.
 * - Photos: "Add photos" (pick several) or drag & drop onto the box.
 * - Language हिंदी / मराठी: type in English letters and press Space -> the word becomes हिंदी/मराठी.
 *   Paste English text -> it is translated into the chosen language. (English chosen + paste मराठी -> English.)
 * - After adding photos, the AI suggests ideas: "Use idea" puts it in the box, "Create" makes it right away.
 */
export default function PromptBox({
  mode, prompt, onPrompt, onImprove, improving, onGenerate, busy, cost, count,
  language, onLanguage, translatingAll,
  uploads, onAddPhotos, onRemovePhoto, onClearPhotos, maxPhotos,
  suggestions, onUseSuggestion, onCreateSuggestion, onRefreshSuggestions,
}) {
  const fileRef = useRef(null);
  const taRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [working, setWorking] = useState(0); // how many words / pastes are being converted right now
  const [langNote, setLangNote] = useState('');

  const photosUploading = uploads.some((u) => u.uploading);
  const hasPhotos = uploads.length > 0;
  const converting = working > 0 || translatingAll;
  const canGo = (prompt.trim().length > 2 || hasPhotos) && !busy && !photosUploading && !converting;
  const full = uploads.length >= maxPhotos;
  const langName = languageName(language);

  // ---------- Language helpers ----------
  // Replace a piece of the text (if it's still there) and keep the cursor where the user is typing.
  // flushSync updates the box at once, so fast typing can't get mixed up.
  const replaceSpan = (start, oldText, newText) => {
    const ta = taRef.current;
    if (!ta) return false;
    const current = ta.value;
    if (current.slice(start, start + oldText.length) !== oldText) return false; // user already changed it
    const caret = ta.selectionStart;
    const shift = newText.length - oldText.length;
    const newCaret = caret >= start + oldText.length ? caret + shift : caret;
    flushSync(() => onPrompt(current.slice(0, start) + newText + current.slice(start + oldText.length)));
    if (document.activeElement === ta) ta.setSelectionRange(newCaret, newCaret);
    return true;
  };

  // Typing: the English-letters word just before the cursor becomes Marathi/Hindi letters
  const convertWordBefore = async (pos) => {
    const ta = taRef.current;
    if (!ta || language === 'en') return;
    const match = ta.value.slice(0, pos).match(/([A-Za-z]+)$/);
    if (!match) return;
    const word = match[1];
    const start = pos - word.length;
    setWorking((n) => n + 1);
    try {
      const { text } = await transliterate(word, language);
      if (text && text !== word) replaceSpan(start, word, text);
    } catch {
      /* keep the English letters if the tool is unreachable */
    } finally {
      setWorking((n) => n - 1);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      if (canGo) onGenerate();
      return;
    }
    // Space, Enter or punctuation ends a word -> convert it
    if (language !== 'en' && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === ' ' || e.key === 'Enter' || /^[.,!?;:]$/.test(e.key))) {
      convertWordBefore(e.currentTarget.selectionStart);
    }
  };

  // Pasting: text in the "wrong" language is translated into the chosen language
  const onPaste = async (e) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted || !needsTranslation(pasted, language)) return; // normal paste
    e.preventDefault();
    const ta = e.currentTarget;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    onPrompt(ta.value.slice(0, start) + pasted + ta.value.slice(end)); // show it straight away
    requestAnimationFrame(() => ta.setSelectionRange(start + pasted.length, start + pasted.length));

    setWorking((n) => n + 1);
    setLangNote(`Translating pasted text into ${langName}…`);
    try {
      const { text } = await translateText(pasted, language);
      replaceSpan(start, pasted, text);
      setLangNote(`Pasted text translated into ${langName}.`);
    } catch (err) {
      setLangNote(err.message || 'Could not translate the pasted text.');
    } finally {
      setWorking((n) => n - 1);
      setTimeout(() => setLangNote(''), 3500);
    }
  };

  // ---------- Photos ----------
  const pickFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (files.length) onAddPhotos(files);
  };

  const hint = mode === 'image'
    ? 'The AI keeps the people, products or style from your photos and changes what you describe.'
    : uploads.length === 1
      ? 'This photo will be the first frame. Describe how it should move, or pick an idea below.'
      : 'These photos are references (people, objects, style). Describe the scene, or pick an idea below.';

  const buttonText = busy
    ? 'Generating…'
    : photosUploading
      ? 'Uploading photos…'
      : converting
        ? 'Translating…'
        : mode === 'image'
          ? `Generate ${count} ${count === 1 ? 'image' : 'images'}`
          : 'Generate video';

  const placeholder = language === 'mr'
    ? (hasPhotos ? 'उदा. फोटो 1 मधील मुलगी बाजारात फिरते — किंवा रिकामे ठेवा' : 'उदा. पावसात खेळणारे गोंडस कुत्र्याचे पिल्लू (English अक्षरात लिहा: pavsat khelnare...)')
    : language === 'hi'
      ? (hasPhotos ? 'जैसे: फोटो 1 वाली लड़की बाज़ार में घूमती है — या खाली छोड़ दें' : 'जैसे: बारिश में खेलता हुआ प्यारा पिल्ला (English अक्षरों में लिखें: barish me...)')
      : hasPhotos
        ? (mode === 'image'
          ? 'e.g. Put the man from photo 1 in a Diwali poster holding the product from photo 2 — or leave empty'
          : 'e.g. The girl walks through the market and smiles, cinematic — or leave empty')
        : (mode === 'image'
          ? 'e.g. A cat reading a newspaper in a Mumbai local train'
          : 'e.g. Drone shot flying over a hill fort at sunrise');

  return (
    <section
      className={`prompt-box ${dragging ? 'is-dragging' : ''}`}
      onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDragging(true); } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
      onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); setDragging(false); pickFiles(e.dataTransfer.files); } }}
    >
      <label htmlFor="prompt" className="field-label">Describe your idea {hasPhotos && <span className="muted">(optional with photos)</span>}</label>
      <textarea
        id="prompt"
        ref={taRef}
        rows={2}
        lang={language}
        value={prompt}
        onChange={(e) => onPrompt(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={(e) => language !== 'en' && convertWordBefore(e.currentTarget.value.length)}
        placeholder={placeholder}
      />

            {/* Language status line: only shows while converting / translating */}
      {(langNote || translatingAll || working > 0) && (
        <div className={`lang-note ${converting ? 'is-busy' : ''}`}>
          <Icon name="globe" size={13} />
          <span>
            {translatingAll
              ? `Translating your text into ${langName}…`
              : langNote || `Converting to ${langName}…`}
          </span>
        </div>
      )}

      {/* ---------- Uploaded photos ---------- */}
      {hasPhotos && (
        <div className="stack8">
          <div className="upload-strip">
            {uploads.map((u, i) => (
              <div key={u.id} className={`upload-thumb ${u.uploading ? 'is-uploading' : ''} ${u.failed ? 'is-failed' : ''}`} title={u.failed ? 'Upload failed — remove and add again' : u.name}>
                <img src={u.preview || u.url} alt={`Photo ${i + 1}`} />
                <span className="upload-num">{i + 1}</span>
                <button className="upload-remove" aria-label={`Remove photo ${i + 1}`} onClick={() => onRemovePhoto(u.id)} disabled={busy}>
                  <Icon name="close" size={12} />
                </button>
              </div>
            ))}
            {!full && (
              <button className="upload-add" onClick={() => fileRef.current?.click()} aria-label="Add more photos" disabled={busy}>
                <Icon name="plus" size={18} />
              </button>
            )}
          </div>
          <div className="row-between">
            <span className="muted tiny">{hint}</span>
            <span className="muted tiny nowrap">
              {uploads.length} / {maxPhotos} photos ·{' '}
              <button className="text-btn tiny" onClick={onClearPhotos} disabled={busy}>Remove all</button>
            </span>
          </div>
        </div>
      )}

      {/* ---------- AI ideas for the photos ---------- */}
      {hasPhotos && (
        <div className="suggest-box">
          <div className="row-between">
            <span className="field-label row gap8"><Icon name="spark" size={14} /> Ideas for your photos</span>
            <button className="text-btn tiny" onClick={onRefreshSuggestions} disabled={suggestions.loading || photosUploading}>
              {suggestions.loading ? 'Thinking…' : 'New ideas'}
            </button>
          </div>

          {photosUploading && <span className="muted tiny">Uploading your photos… ideas will appear in a moment.</span>}
          {!photosUploading && suggestions.error && <span className="muted tiny">{suggestions.error}</span>}

          {suggestions.loading ? (
            <div className="suggest-grid">
              {[0, 1, 2, 3].map((i) => <div key={i} className="suggest-card skeleton" aria-hidden="true" />)}
            </div>
          ) : (
            suggestions.items.length > 0 && (
              <div className="suggest-grid">
                {suggestions.items.map((s, i) => (
                  <div key={i} className="suggest-card">
                    <strong className="small">{s.title}</strong>
                    <span className="muted tiny clamp3">{s.prompt}</span>
                    <div className="row gap8">
                      <button className="btn-ghost xs" onClick={() => onUseSuggestion(s)} disabled={busy}>Use idea</button>
                      <button className="btn-tint xs" onClick={() => onCreateSuggestion(s)} disabled={busy || photosUploading}>
                        {mode === 'image' ? 'Create image' : 'Create video'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {dragging && <div className="drop-hint">Drop your photos here</div>}

      <div className="prompt-actions">
        <button className="btn-tint" onClick={onImprove} disabled={improving || converting || prompt.trim().length < 3}>
          <Icon name="wand" size={16} />
          {improving ? 'Improving…' : 'Improve my prompt'}
        </button>
        <button className="btn-ghost" onClick={() => fileRef.current?.click()} disabled={full || busy} title={full ? `Maximum ${maxPhotos} photos` : 'You can pick several photos at once'}>
          <Icon name="upload" size={16} /> {hasPhotos ? 'Add more photos' : 'Add photos'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          hidden
          onChange={(e) => { pickFiles(e.target.files); e.target.value = ''; }}
        />
        <label className={`btn-ghost select-wrap ${language !== 'en' ? 'is-on' : ''}`} title="Language of the prompt box">
          <Icon name="globe" size={16} />
          <span className="sr-only">Prompt language</span>
          <select value={language} onChange={(e) => onLanguage(e.target.value)} disabled={converting}>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
          </select>
        </label>
        

        <div className="grow" />

        <button className="btn-primary" onClick={() => onGenerate()} disabled={!canGo}>
          {buttonText}
          <span className="cost-badge">{cost} credits</span>
        </button>
      </div>
    </section>
  );
}