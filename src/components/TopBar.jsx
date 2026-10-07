import { useEffect, useRef, useState } from 'react';
import Icon from './Icons.jsx';
import { useTheme } from '../data/theme.js';
import { IMAGE_CREDIT_EACH, VIDEO_CREDIT_PER_SEC_SILENT, VIDEO_CREDIT_PER_SEC_SOUND, LOW_CREDITS } from '../data/constants.js';

const timeAgo = (t) => {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(t).toLocaleDateString();
};
const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'U';

export default function TopBar({
  user, search, onSearch, searchResults, onPickResult,
  notifications, onReadAll, onClearNotifications, onOpenNotification,
  onEditName, onLogout,
}) {
  const [menu, setMenu] = useState(null); // 'credits' | 'bell' | 'profile' | null
  const [theme, toggleTheme] = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const rightRef = useRef(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;
  const low = user.credits < LOW_CREDITS;

  // Close menus when clicking outside them
  useEffect(() => {
    const onDown = (e) => {
      if (rightRef.current && !rightRef.current.contains(e.target)) setMenu(null);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Press "/" anywhere to jump to the search box
  useEffect(() => {
    const onKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (e.key === '/' && !typing) { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === 'Escape') setMenu(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggle = (name) => {
    setMenu((m) => (m === name ? null : name));
    if (name === 'bell' && menu !== 'bell' && unread) onReadAll();
    setEditing(false);
  };

  const saveName = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    const ok = await onEditName(newName.trim());
    setSaving(false);
    if (ok) setEditing(false);
  };

  const pick = (chatId) => {
    onPickResult(chatId);
    setSearchOpen(false);
  };

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-name">Aaryans Technology</span>
      </div>

      {/* ---------- Search ---------- */}
      <div className="search-wrap" ref={searchRef}>
        <label className="search">
          <Icon name="search" size={16} />
          <span className="sr-only">Search your chats and prompts</span>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => { onSearch(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { onSearch(''); setSearchOpen(false); e.currentTarget.blur(); }
              if (e.key === 'Enter' && searchResults[0]) pick(searchResults[0].chatId);
            }}
            placeholder="Search your images, videos and prompts"
          />
          {search ? (
            <button className="search-clear" aria-label="Clear search" onClick={() => { onSearch(''); inputRef.current?.focus(); }}>
              <Icon name="close" size={14} />
            </button>
          ) : (
            <span className="kbd-hint" aria-hidden="true">/</span>
          )}
        </label>

        {searchOpen && search.trim() && (
          <div className="dropdown search-results" role="listbox" aria-label="Search results">
            {searchResults.length === 0 ? (
              <div className="dd-empty">No chats match "{search.trim()}"</div>
            ) : (
              searchResults.map((r) => (
                <button key={r.chatId} role="option" aria-selected="false" className="dd-item" onClick={() => pick(r.chatId)}>
                  <Icon name={r.type} size={15} className={r.type === 'video' ? 'blue' : 'accent'} />
                  <span className="dd-text">
                    <strong className="ellipsis">{r.title}</strong>
                    {r.snippet && <span className="muted tiny ellipsis">{r.snippet}</span>}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="topbar-right" ref={rightRef}>
        {/* ---------- Credits ---------- */}
        <div className="menu-wrap">
          <button className={`credit-pill ${low ? 'low' : ''}`} onClick={() => toggle('credits')} aria-expanded={menu === 'credits'} aria-haspopup="true">
            <Icon name="coin" size={16} className="accent" />
            <span>{user.credits} credits</span>
          </button>
          {menu === 'credits' && (
            <div className="dropdown right credits-menu">
              <div className="dd-head">
                <span className="muted small">Your balance</span>
                <strong className="big-number">{user.credits} <span className="small muted">credits</span></strong>
                {low && <span className="warn small">Running low. Top up soon to keep creating.</span>}
              </div>
              <div className="dd-section">
                <span className="field-label">What things cost</span>
                <div className="price-row"><span>1 image</span><strong>{IMAGE_CREDIT_EACH}</strong></div>
                <div className="price-row"><span>1 sec video, no sound</span><strong>{VIDEO_CREDIT_PER_SEC_SILENT}</strong></div>
                <div className="price-row"><span>1 sec video with sound</span><strong>{VIDEO_CREDIT_PER_SEC_SOUND}</strong></div>
              </div>
              <button className="btn-primary sm full" disabled title="Payments are coming soon">Buy credits (coming soon)</button>
            </div>
          )}
        </div>

        {/* ---------- Dark / light theme ---------- */}
        <button
          className="icon-btn theme-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>

        {/* ---------- Notifications ---------- */}
        <div className="menu-wrap">
          <button className="icon-btn" aria-label={`Notifications${unread ? `, ${unread} new` : ''}`} onClick={() => toggle('bell')} aria-expanded={menu === 'bell'}>
            <Icon name="bell" />
            {unread > 0 && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
          </button>
          {menu === 'bell' && (
            <div className="dropdown right bell-menu">
              <div className="row-between dd-title">
                <strong>Notifications</strong>
                {notifications.length > 0 && <button className="text-btn small" onClick={onClearNotifications}>Clear all</button>}
              </div>
              {notifications.length === 0 ? (
                <div className="dd-empty">No notifications yet.</div>
              ) : (
                <div className="dd-list">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      className={`dd-note ${n.tone || ''}`}
                      onClick={() => { if (n.chatId) { onOpenNotification(n); setMenu(null); } }}
                      disabled={!n.chatId}
                    >
                      <span className={`dot ${n.tone || ''}`} aria-hidden="true" />
                      <span className="dd-text">
                        <span>{n.text}</span>
                        <span className="muted tiny">{timeAgo(n.time)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---------- Profile ---------- */}
        <div className="menu-wrap">
          <button className="avatar" aria-label="Your profile" onClick={() => toggle('profile')} aria-expanded={menu === 'profile'}>
            {initials(user.name)}
          </button>
          {menu === 'profile' && (
            <div className="dropdown right profile-menu">
              <div className="profile-head">
                <span className="avatar big" aria-hidden="true">{initials(user.name)}</span>
                <div className="min0 stack4">
                  {editing ? (
                    <form className="row gap8" onSubmit={saveName}>
                      <label className="sr-only" htmlFor="edit-name">Your name</label>
                      <input id="edit-name" className="input sm grow" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={60} autoFocus />
                      <button className="btn-ghost sm fit" type="submit" disabled={saving}>{saving ? '…' : 'Save'}</button>
                    </form>
                  ) : (
                    <strong className="ellipsis">{user.name}</strong>
                  )}
                  <span className="muted small ellipsis">{user.email}</span>
                </div>
              </div>

              <div className="dd-section">
                <div className="price-row"><span>Credits</span><strong className="accent">{user.credits}</strong></div>
                <div className="price-row"><span>Plan</span><strong>Free</strong></div>
                <div className="price-row"><span>Theme</span><strong>{theme === 'dark' ? 'Dark' : 'Light'}</strong></div>
                <div className="price-row"><span>Member since</span><strong>{new Date(user.createdAt).toLocaleDateString()}</strong></div>
              </div>

              <div className="dd-actions">
                {!editing && (
                  <button className="dd-item" onClick={() => { setNewName(user.name); setEditing(true); }}>
                    <Icon name="settings" size={15} /> Edit name
                  </button>
                )}
                <button className="dd-item" onClick={toggleTheme}>
                  <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} /> {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                </button>
                <button className="dd-item danger" onClick={onLogout}>
                  <Icon name="close" size={15} /> Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}