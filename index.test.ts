import { describe, it, expect } from 'vitest';
import { catsay } from './index.js';

describe('catsay() core library', () => {
  it('must return bubble box with teks default', () => {
    const result = catsay('Meow');
    expect(result).toContain('| Meow |');
    expect(result).toContain('▪ ▪');
  });

  it('must change the expression of the balloon and eyes when detecting an exclamation mark (!)', () => {
    const result = catsay('Bongo Cat!');
    expect(result).toContain('[ Bongo Cat! ]');
    expect(result).toContain('O O');
  });
});
