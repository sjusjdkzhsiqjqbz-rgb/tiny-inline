import { LruCache } from './cache';

const completionCache = new LruCache(200);

const LINE_COMPLETION_ENDINGS = new Set([
  ';', '}', '{', ']', ')', ',', '.', ':',
]);

export function getCached(prefix: string, suffix: string): string | undefined {
  const key = hashKey(prefix, suffix);
  return completionCache.get(key);
}

export function setCache(prefix: string, suffix: string, completion: string): void {
  const key = hashKey(prefix, suffix);
  completionCache.set(key, completion);
}

export function filterStream(
  generator: AsyncGenerator<string>,
  prefix: string,
  suffix: string,
): AsyncGenerator<string> {
  return filterGenerator(generator, prefix, suffix);
}

export function postProcess(completion: string, prefix: string, suffix: string): string {
  if (!completion) return '';

  let result = completion;

  const prefixSig = prefix.slice(-20);
  const prefixIdx = result.indexOf(prefixSig);
  if (prefixIdx >= 0) {
    result = result.slice(prefixIdx + prefixSig.length);
  }

  if (suffix && result.length > 0) {
    const suffixStart = suffix.slice(0, 20).trim();
    if (suffixStart) {
      const overlapIdx = result.indexOf(suffixStart);
      if (overlapIdx > 0) {
        result = result.slice(0, overlapIdx);
      }
    }
  }

  result = result.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '');
  result = result.replace(/(\/\/|#|--)\s*FIM-GUIDE.*$/gm, '');
  result = result.replace(/<PRE>|<SUF>|<MID>|<EOT>/gi, '');

  if (result.length > 2) {
    const firstLineEnd = result.indexOf('\n');
    if (firstLineEnd === -1 || firstLineEnd > 500) {
      const trimmed = result.trimEnd();
      if (trimmed.length >= 2 && LINE_COMPLETION_ENDINGS.has(trimmed.slice(-1))) {
        result = trimmed;
      } else if (firstLineEnd > 0) {
        result = result.slice(0, firstLineEnd);
      }
    }
  }

  return result.trimEnd();
}

function hashKey(prefix: string, suffix: string): string {
  const p = prefix.slice(-200);
  const s = suffix.slice(0, 200);
  return `${p.length}:${s.length}:${p}:::${s}`;
}

async function* filterGenerator(
  generator: AsyncGenerator<string>,
  prefix: string,
  suffix: string,
): AsyncGenerator<string> {
  let buffer = '';
  let yielded = '';

  for await (const chunk of generator) {
    buffer += chunk;

    if (buffer.includes('\n')) {
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed === '```') continue;
        if (trimmed.startsWith('//') && line.length < 4) continue;

        yield line + '\n';
        yielded += line + '\n';
      }
    }
  }

  if (buffer.trim()) {
    yield buffer;
    yielded += buffer;
  }
}

export function clearCache(): void {
  completionCache.clear();
}
