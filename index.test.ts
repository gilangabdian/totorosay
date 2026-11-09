import { describe, it, expect } from 'vitest';
import { catsay } from './index.js';

describe('catsay() core library', () => {
  it('harus menghasilkan bubble box dengan teks default', () => {
    const result = catsay('Meow');
    expect(result).toContain('| Meow |');
    expect(result).toContain('▪ ▪'); // Memastikan mata default keluar
  });

  it('harus merubah ekspresi balon dan mata saat mendeteksi tanda seru (!)', () => {
    const result = catsay('Bongo Cat!');
    expect(result).toContain('[ Bongo Cat! ]'); // Memakai border tajam '['
    expect(result).toContain('O O'); // Mata melotot
  });
});
