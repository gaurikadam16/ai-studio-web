import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import TopBar from './components/TopBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import PromptBox from './components/PromptBox.jsx';
import Results from './components/Results.jsx';
import BottomRow from './components/BottomRow.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import Icon from './components/Icons.jsx';
import { ViewerProvider } from './components/Lightbox.jsx';
import { TeaStallScene, SCENE_PALETTES } from './components/SceneArt.jsx';
import { improvePrompt, generateImages, startVideo, getVideoStatus, uploadPhoto, updateMe, getSuggestions, translateText } from './api/client.js';
import { languageName, needsTranslation, hasDevanagari } from './data/languages.js';
import { IMAGE_CREDIT_EACH, VIDEO_CREDIT_PER_SEC_SOUND, VIDEO_CREDIT_PER_SEC_SILENT, LOW_CREDITS, IMAGE_SIZES, VIDEO_SHAPES, VIDEO_LENGTHS, MAX_IMAGE_PHOTOS, MAX_VIDEO_PHOTOS, DEFAULT_CHARACTERS, EMPTY_BRAND_KIT, STYLE_PROMPTS, CAMERA_PROMPTS } from './data/constants.js';
import { loadChats, saveChats, makeTitle, usePersistentState, allResults } from './data/storage.js';
import GalleryPage from './pages/GalleryPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import TemplatesPage from './pages/TemplatesPage.jsx';
import PromptLibraryPage from './pages/PromptLibraryPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import BrandKitPage, { brandText } from './pages/BrandKitPage.jsx';
import CharactersPage from './pages/CharactersPage.jsx';

const DEFAULT_SETTINGS = {
  // image
  style: 'Realistic', size: 'square', count: 4, negative: '', brandKit: false,
  // video (normal wide video by default)
  length: 5, shape: 'landscape', camera: 'Zoom in', music: false,
};

const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

// Old sample videos (no jobId) can't continue after a refresh. Real ones (with jobId) keep going.
function fixUnfinishedVideos(chats) {
  return chats.map((c) => ({
    ...c,
    generations: c.generations.map((g) =>
      g.status === 'running' && !g.jobId ? { ...g, status: 'failed', error: 'Stopped because the page was closed.' } : g
    ),
  }));
}

/**
 * The whole creative studio for ONE logged-in user.
 * App.jsx shows the login screen first, then this.
 */
