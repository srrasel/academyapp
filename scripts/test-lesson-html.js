const lessons = require('../src/data/imported/lessons.json');
const { parseTopicsQuizTable, getTopicsQuizRows } = require('../src/utils/topicsQuizTable.js');

function countTags(html) {
  const open = (html.match(/<div[\s>]/gi) || []).length;
  const close = (html.match(/<\/div>/gi) || []).length;
  return { open, close, balanced: open === close };
}

const l6393 = lessons.find((l) => l.id === '6393');
const l16167 = lessons.find((l) => l.id === '16167');

console.log('16167 rows:', getTopicsQuizRows(l16167.htmlContent, l16167.content).length);
console.log('6393 div original:', countTags(l6393.htmlContent));

(async () => {
  const { enhanceLessonHtml, prepareLessonHtml } = await import('../src/utils/lessonHtmlEnhancer.js');
  const enhanced = enhanceLessonHtml(l6393.htmlContent);
  console.log('6393 div enhanced:', countTags(enhanced));
  console.log('6393 has table-wrap:', enhanced.includes('table-wrap'));
  console.log('6393 has img:', enhanced.includes('<img'));
  const prep = prepareLessonHtml(l16167.htmlContent, l16167.content);
  console.log('16167 prepared has table:', prep.includes('topics-table'));
  console.log('16167 prepared has Key Points:', prep.includes('Key Points'));
})();
