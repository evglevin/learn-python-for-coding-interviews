import { useSyncExternalStore } from 'react';

/** Matches Tailwind's `md` breakpoint: below it, the app uses the single-pane phone layout. */
const MOBILE_QUERY = '(max-width: 767px)';

const mediaQuery = typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY) : null;

function subscribe(onChange: () => void) {
  mediaQuery?.addEventListener('change', onChange);
  return () => mediaQuery?.removeEventListener('change', onChange);
}

function getSnapshot() {
  return mediaQuery?.matches ?? false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
