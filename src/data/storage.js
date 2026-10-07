import { useEffect, useState } from 'react';

// Saves each user's chat history in this browser (localStorage), so it stays after refresh.
// Every user gets their own copy: the key ends with the user's id.

const CHATS_KEY = 'ai-studio-chats-v1';
const userKey = (base, userId) => `${base}:${userId}`;

export function loadChats(userId) {
  try {
    const raw = localStorage.getItem(userKey(CHATS_KEY, userId));
    const chats = raw ? JSON.parse(raw) : [];
    return Array.isArray(chats) ? chats : [];
  } catch {
    return []; // storage blocked or broken data -> start fresh
  }
}

export function saveChats(userId, chats) {
  try {
    localStorage.setItem(userKey(CHATS_KEY, userId), JSON.stringify(chats));
  } catch {
    // storage full or blocked -> the app still works, it just won't remember
  }
}

// Data saved BEFORE accounts existed is given to the first person who logs in on this browser.
const LEGACY_KEYS = [CHATS_KEY, 'ai-studio-favorites', 'ai-studio-projects', 'ai-studio-brandkit', 'ai-studio-characters', 'ai-studio-settings'];
export function moveOldDataToUser(userId) {
  try {
    for (const base of LEGACY_KEYS) {
      const old = localStorage.getItem(base);
      if (old !== null && localStorage.getItem(userKey(base, userId)) === null) {
        localStorage.setItem(userKey(base, userId), old);
      }
      localStorage.removeItem(base); // only the first user gets the old data
    }
  } catch {
    /* storage blocked */
  }
}

// "Today", "Yesterday", "Previous 7 days", "Previous 30 days", "Older"
export function groupLabel(time) {
  const d = new Date(time);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  if (d >= today) return 'Today';
  if (d >= today - dayMs) return 'Yesterday';
  if (d >= today - 7 * dayMs) return 'Previous 7 days';
  if (d >= today - 30 * dayMs) return 'Previous 30 days';
  return 'Older';
}

// Chat title from the first prompt: first 6 words, first letter capital
export function makeTitle(prompt) {
  const words = prompt.trim().replace(/\s+/g, ' ').split(' ').slice(0, 6).join(' ');
  const title = words.charAt(0).toUpperCase() + words.slice(1);
  return title.length > 50 ? `${title.slice(0, 47)}...` : title || 'Untitled chat';
}

// ---------------------------------------------------------------------------
// Same idea for other things: favorites, projects, brand kit, characters.
// usePersistentState works like useState, but also saves to the browser.

export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked */
    }
  }, [key, value]);

  return [value, setValue];
}

// Every finished result from every chat, newest first (used by Gallery, Favorites, Recent)
export function allResults(chats) {
  return chats
    .flatMap((c) =>
      c.generations
        .filter((g) => g.status === 'done')
        .flatMap((g) =>
          g.results.map((r, i) => ({
            ...r,
            chatId: c.id,
            chatTitle: c.title,
            genId: g.id,
            type: g.type,
            prompt: g.prompt,
            createdAt: g.createdAt,
            index: i,
          }))
        )
    )
    .sort((a, b) => b.createdAt - a.createdAt);
}