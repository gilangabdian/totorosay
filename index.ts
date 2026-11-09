export function catsay(text: string): string {
  const RESET = '\x1b[0m';

  // Totoro pixel-art color palette
  const COLORS: Record<string, [number, number, number]> = {
    O: [105, 88, 100],    // Dark outline
    S: [150, 138, 148],   // Darker gray (shadow, whiskers, arms)
    G: [176, 165, 175],   // Main gray body
    C: [252, 246, 214],   // Cream belly
    T: [238, 218, 160],   // Tan belly stripe
    W: [255, 255, 255],   // White eyes
  };

  // Left half of the sprite (19 chars per row, last char = center column).
  // The right half is mirrored automatically, so every row is 37 pixels wide.
  const HALF_MAP = [
    '..........OOOO.....',
    '.........OSSSO.....',
    '........OSSSSO.....',
    '........OSSSSO.....',
    '.......OSSSSSO.....',
    '.......OSSSSSO.....',
    '.......OGGGGGO.....',
    '.......OGGGGGO.....',
    '.......OGGGGGO.....',
    '.......OGGGGGOOOOOO',
    '......OGGGGGGGGGGGG',
    '.....OGGGGGGGGGGGGG',
    '...SSOGGGGGGGGGGGGG',
    '.....OGGGGGGGGGGGGG',
    '..SSSOGGGGGGGGGGGGG',
    '....OGGGGGWWWWGGGGG',
    '..SSOGGGGGWOOWGGGGG',
    '....OGGGGGWOOWGGGGO',
    '....OGGGGGWWWWGGGGG',
    '...OGGGGGGGGGGGGGGG',
    '...OGGGGGGCCCCCCCCC',
    '...OGGGGGCCCCCCCCCC',
    '...OGGGGCCCCCCCCCCC',
    '...OGGGCCCCCCOCCCCO',
    '...OGGGCCCCCOCOCCOC',
    '...OGGGCCCCCCCCCCCC',
    '.OOOSSSCCCOCCCCOCCC',
    '.OSOSSSCCOCOCCOCOCC',
    '.OSOSSSCCCCCCCCCCCC',
    '.OSOSSSCCCCCCCCCCCC',
    '.OSOSSSCCCCCCCCCCCC',
    '.OOOSSSCCCCCCCCCCCC',
    '...OSSSCCCCCCCCCCCC',
    '...OSSSTTTTTTTTTTTT',
    '...OSSSTTTTTTTTTTTT',
    '...OSSSSCCCCCCCCCCC',
    '....OSSSOOOOOOOOOOO',
    '........OSSSSSO....',
    '........OOOOOOO....',
  ];

  const mirror = (half: string): string =>
    half + half.slice(0, -1).split('').reverse().join('');

  const PIXEL_MAP = HALF_MAP.map(mirror);

  const WIDTH = Math.max(...PIXEL_MAP.map(row => row.length));

  // ANSI color helper
  const color = (key: string, background = false): string => {
    const rgb = COLORS[key];
    if (!rgb) return '';

    const [r, g, b] = rgb;

    return background
      ? `\x1b[48;2;${r};${g};${b}m`
      : `\x1b[38;2;${r};${g};${b}m`;
  };

  // Render two vertical pixels into one terminal character
  const renderPixels = (top: string, bottom: string): string => {
    if (top === '.' && bottom === '.') return ' ';
    if (top === '.') return `${color(bottom)}▄${RESET}`;
    if (bottom === '.') return `${color(top)}▀${RESET}`;
    if (top === bottom) return `${color(top)}█${RESET}`;
    return `${color(top)}${color(bottom, true)}▀${RESET}`;
  };

  // Render Totoro
  const renderTotoro = (): string => {
    const output: string[] = [];

    for (let y = 0; y < PIXEL_MAP.length; y += 2) {
      const top = PIXEL_MAP[y].padEnd(WIDTH, '.');
      const bottom = (PIXEL_MAP[y + 1] ?? '').padEnd(WIDTH, '.');

      let line = '';
      for (let x = 0; x < WIDTH; x++) {
        line += renderPixels(top[x], bottom[x]);
      }
      output.push(line);
    }

    return output.join('\n');
  };

  // ───────────── Cute speech bubble (changed section) ─────────────
  const CONTENT_WIDTH = WIDTH - 8;

  const wrapText = (value: string): string[] => {
    return value.split('\n').flatMap(paragraph => {
      if (!paragraph) return [''];

      const words = paragraph.split(/\s+/);
      const result: string[] = [];
      let current = '';

      for (const word of words) {
        if (current && current.length + word.length + 1 > CONTENT_WIDTH) {
          result.push(current);
          current = '';
        }

        let remaining = word;

        while (remaining.length > CONTENT_WIDTH) {
          if (current) {
            result.push(current);
            current = '';
          }
          result.push(remaining.slice(0, CONTENT_WIDTH));
          remaining = remaining.slice(CONTENT_WIDTH);
        }

        if (remaining) {
          current += (current ? ' ' : '') + remaining;
        }
      }

      if (current) result.push(current);
      return result;
    });
  };

  const lines = wrapText(text);

  // Bubble width is kept the same parity as the sprite so the tail
  // lands exactly on Totoro's center column.
  let bubbleWidth = Math.min(
    WIDTH,
    Math.max(25, ...lines.map(line => line.length + 8))
  );
  if ((bubbleWidth - WIDTH) % 2 !== 0) bubbleWidth += 1;
  bubbleWidth = Math.min(bubbleWidth, WIDTH);

  const inner = bubbleWidth - 2;
  const bubbleLeft = Math.floor((WIDTH - bubbleWidth) / 2);
  const pad = ' '.repeat(bubbleLeft);

  const BORDER = color('O'); // soft purple outline
  const FILL = color('C', true); // cream fill, same as the belly
  const TEXT = color('O'); // text matches the outline
  const HEART = '\x1b[38;2;240;150;170m'; // pink heart
  const SPARK = color('T'); // tan sparkle

  // Center text inside the bubble
  const centerIn = (value: string, width: number): string => {
    const total = Math.max(0, width - value.length);
    const left = Math.floor(total / 2);
    return ' '.repeat(left) + value + ' '.repeat(total - left);
  };

  // Top border with tiny decorations:  ╭─ ♡ ────── ✦ ─╮
  const topFill = '─'.repeat(inner - 8);
  const top =
    `${BORDER}╭─ ${HEART}♡${BORDER} ${topFill} ${SPARK}✦${BORDER} ─╮${RESET}`;

  // Text rows with cream background
  const body = lines.map(line =>
    `${BORDER}│${FILL}${TEXT}${centerIn(line, inner)}${RESET}${BORDER}│${RESET}`
  );

  // Soft empty rows above/below the text so it breathes
  const emptyRow = `${BORDER}│${FILL}${' '.repeat(inner)}${RESET}${BORDER}│${RESET}`;

  // Bottom border with the tail notch in the center
  const sideFill = '─'.repeat((inner - 1) / 2);
  const bottom = `${BORDER}╰${sideFill}┬${sideFill}╯${RESET}`;

  // Little tail pointing down at Totoro's head
  const tail = ' '.repeat(bubbleLeft + 1 + (inner - 1) / 2) +
    `${BORDER}▼${RESET}`;

  const bubble = [top, emptyRow, ...body, emptyRow, bottom]
    .map(line => pad + line)
    .join('\n');

  return [bubble, tail, renderTotoro()].join('\n');
}