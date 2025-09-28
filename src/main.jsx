import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Initialize MSW and seed data (enabled in all modes if SW file is present)
async function enableMocking() {
  try {
    const swUrl = '/mockServiceWorker.js';
    let swAvailable = false;
    try {
      const res = await fetch(swUrl, { method: 'HEAD' });
      swAvailable = res.ok;
    } catch (e) {
      swAvailable = false;
    }

    if (!swAvailable) {
      console.warn(`MSW service worker not available at ${swUrl}. Skipping MSW startup.`);
      return;
    }

    const { worker } = await import('./mocks/browser.js');
    const { seedData } = await import('./db/database.js');

    await worker.start({
      onUnhandledRequest: 'warn',
      serviceWorker: { url: swUrl }
    });

    console.log('🚀 MSW started successfully (mode:', import.meta.env.MODE, ')');

    // Seed the database only once per browser (avoid wiping user data)
    const SEED_FLAG_KEY = 'tf_seed_v1';
    if (!localStorage.getItem(SEED_FLAG_KEY)) {
      await seedData();
      localStorage.setItem(SEED_FLAG_KEY, '1');
      console.log('📊 Database seeded successfully');
    } else {
      console.log('⏭️  Seeding skipped (already seeded)');
    }

    // Sanity log
    const { dbHelpers } = await import('./db/database.js');
    const jobs = await dbHelpers.getJobs();
    const candidates = await dbHelpers.getCandidates();
    console.log(`✅ Seeded ${jobs.length} jobs and ${candidates.length} candidates`);
  } catch (error) {
    console.error('Failed to initialize MSW:', error);
    console.error('Error details:', error?.message);
    // Continue without MSW for now
  }
}

enableMocking()
  .catch((e) => console.warn('MSW init warning:', e))
  .finally(() => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  });
