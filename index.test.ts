import { describe, it, expect } from 'vitest';
import { totorosay } from './index.js';

describe('totorosay() core library', () => {
  it('renders speech bubble with text, cute decorations, and Totoro sprite', () => {
    const result = totorosay('Meow');

    // Contains text inside speech bubble
    expect(result).toContain('Meow');

    // Contains heart and spark decorations
    expect(result).toContain('♡');
    expect(result).toContain('✦');

    // Contains bubble tail pointing down
    expect(result).toContain('▼');

    // Contains half-block ANSI pixel art characters
    expect(result).toContain('▄');
    expect(result).toContain('▀');
  });

  it('handles multi-line and long text with automatic wrapping', () => {
    const longMessage =
      'This is a long sentence that should wrap automatically across multiple lines inside Totoro speech bubble.';
    const result = totorosay(longMessage);

    expect(result).toContain('This is a long');
    expect(result).toContain('▼');
  });

  it('safely handles empty or falsy inputs', () => {
    const result = totorosay('');
    expect(result).toContain('♡');
    expect(result).toContain('▼');
  });
});
