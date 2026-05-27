import type { ProviderConfig, CompletionRequest } from './types';
import { resolveProviderConfig } from '../config';
import { streamDeepseek } from './deepseek';
import { streamChat, streamNativeFim } from './openai-compatible';
import { streamAnthropic } from './anthropic';

export type CompletionStreamer = (
  config: ProviderConfig,
  request: CompletionRequest,
  maxTokens: number,
  signal?: AbortSignal,
) => AsyncGenerator<string>;

export interface ResolvedProvider {
  config: ProviderConfig;
  stream: CompletionStreamer;
}

const CHAT_PRESETS = new Set([
  'opencode-zen', 'openai', 'ollama',
  'groq', 'deepinfra', 'together', 'fireworks', 'mistral', 'xai', 'lmstudio',
]);

export function resolveProvider(name: string): ResolvedProvider | null {
  const config = resolveProviderConfig(name);
  if (!config) return null;

  let stream: CompletionStreamer;

  if (config.type === 'preset') {
    if (config.name === 'deepseek') {
      stream = streamDeepseek;
    } else if (config.name === 'anthropic') {
      stream = streamAnthropic;
    } else if (CHAT_PRESETS.has(config.name)) {
      stream = streamChat;
    } else {
      return null;
    }
  } else {
    stream = config.fimNative ? streamNativeFim : streamChat;
  }

  return { config, stream };
}

export async function resolveWithFallback(name: string): Promise<ResolvedProvider | null> {
  return resolveProvider(name);
}
