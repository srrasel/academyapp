/**
 * Prepare lesson HTML for mobile WebView: fix tables, row numbers, and widths.
 */
import {
  toYouTubeEmbedUrl,
  toYouTubeWatchUrl,
} from './mediaUrl';
import {
  extractTopicsQuizRowsFromTableHtml,
  parseTopicsQuizTable,
  stripTopicsSection,
  stripTopicsTableFromHtml,
  getTopicsQuizRows,
} from './topicsQuizTable';

function escapeHtml(text = '') {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripCellText(html = '') {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function buildTopicsQuizTableHtml(rows = []) {
  if (!rows.length) return '';

  const body = rows
    .map(
      (row) =>
        `<tr><td class="col-no">${escapeHtml(row.num)}</td>` +
        `<td class="col-topic"><strong>${escapeHtml(row.topic)}</strong></td>` +
        `<td class="col-quiz">${escapeHtml(row.quiz)}</td></tr>`
    )
    .join('');

  return (
    '<div class="table-wrap">' +
    '<table class="lesson-table topics-table">' +
    '<thead><tr>' +
    '<th class="col-no">No.</th>' +
    '<th class="col-topic">Topics</th>' +
    '<th class="col-quiz">Quiz</th>' +
    '</tr></thead>' +
    `<tbody>${body}</tbody>` +
    '</table></div>'
  );
}

export function buildTopicsQuizTableFromText(text = '') {
  const parsed = parseTopicsQuizTable('', text);
  if (!parsed?.rows?.length) return null;

  return buildTopicsQuizTableHtml(parsed.rows);
}

function rebuildTopicsQuizTable(tableHtml = '') {
  const rows = extractTopicsQuizRowsFromTableHtml(tableHtml);
  return rows.length ? buildTopicsQuizTableHtml(rows) : tableHtml;
}

function isQuestionLikeText(text = '') {
  const value = text.trim();
  if (!value) return false;
  if (value.endsWith('?')) return true;
  if (value.includes('____________')) return true;
  return /^(what|why|how|which|when|where|who|can|do|does|did|is|are|was|were)\b/i.test(value);
}

function boldLessonQuestions(html = '') {
  let out = html;

  out = out.replace(
    /<span([^>]*)>([\s\S]*?)<\/span>/gi,
    (match, attrs, inner) => {
      if (!isQuestionLikeText(stripCellText(inner))) return match;
      if (/<(?:strong|span|h[1-6])\b/i.test(inner)) return match;
      return `<strong>${inner}</strong>`;
    }
  );

  out = out.replace(/<(h[34])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, inner) => {
    if (!isQuestionLikeText(stripCellText(inner))) return match;
    if (/<strong\b/i.test(inner)) return match;
    return `<${tag}${attrs}><strong>${inner}</strong></${tag}>`;
  });

  out = out.replace(/<(p|li)([^>]*)>([^<]*?\?)([^<]*)<\/\1>/gi, (match, tag, attrs, question, rest) => {
    if (/<strong\b/i.test(match)) return match;
    const qText = stripCellText(question);
    if (!isQuestionLikeText(qText)) return match;
    return `<${tag}${attrs}><strong>${qText.trim()}</strong>${rest}</${tag}>`;
  });

  return out;
}

function fixMergedTextSpacing(html = '') {
  let out = html;

  out = out.replace(/([?:])([A-Za-z])/g, '$1 $2');
  out = out.replace(/([a-z])([A-Z][a-z])/g, '$1 $2');

  return out;
}

function normalizeCaptions(html = '') {
  return html.replace(/<p class="caption">([\s\S]*?)<\/p>/gi, (match, inner) => {
    const cleaned = inner.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
    return `<p class="caption">${cleaned}</p>`;
  });
}

function normalizeFlexContainers(html = '') {
  return html
    .replace(/flex-container-course-center/g, 'lesson-block')
    .replace(/flex-container-course-row/g, 'lesson-row')
    .replace(/flex-container-course-right/g, 'lesson-row')
    .replace(/flex-container-course-left/g, 'lesson-row');
}

function processLessonTable(tableHtml = '') {
  if (/topics/i.test(tableHtml) && /quiz/i.test(tableHtml)) {
    return rebuildTopicsQuizTable(tableHtml);
  }

  let next = tableHtml;
  if (!/class="[^"]*lesson-table/i.test(next)) {
    next = next.replace(/<table/i, '<table class="lesson-table field-table"');
  } else if (!/field-table/.test(next)) {
    next = next.replace(/class="([^"]*)"/, 'class="$1 field-table"');
  }

  return next;
}

