import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// The production build is prerendered by scripts/prerender.js, which embeds the
// same snapshot the server used. Hydrate that markup instead of throwing it
// away; in development the snapshot is absent and App fetches it.
const initialData = window.__ATR_DATA__ || null;
const initialFeed = Array.isArray(window.__ATR_FEED__) ? window.__ATR_FEED__ : [];
const root = document.getElementById('root');
const app = (
  <React.StrictMode>
    <App initialData={initialData} initialFeed={initialFeed} />
  </React.StrictMode>
);

if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, app);
} else {
  ReactDOM.createRoot(root).render(app);
}
