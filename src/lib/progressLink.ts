import { LESSONS } from '../data';
import type { SolutionTab } from '../types/course';
import { lessonPath } from './lessonUrl';
import type { ProgressSnapshot } from './storage';

/**
 * Progress links carry a learner's progress in the URL fragment:
 * `<base>lessons/<lesson-id>#progress=<data>`. The fragment never reaches a
 * server. `<data>` is the payload below as JSON, deflated and base64url-encoded.
 */
const HASH_PREFIX = 'progress=';
const FORMAT_VERSION = 1;

/**
 * Size caps, far above a whole course of code (~6.5K link characters), that keep a
 * crafted link from inflating into enough data to stall the page before it is shown.
 */
const MAX_LINK_DATA_LENGTH = 1_000_000;
const MAX_PAYLOAD_BYTES = 2_000_000;

interface LinkPayload {
  v: number;
  /** Solved lesson ids. */
  s: string[];
  /** Editor tabs by lesson id, as [name, code] pairs. Lessons left at their starter code are omitted. */
  t: Record<string, [string, string][]>;
}

/**
 * Progress from a link the page was opened with. `saveFailed` and `savePartial`: the
 * learner chose to load it, but storage refused all of it or, rarely, part of it.
 */
export type IncomingProgress =
  | { status: 'valid'; progress: ProgressSnapshot }
  | { status: 'invalid' }
  | { status: 'saveFailed' }
  | { status: 'savePartial' };

async function createProgressLink(progress: ProgressSnapshot, lessonId: string): Promise<string> {
  const starterCode = new Map(LESSONS.map((l) => [l.id, l.starterCode]));
  const tabs: LinkPayload['t'] = {};
  for (const [id, lessonTabs] of Object.entries(progress.tabs)) {
    const starter = starterCode.get(id);
    if (starter === undefined || !Array.isArray(lessonTabs) || lessonTabs.length === 0) continue;
    const untouched = lessonTabs.length === 1 && lessonTabs[0].code === starter;
    if (!untouched) tabs[id] = lessonTabs.map((tab) => [tab.name, tab.code]);
  }
  const payload: LinkPayload = {
    v: FORMAT_VERSION,
    s: progress.solved.filter((id) => starterCode.has(id)),
    t: tabs,
  };
  const json = new TextEncoder().encode(JSON.stringify(payload));
  // A link this large would be rejected when opened.
  if (json.length > MAX_PAYLOAD_BYTES) throw new Error('Progress is too large for a link');
  const data = toBase64Url(await pipe(json, new CompressionStream('deflate-raw')));
  if (data.length > MAX_LINK_DATA_LENGTH) throw new Error('Progress is too large for a link');
  return `${window.location.origin}${lessonPath(lessonId)}#${HASH_PREFIX}${data}`;
}

/**
 * Copies a progress link to the clipboard. Building the link is async, so the
 * clipboard gets a pending item: Safari rejects writes that happen after the
 * click's user activation has passed.
 */
export async function copyProgressLink(progress: ProgressSnapshot, lessonId: string): Promise<void> {
  const link = createProgressLink(progress, lessonId);
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
    const blob = link.then((text) => new Blob([text], { type: 'text/plain' }));
    await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
  } else {
    await navigator.clipboard.writeText(await link);
  }
}

/**
 * Removes a progress payload from the URL fragment and returns it, or null if there is none.
 * Call it at startup and on `hashchange`: pasting a link to the lesson that is already open
 * changes only the fragment, so the page doesn't reload.
 */
export function takeProgressFromUrl(): string | null {
  const hash = window.location.hash.slice(1);
  if (!hash.startsWith(HASH_PREFIX)) return null;
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, '', pathname + search);
  return hash.slice(HASH_PREFIX.length);
}

export async function decodeProgress(data: string): Promise<IncomingProgress> {
  if (data.length > MAX_LINK_DATA_LENGTH) return { status: 'invalid' };
  try {
    const json = await pipe(fromBase64Url(data), new DecompressionStream('deflate-raw'), MAX_PAYLOAD_BYTES);
    const progress = parsePayload(JSON.parse(new TextDecoder().decode(json)));
    if (progress) return { status: 'valid', progress };
  } catch {
    // truncated or corrupted link
  }
  return { status: 'invalid' };
}

function isTabPair(pair: unknown): pair is [string, string] {
  return (
    Array.isArray(pair) && pair.length === 2 && typeof pair[0] === 'string' && typeof pair[1] === 'string'
  );
}

/**
 * Validates a decoded payload. Lessons this version doesn't know are dropped (the link may
 * come from a newer course); malformed data for a known lesson rejects the whole link,
 * since accepting it would replace that lesson's code with nothing.
 */
function parsePayload(data: unknown): ProgressSnapshot | null {
  if (!data || typeof data !== 'object') return null;
  const { v, s, t } = data as Partial<LinkPayload>;
  if (v !== FORMAT_VERSION || !Array.isArray(s) || !t || typeof t !== 'object' || Array.isArray(t)) {
    return null;
  }
  const known = new Set(LESSONS.map((l) => l.id));
  const tabs: Record<string, SolutionTab[]> = {};
  for (const [lessonId, pairs] of Object.entries(t)) {
    if (!known.has(lessonId)) continue;
    if (!Array.isArray(pairs) || pairs.length === 0 || !pairs.every(isTabPair)) return null;
    tabs[lessonId] = pairs.map(([name, code], i) => ({ id: `tab-${i + 1}`, name, code }));
  }
  if (!s.every((id) => typeof id === 'string')) return null;
  return { solved: [...new Set(s)].filter((id) => known.has(id)), tabs };
}

/** Runs bytes through a (de)compression stream, failing once the output passes `maxBytes`. */
async function pipe(
  bytes: Uint8Array<ArrayBuffer>,
  transform: CompressionStream | DecompressionStream,
  maxBytes = Infinity
): Promise<Uint8Array<ArrayBuffer>> {
  const reader = new Blob([bytes]).stream().pipeThrough(transform).getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) {
      void reader.cancel();
      throw new Error('Output too large');
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const CHUNK = 0x8000; // stay well below the engine's argument-count limit
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(data: string): Uint8Array<ArrayBuffer> {
  const binary = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
