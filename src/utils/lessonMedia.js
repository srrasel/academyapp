const AUDIO_EXT_RE = /\.(mp3|m4a|wav|ogg)(\?|$)/i;

function normalizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let value = url.trim().replace(/&lt;\/p&gt;$/i, '').replace(/<\/p>$/i, '');
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) return `https://bridge-academy.vn${value}`;
  if (!/^https?:\/\//i.test(value)) return `https://bridge-academy.vn/${value}`;
  return value;
}

function extractAudioUrlsFromText(text) {
  if (!text || typeof text !== 'string') return [];

  const urls = [];
  const patterns = [
    /<audio[^>]+src=["']([^"']+)["']/gi,
    /\[audio[^\]]*(?:src|mp3|url)=["']([^"']+)["']/gi,
    /data-(?:src|audio|url|file)=["']([^"']+)["']/gi,
    /"(?:audio_url|audioUrl|audio|file_url)"\s*:\s*"([^"]+)"/gi,
    /(https?:\/\/[^"'\\s<>]+\.(?:mp3|m4a|wav|ogg)[^"'\\s<>]*)/gi,
  ];

  for (const re of patterns) {
    for (const match of text.matchAll(re)) {
      const url = normalizeMediaUrl(match[1] || match[0] || '');
      if (AUDIO_EXT_RE.test(url)) urls.push(url);
    }
  }

  return [...new Set(urls)];
}

export function resolveLessonAudioUrl(lesson) {
  if (!lesson) return '';
  if (lesson.audioUrl?.trim()) return normalizeMediaUrl(lesson.audioUrl);

  const fromHtml = extractAudioUrlsFromText(lesson.htmlContent);
  if (fromHtml[0]) return fromHtml[0];

  const fromContent = extractAudioUrlsFromText(lesson.content || lesson.body);
  if (fromContent[0]) return fromContent[0];

  return '';
}

export function enrichLessonMedia(lesson) {
  if (!lesson) return lesson;

  const audioUrl = resolveLessonAudioUrl(lesson);
  if (!audioUrl) return lesson;

  return {
    ...lesson,
    audioUrl,
  };
}
