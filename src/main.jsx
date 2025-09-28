import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Initialize MSW and seed data
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    // Ensure the service worker file is reachable before attempting to start MSW.
    // If the dev server isn't running or the file isn't served, this prevents
    // MSW from attempting passthroughs that will fail with "Failed to fetch".
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
    } else {
      const { worker } = await import('./mocks/browser.js');
      const { seedData } = await import('./db/database.js');

      // Start MSW worker with a less aggressive unhandled-request behavior so
      // passthrough network errors do not surface as noisy uncaught exceptions.
      await worker.start({
        onUnhandledRequest: 'warn',
        serviceWorker: {
          url: swUrl
        }
      });

      console.log('🚀 MSW started successfully');

      // Seed the database
      await seedData();

      console.log('📊 Database seeded successfully');

      // Test if data was seeded
      const { dbHelpers } = await import('./db/database.js');
      const jobs = await dbHelpers.getJobs();
      const candidates = await dbHelpers.getCandidates();
      console.log(`✅ Seeded ${jobs.length} jobs and ${candidates.length} candidates`);
    }
  } catch (error) {
    console.error('Failed to initialize MSW:', error);
    console.error('Error details:', error.message);
    // Continue without MSW for now
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}).catch((error) => {
  console.error('Failed to start app:', error);
  // Fallback: render app without MSW
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
});
