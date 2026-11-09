const RESET = '\x1b[0m';

// Totoro pixel-art color palette
const COLORS: Record<string, [number, number, number]> = {
  O: [105, 88, 100],
  S: [150, 138, 148],
  G: [176, 165, 175],
  C: [252, 246, 214],
  T: [238, 218, 160],
  W: [255, 255, 255],
};

// RLE compressed half-map (19 chars per row, 39 rows)
const RLE_MAP =
  '10.4O14.O3SO13.O4SO13.O4SO12.O5SO12.O5SO12.O5GO12.O5GO12.O5GO12.O5G6O6.O12G5.O13G3.2SO13G5.O13G2.3SO13G4.O5G4W5G2.2SO5GW2OW5G4.O5GW2OW4GO4.O5G4W5G3.O15G3.O6G9C3.O5G10C3.O4G11C3.O3G6CO4CO3.O3G5COCO2COC3.O3G12C.3O3S3CO4CO3C.OSO3S2COCO2COCO2C.OSO3S12C.OSO3S12C.OSO3S12C.3O3S12C3.O3S12C3.O3S12T3.O3S12T3.O4S11C4.O3S11O8.O5SO12.7O4.';

const HALF_ROWS = RLE_MAP.replace(/(\d+)(.)/g, (_, n, c) => c.repeat(+n)).match(/.{19}/g)!;
const PIXEL_MAP = HALF_ROWS.map(half => half + half.slice(0, -1).split('').reverse().join(''));
const WIDTH = 37;

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
