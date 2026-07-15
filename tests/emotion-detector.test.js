import { describe, it, expect } from 'vitest';
import { detectEmotion } from '../backend/emotion-detector.js';

describe('Emotion Detector', () => {
  it('detects angry emotion', () => {
    expect(detectEmotion('this is stupid and annoying')).toBe('angry');
  });

  it('detects sad emotion', () => {
    expect(detectEmotion('im feeling so sad and lonely')).toBe('sad');
  });

  it('detects happy emotion', () => {
    expect(detectEmotion('wow this is awesome and great')).toBe('happy');
  });

  it('detects grateful emotion', () => {
    expect(detectEmotion('thank you so much')).toBe('grateful');
  });

  it('defaults to neutral', () => {
    expect(detectEmotion('what is the time')).toBe('neutral');
  });
});
