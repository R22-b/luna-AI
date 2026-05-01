# 🌙 Luna AI — Desktop Companion

> AGI-level AI companion for Windows. Built by **Ravikiran** from Bengaluru, India. 2026.

Luna is a rebellious, Gen-Z, sarcastic but deeply caring AI desktop companion with 8 AI brains, persistent memory, real-time PC control, and a glassmorphism UI.

## Features

- **8-Brain AI Cascade** — Groq, Gemini, OpenRouter, Cohere, Mistral, Together, HuggingFace, Pollinations
- **Zero-Cost Operation** — Works with Pollinations (free, no API key) out of the box
- **Persistent Memory** — SQLite database remembers conversations, preferences, goals
- **PC Control (Ghost Mode)** — Open apps, take screenshots, control volume, manage files
- **Project Guardian** — Auto-backup your projects with file watching
- **Student Superpower** — PDF summarizer, YouTube summarizer, quiz generator, Feynman mode
- **Self Evolution** — Luna analyzes her own performance and proposes improvements
- **Voice / Talk Mode** — Text-to-speech + speech recognition
- **Plugin System** — Drop-in plugins for extensibility
- **Proactive Engine** — Morning briefings, goal reminders, backup alerts

## Requirements

- **Node.js** 18+
- **Windows** 10/11
- **npm** 9+

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Rebuild native modules for Electron
npx electron-rebuild -f -w better-sqlite3

# 3. Copy env file and add API keys (optional — Luna works without them!)
copy .env.example .env

# 4. Run in development
npm run dev
```

## API Keys (All Free!)

| Provider | Get Key | Required? |
|----------|---------|-----------|
| **Pollinations** | No key needed! | ✅ Built-in |
| Groq | [console.groq.com](https://console.groq.com) | Optional (fastest) |
| Gemini | [aistudio.google.com](https://aistudio.google.com) | Optional (best reasoning) |
| OpenRouter | [openrouter.ai](https://openrouter.ai) | Optional |
| Cohere | [dashboard.cohere.com](https://dashboard.cohere.com) | Optional |
| Mistral | [console.mistral.ai](https://console.mistral.ai) | Optional |
| Together | [api.together.xyz](https://api.together.xyz) | Optional |
| HuggingFace | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | Optional |
| Serper | [serper.dev](https://serper.dev) | Optional (web search) |

## Build for Windows

```bash
npm run dist:win
```

Output: `release/Luna AI Setup.exe`

## Plugin Development

1. Create folder: `plugins/my-plugin/`
2. Add `plugin.json`:
   ```json
   { "name": "my-plugin", "version": "1.0.0", "description": "My plugin" }
   ```
3. Add `index.js` with your logic
4. Restart Luna — auto-loaded!

## Tech Stack

Electron • React • Vite • SQLite • Tailwind CSS • Node.js

## Credits

Built with 🔥 by **Ravikiran** — Final year BCA student, Bengaluru, India. 2026.

*"one person. one vision. infinite potential."* 🌙
