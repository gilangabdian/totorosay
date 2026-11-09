export function catsay(text: string): string {
  const lines = text.split('\n');
  const maxLength = Math.max(...lines.map(l => l.length));

  // Fitur Unik: Otomatisasi mood bubble & ekspresi berdasarkan tanda baca terakhir
  const lastChar = text.trim().slice(-1);
  let topBorder = '_', bottomBorder = '-';
  let sideLeft = '|', sideRight = '|';
  let eyeLeft = '▪', eyeRight = '▪'; // Gaya mata pixel dari gambar
  let mouth = 'w';

  if (lastChar === '!') {
    topBorder = '*'; bottomBorder = '*';
    sideLeft = '['; sideRight = ']';
    eyeLeft = 'O'; eyeRight = 'O'; // Kaget/Marah
    mouth = 'A';
  } else if (lastChar === '?') {
    topBorder = '.'; bottomBorder = '.';
    sideLeft = ':'; sideRight = ':';
    eyeLeft = 'o'; eyeRight = 'O'; // Bingung/Heran
  }

  // Membuat Gelembung Balon Teks (Bubble Box)
  let bubble = `  ${topBorder.repeat(maxLength + 2)}\n`;
  for (const line of lines) {
    const padded = line.padEnd(maxLength, ' ');
    bubble += ` ${sideLeft} ${padded} ${sideRight}\n`;
  }
  bubble += `  ${bottomBorder.repeat(maxLength + 2)}`;

  // ASCII Art Bongo Cat (terinspirasi dari gambar paw menepuk)
  const cat = `
     \\
      \\     /\\_/\\
       \\   / ${eyeLeft} ${eyeRight} \\
        🐾(   ${mouth}  )
       =====(  )===
  `;

  return `${bubble}${cat}`;
}