export default function Studio({ user, setUser, onLogout, isNewUser }) {
  const uid = user.id;
  const [page, setPage] = useState('home');
  const [mode, setMode] = useState('image');
  const [prompt, setPrompt] = useState('');
  // Prompt language (English / हिंदी / मराठी), remembered for each user
  const [language, setLanguage] = usePersistentState(`ai-studio-language:${user.id}`, 'en');
  const [translatingAll, setTranslatingAll] = useState(false);
  // Photos you added (for images: references, for videos: first frame or references)
  // Each photo: { id, name, file?, preview, url? }  (url = after it is uploaded to the AI service)
  const [uploads, setUploads] = useState([]);
  const maxPhotos = mode === 'image' ? MAX_IMAGE_PHOTOS : MAX_VIDEO_PHOTOS;
  const [search, setSearch] = useState('');

  // Credits live on the server; we show the latest number it sent us
  const credits = user.credits;
  const setCredits = useCallback((value) => {
    if (typeof value === 'number') setUser((u) => ({ ...u, credits: value }));
  }, [setUser]);
  const [loading, setLoading] = useState(false);   // images being made
  const [starting, setStarting] = useState(false); // video being started
  const [improving, setImproving] = useState(false);
  // ---- Saved in the browser (stay after refresh), separately for each user
  const [favorites, setFavorites] = usePersistentState(`ai-studio-favorites:${uid}`, []);
  const [projects, setProjects] = usePersistentState(`ai-studio-projects:${uid}`, []);
  const [brandKit, setBrandKit] = usePersistentState(`ai-studio-brandkit:${uid}`, EMPTY_BRAND_KIT);
  const [characters, setCharacters] = usePersistentState(`ai-studio-characters:${uid}`, DEFAULT_CHARACTERS);
  const [savedSettings, setSettings] = usePersistentState(`ai-studio-settings:${uid}`, DEFAULT_SETTINGS);
  const settings = { ...DEFAULT_SETTINGS, ...savedSettings }; // new options get their default value
  if (!VIDEO_LENGTHS.includes(settings.length)) settings.length = 5; // old 4/6/8 values -> 5
  const hasBrandKit = Boolean(brandKit.name || brandKit.tone || brandKit.keywords);
  const [compareMode, setCompareMode] = useState(false);
  const [compare, setCompare] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [pendingRun, setPendingRun] = useState(null); // "Create now" from the Prompt Library
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = usePersistentState(`ai-studio-notifications:${uid}`, []);

  // Clear old saved "character" and "voice-over" choices (those options were removed)
  useEffect(() => {
    if (savedSettings.character || savedSettings.voice) {
      setSettings((s) => ({ ...s, character: null, voice: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Chat history (real, saved in the browser)
  const [chats, setChats] = useState(() => fixUnfinishedVideos(loadChats(uid)));
  const [activeChatId, setActiveChatId] = useState(null); // null = new, empty chat
  const [projectId, setProjectId] = useState(null); // project the open chat belongs to (null = none)
  const [openProjectId, setOpenProjectId] = useState(null); // project shown on the Projects page
  const [shownGenId, setShownGenId] = useState(null);

  useEffect(() => { saveChats(uid, chats); }, [uid, chats]); // save after every change

  // After a refresh, keep checking videos that were still being made
  useEffect(() => {
    const running = chats.flatMap((c) =>
      c.generations
        .filter((g) => g.type === 'video' && g.status === 'running' && g.jobId)
        .map((g) => ({ id: g.jobId, chatId: c.id, genId: g.id, title: `${makeTitle(g.prompt)} · ${g.settings?.length || ''} sec`, status: 'running', progress: 5 }))
    );
    if (running.length) setJobs(running);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const currentProject = projects.find((p) => p.id === projectId) || null;
  const history = activeChat ? activeChat.generations : [];
  const shownGen = history.find((g) => g.id === shownGenId) || history[history.length - 1] || null;

  const set = (patch) => setSettings((s) => ({ ...s, ...patch }));
  const toggleFavorite = (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  // What we send to the AI = your words + EVERY setting turned into words.
  // (History keeps only your own words; the full version is saved as finalPrompt.)
  const buildPrompt = (text) => {
    if (!text) return '';
    const parts = [text];
    if (mode === 'image') {
      parts.push(STYLE_PROMPTS[settings.style]);
      if (settings.brandKit && hasBrandKit) parts.push(brandText(brandKit));
      if (settings.negative.trim()) parts.push(`Avoid: ${settings.negative.trim()}`);
    } else {
      parts.push(CAMERA_PROMPTS[settings.camera]);
      parts.push(settings.shape === 'vertical' ? 'vertical 9:16 video for Reels' : 'wide 16:9 video');
      if (settings.music) parts.push('with background music');
    }
    return parts.filter(Boolean).join('. ');
  };

  // Video cost depends on length + whether it has sound (music ON = sound)
  const videoSound = Boolean(settings.music);
  const videoSeconds = settings.length;

  // A snapshot of the settings used, saved with each result
  const imageSnapshot = () => ({
    style: settings.style,
    size: settings.size,
    count: settings.count,
    photoCount: uploads.length,
    negative: settings.negative.trim(),
    brandColors: settings.brandKit && hasBrandKit ? brandKit.colors : null,
  });
  const videoSnapshot = () => ({
    length: videoSeconds,
    shape: settings.shape,
    camera: settings.camera,
    music: settings.music,
    photoCount: uploads.length,
    startFrom: uploads.length ? 'photo' : 'text', // used by the tags under results
  });

  // Opening an old result puts its settings back in the panel
  const restoreSettings = (gen) => {
    const g = gen?.settings;
    if (!g) return;
    if (gen.type === 'image') {
      set({
        ...(g.style && { style: g.style }),
        ...(g.size && { size: g.size }),
        ...(g.count && { count: g.count }),
        negative: g.negative || '',
        brandKit: Boolean(g.brandColors),
      });
    } else {
      set({
        ...(VIDEO_LENGTHS.includes(g.length) && { length: g.length }),
        ...(g.shape && { shape: g.shape }),
        ...(g.camera && { camera: g.camera }),
        music: Boolean(g.music),
      });
    }
  };

  const showToast = useCallback((msg, tone = 'info') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ---- Photos: add / remove. Each photo uploads by itself right after you add it.
  const addPhotos = (files) => {
    const ok = [];
    for (const f of files) {
      if (!/^image\/(png|jpeg|webp)$/.test(f.type)) { showToast(`"${f.name}" is not a PNG, JPG or WEBP image.`, 'error'); continue; }
      if (f.size > 20 * 1024 * 1024) { showToast(`"${f.name}" is bigger than 20 MB.`, 'error'); continue; }
      ok.push({ id: newId('photo'), name: f.name, file: f, preview: URL.createObjectURL(f) });
    }
    setUploads((list) => {
      const room = maxPhotos - list.length;
      if (ok.length > room) showToast(`You can add up to ${maxPhotos} photos here. Extra photos were skipped.`, 'error');
      return [...list, ...ok.slice(0, Math.max(room, 0))];
    });
  };
  const removePhoto = (id) => setUploads((list) => list.filter((u) => u.id !== id));
  const clearPhotos = () => setUploads([]);

  // Upload waiting photos one by one in the background (needed for ideas + generating)
  useEffect(() => {
    if (uploads.some((u) => u.uploading)) return; // one at a time
    const next = uploads.find((u) => !u.url && !u.failed);
    if (!next) return;
    setUploads((all) => all.map((x) => (x.id === next.id ? { ...x, uploading: true } : x)));
    uploadPhoto(next.file)
      .then(({ url }) => setUploads((all) => all.map((x) => (x.id === next.id ? { ...x, url, uploading: false } : x))))
      .catch((e) => {
        setUploads((all) => all.map((x) => (x.id === next.id ? { ...x, uploading: false, failed: true } : x)));
        showToast(`"${next.name}" didn't upload: ${e.message}`, 'error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploads]);

  const readyUrls = uploads.filter((u) => u.url).map((u) => u.url);
  const photosUploading = uploads.some((u) => u.uploading || (!u.url && !u.failed));

  // ---- AI ideas for your photos (asked again when photos, Image/Video mode or language change)
  const [suggestions, setSuggestions] = useState({ key: '', items: [], loading: false, error: '' });
  const suggestKey = `${mode}|${readyUrls.join(',')}|${language}`;
  const loadSuggestions = useCallback(async (key, force = false) => {
    const [m, urlList, lang] = key.split('|');
    const urls = urlList ? urlList.split(',') : [];
    if (!urls.length) { setSuggestions({ key: '', items: [], loading: false, error: '' }); return; }
    if (m === 'video' && urls.length > MAX_VIDEO_PHOTOS) {
      setSuggestions({ key, items: [], loading: false, error: `Videos use up to ${MAX_VIDEO_PHOTOS} photos. Remove some to get ideas.` });
      return;
    }
    setSuggestions((s) => (s.key === key && s.items.length && !force ? s : { key, items: [], loading: true, error: '' }));
    try {
      const { suggestions: items } = await getSuggestions(m, urls, '', lang);
      setSuggestions((s) => (s.key === key ? { key, items, loading: false, error: '' } : s));
    } catch (e) {
      setSuggestions((s) => (s.key === key ? { key, items: [], loading: false, error: e.message } : s));
    }
  }, []);
  useEffect(() => {
    if (photosUploading || suggestKey === suggestions.key) return;
    const t = setTimeout(() => loadSuggestions(suggestKey), 500); // small wait in case more photos are coming
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestKey, photosUploading]);

  // Default words when you press Generate with photos but no text
  const defaultPhotoPrompt = () => {
    if (mode === 'image') {
      return uploads.length > 1
        ? 'Combine these photos into one beautiful, natural-looking, high quality image'
        : 'Make a beautiful, professional, high quality version of this photo';
    }
    return uploads.length > 1
      ? 'Bring the people and objects from these photos together in one natural, cinematic scene'
      : 'Bring this photo to life with natural, smooth, cinematic motion';
  };

  // ---- Language: switching it translates what is already in the box
  const changeLanguage = async (code) => {
    setLanguage(code);
    const current = prompt.trim();
    if (!current || !needsTranslation(current, code)) return;
    setTranslatingAll(true);
    try {
      const { text } = await translateText(current, code);
      setPrompt(text);
      showToast(`Your text was translated into ${languageName(code)}.`);
    } catch (e) {
      showToast(`Couldn't translate: ${e.message}`, 'error');
    } finally {
      setTranslatingAll(false);
    }
  };

  // The image/video AIs understand English best, so हिंदी/मराठी words are translated before sending
  const toEnglish = async (text) => {
    if (!hasDevanagari(text)) return text;
    try {
      return (await translateText(text, 'en')).text || text;
    } catch {
      return text; // if translation fails, send the original words
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    showToast('Settings reset.');
  };

  const cost = mode === 'image'
    ? settings.count * IMAGE_CREDIT_EACH
    : videoSeconds * (videoSound ? VIDEO_CREDIT_PER_SEC_SOUND : VIDEO_CREDIT_PER_SEC_SILENT);

  // ---- Notifications (bell in the top bar), newest first, max 30
  const notify = useCallback((text, tone = 'info', chatId = null) => {
    setNotifications((list) => [{ id: newId('note'), text, tone, chatId, time: Date.now(), read: false }, ...list].slice(0, 30));
  }, [setNotifications]);

  // Welcome message for brand-new accounts (the ref stops it appearing twice)
  const welcomed = useRef(false);
  useEffect(() => {
    if (isNewUser && !welcomed.current) {
      welcomed.current = true;
      notify(`Welcome, ${user.name.split(' ')[0]}! You have ${user.credits} free credits to start creating.`, 'success');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn once when credits drop below the low mark
  const wasLow = useRef(credits < LOW_CREDITS);
  useEffect(() => {
    const low = credits < LOW_CREDITS;
    if (low && !wasLow.current) notify(`Your credits are low (${credits} left).`, 'warn');
    wasLow.current = low;
  }, [credits, notify]);

  // ---- Edit your name (profile menu)
  const editName = async (name) => {
    try {
      const { user: updated } = await updateMe(name);
      setUser((u) => ({ ...u, name: updated.name }));
      showToast('Name updated.');
      return true;
    } catch (e) {
      showToast(e.message, 'error');
      return false;
    }
  };

  /**
   * Save one generation into a chat.
   * If chatId is null, a NEW chat is created and named from the prompt.
   * Returns the chat id used.
   */
  const addGeneration = (chatId, gen) => {
    const id = chatId || newId('chat');
    const now = Date.now();
    setChats((list) => {
      const existing = list.find((c) => c.id === id);
      if (existing) {
        const updated = { ...existing, updatedAt: now, generations: [...existing.generations, gen] };
        return [updated, ...list.filter((c) => c.id !== id)];
      }
      const created = { id, title: makeTitle(gen.prompt), type: gen.type, createdAt: now, updatedAt: now, generations: [gen] };
      return [created, ...list];
    });
    return id;
  };

  const updateGeneration = (chatId, genId, patch) => {
    setChats((list) =>
      list.map((c) =>
        c.id !== chatId ? c : { ...c, generations: c.generations.map((g) => (g.id === genId ? { ...g, ...patch } : g)) }
      )
    );
  };

  // ---- New chat (button + Ctrl/Cmd K)
  const newChat = useCallback(() => {
    setActiveChatId(null);
    setProjectId(null);
    setShownGenId(null);
    setPrompt('');
    setCompare([]);
    setCompareMode(false);
    setUploads([]);
    setPage('home');
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); newChat(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [newChat]);

  // ---- Projects: start a new chat that belongs to a project
  const newChatInProject = (pid, type) => {
    newChat();
    setProjectId(pid);
    setMode(type);
  };

  // Put a chat inside the current project (only once)
  const linkChatToProject = (pid, chatId) => {
    if (!pid) return;
    setProjects((list) =>
      list.map((p) => (p.id === pid && !p.chatIds.includes(chatId) ? { ...p, chatIds: [...p.chatIds, chatId] } : p))
    );
  };

  const backToProject = () => {
    setOpenProjectId(projectId);
    setPage('projects');
  };

  // ---- Open a chat from history (optionally a specific result inside it)
  const openChat = (chatId, genId) => {
    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return;
    const gen = chat.generations.find((g) => g.id === genId) || chat.generations[chat.generations.length - 1];
    setActiveChatId(chat.id);
    setProjectId(projects.find((p) => p.chatIds.includes(chat.id))?.id || null);
    setShownGenId(gen?.id || null);
    setMode(gen?.type || chat.type);
    setPrompt(gen?.prompt || '');
    restoreSettings(gen);
    setUploads([]);
    setCompare([]);
    setCompareMode(false);
    setPage('home');
  };

  const deleteChat = (chat) => {
    if (!window.confirm(`Delete "${chat.title}"? This can't be undone.`)) return;
    setChats((list) => list.filter((c) => c.id !== chat.id));
    setProjects((list) => list.map((p) => ({ ...p, chatIds: p.chatIds.filter((id) => id !== chat.id) })));
    if (chat.id === activeChatId) newChat();
    showToast('Chat deleted.');
  };

  const pickHistory = (genId) => {
    const gen = history.find((g) => g.id === genId);
    if (!gen) return;
    setShownGenId(gen.id);
    setMode(gen.type);
    setPrompt(gen.prompt);
    restoreSettings(gen);
    setCompare([]);
  };

  // ---- Actions
  const handleImprove = async () => {
    setImproving(true);
    try {
      const { prompt: better } = await improvePrompt(prompt, mode, readyUrls, language);
      setPrompt(better);
    } catch (e) {
      showToast(`Couldn't improve the prompt: ${e.message}`, 'error');
    } finally {
      setImproving(false);
    }
  };

  // overrideText: used by "Create" on an idea card / Prompt Library (generates right away with that text)
  const handleGenerate = async (overrideText) => {
    const typed = (typeof overrideText === 'string' ? overrideText : prompt).trim();
    if (typed.length < 3 && !uploads.length) { showToast('Describe your idea in a few words, or add photos.', 'error'); return; }
    if (photosUploading) { showToast('Your photos are still uploading. Try again in a moment.', 'error'); return; }
    if (uploads.some((u) => u.failed)) { showToast('A photo failed to upload. Remove it (✕) and add it again.', 'error'); return; }
    const text = typed.length >= 3 ? typed : defaultPhotoPrompt(); // photos only -> sensible default words

    // The words talk about "photo 1/2…" but no photo is attached -> the AI would refuse
    if (!uploads.length && /\bphoto\s*\d\b|फोटो\s*\d/i.test(text)) {
      showToast('Your text mentions "photo 1", but no photo is added. Add the photo first, or change the words.', 'error');
      return;
    }

    if (credits < cost) { showToast(`This needs ${cost} credits, but you have ${credits}.`, 'error'); return; }
    const chatIdAtStart = activeChatId; // remember which chat this belongs to
    const projectAtStart = projectId;   // ...and which project

    // ---------------- IMAGES ----------------
    if (mode === 'image') {
      setLoading(true);
      setCompare([]);
      try {
        const size = IMAGE_SIZES.find((z) => z.id === settings.size);
        const finalPrompt = buildPrompt(await toEnglish(text));
        const imageUrls = readyUrls;
        const { images, description, credits: left } = await generateImages({
          prompt: finalPrompt,
          count: settings.count,
          aspectRatio: size.ratio,
          imageUrls,
        });
        const gen = {
          id: newId('gen'), type: 'image', prompt: text, finalPrompt, description, status: 'done', createdAt: Date.now(),
          settings: imageSnapshot(),
          photos: imageUrls, // the photos you used, kept with the result
          results: images,
        };
        const chatId = addGeneration(chatIdAtStart, gen);
        linkChatToProject(projectAtStart, chatId);
        setActiveChatId(chatId);
        setShownGenId(gen.id);
        setCredits(left); // the server already took the credits
      } catch (e) {
        setCredits(e.credits);
        showToast(`Images didn't generate: ${e.message}`, 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    // ---------------- VIDEOS ----------------
    if (uploads.length > MAX_VIDEO_PHOTOS) {
      showToast(`Videos can use up to ${MAX_VIDEO_PHOTOS} photos. Remove ${uploads.length - MAX_VIDEO_PHOTOS} and try again.`, 'error');
      return;
    }
    setStarting(true);
    try {
      const finalPrompt = buildPrompt(await toEnglish(text));
      const shape = VIDEO_SHAPES.find((v) => v.id === settings.shape);

      // Photos: 0 = video from text, 1 = first frame, 2–4 = references
      const imageUrls = readyUrls;

      const { jobId, credits: left } = await startVideo({
        prompt: finalPrompt,
        length: videoSeconds,
        aspectRatio: shape.ratio,
        sound: videoSound, // Kling makes sound (music, effects) when this is on
        imageUrls,
      });
      const gen = {
        id: newId('gen'), type: 'video', prompt: text, finalPrompt, jobId, status: 'running', createdAt: Date.now(),
        settings: videoSnapshot(),
        photos: imageUrls,
        results: [],
      };
      const chatId = addGeneration(chatIdAtStart, gen);
      linkChatToProject(projectAtStart, chatId);
      setActiveChatId(chatId);
      setShownGenId(gen.id);
      setJobs((j) => [{ id: jobId, chatId, genId: gen.id, title: `${makeTitle(text)} · ${videoSeconds} sec`, status: 'running', progress: 5 }, ...j]);
      setCredits(left); // the server already took the credits
      showToast('Video started. It takes 1–4 minutes. You can keep working meanwhile.');
    } catch (e) {
      setCredits(e.credits);
      showToast(`Video didn't start: ${e.message}`, 'error');
    } finally {
      setStarting(false);
    }
  };

  // Templates page: start a fresh chat with the template filled in
  const applyTemplate = (t) => {
    newChat();
    setMode(t.mode);
    setPrompt(t.prompt);
    if (t.size) set({ size: t.size });
    if (t.style) set({ style: t.style });
    showToast(`"${t.label}" is ready. Change the words if you like, then press Generate.`);
  };

  // "Make video" on an image result: that image becomes the video's first frame
  const handleMakeVideo = (result) => {
    setUploads([{ id: newId('photo'), name: 'Picked result', preview: result.url, url: result.url }]);
    setMode('video');
    showToast('Image added as the first frame. Describe the motion and press Generate video.');
  };

  // Prompt Library: fill the editor with the expert prompt + its best settings ("Create now" also generates)
  const applyLibraryPrompt = (t, text, run) => {
    newChat();
    setMode(t.mode);
    set(t.settings || {});
    setPrompt(text);
    if (t.photos === 'required') {
      showToast(`${t.photoHint} Then press Generate.`);
    } else if (run) {
      setPendingRun({ mode: t.mode, text }); // generates as soon as the editor is ready (see below)
    } else {
      showToast('Prompt ready. Change anything you like, then press Generate.');
    }
  };

  const handleCompare = (arg) => {
    if (arg === 'toggle-mode') {
      setCompareMode((m) => !m);
      setCompare([]);
      if (!compareMode) showToast('Tap two results to compare them.');
      return;
    }
    if (!compareMode) return;
    setCompare((c) => (c.includes(arg) ? c.filter((x) => x !== arg) : c.length < 2 ? [...c, arg] : [c[1], arg]));
  };

  // ---- Check running videos every 5 seconds
  const runningKey = jobs.filter((j) => j.status === 'running').map((j) => j.id).join(',');
  useEffect(() => {
    if (!runningKey) return;
    const t = setInterval(async () => {
      for (const job of jobs.filter((j) => j.status === 'running')) {
        try {
          const s = await getVideoStatus(job.id);
          setJobs((list) => list.map((j) => (j.id === job.id ? { ...j, status: s.status, progress: s.progress ?? j.progress } : j)));
          if (s.status === 'done') {
            updateGeneration(job.chatId, job.genId, { status: 'done', results: [{ id: newId('vid'), url: s.url }] });
            showToast('Your video is ready.');
            notify(`Your video is ready: ${job.title}`, 'success', job.chatId);
          }
          if (s.status === 'failed') {
            updateGeneration(job.chatId, job.genId, { status: 'failed', error: s.error });
            setCredits(s.credits); // refunded by the server
            showToast(`A video failed: ${s.error}`, 'error');
            notify(`A video failed: ${job.title}. Credits were returned.`, 'error', job.chatId);
          }
        } catch {
          /* network hiccup: try again next round */
        }
      }
    }, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runningKey]);

  // ---- "Create now" from the Prompt Library: run once the editor shows the right mode
  useEffect(() => {
    if (!pendingRun || page !== 'home' || mode !== pendingRun.mode) return;
    const text = pendingRun.text;
    setPendingRun(null);
    handleGenerate(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRun, page, mode]);

  // ---- Every finished result (for Gallery, Favorites, Projects) and the 5 newest for Recent
  const items = useMemo(() => allResults(chats), [chats]);
  const recent = useMemo(() => items.filter((it) => it.index === 0).slice(0, 5).map((it) => ({ ...it, id: it.genId })), [items]);

  // ---- Search box results: chats whose title or any prompt matches
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return chats
      .map((c) => {
        const hit = c.generations.find((g) => g.prompt.toLowerCase().includes(q));
        const titleHit = c.title.toLowerCase().includes(q);
        if (!hit && !titleHit) return null;
        return { chatId: c.id, title: c.title, type: c.type, snippet: hit && hit.prompt !== c.title ? hit.prompt : '' };
      })
      .filter(Boolean)
      .slice(0, 8);
  }, [chats, search]);

  const shownJob = shownGen ? jobs.find((j) => j.genId === shownGen.id) : null;
  const compareItems = (shownGen?.results || []).filter((r) => compare.includes(r.id));

  return (
    <ViewerProvider favorites={favorites} onToggleFavorite={toggleFavorite} onOpenChat={openChat}>
      <div className="app">
        <TopBar
          user={user}
          search={search}
          onSearch={setSearch}
          searchResults={searchResults}
          onPickResult={(chatId) => { openChat(chatId); setSearch(''); }}
          notifications={notifications}
          onReadAll={() => setNotifications((list) => list.map((n) => ({ ...n, read: true })))}
          onClearNotifications={() => setNotifications([])}
          onOpenNotification={(n) => openChat(n.chatId)}
          onEditName={editName}
          onLogout={onLogout}
        />

        <div className="body">
          <Sidebar
            page={page}
            onNavigate={setPage}
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={(id) => openChat(id)}
            onDeleteChat={deleteChat}
            onNewChat={newChat}
            credits={credits}
            topSearch={search}
          />

          <main className="main">
            {page === 'home' && (
              <>
                <div className="heading-row">
                  <div className="min0">
                    {currentProject ? (
                      <div className="project-badge">
                        <Icon name="folder" size={14} />
                        <span className="ellipsis">Project: {currentProject.name}</span>
                        <button className="text-btn" onClick={backToProject}>View project</button>
                      </div>
                    ) : (
                      <div className="muted">{greeting()}, {user.name.split(' ')[0]}</div>
                    )}
                    <h1 className="h1">
                      {activeChat ? activeChat.title : currentProject ? `New ${mode} in ${currentProject.name}` : 'What do you want to create today?'}
                    </h1>
                  </div>
                  <div className="mode-switch" role="tablist" aria-label="Creation type">
                    <button role="tab" aria-selected={mode === 'image'} className={mode === 'image' ? 'on' : ''} onClick={() => setMode('image')}>
                      <Icon name="image" size={17} /> Image
                    </button>
                    <button role="tab" aria-selected={mode === 'video'} className={mode === 'video' ? 'on' : ''} onClick={() => setMode('video')}>
                      <Icon name="video" size={17} /> Video
                    </button>
                  </div>
                </div>

                <PromptBox
                  mode={mode}
                  prompt={prompt}
                  onPrompt={setPrompt}
                  onImprove={handleImprove}
                  improving={improving}
                  onGenerate={handleGenerate}
                  busy={loading || starting}
                  cost={cost}
                  count={settings.count}
                  language={language}
                  onLanguage={changeLanguage}
                  translatingAll={translatingAll}
                  uploads={uploads}
                  onAddPhotos={addPhotos}
                  onRemovePhoto={removePhoto}
                  onClearPhotos={clearPhotos}
                  maxPhotos={maxPhotos}
                  suggestions={suggestions}
                  onUseSuggestion={(sg) => { setPrompt(sg.prompt); showToast('Idea added. Change the words if you like, then press Generate.'); }}
                  onCreateSuggestion={(sg) => { setPrompt(sg.prompt); handleGenerate(sg.prompt); }}
                  onRefreshSuggestions={() => loadSuggestions(suggestKey, true)}
                />

                <Results
                  generation={shownGen}
                  history={history}
                  onPickHistory={pickHistory}
                  loading={loading}
                  loadingSettings={settings}
                  favorites={favorites}
                  onFavorite={toggleFavorite}
                  onMakeVideo={handleMakeVideo}
                  onRegenerate={() => handleGenerate()}
                  compare={compareMode ? compare : []}
                  compareMode={compareMode}
                  onCompare={handleCompare}
                  jobProgress={shownJob?.progress}
                />

                <BottomRow recent={recent} jobs={jobs} onOpen={openChat} />
              </>
            )}

            {page === 'gallery' && (
              <GalleryPage items={items} favorites={favorites} onToggleFavorite={toggleFavorite} onOpen={openChat} onGoHome={() => setPage('home')} />
            )}
            {page === 'projects' && (
              <ProjectsPage
                projects={projects}
                setProjects={setProjects}
                chats={chats}
                items={items}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onOpen={openChat}
                onOpenChat={(id) => openChat(id)}
                openId={openProjectId}
                setOpenId={setOpenProjectId}
                onNewChatInProject={newChatInProject}
              />
            )}
            {page === 'templates' && <TemplatesPage onUse={applyTemplate} />}
            {page === 'prompts' && <PromptLibraryPage userId={uid} onUse={applyLibraryPrompt} />}
            {page === 'favorites' && (
              <FavoritesPage items={items} favorites={favorites} onToggleFavorite={toggleFavorite} onOpen={openChat} />
            )}
            {page === 'brand' && <BrandKitPage brandKit={brandKit} setBrandKit={setBrandKit} onGoHome={() => setPage('home')} />}
            {page === 'characters' && <CharactersPage characters={characters} setCharacters={setCharacters} />}
          </main>

          {page === 'home' && (
            <SettingsPanel
              mode={mode}
              s={settings}
              set={set}
              cost={cost}
              hasBrandKit={hasBrandKit}
              onNavigate={setPage}
              onReset={resetSettings}
              finalPrompt={buildPrompt(prompt.trim() || (uploads.length ? defaultPhotoPrompt() : ''))}
              photoCount={uploads.length}
            />
          )}
        </div>

        {compareItems.length === 2 && (
          <div className="modal-back" onClick={() => setCompare([])}>
            <div className="modal" role="dialog" aria-label="Compare results" onClick={(e) => e.stopPropagation()}>
              <div className="row-between">
                <h2 className="h2">Compare side by side</h2>
                <button className="icon-btn sm" aria-label="Close" onClick={() => setCompare([])}><Icon name="close" size={16} /></button>
              </div>
              <div className="compare-grid">
                {compareItems.map((r) => (
                  <div key={r.id} className="stack10">
                    <div className="compare-tile">
                      {r.url ? <img src={r.url} alt="" /> : <TeaStallScene p={SCENE_PALETTES[r.paletteIndex ?? 0]} />}
                    </div>
                    <button className="btn-primary" onClick={() => { setFavorites((f) => [...new Set([...f, r.id])]); setCompare([]); setCompareMode(false); showToast('Saved to Favorites.'); }}>
                      Keep this one
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {toast && <div className={`toast ${toast.tone}`} role="status">{toast.msg}</div>}
      </div>
    </ViewerProvider>
  );
}