import type { ProviderConfig, CompletionRequest } from './types';

const STOP_TOKENS = ['<PRE>', '<SUF>', '<MID>', '<EOT>', '喋', 'レ', 'ンス'];

function makeHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    Accept: 'text/event-stream',
  };
}

export async function testDeepseekFim(config: ProviderConfig): Promise<boolean> {
  try {
    const resp = await fetch(`${config.baseUrl}/beta/completions`, {
      method: 'POST',
      headers: makeHeaders(config.apiKey),
      body: JSON.stringify({
        model: config.model,
        prompt: 'function test() {',
        suffix: '}',
        max_tokens: 1,
        temperature: 0,
        stream: false,
      }),
      signal: AbortSignal.timeout(10000),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export async function* streamDeepseek(
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
    stop: STOP_TOKENS,
    stream: true,
  });

  const resp = await fetch(`${config.baseUrl}/beta/completions`, {
    method: 'POST',
    headers: makeHeaders(config.apiKey),
    body,
    signal,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`DeepSeek API error ${resp.status}: ${errText}`);
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
