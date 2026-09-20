const lessons = [
  { id: '6392', name: 'text-welcome' },
  { id: '6396', name: 'quiz' },
  { id: '16167', name: 'intro' },
];

for (const lesson of lessons) {
  const url = `https://bridge-academy.vn/en/courses-3/general-course/${lesson.id}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 BridgeAcademyApp/1.0' } });
  const html = await res.text();
  console.log(`\n=== ${lesson.id} ${lesson.name} status=${res.status} len=${html.length}`);

  const checks = [
    ['iframe', /iframe[^>]+src="([^"]+)"/gi],
    ['video', /<video[^>]+src="([^"]+)"/gi],
    ['source', /<source[^>]+src="([^"]+)"/gi],
    ['vimeo', /https?:\/\/player\.vimeo\.com[^"'\s]+/gi],
    ['youtube', /https?:\/\/[^"'\s]*youtube[^"'\s]+/gi],
    ['mp4', /https?:\/\/[^"'\s]+\.mp4[^"'\s]*/gi],
    ['entry-content', /class="entry-content[^"]*"[^>]*>([\s\S]{0,800})/gi],
    ['stm-content', /stm-lms-course__material-content([\s\S]{0,500})/gi],
    ['wp-block', /wp-block[^"]*"[^>]*>([\s\S]{0,300})/gi],
    ['quiz-data', /quiz[^"']{0,40}/gi],
    ['data-video', /data-video[^>]+/gi],
    ['presto', /presto-player[^]{0,120}/gi],
    ['h5p', /h5p[^]{0,80}/gi],
  ];

  for (const [name, re] of checks) {
    const matches = [...html.matchAll(re)].slice(0, 2);
    if (matches.length) {
      console.log(`  ${name}:`, matches.map((m) => (m[1] || m[0]).replace(/\s+/g, ' ').slice(0, 150)).join(' | '));
    }
  }
}
