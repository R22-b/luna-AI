<div align="center">
  <img src="https://raw.githubusercontent.com/R22-b/luna-AI/main/assets/luna-icon.ico" width="120" alt="Luna Logo" />
  <h1>🌙 Luna AI — Advanced Desktop Companion</h1>
  <p><strong>An AGI-level AI companion for Windows. Built by Ravikiran from Bengaluru, India.</strong></p>
  
  <p>
    <a href="https://github.com/R22-b/luna-AI/stargazers"><img src="https://img.shields.io/github/stars/R22-b/luna-AI?style=for-the-badge&color=8A2BE2" alt="Stars" /></a>
    <a href="https://github.com/R22-b/luna-AI/network/members"><img src="https://img.shields.io/github/forks/R22-b/luna-AI?style=for-the-badge&color=00FFFF" alt="Forks" /></a>
    <a href="https://github.com/R22-b/luna-AI/issues"><img src="https://img.shields.io/github/issues/R22-b/luna-AI?style=for-the-badge&color=FF69B4" alt="Issues" /></a>
  </p>
</div>

<br />

Luna is a rebellious, sarcastic, Gen-Z, but deeply caring AI desktop companion. She doesn't just chat—she actively watches your projects, controls your PC autonomously, writes code, heals herself, and remembers your preferences forever.

Powered by a dual-process **Electron + React + Node.js** architecture, she features an 8-Brain AI cascade system, giving her unparalleled reasoning and operational capabilities without relying on a single API provider.

---

## ✨ Core Features

### 🧠 8-Brain AI Cascade
Luna utilizes a swarm of top-tier AI models depending on the task:
- **Groq, Gemini, OpenRouter, Cohere, Mistral, Together, HuggingFace, Pollinations**
- She dynamically routes requests. If an API rate-limits, she instantly falls back to another brain without dropping the conversation. 
- *Works with Zero-Cost!* Uses Pollinations out of the box so you don't even need an API key to get started.

### 💻 PC Control (Ghost Mode)
Luna literally has hands on your PC. You can ask her to:
- `"Open Spotify"`, `"Close YouTube"`, `"Set brightness to 100%"`
- `"Take a screenshot"`, `"Mute the volume"`, `"Show me my system health"`
- She executes real-time PowerShell scripts seamlessly in the background.

### 🛡️ Project Guardian & Architect
- **Architect Builder:** Tell Luna to "Build a React Dashboard", and she will plan the architecture, generate all the necessary files, and scaffold the whole project directly onto your hard drive.
- **Project Guardian:** Luna watches your active projects. If you break your code, she automatically backs it up and allows you to `rollback` to a stable state instantly.
- **Visual Self-Healing:** She can optionally use Vision AI to look at the UI she just built, detect CSS issues, and automatically rewrite her code to fix alignment and colors!

### 📚 Student Superpowers
- Read and summarize PDFs.
- Transcribe and summarize long YouTube videos.
- **Feynman Mode:** She will ask you questions to test your understanding of a topic.

### 🧬 Self-Evolution
Luna constantly analyzes her own interaction logs, tracks API failures, and identifies gaps in her knowledge. She then writes her own plugins and evolves her codebase autonomously!

### 🔒 5-Layer Security Architecture
Your data stays yours. Luna operates via a secure local SQLite database for persistent memory and features strict IPC bridge validation between the Electron Renderer and Node Main process.

---

## 🚀 Quick Setup

### Prerequisites
- **Node.js** 18+
- **Windows** 10 / 11
- **npm** 9+

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/R22-b/luna-AI.git
cd luna-AI

# 2. Install dependencies
npm install

# 3. Rebuild native modules for Electron (Crucial for SQLite)
npx electron-rebuild -f -w better-sqlite3

# 4. (Optional) Setup API Keys
# Luna works out of the box using free endpoints, but you can add your own keys for maximum speed.
copy .env.example .env

# 5. Launch Luna!
npm run dev
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS (Glassmorphism design language)
- **Backend:** Node.js, Electron (Dual-process IPC Architecture)
- **Database:** SQLite3 (Local Persistent Memory)
- **AI Integrations:** Official SDKs for Gemini, Groq, Mistral, OpenRouter, and more.

---

## 🔑 API Keys (Optional but Recommended)

Luna comes built-in with a zero-cost fallback provider (Pollinations), but for elite reasoning, you can add your free tier API keys:

| Provider | Get Key | Use Case |
|----------|---------|-----------|
| **Pollinations** | No key needed! | Default Chat & General Tasks |
| **Groq** | [console.groq.com](https://console.groq.com) | Ultra-fast responses |
| **Gemini** | [aistudio.google.com](https://aistudio.google.com) | Complex reasoning & Architect |
| **Mistral** | [console.mistral.ai](https://console.mistral.ai) | Code Generation |
| **OpenRouter** | [openrouter.ai](https://openrouter.ai) | Model routing & Fallback |

---

## 📦 Building for Production

Want to create an `.exe` installer?
```bash
npm run dist:win
```
Your compiled installer will be available in the `release/` directory!

---

## 👨‍💻 Credits & Author

Built with passion and excessive amounts of coffee by **Ravikiran**.
A final-year BCA student from Bengaluru, India (2026).

> *"One person. One vision. Infinite potential."* 🌙

---
*Feel free to star ⭐ the repo if Luna helped you!*
