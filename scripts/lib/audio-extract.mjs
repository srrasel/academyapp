const BASE_URL = 'https://bridge-academy.vn';

const AUDIO_EXT_RE = /\.(mp3|m4a|wav|ogg)(\?|$)/i;
const AUDIO_KEY_RE = /audio|voice|recording|sound|mp3|podcast/i;

export function normalizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let value = url.trim().replace(/&lt;\/p&gt;$/i, '').replace(/<\/p>$/i, '');
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) return `${BASE_URL}${value}`;
  if (!/^https?:\/\//i.test(value)) return `${BASE_URL}/${value}`;
  return value;
}

export function isAudioUrl(url) {
  return Boolean(url && AUDIO_EXT_RE.test(url));
}

export function extractAudioUrlsFromText(text) {
  if (!text || typeof text !== 'string') return [];

  const urls = [];
  const patterns = [
    /<audio[^>]+src=["']([^"']+)["']/gi,
    /\[audio[^\]]*(?:src|mp3|url)=["']([^"']+)["']/gi,
    /data-(?:src|audio|url|file)=["']([^"']+)["']/gi,
    /"(?:audio_url|audioUrl|audio|file_url|external_url)"\s*:\s*"([^"]+)"/gi,
    /(https?:\/\/[^"'\\s<>]+\.(?:mp3|m4a|wav|ogg)[^"'\\s<>]*)/gi,
    /(https?:\\\/\\\/[^"']+\.(?:mp3|m4a|wav|ogg)[^"']*)/gi,
  ];

  for (const re of patterns) {
    for (const match of text.matchAll(re)) {
      const raw = (match[1] || match[0] || '').replace(/\\\//g, '/');
      const url = normalizeMediaUrl(raw);
      if (isAudioUrl(url)) urls.push(url);
    }
  }

  return [...new Set(urls)];
}

export function extractAudioFromPayload(payload) {
  const hits = [];

  function walk(value, key = '') {
    if (value == null) return;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return;

      if (isAudioUrl(trimmed) || (AUDIO_KEY_RE.test(key) && /^https?:\/\//i.test(trimmed))) {
        hits.push(normalizeMediaUrl(trimmed));
        return;
      }

      if (trimmed.includes('<') || trimmed.includes('http') || trimmed.includes('mp3')) {
        hits.push(...extractAudioUrlsFromText(trimmed));
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, key));
      return;
    }

    if (typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(value)) {
        walk(childValue, childKey);
      }
    }
  }

  walk(payload);
  return [...new Set(hits)];
}

export function pickLessonAudioUrl(...sources) {
  for (const source of sources) {
    if (!source) continue;

    if (typeof source === 'string') {
      const fromText = extractAudioUrlsFromText(source);
      if (fromText[0]) return fromText[0];
      continue;
    }

    const fromPayload = extractAudioFromPayload(source);
    if (fromPayload[0]) return fromPayload[0];
  }

  return '';
}
