import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { loadTheme } from './lib/storage';

const initialTheme = loadTheme();
document.documentElement.classList.toggle('dark', initialTheme === 'dark');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App initialTheme={initialTheme} />
  </StrictMode>
);
