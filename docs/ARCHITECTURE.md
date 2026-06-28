# 🏗️ Luna AI Architecture

## System Overview

Luna AI is built on a **dual-process Electron architecture** with a React frontend, Node.js backend, and SQLite database. The system is designed for reliability, security, and performance.

```
┌─────────────────────────────────────────────────────────────┐
│                    LUNA AI ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     ELECTRON MAIN PROCESS                    │
│  (Runs with OS-level permissions, handles system tasks)     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         IPC Bridge (Inter-Process Communication)    │   │
│  │  - Validates all messages from Renderer             │   │
│  │  - Enforces 3-tier permission system                │   │
│  │  - Encrypts sensitive data                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌────────────┬──────────┴──────────┬─────────────────┐    │
│  │            │                     │                 │    │
│  ▼            ▼                     ▼                 ▼    │
│ ┌──────┐  ┌─────────┐  ┌──────────┐  ┌────────────┐      │
│ │Brain │  │PC       │  │Express   │  │SQLite      │      │
│ │Mgr   │  │Control  │  │Server    │  │Database    │      │
│ └──────┘  └─────────┘  └──────────┘  └────────────┘      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
        ┌─────────────────┐  ┌──────────────┐
        │  27 AI          │  │  File        │
        │  Providers      │  │  System      │
        │  (Cascade)      │  │  (PC Ctrl)   │
        └─────────────────┘  └──────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  ELECTRON RENDERER PROCESS                   │
│  (React UI - runs in sandboxed browser context)             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React 18 Component Tree                 │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │Chat UI     │  │Settings    │  │Memory      │    │  │
│  │  │Components  │  │Panel       │  │Browser     │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┴────────────────────────────┐   │
│  │        IPC Message Handler (Preload)               │   │
│  │  - Sends user input to Main Process                │   │
│  │  - Receives responses and renders                  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Brain Manager (`brain-manager.js`)

**Responsibility:** AI provider orchestration and response synthesis

**Features:**
- Manages 27 AI providers
- Implements cascade fallback system
- Handles rate limit tracking
- Implements Master AI synthesis for complex tasks
- Caches responses (FIFO eviction at 500 items)

**Flow:**
```
User Input
    ↓
Intent Classification (Local)
    ↓
Select 3-5 Providers (Based on task type)
    ↓
Send Parallel Requests (Promise.allSettled)
    ↓
Handle Rate Limits (Auto-cascade)
    ↓
Master AI Synthesis (For complex tasks)
    ↓
Return Best Response
```

**Supported Providers:**
- Elite 5 (Always Free): Groq, Gemini, Cerebras, SambaNova, Pollinations
- Premium: Claude, GPT-4, DeepSeek, Mistral Large
- Fallback: Pollinations (unlimited, no key)

---

### 2. PC Control Module (`pc-control.js`)

**Responsibility:** Safe execution of system commands

**Features:**
- 3-tier permission system
- Kill switches for dangerous operations
- Real-time command execution
- PowerShell integration (Windows)
- Security regex validation

**Permission Tiers:**

| Tier | Examples | Popup? |
|------|----------|--------|
| **Safe** | Open app, adjust volume, take screenshot | No |
| **Dangerous** | Run script, create file, modify registry | Yes |
| **Restricted** | Delete system files, format drive, malware | Never |

**Blocked Keywords:**
- `delete`, `format`, `system32`, `rm -rf`, `del /s`, etc.

---

### 3. Express Server (`ipc-bridge.js`)

**Responsibility:** Backend API and IPC communication

**Features:**
- Runs on `127.0.0.1:3000` (localhost only)
- Handles all Renderer ↔ Main process communication
- Validates all incoming requests
- Encrypts sensitive data
- Manages database queries

**Endpoints:**
- `POST /api/luna/chat` - Send message
- `POST /api/luna/pcControl` - Execute PC command
- `POST /api/luna/project` - Create project
- `GET /api/luna/memory` - Retrieve memories
- `POST /api/luna/memory` - Save memory

---

### 4. SQLite Database (`database/`)

**Responsibility:** Persistent local storage

**Tables:**
- `conversations` - Chat history
- `memories` - Learned preferences
- `api_usage` - Token tracking
- `projects` - Project metadata
- `settings` - User configuration

**Schema:**
```sql
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY,
  thread_id TEXT,
  role TEXT,
  content TEXT,
  timestamp DATETIME,
  provider TEXT
);

