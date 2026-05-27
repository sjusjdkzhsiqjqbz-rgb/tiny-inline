export interface FimContext {
  prefix: string;
  suffix: string;
}

const MAX_LINES_PREFIX = 100;
const MAX_LINES_SUFFIX = 40;

export function extractFimContext(
  documentContent: string,
  cursorOffset: number,
  contextWindow: number,
): FimContext {
  let prefix: string;
  let suffix: string;

  const prefixRaw = documentContent.slice(0, cursorOffset);
  const suffixRaw = documentContent.slice(cursorOffset);

  const prefixChars = contextWindow;
  const suffixChars = contextWindow;

  if (prefixRaw.length > prefixChars) {
    const trimmed = prefixRaw.slice(-prefixChars);
    const newlineIdx = trimmed.indexOf('\n');
    prefix = newlineIdx > 0 ? trimmed.slice(newlineIdx) : trimmed;
  } else {
    prefix = prefixRaw;
  }

  if (suffixRaw.length > suffixChars) {
    const trimmed = suffixRaw.slice(0, suffixChars);
    const newlineIdx = trimmed.lastIndexOf('\n');
    suffix = newlineIdx > 0 ? trimmed.slice(0, newlineIdx) : trimmed;
  } else {
    suffix = suffixRaw;
  }

  const prefixLines = prefix.split('\n');
  if (prefixLines.length > MAX_LINES_PREFIX) {
    prefix = prefixLines.slice(-MAX_LINES_PREFIX).join('\n');
  }

  const suffixLines = suffix.split('\n');
  if (suffixLines.length > MAX_LINES_SUFFIX) {
    suffix = suffixLines.slice(0, MAX_LINES_SUFFIX).join('\n');
  }

  return { prefix, suffix };
}

export function buildFimPrompt(prefix: string, suffix: string): string {
  return `<PRE> ${prefix} <SUF>${suffix} <MID>`;
}
