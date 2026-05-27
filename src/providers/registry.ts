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

export function resolveProvider(name: string): ResolvedProvider | null {
  const config = resolveProviderConfig(name);
  if (!config) return null;

  let stream: CompletionStreamer;

  if (config.type === 'preset') {
    switch (config.name) {
      case 'deepseek':
        stream = streamDeepseek;
        break;
      case 'opencode-zen':
        stream = streamChat;
        break;
      case 'anthropic':
        stream = streamAnthropic;
        break;
      case 'openai':
      case 'ollama':
        stream = streamChat;
        break;
      default:
        return null;
    }
  } else {
    stream = config.fimNative ? streamNativeFim : streamChat;
  }

  return { config, stream };
}

export async function resolveWithFallback(name: string): Promise<ResolvedProvider | null> {
  const resolved = resolveProvider(name);
  if (!resolved) return null;

  if (resolved.config.fimNative) {
    return resolved;
  }

  if (resolved.config.type === 'custom') {
    return resolved;
  }

  return resolved;
}
