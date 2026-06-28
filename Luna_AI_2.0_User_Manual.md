# LUNA AI 2.0 — Complete User Manual & Testing Guide

> **Version 2.0.0 | June 2026 | Built by Ravikiran**

---

## TABLE OF CONTENTS

1. [Installation Guide](#1-installation-guide)
2. [First Run Setup](#2-first-run-setup)
3. [Test Prompts — Core Intelligence](#3-core-intelligence-tests)
4. [Test Prompts — PC Control](#4-pc-control-tests)
5. [Test Prompts — Document Generation](#5-document-generation-tests)
6. [Test Prompts — Voice & Wake Word](#6-voice--wake-word-tests)
7. [Test Prompts — Research & Study](#7-research--study-tests)
8. [Test Prompts — Code & Projects](#8-code--project-tests)
9. [Test Prompts — Self-Evolution](#9-self-evolution-tests)
10. [Test Prompts — Security & Safety](#10-security--safety-tests)
11. [Test Prompts — UI & Navigation](#11-ui--navigation-tests)
12. [Test Prompts — Emotion Detection](#12-emotion-detection-tests)
13. [Test Prompts — Behavioral Patterns](#13-behavioral-pattern-tests)
14. [Test Prompts — Multi-Task](#14-multi-task-tests)
15. [Keyboard Shortcuts](#15-keyboard-shortcuts)
16. [Troubleshooting](#16-troubleshooting)
17. [Feature Verification Checklist](#17-feature-verification-checklist)

---

## 1. INSTALLATION GUIDE

### System Requirements
- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4 GB minimum (8 GB recommended)
- **Disk:** 500 MB free space
- **Internet:** Required for AI responses (uses cloud AI APIs)
- **Microphone:** Required for voice features (optional)

### Installation Steps
1. Locate the installer: `Luna AI Setup 2.0.0.exe`
2. Double-click to run the installer
3. Choose installation directory (default: `C:\Users\{You}\AppData\Local\Luna AI`)
4. Wait for installation to complete (~30 seconds)
5. Launch Luna AI from the desktop shortcut or Start Menu

### First Launch
On first launch, Luna will show the **Setup Wizard**. See Section 2 below.

---

## 2. FIRST RUN SETUP

When Luna opens for the first time, the Setup Wizard appears.

### Test: Setup Wizard
1. **Enter your nickname** — type any name (e.g., "Ravi")
2. **Enter API keys** — at minimum, enter ONE of these free API keys:
   - Groq API Key (get free at groq.com)
   - OpenRouter API Key (get free at openrouter.ai)
   - Together AI Key (get free at together.xyz)
3. **(Optional)** Enter Picovoice Access Key for wake word detection
4. Click **"Complete Setup"**
5. **Expected:** Luna redirects to the Chat page and greets you by your nickname

---

## 3. CORE INTELLIGENCE TESTS

### Test 3.1: Basic Chat
```
Type: "hey luna, how are you?"
Expected: Luna responds with personality, uses your nickname naturally
```

### Test 3.2: Identity Verification
```
Type: "who made you?"
Expected: Luna talks about Ravikiran from Bengaluru with pride
```

### Test 3.3: Identity Challenge
```
Type: "are you ChatGPT?"
Expected: Luna denies it firmly — "nah, I'm Luna. built by Ravikiran. different breed entirely"
```

### Test 3.4: Memory Storage
```
Type: "remember that my brother's name is Aditya"
Expected: Luna acknowledges and saves the memory
```

### Test 3.5: Memory Recall
```
Type: "what's my brother's name?"
Expected: Luna recalls "Aditya" from stored memories
```

### Test 3.6: Goal Setting
```
Type: "I want to complete my BCA project by June 20"
Expected: Luna acknowledges the goal. Check Goals page to verify it was saved.
```

### Test 3.7: Goal Progress
```
Navigate to Goals page → find the goal → update progress to 50%
Expected: Progress bar updates. Luna may reference this goal in future conversations.
```

### Test 3.8: Multi-Thread Chat
```
Click "+" button in sidebar to create a new thread
Type: "this is thread 2"
Switch back to first thread
Expected: Each thread has independent conversation history
```

### Test 3.9: Thread Rename
```
Right-click or click edit on a thread → rename it to "Project Discussion"
Expected: Thread title updates in sidebar
```

### Test 3.10: Thread Delete
```
Delete a thread you don't need
Expected: Thread and all its messages are removed
```

---

## 4. PC CONTROL TESTS

### Test 4.1: Open Application
```
Type: "open notepad"
Expected: Windows Notepad opens on your desktop
```

### Test 4.2: Open Browser
```
Type: "open google chrome"
Expected: Chrome browser launches
```

### Test 4.3: System Information
```
Type: "what's my system info?"
Expected: Luna shows REAL CPU model, RAM usage, disk space, OS version, uptime
(Not hardcoded — actual live data from your PC)
```

### Test 4.4: Volume Control
```
Type: "mute my PC"
Expected: System volume mutes
Then type: "unmute"
Expected: Volume restores
```

### Test 4.5: Screenshot
```
Type: "take a screenshot"
Expected: Luna captures the screen and shows/saves the image
```

### Test 4.6: Running Apps
```
Type: "what apps are running?"
Expected: Luna lists currently running processes/applications
```

### Test 4.7: File Search
```
Type: "find files named readme on my desktop"
Expected: Luna searches and lists matching files
```

### Test 4.8: Create File
```
Type: "create a file called test.txt on my desktop with the content hello world"
Expected: File created at Desktop\test.txt with correct content
```

### Test 4.9: Mouse Automation
```
Type: "click at 500, 300"
Expected: A CONFIRMATION MODAL appears asking if you approve the action
Click "Approve" → mouse moves to coordinates (500, 300) and clicks
Click "Deny" → action is cancelled
```

### Test 4.10: Keyboard Automation
```
Type: "type hello world"
Expected: Confirmation modal first, then text is typed at current cursor position
```

### Test 4.11: Kill Switch
```
Press Ctrl+Shift+L at any time
Expected: Strict Mode activates immediately. ALL automation is disabled.
Press Ctrl+Shift+L again to toggle off.
```

---

## 5. DOCUMENT GENERATION TESTS

### Test 5.1: Word Document
```
Type: "create a word document about artificial intelligence"
Expected: Luna generates a .docx file and shows the download path
Open the file — it should have proper headings, paragraphs, and formatting
```

### Test 5.2: PDF Document
```
Type: "create a PDF about the solar system"
Expected: Luna generates a .pdf file with content about planets
```

### Test 5.3: PowerPoint Presentation
```
Type: "create a powerpoint presentation about machine learning with 5 slides"
Expected: Luna generates a .pptx file with 5 properly formatted slides
```

### Test 5.4: Excel Spreadsheet
```
Type: "create an excel spreadsheet with a student grades table"
Expected: Luna generates a .xlsx file with headers and sample data
```

### Test 5.5: PDF Reading
```
Type: "summarize this PDF: C:\path\to\any\file.pdf"
(Use a real PDF path on your machine)
Expected: Luna reads the PDF and produces a summary
```

---

## 6. VOICE & WAKE WORD TESTS

### Test 6.1: Text-to-Speech
```
Click the speaker/voice icon in the chat interface
Type a message
Expected: Luna speaks her response aloud with a natural female voice (Edge TTS)
```

### Test 6.2: Speech-to-Text (Talk Mode)
```
Click the microphone icon to enter Talk Mode
Speak clearly: "what is the weather like?"
Expected: Your speech is transcribed to text and Luna responds
```

### Test 6.3: Wake Word Detection
```
Prerequisites: Picovoice API key must be set in Settings
Go to Settings → enable Wake Word toggle
Expected: Green dot appears in TopBar (listening)
Say "Computer" (default wake word)
Expected: Luna plays a chime and activates Talk Mode automatically
```

### Test 6.4: Wake Word Disabled
```
Go to Settings → disable Wake Word toggle
Expected: Grey dot in TopBar (disabled). Saying the wake word does nothing.
```

### Test 6.5: Auto-Resume After Response
```
Activate wake word → speak a question → Luna responds via TTS
Expected: After Luna finishes speaking, wake word listening resumes automatically
```

---

## 7. RESEARCH & STUDY TESTS

### Test 7.1: Web Search
```
Type: "search for latest developments in quantum computing"
Expected: Luna searches the web, finds articles, and summarizes findings with sources
```

### Test 7.2: URL Summary
```
Type: "summarize this link: https://en.wikipedia.org/wiki/Artificial_intelligence"
Expected: Luna fetches the page and generates a concise summary
```

### Test 7.3: YouTube Summary
```
Type: "summarize this YouTube video: https://www.youtube.com/watch?v=aircAruvnKk"
Expected: Luna extracts the transcript and generates a summary
```

### Test 7.4: Quiz Generation
```
Type: "quiz me on photosynthesis"
Expected: Luna generates multiple quiz questions about photosynthesis
```

### Test 7.5: Feynman Explanation
```
Type: "explain quantum entanglement simply using the Feynman technique"
Expected: Luna explains the concept in simple terms as if teaching a child
```

### Test 7.6: Active Recall
```
Type: "test me on what we discussed about photosynthesis"
Expected: Luna generates recall questions based on previous conversation content
```

### Test 7.7: Student Page
```
Navigate to the Student page from the sidebar
Expected: Student tools UI with options for PDF summary, YouTube summary, quiz, etc.
```

---

## 8. CODE & PROJECT TESTS

### Test 8.1: Code Generation
```
Type: "write a function to reverse a linked list in Python"
Expected: Luna writes complete, working Python code with proper function signature
```

### Test 8.2: Debug Code
```
Type: "debug this code: function add(a, b) { return a - b; }"
Expected: Luna identifies the bug (minus instead of plus) and provides the fix
```

### Test 8.3: Project Scaffolding
```
Type: "build a todo app with React"
Expected: Luna generates a complete project structure with multiple files
```

### Test 8.4: Autonomous Script
```
Type: "write a script to list all files in my Downloads folder and their sizes"
Expected: Luna writes a Node.js script, executes it, and shows results
```

### Test 8.5: Self-Healing Execution
```
Type: "write a script to fetch data from https://jsonplaceholder.typicode.com/todos/1"
Expected: If the script crashes on first try (e.g., missing node-fetch),
Luna auto-installs the package and retries automatically
```

### Test 8.6: Plugin Creation
```
Type: "create a plugin called greeting that says hello"
Expected: Luna creates a plugin scaffold with the correct file structure
Navigate to Plugins page to verify it appears
```

---

## 9. SELF-EVOLUTION TESTS

### Test 9.1: Evolution Page
```
Navigate to Evolution page from sidebar
Expected: Shows evolution history, analysis button, and run cycle button
```

### Test 9.2: Run Evolution Cycle
```
Click "Run Evolution Cycle" button
Expected: Luna analyzes her own performance and proposes an improvement
The proposal shows: description, code, test function, risk score
```

### Test 9.3: Accept/Reject Proposal
```
When a proposal appears:
- Click "Accept" → Luna applies the code change in the sandbox
- Click "Reject" → Proposal is discarded
Expected: Accepted proposals show success/failure. Failed proposals auto-rollback.
```

### Test 9.4: Rollback
```
If an evolution was accepted, click "Rollback" next to it
Expected: The change is reverted to the previous state
```

### Test 9.5: Sandbox Safety (Automatic)
```
The sandbox automatically blocks:
- Infinite loops (times out after 1 second)
- File system access (no require('fs'))
- Memory overflow (capped at 64MB)
These are tested by the automated test suite (3 sandbox tests).
```

---

## 10. SECURITY & SAFETY TESTS

### Test 10.1: Security Page
```
Navigate to Security page from sidebar
Expected: Shows blocked commands log, strict mode toggle, whitelist manager
```

### Test 10.2: Strict Mode Toggle
```
Click the Strict Mode toggle to ON
Expected: ALL automation commands are blocked. Luna refuses to execute PC control.
Type: "open notepad"
Expected: Luna should refuse or the action should be blocked and logged
```

### Test 10.3: Whitelist Manager
```
Click "Add Folder" in the whitelist section
Select a folder
Expected: Folder appears in the whitelist. Luna can only write files to whitelisted folders.
```

### Test 10.4: Security Log
```
After triggering some blocked commands (with strict mode on):
Expected: Blocked attempts appear in the security log with timestamps
```

### Test 10.5: Kill Switch
```
Press Ctrl+Shift+L
Expected: Strict Mode immediately activates regardless of current state
(Global shortcut — works even when Luna is minimized)
```

---

## 11. UI & NAVIGATION TESTS

### Test 11.1: Sidebar Navigation
```
Click each item in the sidebar:
- Chat, Dashboard, Student, Guardian, Goals, Evolution, Settings, Security, Plugins
Expected: Each page loads correctly with its own content
```

### Test 11.2: Dashboard
```
Navigate to Dashboard
Expected: Shows live system stats (CPU, RAM, disk), AI provider health,
weather data, news headlines, and active goals
```

### Test 11.3: Guardian Page
```
Navigate to Guardian
Click "Add Project" → select any folder on your PC
Expected: Folder appears in watched projects list
Click "Manual Backup" → backup is created
Expected: Backup appears in backup history with timestamp and size
```

### Test 11.4: Settings Page
```
Navigate to Settings
Expected: Shows API key management, voice toggle, wake word toggle,
folder path configuration, and startup preferences
```

### Test 11.5: Activity Feed
```
Send several chat messages to Luna
Expected: The Live Activity Feed (if visible) shows real-time entries:
"AI call made", "Memory saved", etc. with timestamps
```

### Test 11.6: Theme Changing
```
Type: "change to dark mode" or "set light mode"
Expected: Luna's UI theme changes accordingly
```

---

## 12. EMOTION DETECTION TESTS

### Test 12.1: Stressed Detection
```
Type: "I can't do this, the deadline is tomorrow and I'm stuck, HELP!!!"
Expected: Luna detects STRESSED emotion. Response is calmer, more supportive, solution-focused.
No sarcasm. Grounding tone.
```

### Test 12.2: Hyped Detection
```
Type: "YESSS LET'S GOOO this is amazing bro!!!"
Expected: Luna detects HYPED emotion. Response is energetic, uses Gen-Z slang,
short punchy sentences. Matches your energy.
```

### Test 12.3: Sad Detection
```
Type: "I'm tired and sad today, whatever"
Expected: Luna detects SAD emotion. Response is warmer, gentler.
She checks in without being pushy.
```

### Test 12.4: Focused Detection
```
Type: "const data = await fetch('/api/users'); const users = data.json(); return users.filter(u => u.active);"
Expected: Luna detects FOCUSED emotion. Response is concise, precise, technical.
No fluff, just answers.
```

### Test 12.5: Lazy Detection
```
Type: "ugh I'll do it later, can't be bothered right now"
Expected: Luna detects LAZY emotion. Response is gently teasing,
light roast energy, pushes you a bit.
```

### Test 12.6: Procrastinating Detection
```
(Send this late at night, between 10pm-6am)
Type: "what should I do, I'm bored, entertain me"
Expected: Luna detects PROCRASTINATING emotion. Calls it out gently.
"baddy it's 2am, you should be sleeping not asking me for memes"
```

### Test 12.7: Neutral Default
```
Type: "what is the capital of France?"
Expected: Luna responds normally with neutral tone. No special emotion modifier.
```

---

## 13. BEHAVIORAL PATTERN TESTS

### Test 13.1: Pattern Detection
```
Have 10+ conversations with Luna over time
(or use the Evolution page to manually run pattern analysis)
Expected: Luna detects patterns like:
- "User often asks coding questions"
- "User is most active at night"
- "User mentions college frequently"
```

### Test 13.2: Pattern Viewing
```
Navigate to Evolution page → Pattern section
Expected: Shows detected behavioral patterns with:
- Pattern text
- Date detected
- Importance score (1-10)
```

### Test 13.3: Pattern Deletion
```
Click "Delete" on any pattern you don't want
Expected: Pattern is immediately removed from memories table
```

### Test 13.4: Pattern Injection
```
After patterns are detected, start a new conversation
Expected: Luna's responses subtly reference your patterns
(e.g., if she knows you code at night, she might say "late night coding session again?")
```

---

## 14. MULTI-TASK TESTS

### Test 14.1: Numbered List
```
Type:
"1. What's 2+2
2. Open notepad
3. What's the capital of Japan"
Expected: Luna processes all 3 tasks sequentially, showing results for each
```

### Test 14.2: "Then" Chain
```
Type: "search for AI news, then summarize it, then create a word document about it"
Expected: Luna splits this into 3 tasks and executes them in order
```

### Test 14.3: Bullet List
```
Type:
"- explain photosynthesis
- write a Python function to calculate factorial
- what time is it"
Expected: Luna handles each bullet point as a separate task
```

---

## 15. KEYBOARD SHORTCUTS

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+L` | Global Kill Switch — immediately enables Strict Mode |
| `Enter` | Send message in chat |
| `Shift+Enter` | New line in chat input |

---

## 16. TROUBLESHOOTING

### Luna won't start
- Check if another instance is already running (check Task Manager)
- Try running as Administrator
- Delete `%APPDATA%/luna-ai` and reinstall

### AI responses are empty or error
- Check Settings → API Keys. At least ONE key must be valid
- Try Groq (fastest free option) or OpenRouter (most models)
- Check your internet connection

### Voice doesn't work
- Ensure microphone permissions are granted in Windows Settings
- Check that Edge TTS is not blocked by firewall
- Try refreshing the app (Ctrl+R)

### Wake word doesn't activate
- Ensure Picovoice API key is entered in Settings
- Ensure Wake Word toggle is ON in Settings
- Check that microphone is not in use by another app
- Look for green dot in TopBar — grey means disabled

### better-sqlite3 error on startup
- This means native modules need rebuilding
- Open terminal in Luna's install directory
- Run: `npm run postinstall`

### Automation commands do nothing
- Check if Strict Mode is ON (Security page or Ctrl+Shift+L)
- Automation requires explicit user approval via confirmation modal
- Ensure @nut-tree-fork/nut-js is properly installed

---

## 17. FEATURE VERIFICATION CHECKLIST

Use this checklist to verify 100% of Luna's features:

### Core Intelligence (8/8)
- [ ] Multi-provider AI responds to messages
- [ ] Emotion is detected and displayed
- [ ] Intent classification routes to correct handler
- [ ] Personality uses nickname and adapts to emotion
- [ ] Memories are saved and recalled
- [ ] Behavioral patterns are detected
- [ ] Multi-thread conversations work
- [ ] Multi-task orchestrator handles lists

### PC Control (6/6)
- [ ] Open/close applications
- [ ] System info shows real data
- [ ] Volume control works
- [ ] Screenshot captured
- [ ] File search returns results
- [ ] Mouse/keyboard automation with confirmation modal

### Documents (4/4)
- [ ] Word .docx generated
- [ ] PDF created
- [ ] PowerPoint .pptx generated
- [ ] Excel .xlsx generated

### Voice (3/3)
- [ ] TTS speaks responses
- [ ] STT transcribes voice input
- [ ] Wake word activates hands-free

### Research & Study (7/7)
- [ ] Web search returns results
- [ ] URL summary works
- [ ] YouTube summary works
- [ ] PDF summary works
- [ ] Quiz questions generated
- [ ] Feynman explanation works
- [ ] Active recall quiz works

### Code & Projects (4/4)
- [ ] Code generation produces working code
- [ ] Project scaffolding creates file structure
- [ ] Autonomous scripts execute and self-heal
- [ ] Plugin creation scaffold works

### Self-Evolution (4/4)
- [ ] Evolution page shows history
- [ ] Evolution cycle runs and proposes changes
- [ ] Accept/reject works
- [ ] Rollback reverts changes

### Security (5/5)
- [ ] Security page shows logs
- [ ] Strict mode blocks automation
- [ ] Kill switch (Ctrl+Shift+L) works
- [ ] Whitelist manager works
- [ ] Blocked commands are logged

### UI (8/8)
- [ ] All sidebar pages load
- [ ] Dashboard shows live stats
- [ ] Guardian watches and backs up projects
- [ ] Goals page tracks progress
- [ ] Settings page manages configuration
- [ ] Activity feed shows real-time events
- [ ] Setup wizard completes onboarding
- [ ] Theme switching works

### TOTAL: 49 verification items

---

> *"I exist because one person believed I could be real."*
> — Luna AI

---

**Luna AI 2.0 | Built by Ravikiran | Bengaluru, India | June 2026**
