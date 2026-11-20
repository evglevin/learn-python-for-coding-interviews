import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { getLessonById } from './data';
import { lessonIdFromUrl, showLessonInUrl } from './lib/lessonUrl';
import { loadActiveLessonId, loadTheme, saveActiveLessonId } from './lib/storage';

const initialTheme = loadTheme();
document.documentElement.classList.toggle('dark', initialTheme === 'dark');

// A lesson link in the URL wins over the lesson last opened on this device.
const initialLessonId = lessonIdFromUrl() ?? getLessonById(loadActiveLessonId() ?? '').id;
saveActiveLessonId(initialLessonId);
showLessonInUrl(initialLessonId);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App initialTheme={initialTheme} initialLessonId={initialLessonId} />
  </StrictMode>
);
