/**
 * 🚀 GESTURE POINTER MONOLITH - WEB ENTRY
 * 
 * Boots the GestureMonolithApp and attaches it to the DOM.
 */

import { GestureMonolithApp } from './app.js';

async function bootstrap() {
  const container = document.getElementById('app');
  const loading = document.getElementById('loading');
  
  if (!container) {
    console.error('❌ Could not find #app container');
    return;
  }

  const app = new GestureMonolithApp(container);
  
  try {
    await app.init();
    
    if (loading) {
      loading.classList.add('hidden');
    }

    // Auto-run demo if URL has ?demo=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
      console.log('🎬 Auto-starting demo sequence...');
      setTimeout(() => app.runDemo(), 1000);
    }

    // Expose app on window for manual playing
    (window as any).app = app;
    console.log('✅ App ready. Access via `window.app`.');
  } catch (error) {
    console.error('💥 Failed to initialize app:', error);
    if (loading) {
      loading.innerHTML = `<p style="color:#f66">Failed to load: ${(error as Error).message}</p>`;
    }
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
