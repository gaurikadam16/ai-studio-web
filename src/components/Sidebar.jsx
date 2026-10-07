import { useState } from 'react';
import Icon from './Icons.jsx';
import { TOTAL_CREDITS } from '../data/constants.js';
import { groupLabel } from '../data/storage.js';

const NAV = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'gallery', label: 'My Gallery', icon: 'gallery' },
  { id: 'projects', label: 'Projects', icon: 'folder' },
  { id: 'templates', label: 'Templates', icon: 'template' },
  { id: 'prompts', label: 'Prompt Library', icon: 'wand' },
  { id: 'favorites', label: 'Favorites', icon: 'heart' },
  { id: 'brand', label: 'Brand Kit', icon: 'palette' },
];

function ChatRow({ chat, active, onSelect, onDelete }) {
  return (
    <div className={`chat-row ${active ? 'is-active' : ''}`}>
      <button className="chat-open" onClick={() => onSelect(chat.id)} title={chat.title}>
        <Icon name={chat.type} size={14} strokeWidth={2.2} className={chat.type === 'video' ? 'blue' : 'accent'} />
        <span className="ellipsis">{chat.title}</span>
      </button>
      <button className="chat-delete" aria-label={`Delete chat: ${chat.title}`} onClick={() => onDelete(chat)}>
        <Icon name="close" size={12} />
      </button>
    </div>
  );
}

export default function Sidebar({ page, onNavigate, chats, activeChatId, onSelectChat, onDeleteChat, onNewChat, credits, topSearch }) {
  const [historyOpen, setHistoryOpen] = useState(true);
  const [filter, setFilter] = useState('all'); // all | image | video
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Search matches the chat title OR any prompt used inside the chat
  const text = (query || topSearch).trim().toLowerCase();
  const visible = chats.filter((c) => {
    if (filter !== 'all' && c.type !== filter) return false;
    if (!text) return true;
    return c.title.toLowerCase().includes(text) || c.generations.some((g) => g.prompt.toLowerCase().includes(text));
  });

  // Newest first, then split into Today / Yesterday / Previous 7 days ...
  const sorted = [...visible].sort((a, b) => b.updatedAt - a.updatedAt);
  const groups = [];
  for (const chat of sorted) {
    const label = groupLabel(chat.updatedAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(chat);
    else groups.push({ label, items: [chat] });
  }

  const nextFilter = { all: 'image', image: 'video', video: 'all' }[filter];
  // Credits bar: never wider than 100% (someone may have more credits than the starting amount)
  const usedPct = Math.max(0, Math.min(100, Math.round((credits / TOTAL_CREDITS) * 100)));

  return (
    <nav className="sidebar" aria-label="Main">
      <button className="new-chat" onClick={onNewChat}>
        <Icon name="plus" strokeWidth={2.4} />
        New chat
        <span className="kbd">Ctrl K</span>
      </button>

      <div className="nav-list">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`nav-item ${page === n.id ? 'is-active' : ''}`}
            onClick={() => onNavigate(n.id)}
            aria-current={page === n.id ? 'page' : undefined}
          >
            <Icon name={n.icon} className={page === n.id ? 'accent' : ''} />
            {n.label}
          </button>
        ))}
      </div>

      <div className="divider" />

      <div className="history">
        <div className="history-head">
          <button className="history-toggle" onClick={() => setHistoryOpen((o) => !o)} aria-expanded={historyOpen}>
            Chats &amp; history
            <Icon name="chevron" size={14} strokeWidth={2.2} style={{ transform: historyOpen ? 'none' : 'rotate(-90deg)' }} />
          </button>
          <div className="history-tools">
            <button className="tiny-btn" aria-label="Search chats" onClick={() => setSearchOpen((s) => !s)}><Icon name="search" size={15} /></button>
            <button className="tiny-btn" aria-label={`Filter chats: showing ${filter}`} onClick={() => setFilter(nextFilter)}>
              <Icon name="filter" size={15} />
            </button>
          </div>
        </div>

        {historyOpen && (
          <>
            {searchOpen && (
              <input className="history-search" autoFocus placeholder="Search chats and prompts" value={query} onChange={(e) => setQuery(e.target.value)} />
            )}
            {filter !== 'all' && <span className="filter-note">Showing {filter} chats only</span>}

            {groups.map((g) => (
              <div key={g.label} className="chat-group">
                <span className="group-label">{g.label}</span>
                {g.items.map((c) => (
                  <ChatRow key={c.id} chat={c} active={c.id === activeChatId} onSelect={onSelectChat} onDelete={onDeleteChat} />
                ))}
              </div>
            ))}

            {chats.length === 0 && (
              <span className="filter-note">No chats yet. Type an idea and press Generate — it will show up here.</span>
            )}
            {chats.length > 0 && visible.length === 0 && <span className="filter-note">No chats match "{text}".</span>}
          </>
        )}
      </div>

      <div className="grow" />

      <div className="credit-card">
        <div className="row-between">
          <strong>Credits</strong>
          <span className="muted small">{credits} of {TOTAL_CREDITS} · Free</span>
        </div>
        <div className="bar"><div className="bar-fill" style={{ width: `${usedPct}%` }} /></div>
        <div className="row gap8">
          <button className="btn-light grow">Upgrade</button>
        </div>
      </div>
    </nav>
  );
}