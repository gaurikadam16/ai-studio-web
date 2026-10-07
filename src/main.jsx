import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { applyTheme, getSavedTheme } from './data/theme.js';

applyTheme(getSavedTheme()); // dark by default, before anything is drawn

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);