function wrapLessonTables(html = '') {
  let out = html.replace(
    /<div class="table-wrap">\s*(<table[\s\S]*?<\/table>)\s*<\/div>/gi,
    (match, tableHtml) => `<div class="table-wrap">${processLessonTable(tableHtml)}</div>`
  );

  out = out.replace(/<table[\s\S]*?<\/table>/gi, (tableHtml) => {
    return `<div class="table-wrap">${processLessonTable(tableHtml)}</div>`;
  });

  return out;
}

function removeEmptyLessonTail(html = '') {
  let out = html;
  out = out.replace(/<p style="margin-top: -1\.5em">\s*<\/p>/gi, '');
  out = out.replace(
    /<p style="margin-top: -1\.5em">https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^<]+<\/p>/gi,
    ''
  );
  return out;
}

function stripLayoutStyles(html = '') {
  let out = html;

  out = out.replace(/\swidth="[^"]*"/gi, '');
  out = out.replace(/\sheight="[^"]*"/gi, '');
  out = out.replace(/\s+border="1"/gi, '');

  out = out.replace(/style="([^"]*)"/gi, (match, styleValue) => {
    const cleaned = styleValue
      .replace(/\s*width:\s*\d+[^;]*;?/gi, '')
      .replace(/\s*height:\s*\d+[^;]*;?/gi, '')
      .replace(/\s*min-height:\s*[^;]+;?/gi, '')
      .replace(/\s*max-height:\s*[^;]+;?/gi, '')
      .replace(/\s*margin-top:\s*-[^;]+;?/gi, '')
      .replace(/\s*text-align:\s*justify\s*;?/gi, '')
      .replace(/\s*text-indent:\s*[^;]+;?/gi, '')
      .replace(/\s*text-decoration:\s*underline\s*;?/gi, '')
      .replace(/;\s*;/g, ';')
      .trim()
      .replace(/^;|;$/g, '');

    return cleaned ? `style="${cleaned}"` : '';
  });

  // Drop decorative <u> wrappers that look like links but aren't tappable.
  out = out.replace(/<\/?u\b[^>]*>/gi, '');

  // Leading indent spaces / nbsp make the first line look shifted right.
  out = out.replace(
    /<(p|div|span|li)(\b[^>]*)>(?:\s|&nbsp;|\u00a0)+/gi,
    '<$1$2>'
  );

  return out;
}

