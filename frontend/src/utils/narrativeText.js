const CODE_FENCE = /```[\s\S]*?```/g;
const INLINE_CODE = /`([^`]+)`/g;
const BOLD = /\*\*([^*]+)\*\*/g;
const BOLD_UNDERSCORE = /__([^_]+)__/g;
const ITALIC = /(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:!?)']|$)/g;
const ITALIC_UNDERSCORE = /(^|[\s(])_([^_\n]+)_(?=[\s.,;:!?)']|$)/g;
const LEADING_HEADING = /^\s{0,3}#{1,6}\s+/;
const LEADING_BLOCKQUOTE = /^\s{0,3}>\s?/;
const BULLET = /^\s{0,3}([*\-+•])\s+(.*)$/;
const NUMBERED = /^\s{0,3}(\d{1,3})[.)]\s+(.*)$/;

const stripInline = (line) =>
  line
    .replace(CODE_FENCE, '')
    .replace(INLINE_CODE, '$1')
    .replace(BOLD, '$1')
    .replace(BOLD_UNDERSCORE, '$1')
    .replace(ITALIC, '$1$2')
    .replace(ITALIC_UNDERSCORE, '$1$2')
    .replace(LEADING_HEADING, '')
    .replace(LEADING_BLOCKQUOTE, '')
    .trim();

const classifyLine = (rawLine) => {
  const line = rawLine ?? '';
  if (!line.trim()) return { type: 'blank' };

  const bulletMatch = line.match(BULLET);
  if (bulletMatch) return { type: 'bullet', text: stripInline(bulletMatch[2]) };

  const numberedMatch = line.match(NUMBERED);
  if (numberedMatch) return { type: 'bullet', text: stripInline(numberedMatch[2]) };

  return { type: 'text', text: stripInline(line) };
};

export const parseNarrativeText = (input) => {
  if (input === null || input === undefined) return [];
  const text = typeof input === 'string' ? input : String(input);
  const normalized = text.replace(/\r\n?/g, '\n').replace(CODE_FENCE, '').trim();
  if (!normalized) return [];

  const lines = normalized.split('\n');
  const blocks = [];
  let paragraph = [];
  let bullets = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const joined = paragraph.join(' ').replace(/\s+/g, ' ').trim();
    if (joined) blocks.push({ type: 'paragraph', text: joined });
    paragraph = [];
  };

  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push({ type: 'list', items: bullets });
    bullets = [];
  };

  for (const rawLine of lines) {
    const { type, text } = classifyLine(rawLine);
    if (type === 'bullet') {
      flushParagraph();
      if (text) bullets.push(text);
      continue;
    }
    if (type === 'blank') {
      flushParagraph();
      flushBullets();
      continue;
    }
    flushBullets();
    if (text) paragraph.push(text);
  }

  flushParagraph();
  flushBullets();

  return blocks;
};
