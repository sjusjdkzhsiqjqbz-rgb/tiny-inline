import type { ProviderConfig, CompletionRequest, CompletionResult } from './types';

function makeHeaders(config: ProviderConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey) {
    if (config.authType === 'x-api-key') {
      headers['x-api-key'] = config.apiKey;
    } else {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
  }
  headers['Accept'] = 'text/event-stream';
  return headers;
}

function buildFimChatPrompt(prefix: string, suffix: string): string {
  const trimmedPrefix = prefix.slice(-2000);
  const trimmedSuffix = suffix.slice(0, 2000);
  const suffixIsEmpty = !trimmedSuffix.trim();

  if (suffixIsEmpty) {
    return `You are a code autocomplete engine. Continue the code below by writing ONLY the very next 1-3 lines.
Do NOT write entire function bodies. Do NOT invent new functions or types.
Return ONLY the continuation — no markdown, no backticks, no commentary.

Code:
${trimmedPrefix}

Next lines:`;
  }

  return `You are a code completion engine. Return ONLY the code that goes between the prefix and suffix.
Output ONLY 1-3 lines. Do not repeat the prefix or suffix. Do not add explanations.

<PREFIX>
${trimmedPrefix}
</PREFIX>

<SUFFIX>
${trimmedSuffix}
</SUFFIX>

Your task: output the exact code that should appear at the cursor position, between prefix and suffix.
Return only the code — no markdown, no backticks, no commentary.`;
}

export async function testOpenAICompatible(config: ProviderConfig): Promise<boolean> {
  try {
    const resp = await fetch(`${config.baseUrl}/models`, {
      method: 'GET',
      headers: makeHeaders(config),
      signal: AbortSignal.timeout(10000),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export function testOpenAICompatibleFim(config: ProviderConfig): Promise<boolean> {
  return fetch(`${config.baseUrl}/completions`, {
    method: 'POST',
    headers: makeHeaders(config),
    body: JSON.stringify({
      model: config.model,
      prompt: 'function test() {',
      suffix: '}',
      max_tokens: 1,
      temperature: 0,
      stream: false,
    }),
    signal: AbortSignal.timeout(10000),
  })
    .then(r => r.ok)
    .catch(() => false);
}

export async function* streamNativeFim(
  config: ProviderConfig,
  request: CompletionRequest,
  maxTokens: number,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const body = JSON.stringify({
    model: config.model,
    prompt: request.prefix,
    suffix: request.suffix,
    max_tokens: maxTokens,
    temperature: 0,
    stop: ['<PRE>', '<SUF>', '<MID>', '<EOT>', ' <file_sep>', '\n\n\n'],
    stream: true,
  });

  const resp = await fetch(`${config.baseUrl}/completions`, {
    method: 'POST',
    headers: makeHeaders(config),
    body,
    signal,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Completions API error ${resp.status}: ${errText}`);
  }

  const reader = resp.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        const text = parsed.choices?.[0]?.text;
        if (text) yield text;
      } catch {
        continue;
      }
    }
  }
}

export async function* streamChat(
  config: ProviderConfig,
  request: CompletionRequest,
  maxTokens: number,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const systemPrompt = buildFimChatPrompt(request.prefix, request.suffix);
  const body = JSON.stringify({
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '<|middle|>' },
    ],
    max_tokens: maxTokens,
    temperature: 0,
    stop: ['<PRE>', '<SUF>', '<MID>', '<EOT>', '\n\n\n'],
    stream: true,
  });

  const resp = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: makeHeaders(config),
    body,
    signal,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Chat API error ${resp.status}: ${errText}`);
  }

  const reader = resp.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        continue;
      }
    }
  }
}
