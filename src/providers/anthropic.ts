import type { ProviderConfig, CompletionRequest } from './types';

const STOP_TOKENS = ['<PRE>', '<SUF>', '<MID>', '<EOT>'];

function buildFimPrompt(prefix: string, suffix: string): string {
  const trimmedPrefix = prefix.slice(-2000);
  const trimmedSuffix = suffix.slice(0, 2000);
  const suffixIsEmpty = !trimmedSuffix.trim();

  if (suffixIsEmpty) {
    return `Continue the code below by writing ONLY the very next 1-3 lines.
Do NOT write entire function bodies. Do NOT invent new functions or types.

Code:
${trimmedPrefix}

Next lines:`;
  }

  return `Fill the gap. Return ONLY the code between prefix and suffix (1-3 lines max).

<PREFIX>
${trimmedPrefix}
</PREFIX>

<SUFFIX>
${trimmedSuffix}
</SUFFIX>

Missing code:`;
}

export async function testAnthropic(config: ProviderConfig): Promise<boolean> {
  try {
    const resp = await fetch(`${config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
      signal: AbortSignal.timeout(10000),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export async function* streamAnthropic(
  config: ProviderConfig,
  request: CompletionRequest,
  maxTokens: number,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const prompt = buildFimPrompt(request.prefix, request.suffix);
  const body = JSON.stringify({
    model: config.model,
    max_tokens: maxTokens,
    temperature: 0,
    stop_sequences: STOP_TOKENS,
    system: 'You are a code completion engine. Output ONLY the code. No explanations, no markdown, no backticks.',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  const resp = await fetch(`${config.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body,
    signal,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Anthropic API error ${resp.status}: ${errText}`);
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
        if (parsed.type === 'content_block_delta') {
          const text = parsed.delta?.text;
          if (text) yield text;
        }
      } catch {
        continue;
      }
    }
  }
}

export function testAnthropicFim(_config: ProviderConfig): boolean {
  return false;
}