CREATE TABLE memories (
  id INTEGER PRIMARY KEY,
  key TEXT UNIQUE,
  value TEXT,
  category TEXT,
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE api_usage (
  id INTEGER PRIMARY KEY,
  provider TEXT,
  tokens_used INTEGER,
  cost REAL,
  timestamp DATETIME
);
```

---

### 5. Terminal Integration (`luna-core.js`)

**Responsibility:** Project creation and script execution

**Features:**
- Real-time terminal output streaming (via `spawn()`)
- Dependency conflict resolution (`--legacy-peer-deps`)
- Autonomous script generation and execution
- Auto-healing (detect errors, fix, retry)
- Project scaffolding (Vite, Express, etc.)

**Workflow:**
```
User Request: "Build React app"
    ↓
Generate Project Structure
    ↓
Create Files (components, config, etc.)
    ↓
Spawn npm install (with real-time output)
    ↓
Handle Errors (auto-fix peer deps)
    ↓
Start Dev Server
    ↓
Display Success
```

---

## Data Flow

### Chat Message Flow

```
1. User types message in React UI
   ↓
2. React sends IPC message to Main Process
   ↓
3. Preload validates message
   ↓
4. Express Server receives request
   ↓
5. Brain Manager processes:
   - Intent classification
   - Provider selection
   - Parallel API calls
   - Response synthesis
   ↓
6. Response cached in SQLite
   ↓
7. Response sent back to React UI
   ↓
8. React renders response
```

### PC Control Flow

```
1. User asks: "Open Notepad"
   ↓
2. PC Control module receives request
   ↓
3. Security validation:
   - Check against blocked keywords
   - Verify permission tier
   - Prompt user if dangerous
   ↓
4. Execute command via PowerShell/bash
   ↓
5. Capture output/status
   ↓
6. Return result to UI
```

---

## Security Architecture

### 5-Layer Security Model

**Layer 1: IPC Validation**
- All messages validated before processing
- Type checking and sanitization
- Rate limiting per operation

**Layer 2: Permission System**
- 3-tier approval system
- User confirmation for dangerous ops
- Kill switches for emergency stop

**Layer 3: Database Encryption**
- API keys encrypted at rest
- Sensitive data hashed
- Local-only storage (no cloud sync)

**Layer 4: Process Isolation**
- Renderer runs in sandboxed context
- Main process has OS permissions
- Strict IPC bridge between them

**Layer 5: Audit Logging**
- All operations logged
- Sensitive operations flagged
- User can review history

---

## Performance Optimization

### Caching Strategy

**Response Cache:**
- FIFO eviction at 500 items
- TTL: 24 hours
- Reduces API calls by 40%

**Provider Health Cache:**
- Track rate limits
- Auto-skip dead providers
- Reset every 10 minutes

### Parallel Processing

**Concurrent Operations:**
- Multiple API calls in parallel
- Non-blocking UI updates
- Background task processing

**Metrics:**
- Startup: < 3 seconds
- Average response: 1.2 seconds
- Memory: ~210 MB idle, ~350 MB peak

---

## Extensibility

### Plugin System

Luna supports custom plugins:

```javascript
// plugins/my-plugin.js
module.exports = {
  name: 'My Plugin',
  version: '1.0.0',
  execute: async (input) => {
    // Your custom logic
    return result;
  }
};
```

### Custom AI Providers

Add new providers:

```javascript
// Add to brain-manager.js
const providers = {
  myProvider: {
    model: 'my-model',
    priority: 5,
    timeout: 5000,
    tasks: ['chat', 'code']
  }
};
```

---

## Development Workflow

### Local Development

```bash
# Start development server
npm run dev

# This launches:
# 1. Electron window
# 2. React dev server (hot reload)
# 3. Express backend
# 4. SQLite database
```

### Building for Production

```bash
# Create Windows installer
npm run dist:win

# Output: Luna AI Setup 2.0.0.exe
```

---

## Troubleshooting

### Common Issues

**Q: Luna is slow**
- A: Check internet connection, API rate limits, or cache size

**Q: Memory usage high**
- A: Restart Luna, check for memory leaks in logs

**Q: PC Control not working**
- A: Check Windows permissions, PowerShell execution policy

**Q: Database errors**
- A: Delete `db.json`, restart Luna (will recreate)

---

## Future Improvements

- [ ] macOS/Linux support
- [ ] Cloud sync (optional)
- [ ] Advanced plugin marketplace
- [ ] Real-time collaboration
- [ ] GPU acceleration for local models
- [ ] Mobile app companion

---

**For more details, see the [User Manual](../Luna_AI_2.0_User_Manual.md) or [GitHub Issues](https://github.com/R22-b/luna-AI/issues).**
