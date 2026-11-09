import { describe, it, expect } from 'vitest';
import {
  toUnicodeBold,
  toUnicodeItalic,
  stripMarkdown,
  getLinkedInFoldStatus
} from '../unicodeTextFormatter';

describe('unicodeTextFormatter utility', () => {
  it('converts ASCII text to Unicode bold correctly', () => {
    const original = 'Hello World 2026';
    const bolded = toUnicodeBold(original);
    expect(bolded).toBe('𝗛𝗲𝗹𝗹𝗼 𝗪𝗼𝗿𝗹𝗱 𝟮𝟬𝟮𝟲');
  });

  it('converts ASCII text to Unicode italic correctly', () => {
    const original = 'Proactive IT';
    const italicized = toUnicodeItalic(original);
    expect(italicized).toBe('𝘗𝘳𝘰𝘢𝘤𝘵𝘪𝘷𝘦 𝘐𝘛');
  });

  it('strips markdown asterisks, underscores and headings', () => {
    const markdown = '### **Why** your _network_ is failing\n\n**Key Takeaway**: Don\'t wait.';
    const cleaned = stripMarkdown(markdown);
    expect(cleaned).toBe('Why your network is failing\n\nKey Takeaway: Don\'t wait.');
  });

  it('calculates LinkedIn fold status at 210 characters', () => {
    const shortText = 'Short post hook.';
    const shortStatus = getLinkedInFoldStatus(shortText);
    expect(shortStatus.isFolded).toBe(false);
    expect(shortStatus.beforeFold).toBe('Short post hook.');
    expect(shortStatus.charCount).toBe(16);

    const longText = 'A'.repeat(250);
    const longStatus = getLinkedInFoldStatus(longText);
    expect(longStatus.isFolded).toBe(true);
    expect(longStatus.beforeFold.length).toBe(210);
    expect(longStatus.afterFold.length).toBe(40);
  });
});
