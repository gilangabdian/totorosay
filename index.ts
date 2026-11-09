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
  // . = transparent
  const HALF_MAP = [
    '..........OOOO.....', // 0  ear tips
    '.........OSSSO.....',
    '........OSSSSO.....',
    '........OSSSSO.....',
    '.......OSSSSSO.....',
    '.......OSSSSSO.....',
    '.......OGGGGGO.....',
    '.......OGGGGGO.....',
    '.......OGGGGGO.....',
    '.......OGGGGGOOOOOO', // 9  line between the ears
    '......OGGGGGGGGGGGG', // 10 head
    '.....OGGGGGGGGGGGGG',
    '...SSOGGGGGGGGGGGGG', // 12 whisker
    '.....OGGGGGGGGGGGGG',
    '..SSSOGGGGGGGGGGGGG', // 14 whisker
    '....OGGGGGWWWWGGGGG', // 15 eyes
    '..SSOGGGGGWOOWGGGGG', // 16 whisker + eyes
    '....OGGGGGWOOWGGGGO', // 17 eyes + nose
    '....OGGGGGWWWWGGGGG', // 18 eyes
    '...OGGGGGGGGGGGGGGG', // 19 body
    '...OGGGGGGCCCCCCCCC', // 20 belly starts
    '...OGGGGGCCCCCCCCCC',
    '...OGGGGCCCCCCCCCCC',
    '...OGGGCCCCCCOCCCCO', // 23 belly marks
    '...OGGGCCCCCOCOCCOC',
    '...OGGGCCCCCCCCCCCC',
    '.OOOSSSCCCOCCCCOCCC', // 26 arm + belly marks
    '.OSOSSSCCOCOCCOCOCC',
    '.OSOSSSCCCCCCCCCCCC',
    '.OSOSSSCCCCCCCCCCCC',
    '.OSOSSSCCCCCCCCCCCC',
    '.OOOSSSCCCCCCCCCCCC',
    '...OSSSCCCCCCCCCCCC',
    '...OSSSTTTTTTTTTTTT', // 33 tan stripe
    '...OSSSTTTTTTTTTTTT',
    '...OSSSSCCCCCCCCCCC',
    '....OSSSOOOOOOOOOOO', // 36 bottom outline
    '........OSSSSSO....', // 37 feet
    '........OOOOOOO....', // 38
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
    if (top === '.' && bottom === '.') {
      return ' ';
    }

    if (top === '.') {
      return `${color(bottom)}▄${RESET}`;
    }

    if (bottom === '.') {
      return `${color(top)}▀${RESET}`;
    }

    if (top === bottom) {
      return `${color(top)}█${RESET}`;
    }

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

  // Speech bubble
  const CONTENT_WIDTH = WIDTH - 4;

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

  const bubbleWidth = Math.min(
    WIDTH,
    Math.max(20, ...lines.map(line => line.length + 4))
  );

  const center = (value: string): string => {
    const left = Math.max(0, Math.floor((WIDTH - value.length) / 2));
    return ' '.repeat(left) + value;
  };

  const bubbleColor = '\x1b[38;2;105;88;100m';

  const bubble = [
    `╭${'─'.repeat(bubbleWidth - 2)}╮`,
    ...lines.map(line => `│ ${line.padEnd(bubbleWidth - 4)} │`),
    `╰${'─'.repeat(bubbleWidth - 2)}╯`,
  ]
    .map(line => `${bubbleColor}${center(line)}${RESET}`)
    .join('\n');

  const tail = `${bubbleColor}${center('╲')}${RESET}`;

  return [bubble, tail, renderTotoro()].join('\n');
}