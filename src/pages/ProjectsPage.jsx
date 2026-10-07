import { useState } from 'react';
import Icon from '../components/Icons.jsx';
import { PageHeader, EmptyState, MediaGrid } from './Shared.jsx';

const newId = () => `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export default function ProjectsPage({ projects, setProjects, chats, items, favorites, onToggleFavorite, onOpen, onOpenChat, openId, setOpenId, onNewChatInProject }) {
  const [newName, setNewName] = useState('');
  const project = projects.find((p) => p.id === openId);

  const createProject = (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setProjects((list) => [{ id: newId(), name, chatIds: [], createdAt: Date.now() }, ...list]);
    setNewName('');
  };

  const update = (id, patch) => setProjects((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const renameProject = (p) => {
    const name = window.prompt('New project name', p.name);
    if (name && name.trim()) update(p.id, { name: name.trim() });
  };

  const deleteProject = (p) => {
    if (!window.confirm(`Delete project "${p.name}"? Your chats are NOT deleted.`)) return;
    setProjects((list) => list.filter((x) => x.id !== p.id));
    setOpenId(null);
  };

  // ---------- One project open ----------
  if (project) {
    const projectChats = chats.filter((c) => project.chatIds.includes(c.id));
    const otherChats = chats.filter((c) => !project.chatIds.includes(c.id));
    const projectItems = items.filter((it) => project.chatIds.includes(it.chatId));

    return (
      <div className="page">
        <button className="text-btn back" onClick={() => setOpenId(null)}>← All projects</button>
        <PageHeader title={project.name} subtitle={`${projectChats.length} ${projectChats.length === 1 ? "chat" : "chats"} · ${projectItems.length} creations`}>
          <button className="btn-primary sm" onClick={() => onNewChatInProject(project.id, 'image')}>
            <Icon name="image" size={16} /> New image
          </button>
          <button className="btn-primary sm blue-btn" onClick={() => onNewChatInProject(project.id, 'video')}>
            <Icon name="video" size={16} /> New video
          </button>
          <button className="btn-ghost sm" onClick={() => renameProject(project)}>Rename</button>
          <button className="btn-ghost sm danger" onClick={() => deleteProject(project)}>Delete</button>
        </PageHeader>

        <div className="panel">
          <strong>Chats in this project</strong>
          {projectChats.length === 0 && (
            <span className="muted small">No chats yet. Press "New image" or "New video" above, or add an existing chat below.</span>
          )}
          <div className="stack8">
            {projectChats.map((c) => (
              <div key={c.id} className="list-row">
                <Icon name={c.type} size={15} className={c.type === 'video' ? 'blue' : 'accent'} />
                <button className="text-btn plain ellipsis" onClick={() => onOpenChat(c.id)}>{c.title}</button>
                <span className="muted tiny">{c.generations.length} {c.generations.length === 1 ? 'result' : 'results'}</span>
                <button className="btn-ghost xs fit" onClick={() => onOpenChat(c.id)}>Open</button>
                <button className="btn-ghost xs fit" onClick={() => update(project.id, { chatIds: project.chatIds.filter((id) => id !== c.id) })}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          {otherChats.length > 0 && (
            <label className="row gap8 add-row">
              <span className="small soft">Add a chat:</span>
              <select
                className="input grow"
                value=""
                onChange={(e) => e.target.value && update(project.id, { chatIds: [...project.chatIds, e.target.value] })}
              >
                <option value="">Choose a chat…</option>
                {otherChats.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </label>
          )}
        </div>

        {projectItems.length > 0 && (
          <MediaGrid items={projectItems} favorites={favorites} onToggleFavorite={onToggleFavorite} onOpen={onOpen} />
        )}
      </div>
    );
  }

  // ---------- List of projects ----------
  return (
    <div className="page">
      <PageHeader title="Projects" subtitle="Group chats together, like one folder per client or YouTube channel." />

      <form className="row gap8" onSubmit={createProject}>
        <label className="sr-only" htmlFor="new-project">Project name</label>
        <input id="new-project" className="input grow" placeholder="New project name, e.g. Client A" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={60} />
        <button className="btn-primary sm" type="submit" disabled={!newName.trim()}>
          <Icon name="plus" size={16} /> Create project
        </button>
      </form>

      {projects.length === 0 ? (
        <EmptyState icon="folder" title="No projects yet" text="Type a name above and press Create project." />
      ) : (
        <div className="card-grid">
          {projects.map((p) => {
            const count = p.chatIds.filter((id) => chats.some((c) => c.id === id)).length;
            return (
              <button key={p.id} className="card clickable" onClick={() => setOpenId(p.id)}>
                <Icon name="folder" size={22} className="accent" />
                <strong>{p.name}</strong>
                <span className="muted small">{count} {count === 1 ? 'chat' : 'chats'}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}