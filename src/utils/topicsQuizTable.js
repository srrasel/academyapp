function stripCellText(html = '') {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function normalizePlainText(text = '') {
  return text.replace(/\r/g, '').trim();
}

export function extractTopicsQuizRowsFromTableHtml(tableHtml = '') {
  const rows = [];
  const trMatches = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

  for (const trMatch of trMatches) {
    const cells = [...trMatch[1].matchAll(/<t[dh]([^>]*)>([\s\S]*?)<\/t[dh]>/gi)];
    if (cells.length < 3) continue;

    const values = cells.map((cell) => stripCellText(cell[2]));
    if (/topics/i.test(values[1]) && /quiz/i.test(values[2])) continue;

    const num = values[0];
    const topic = values[1];
    const quiz = values[2];

    if (!topic || !/^(yes|no)$/i.test(quiz)) continue;

    rows.push({
      num: /^\d+$/.test(num) ? num : String(rows.length + 1),
      topic,
      quiz,
    });
  }

  return rows;
}

function parseTopicsQuizRowsFromText(section = '') {
  const rows = [];
  const lines = section.split(/\n+/).map((line) => line.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i += 1) {
    if (!/^\d+$/.test(lines[i])) continue;

    const num = lines[i];
    const topic = lines[i + 1] || '';
    const quiz = lines[i + 2] || '';

    if (topic && /^(yes|no)$/i.test(quiz)) {
      rows.push({ num, topic, quiz });
      i += 2;
    }
  }

  return rows;
}

const TOPICS_BLOCK_PATTERN =
  /Topics\s*\n+\s*Quiz[\s\S]*?(?=\n+\s*(?:Key Points|Career opportunities:)|$)/i;

const TOPICS_SECTION_PATTERN =
  /Topics\s*\n+\s*Quiz([\s\S]*?)(?=\n+\s*(?:Key Points|Career opportunities:)|$)/i;

function findTopicsQuizTextSection(text = '') {
  const normalized = normalizePlainText(text);
  const match = normalized.match(TOPICS_SECTION_PATTERN);
  return match ? match[1] : null;
}

function stripTopicsBlock(text = '') {
  return normalizePlainText(text).replace(TOPICS_BLOCK_PATTERN, '').trim();
}

function htmlToPlainText(html = '') {
  return normalizePlainText(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
  );
}

function parseFromPlainText(text = '') {
  const section = findTopicsQuizTextSection(text);
  if (!section) return null;

  const rows = parseTopicsQuizRowsFromText(section);
  if (!rows.length) return null;

  return {
    rows,
    remainderText: stripTopicsBlock(text),
  };
}

function stripTopicsTableFromHtml(html = '') {
  const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/i);
  if (tableMatch && /topics/i.test(tableMatch[0]) && /quiz/i.test(tableMatch[0])) {
    return html.replace(tableMatch[0], '').trim();
  }
  return html.trim();
}

export function parseTopicsQuizTable(html = '', text = '') {
  const plainCandidates = [
    normalizePlainText(text),
    htmlToPlainText(html),
  ].filter(Boolean);

  for (const candidate of plainCandidates) {
    const parsed = parseFromPlainText(candidate);
    if (parsed) {
      return {
        rows: parsed.rows,
        remainderHtml: html?.trim() ? stripTopicsTableFromHtml(html) : '',
        remainderText: parsed.remainderText,
      };
    }
  }

  if (html?.trim()) {
    const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/i);
    if (tableMatch && /topics/i.test(tableMatch[0]) && /quiz/i.test(tableMatch[0])) {
      const rows = extractTopicsQuizRowsFromTableHtml(tableMatch[0]);
      if (rows.length) {
        return {
          rows,
          remainderHtml: html.replace(tableMatch[0], '').trim(),
          remainderText: stripTopicsBlock(text),
        };
      }
    }
  }

  return null;
}

export function stripTopicsSection(text = '') {
  return stripTopicsBlock(text);
}

export function getTopicsQuizRows(html = '', text = '') {
  const parsed = parseTopicsQuizTable(html, text);
  if (parsed?.rows?.length) return parsed.rows;

  if (html?.trim()) {
    const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/i);
    if (tableMatch && /topics/i.test(tableMatch[0]) && /quiz/i.test(tableMatch[0])) {
      const rows = extractTopicsQuizRowsFromTableHtml(tableMatch[0]);
      if (rows.length) return rows;
    }
  }

  return [];
}

export { stripTopicsTableFromHtml };
