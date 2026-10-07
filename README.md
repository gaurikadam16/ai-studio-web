# [Your Brand] – AI Studio Dashboard (React)

The approved dashboard design, built in React with Vite.

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

It starts in **mock mode** (`VITE_USE_MOCK=true`), so every button works with fake
results. No backend is needed yet.

## What works already

- New chat button (and Ctrl/Cmd + K), which clears the screen and starts a fresh chat
- Chats & history: grouped by Today / Previous 7 days, with search, a filter (all → images → videos) and collapse
- The first Generate in a new chat adds it to history, named from the prompt
- Image / Video switch, and the settings panel changes with it
- Improve my prompt, Upload photo, language choice, quick-start templates
- Generate images with loading skeletons, favorites, compare side by side, and a "Make video" button on each result
- Video jobs with a live progress bar (polling)
- Credits: the cost is shown before generating and is deducted after

## Folder structure

```
src/
  App.jsx                  all state + actions
  api/client.js            the ONLY place that calls the backend
  data/constants.js        styles, sizes, lengths, credit rules
  data/mock.js             sample chats and artwork colours
  components/
    TopBar.jsx  Sidebar.jsx  PromptBox.jsx  Results.jsx
    BottomRow.jsx  SettingsPanel.jsx  Icons.jsx  SceneArt.jsx
  styles.css               design tokens (colours, fonts) at the top
```

## Backend contract (build this next)

Set `VITE_USE_MOCK=false` once your backend runs on port 5000 (vite proxies `/api`).

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/prompt/improve` | `{ prompt, mode }` | `{ prompt }` |
| POST | `/api/images` | `{ prompt, language, style, aspectRatio, count, negativePrompt, characterId, useBrandKit }` | `{ images: [{ id, url }] }` |
| POST | `/api/videos` | `{ prompt, language, length, aspectRatio, camera, music, voiceOver, startFrom }` | `{ jobId }` |
| GET | `/api/videos/:jobId` | – | `{ status, progress, url }` |

The fal.ai API key lives only in the backend. Never put it in the React app.
