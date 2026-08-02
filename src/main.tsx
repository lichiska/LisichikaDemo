import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadRuntimeConfig } from './lib/config.ts';

// Prerendered blog pages are served as pure static HTML for SEO.
// Skip React mounting so the crawler-facing markup stays lightweight.
if (
  document
    .querySelector('meta[name="prerender-static-page"]')
    ?.getAttribute('content') === 'blog'
) {
  // No-op for static blog pages
} else {
  // Render the app immediately, load config in background
  const root = createRoot(document.getElementById('root')!);
  root.render(<App />);

  // Load runtime config in background (non-blocking)
  loadRuntimeConfig().catch(() => {
    // Config loading failed, app already rendered with defaults
  });
}
