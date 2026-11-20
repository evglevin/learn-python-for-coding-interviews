import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { getLessonById } from './data';
import { lessonIdFromUrl, showLessonInUrl } from './lib/lessonUrl';
import { decodeProgress, takeProgressFromUrl, type IncomingProgress } from './lib/progressLink';
import { loadActiveLessonId, loadTheme, saveActiveLessonId } from './lib/storage';

// Read before anything else rewrites the URL; the payload is stripped so a reload doesn't ask again.
const progressData = takeProgressFromUrl();

const initialTheme = loadTheme();
document.documentElement.classList.toggle('dark', initialTheme === 'dark');

// A lesson link in the URL wins over the lesson last opened on this device.
const initialLessonId = lessonIdFromUrl() ?? getLessonById(loadActiveLessonId() ?? '').id;
saveActiveLessonId(initialLessonId);
showLessonInUrl(initialLessonId);

function render(incomingProgress: IncomingProgress | null) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App
        initialTheme={initialTheme}
        initialLessonId={initialLessonId}
        incomingProgress={incomingProgress}
      />
    </StrictMode>
  );
}

if (progressData === null) render(null);
else void decodeProgress(progressData).then(render);
