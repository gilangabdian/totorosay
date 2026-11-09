const RESET = '\x1b[0m';

// Totoro pixel-art color palette matching reference image
const COLORS: Record<string, [number, number, number]> = {
  O: [111, 93, 102],   // Dark outline, nose, eyes
  S: [174, 163, 163],  // Darker gray (ears tip, whiskers, arms, feet, belly chevrons)
  G: [192, 181, 185],  // Main gray body
  C: [253, 246, 219],  // Cream belly
  T: [239, 221, 198],  // Tan belly stripe
  W: [255, 255, 255],  // White eyes
};

// RLE compressed half-map (21 chars per row, 47 rows, mirrored horizontally to 41 px)
const RLE_MAP =
  '11.3O17.O3SO15.O4SO14.O5SO14.O5SO14.O5SO14.O5GO14.O5GO13.O6GO13.O6GO13.O5G8O7.O13G7.O13G7.O13G7.O13G2.4S.O13G6.SO13G6.O14G2.4SO4G4W6G5.SO3GW3OW6G5.O4GW3OW3G3O3.2O5GW3OW5GO2.O.O6G4W6G4.O16G4.O9G7C4.O7G9C3.O7G10C3.O6G4CS5CS2.SO6G3CSCS3CSC2.O6G12C2.O6G2CS9C.OGO5GCSCS4CS3C.OGO4G8CSCS2C.OGO4G13CO2SO4S13CO2SO4S13CO2SO4S13C.7S13C2.O5S13C3.5S13T3.O4S13T4.O4S12C5.O3S12C6.O4S10T7.14O9.O3SO17.3O8.';

const HALF_ROWS = RLE_MAP.replace(/(\d+)(.)/g, (_, n, c) => c.repeat(+n)).match(/.{21}/g)!;
const PIXEL_MAP = HALF_ROWS.map(half => half + half.slice(0, -1).split('').reverse().join(''));
const WIDTH = 41;

const color = (key: string, background = false): string => {
  const rgb = COLORS[key];
  if (!rgb) return '';
  const [r, g, b] = rgb;
  return background
    ? `\x1b[48;2;${r};${g};${b}m`
    : `\x1b[38;2;${r};${g};${b}m`;
};

const renderPixels = (top: string, bottom: string): string => {
  if (top === '.' && bottom === '.') return ' ';
  if (top === '.') return `${color(bottom)}▄${RESET}`;
  if (bottom === '.') return `${color(top)}▀${RESET}`;
  if (top === bottom) return `${color(top)}█${RESET}`;
  return `${color(top)}${color(bottom, true)}▀${RESET}`;
};

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

// Static sprite pre-computed once to eliminate repeated allocations
const TOTORO = renderTotoro();

const CONTENT_WIDTH = WIDTH - 8;
const BORDER = color('O');
const FILL = color('C', true);
const TEXT = color('O');
const HEART = '\x1b[38;2;240;150;170m';
const SPARK = color('T');

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

const centerIn = (value: string, width: number): string => {
  const total = Math.max(0, width - value.length);
  const left = Math.floor(total / 2);
  return ' '.repeat(left) + value + ' '.repeat(total - left);
};

export function totorosay(text: string): string {
  const safeText = String(text ?? '');
  const lines = wrapText(safeText);

  let bubbleWidth = Math.min(
    WIDTH,
    Math.max(25, ...lines.map(line => line.length + 8))
  );
  if ((bubbleWidth - WIDTH) % 2 !== 0) bubbleWidth += 1;
  bubbleWidth = Math.min(bubbleWidth, WIDTH);

  const inner = bubbleWidth - 2;
  const bubbleLeft = Math.floor((WIDTH - bubbleWidth) / 2);
  const pad = ' '.repeat(bubbleLeft);

  const topFill = '─'.repeat(inner - 8);
  const top = `${BORDER}╭─ ${HEART}♡${BORDER} ${topFill} ${SPARK}✦${BORDER} ─╮${RESET}`;
  const body = lines.map(line =>
    `${BORDER}│${FILL}${TEXT}${centerIn(line, inner)}${RESET}${BORDER}│${RESET}`
  );
  const emptyRow = `${BORDER}│${FILL}${' '.repeat(inner)}${RESET}${BORDER}│${RESET}`;
  const sideFill = '─'.repeat((inner - 1) / 2);
  const bottom = `${BORDER}╰${sideFill}┬${sideFill}╯${RESET}`;
  const tail = ' '.repeat(bubbleLeft + 1 + (inner - 1) / 2) + `${BORDER}▼${RESET}`;

  const bubble = [top, emptyRow, ...body, emptyRow, bottom]
    .map(line => pad + line)
    .join('\n');

  return [bubble, tail, TOTORO].join('\n');
}

export default totorosay;
