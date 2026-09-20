const YOUTUBE_PATTERNS = [
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
  /youtube\.com\/watch\?[^"'\s]*v=([a-zA-Z0-9_-]{11})/i,
  /youtu\.be\/([a-zA-Z0-9_-]{11})/i,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i,
];

/** YouTube requires a valid https Referer / origin for embedded playback (error 153). */
export const YOUTUBE_REFERER_ORIGIN = 'https://com.bridgeacademy.app';

export function extractYouTubeId(url = '') {
  if (!url) return null;
  const cleaned = url.replace(/<\/p>$/i, '').trim();
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = cleaned.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function isYouTubeUrl(url = '') {
  return Boolean(extractYouTubeId(url) || /youtube\.com|youtu\.be/i.test(url));
}

export function toYouTubeWatchUrl(url = '') {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : url;
}

export function toYouTubeEmbedUrl(url = '') {
  const id = extractYouTubeId(url);
  if (!id) return url;
  const origin = encodeURIComponent(YOUTUBE_REFERER_ORIGIN);
  // rel=0 limits end-screen suggestions; modestbranding keeps chrome light.
  return `https://www.youtube.com/embed/${id}?playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&controls=1&fs=1&enablejsapi=1&origin=${origin}`;
}

export function buildYouTubeEmbedHtml(videoId) {
  const origin = encodeURIComponent(YOUTUBE_REFERER_ORIGIN);
  const embedSrc = `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&controls=1&fs=1&enablejsapi=1&origin=${origin}`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }
    iframe { width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body>
  <iframe
    id="player"
    src="${embedSrc}"
    title="YouTube video"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
  <script>
    // Keep playback inside the embed; never jump to full YouTube watch pages.
    document.addEventListener('click', function (event) {
      var anchor = event.target && event.target.closest ? event.target.closest('a') : null;
      if (anchor) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  </script>
</body>
</html>`;
}

export function isDirectVideoUrl(url = '') {
  if (!url || isYouTubeUrl(url)) return false;
  return /\.(mp4|m3u8|webm)(\?|$)/i.test(url) || /vimeo\.com\/video\//i.test(url);
}

export function isDirectAudioUrl(url = '') {
  if (!url) return false;
  return /\.(mp3|m4a|wav|ogg|aac)(\?|$)/i.test(url) || /wp-content\/uploads\/.*\.(mp3|m4a)/i.test(url);
}
