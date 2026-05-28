# Tiny Inline

Minimal AI inline code completions for VSCodium / VS Code. No sidebar, no chat, no agents — just ghost-text code suggestions as you type.

Supports **12 built-in providers** and unlimited **custom OpenAI-compatible providers**.

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Repo](https://img.shields.io/badge/GitHub-tiny--inline-blue?logo=github)](https://github.com/sjusjdkzhsiqjqbz-rgb/tiny-inline)

---

## Features

- **12 built-in provider presets** — DeepSeek, OpenCode Zen, Anthropic, OpenAI, Ollama, Groq, DeepInfra, Together, Fireworks, Mistral, xAI, LM Studio
- **Unlimited custom providers** — any OpenAI-compatible API endpoint
- **FIM-native support** — DeepSeek's native fill-in-the-middle endpoint for best quality completions
- **FIM auto-detection** — test whether a provider supports native FIM or uses prompt-based fallback
- **LRU completion cache** — avoid re-requesting identical contexts
- **Conservative completions** — temperature 0, max 3 lines, truncates invented function declarations
- **Debounced requests** — avoids flooding the API on rapid typing
- **Status bar indicator** — shows active provider, click to toggle on/off
- **Switch providers via quick pick** — `Ctrl+Shift+P` → `Tiny Inline: Switch Provider`

---

## Installation

### From VSIX (recommended for testing)

```bash
# Build the .vsix
npm run package

# Install in VSCodium
codium --install-extension tiny-inline-*.vsix
```

### Dev mode (live development)

```bash
codium --extensionDevelopmentPath=/path/to/tiny-inline
```

### From source

```bash
npm install
npm run build          # compiles to dist/
npm run package        # creates .vsix for distribution
```

---

## Quick Start

1. **Install and reload VSCodium**
2. **Set your API key** — `Ctrl+,` → search `tiny-inline`:
   - `Tiny Inline > Providers > Deepseek > Api Key` — or any other provider
3. **Switch to a provider** — `Ctrl+Shift+P` → `Tiny Inline: Switch Provider`
4. **Open a code file and start typing** — completions appear as ghost text

---

## Configuration Reference

All settings are under `tiny-inline.*` in VS Code settings.

### General

| Setting | Default | Description |
|---|---|---|
| `tiny-inline.enabled` | `true` | Enable/disable inline completions |
| `tiny-inline.activeProvider` | `deepseek` | Active provider ID (preset name or custom provider name) |
| `tiny-inline.debounceMs` | `150` | Milliseconds to wait after typing before requesting |
| `tiny-inline.maxTokens` | `256` | Max tokens per completion |
| `tiny-inline.maxLines` | `3` | Max lines in a completion (longer completions are truncated) |
| `tiny-inline.contextWindow` | `2048` | Max characters of document context (before + after cursor) |

### Provider Settings

Each provider has three settings: `apiKey`, `model`, `baseUrl`. Only `apiKey` requires configuration — defaults work out of the box.

#### DeepSeek *(FIM-native — best quality)*

| Setting | Default |
|---|---|
| `tiny-inline.providers.deepseek.apiKey` | _(empty)_ |
| `tiny-inline.providers.deepseek.model` | `deepseek-coder` |
| `tiny-inline.providers.deepseek.baseUrl` | `https://api.deepseek.com` |

Uses DeepSeek's native `/beta/completions` endpoint with `prompt`+`suffix` FIM parameters. The only provider with true fill-in-the-middle support.

#### OpenCode Zen

| Setting | Default |
|---|---|
| `tiny-inline.providers.opencodeZen.apiKey` | _(empty)_ |
| `tiny-inline.providers.opencodeZen.model` | `deepseek-v4-pro` |
| `tiny-inline.providers.opencodeZen.baseUrl` | `https://opencode.ai/zen/go/v1` |

OpenCode's curated model hub. Models: deepseek-v4-pro, deepseek-v4-flash, qwen3.7-max, kimi-k2.6, glm-5.1, mimo-v2.5, and more.

#### Anthropic

| Setting | Default |
|---|---|
| `tiny-inline.providers.anthropic.apiKey` | _(empty)_ |
| `tiny-inline.providers.anthropic.model` | `claude-sonnet-4-20250514` |
| `tiny-inline.providers.anthropic.baseUrl` | `https://api.anthropic.com` |

Uses Anthropic's `/v1/messages` streaming endpoint.

#### OpenAI

| Setting | Default |
|---|---|
| `tiny-inline.providers.openai.apiKey` | _(empty)_ |
| `tiny-inline.providers.openai.model` | `gpt-4o` |
| `tiny-inline.providers.openai.baseUrl` | `https://api.openai.com` |

#### Groq *(fast, free tier available)*

| Setting | Default |
|---|---|
| `tiny-inline.providers.groq.apiKey` | _(empty)_ |
| `tiny-inline.providers.groq.model` | `qwen-qwq-32b` |
| `tiny-inline.providers.groq.baseUrl` | `https://api.groq.com/openai/v1` |

#### DeepInfra

| Setting | Default |
|---|---|
| `tiny-inline.providers.deepinfra.apiKey` | _(empty)_ |
| `tiny-inline.providers.deepinfra.model` | `deepseek-ai/DeepSeek-V3` |
| `tiny-inline.providers.deepinfra.baseUrl` | `https://api.deepinfra.com/v1/openai` |

#### Together AI

| Setting | Default |
|---|---|
| `tiny-inline.providers.together.apiKey` | _(empty)_ |
| `tiny-inline.providers.together.model` | `Qwen/Qwen2.5-Coder-32B-Instruct` |
| `tiny-inline.providers.together.baseUrl` | `https://api.together.xyz/v1` |

#### Fireworks AI

| Setting | Default |
|---|---|
| `tiny-inline.providers.fireworks.apiKey` | _(empty)_ |
| `tiny-inline.providers.fireworks.model` | `accounts/fireworks/models/qwen2p5-coder-32b-instruct` |
| `tiny-inline.providers.fireworks.baseUrl` | `https://api.fireworks.ai/inference/v1` |

#### Mistral

| Setting | Default |
|---|---|
| `tiny-inline.providers.mistral.apiKey` | _(empty)_ |
| `tiny-inline.providers.mistral.model` | `codestral-latest` |
| `tiny-inline.providers.mistral.baseUrl` | `https://api.mistral.ai/v1` |

#### xAI

| Setting | Default |
|---|---|
| `tiny-inline.providers.xai.apiKey` | _(empty)_ |
| `tiny-inline.providers.xai.model` | `grok-3-mini` |
| `tiny-inline.providers.xai.baseUrl` | `https://api.x.ai/v1` |

#### Ollama *(local, no API key)*

| Setting | Default |
|---|---|
| `tiny-inline.providers.ollama.model` | `qwen2.5-coder:7b` |
| `tiny-inline.providers.ollama.baseUrl` | `http://localhost:11434` |

Runs locally. No API key needed.

#### LM Studio *(local, no API key)*

| Setting | Default |
|---|---|
| `tiny-inline.providers.lmstudio.model` | `local-model` |
| `tiny-inline.providers.lmstudio.baseUrl` | `http://localhost:1234/v1` |

Runs locally via LM Studio. No API key needed.

---

## Custom Providers

Add any OpenAI-compatible API. Unlimited providers, each with a custom name.

```json
"tiny-inline.customProviders": [
  {
    "name": "My GP Coder",
    "baseUrl": "https://llm.example.com/v1",
    "apiKey": "sk-xxx",
    "model": "custom-coder-v2",
    "fimNative": false,
    "authType": "bearer"
  },
  {
    "name": "Local Mistral",
    "baseUrl": "http://localhost:8000/v1",
    "apiKey": "",
    "model": "mistral-nemo",
    "fimNative": false,
    "authType": "none"
  }
]
```

Then set `"tiny-inline.activeProvider": "My GP Coder"` to use it.

| Field | Required | Default | Description |
|---|---|---|---|
| `name` | Yes | — | Display name; used as `activeProvider` value |
| `baseUrl` | Yes | — | API base URL (e.g. `https://api.example.com/v1`) |
| `model` | Yes | — | Model identifier |
| `apiKey` | No | `""` | API key |
| `fimNative` | No | `false` | `true` if provider accepts `prompt`+`suffix` params (like DeepSeek's `/beta/completions`) |
| `authType` | No | `bearer` | `bearer`, `x-api-key`, or `none` |

---

## Commands

All available via `Ctrl+Shift+P`:

| Command | Description |
|---|---|
| `Tiny Inline: Toggle Completions` | Enable/disable inline completions |
| `Tiny Inline: Switch Provider` | Quick-pick to change active provider |
| `Tiny Inline: Test Provider` | Ping the active provider's `/models` endpoint, verify auth |
| `Tiny Inline: Test FIM Support` | Send a test FIM request; reports whether provider supports native FIM |

---

## How It Works

### FIM — Fill-In-the-Middle

Traditional completion models see only **prefix** (code before cursor). FIM models additionally see **suffix** (code after cursor), allowing them to predict the middle — exactly what's needed for inline completion.

```
<PRE> prefix <SUF> suffix <MID>  →  model predicts middle
```

Only **DeepSeek** has a true FIM-native API (`POST /beta/completions` with `prompt` + `suffix` parameters). All other providers use **prompt-based FIM** — the prefix and suffix are sent as a chat message asking the model to "continue" or "fill the gap".

### Completion Flow

```
User types →
  Debounce (150ms) →
    Extract prefix/suffix from document (bounded by contextWindow) →
      Check LRU cache →
        No cache? → call provider
          FIM-native? → POST /beta/completions {prompt, suffix}
          Chat-based? → POST /chat/completions {messages: [fim_prompt]}
        Stream response through filter →
          Post-process (truncate to maxLines, strip invented declarations) →
            Cache result →
              Return InlineCompletionItem
```

### FIM Auto-Fallback

If a provider claims `fimNative: true` but the API returns 400/404, the extension falls back to chat-based completion for the rest of the session.

---

## Architecture

```
tiny-inline/
├── src/
│   ├── extension.ts           # Entry point — registers provider + status bar
│   ├── completionProvider.ts  # InlineCompletionItemProvider (debounce, abort, cache)
│   ├── config.ts              # Reads VS Code settings → ProviderConfig
│   ├── commands.ts            # testFim, testProvider, switchProvider, toggle
│   ├── providers/
│   │   ├── types.ts           # ProviderConfig, CompletionRequest, CompletionResult
│   │   ├── presets.ts         # Built-in provider definitions
│   │   ├── registry.ts        # Resolves name → {config, stream}
│   │   ├── deepseek.ts        # Native FIM via /beta/completions
│   │   ├── openai-compatible.ts  # Chat + optional completions endpoint
│   │   └── anthropic.ts       # Anthropic Messages API
│   ├── template.ts            # Extract prefix/suffix from document
│   ├── filter.ts              # SSE stream filter + postprocessing + cache
│   └── cache.ts               # LRU cache (prefix+suffix → completion)
├── package.json               # VS Code extension manifest + all settings
└── icon.png                   # 256×256 extension icon
```

---

## Building

```bash
npm install
npm run build    # esbuild → dist/extension.js
npm run package  # builds + creates .vsix
```

No TypeScript compilation step needed — esbuild handles the bundling directly from TS source.

---

## License

MIT — see [LICENSE](LICENSE)