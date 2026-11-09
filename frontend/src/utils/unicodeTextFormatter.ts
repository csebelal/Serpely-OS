/**
 * Unicode Text Formatter for LinkedIn & Social Media Posts
 * Transforms standard ASCII characters into mathematical Unicode variants that render natively
 * across LinkedIn, Facebook, X, and other platforms without Markdown.
 */

// Mathematical Sans-serif Bold mappings
const BOLD_MAP: Record<string, string> = {
  // Uppercase A-Z
  A: '𝗔', B: '𝗕', C: '𝗖', D: '𝗗', E: '𝗘', F: '𝗙', G: '𝗚', H: '𝗛', I: '𝗜',
  J: '𝗝', K: '𝗞', L: '𝗟', M: '𝗠', N: '𝗡', O: '𝗢', P: '𝗣', Q: '𝗤', R: '𝗥',
  S: '𝗦', T: '𝗧', U: '𝗨', V: '𝗩', W: '𝗪', X: '𝗫', Y: '𝗬', Z: '𝗭',
  // Lowercase a-z
  a: '𝗮', b: '𝗯', c: '𝗰', d: '𝗱', e: '𝗲', f: '𝗳', g: '𝗴', h: '𝗵', i: '𝗶',
  j: '𝗷', k: '𝗸', l: '𝗹', m: '𝗺', n: '𝗻', o: '𝗼', p: '𝗽', q: '𝗾', r: '𝗿',
  s: '𝘀', t: '𝘁', u: '𝘂', v: '𝘃', w: '𝘄', x: '𝘅', y: '𝘆', z: '𝘇',
  // Digits 0-9
  '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰',
  '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
};

// Mathematical Sans-serif Italic mappings
const ITALIC_MAP: Record<string, string> = {
  // Uppercase A-Z
  A: '𝘈', B: '𝘉', C: '𝘊', D: '𝘋', E: '𝘌', F: '𝘍', G: '𝘎', H: '𝘏', I: '𝘐',
  J: '𝘑', K: '𝘒', L: '𝘓', M: '𝘔', N: '𝘕', O: '𝘖', P: '𝘗', Q: '𝘘', R: '𝘙',
  S: '𝘚', T: '𝘛', U: '𝘜', V: '𝘝', W: '𝘞', X: '𝘟', Y: '𝘠', Z: '𝘡',
  // Lowercase a-z
  a: '𝘢', b: '𝘣', c: '𝘤', d: '𝘥', e: '𝘦', f: '𝘧', g: '𝘨', h: '𝘩', i: '𝘪',
  j: '𝘫', k: '𝘬', l: '𝘭', m: '𝘮', n: '𝘯', o: '𝘰', p: '𝘱', q: '𝘲', r: '𝘳',
  s: '𝘴', t: '𝘵', u: '𝘶', v: '𝘷', w: '𝘸', x: '𝘹', y: '𝘺', z: '𝘻'
};

/**
 * Converts standard ASCII text into mathematical Unicode Bold characters.
 */
export function toUnicodeBold(text: string): string {
  if (!text) return '';
  return text
    .split('')
    .map(ch => BOLD_MAP[ch] || ch)
    .join('');
}

/**
 * Converts standard ASCII text into mathematical Unicode Italic characters.
 */
export function toUnicodeItalic(text: string): string {
  if (!text) return '';
  return text
    .split('')
    .map(ch => ITALIC_MAP[ch] || ch)
    .join('');
}

/**
 * Strips raw markdown asterisks and hash headings that look ugly on LinkedIn.
 */
export function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/___(.*?)___/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^>\s*/gm, '')
    .trim();
}

/**
 * LinkedIn truncates desktop/mobile feeds after ~210 characters with "...see more".
 * Calculates exact metrics and splits text at the fold line.
 */
export interface LinkedInFoldInfo {
  beforeFold: string;
  afterFold: string;
  isFolded: boolean;
  charCount: number;
  wordCount: number;
  linesCount: number;
  estimatedReadTimeSec: number;
}

export function getLinkedInFoldStatus(text: string, foldLimit = 210): LinkedInFoldInfo {
  const content = text || '';
  const charCount = content.length;
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const linesCount = content.split('\n').length;
  const isFolded = charCount > foldLimit;
  const beforeFold = isFolded ? content.slice(0, foldLimit) : content;
  const afterFold = isFolded ? content.slice(foldLimit) : '';
  const estimatedReadTimeSec = Math.max(1, Math.round(wordCount / 3.5)); // ~210 words/min

  return {
    beforeFold,
    afterFold,
    isFolded,
    charCount,
    wordCount,
    linesCount,
    estimatedReadTimeSec
  };
}
