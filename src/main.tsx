import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initPerformanceMonitoring } from './lib/performance-monitor';
import { registerServiceWorker } from './lib/register-sw';

initPerformanceMonitoring();
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