function isHarshRedColor(value = '') {
  const color = String(value).trim().toLowerCase();
  if (!color) return false;
  if (color === 'red' || color === '#f00' || color === '#ff0000' || color === '#e60000') {
    return true;
  }
  // Other pure/near-red hex used for emphasis in WP content.
  if (/^#f{2}0{4}$/i.test(color)) return true;
  if (/^#e[0-9a-f]{2}0{3}$/i.test(color)) return true;
  return false;
}

/** Turn ugly WP red text into a soft highlight callout. */
function restyleHarshRedHighlights(html = '') {
  if (!html?.trim()) return html;

  let out = html;

  // <span style="color: #ff0000">...</span> (and similar)
  out = out.replace(
    /<(span|strong|em|b|p|font)([^>]*)style="([^"]*)"([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, before, styleValue, after, inner) => {
      const colorMatch = styleValue.match(/color:\s*([^;]+)/i);
      if (!colorMatch || !isHarshRedColor(colorMatch[1])) return match;

      const cleanedStyle = styleValue
        .replace(/\s*color:\s*[^;]+;?/gi, '')
        .replace(/;\s*;/g, ';')
        .trim()
        .replace(/^;|;$/g, '');

      const styleAttr = cleanedStyle ? ` style="${cleanedStyle}"` : '';
      const classMatch = `${before}${after}`.match(/\sclass="([^"]*)"/i);
      const existingClass = classMatch?.[1] || '';
      const nextClass = existingClass.includes('lesson-highlight')
        ? existingClass
        : `${existingClass} lesson-highlight`.trim();

      let attrs = `${before}${after}`
        .replace(/\sclass="[^"]*"/i, '')
        .replace(/\sstyle="[^"]*"/i, '');

      return `<${tag}${attrs} class="${nextClass}"${styleAttr}>${inner}</${tag}>`;
    }
  );

  // <font color="red">...</font>
  out = out.replace(
    /<font([^>]*)\scolor=["']?(red|#ff0000|#f00)["']?([^>]*)>([\s\S]*?)<\/font>/gi,
    (_match, before, _color, after, inner) =>
      `<span${before}${after} class="lesson-highlight">${inner}</span>`
  );

  return out;
}

export function enhanceLessonHtml(html = '') {
  if (!html?.trim()) return html;

  let out = removeEmptyLessonTail(html);
  out = normalizeFlexContainers(out);
  out = normalizeCaptions(out);
  out = stripLayoutStyles(out);
  out = restyleHarshRedHighlights(out);
  out = wrapLessonTables(out);

  out = out.replace(/<iframe([^>]*)>/gi, (tag, attrs) => {
    if (!/youtube\.com|youtu\.be/i.test(attrs)) return `<iframe${attrs}>`;
    let next = attrs;
    if (!/referrerpolicy=/i.test(next)) {
      next += ' referrerpolicy="strict-origin-when-cross-origin"';
    }
    if (!/allowfullscreen/i.test(next)) {
      next += ' allowfullscreen';
    }
    const srcMatch = next.match(/src="([^"]+)"/i);
    if (srcMatch) {
      let fixed = toYouTubeEmbedUrl(srcMatch[1]);
      // Ensure related-video suggestions stay off for HTML embeds too.
      if (/youtube\.com\/embed\//i.test(fixed) && !/[?&]rel=0/i.test(fixed)) {
        fixed += (fixed.includes('?') ? '&' : '?') + 'rel=0';
      }
      next = next.replace(srcMatch[0], `src="${fixed}"`);
    }
    return `<iframe${next}>`;
  });

  out = out.replace(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})\S*/gi,
    (match) => {
      const watch = toYouTubeWatchUrl(match);
      return `<a href="${watch}" target="_blank" rel="noopener noreferrer">${watch}</a>`;
    }
  );

  return boldLessonQuestions(out);
}

export function prepareLessonHtml(html = '', text = '') {
  const parsed = parseTopicsQuizTable(html, text);
  const topicsRows = getTopicsQuizRows(html, text);
  let contentHtml = parsed?.remainderHtml ?? html;
  let contentText = parsed?.remainderText ?? text;

  if (!parsed && text?.trim()) {
    contentText = stripTopicsSection(text);
  }

  if (topicsRows.length && html?.trim()) {
    contentHtml = stripTopicsTableFromHtml(contentHtml || html);
  }

  if (contentHtml?.trim()) {
    const enhanced = enhanceLessonHtml(contentHtml);
    if (enhanced?.trim()) return enhanced;
  }

  if (contentText?.trim()) {
    const normalized = fixMergedTextSpacing(contentText.trim());
    const htmlBlocks = normalized
      .split(/\n{2,}/)
      .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br/>')}</p>`)
      .join('');
    return boldLessonQuestions(htmlBlocks);
  }

  return '';
}

export { parseTopicsQuizTable, getTopicsQuizRows };
