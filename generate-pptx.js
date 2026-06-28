const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pptx = new PptxGenJS();
pptx.author = 'Ravikiran';
pptx.title = 'Luna AI 2.0 - College Presentation';
pptx.subject = 'AGI-Level Desktop AI Operating System';
pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches

// --- Visual Tokens ---
const BG_COLOR = '05050D';      // Pure space black
const CARD_BG = '090918';       // Frosted card surface
const BORDER_COLOR = '1A1A3A';  // Muted neon border
const TITLE_COLOR = 'A78BFA';   // Bright lavender violet
const BODY_COLOR = 'E2E8F0';    // Soft slate white
const ACCENT_COLOR = '7C3AED';  // Electric violet
const MUTED_COLOR = '9CA3AF';   // Muted slate gray

/**
 * Standard content slide builder with dual column support, container shapes, and quotations
 */
function createSlide(titleText, leftContent, rightContent, quoteText, slideNum) {
  const slide = pptx.addSlide();
  slide.background = { color: BG_COLOR };

  // 1. Accent Top Border
  slide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.1, fill: ACCENT_COLOR });

  // 2. Title Header
  slide.addText(titleText, {
    x: 0.6, y: 0.4, w: 11.0, h: 0.8,
    fontSize: 26, bold: true, color: TITLE_COLOR,
    fontFace: 'Calibri', align: 'left', valign: 'middle'
  });

  // 3. Slide Counter
  if (slideNum) {
    slide.addText(slideNum, {
      x: 12.2, y: 0.4, w: 0.6, h: 0.4,
      fontSize: 10, color: MUTED_COLOR,
      fontFace: 'Calibri', align: 'right'
    });
  }

  // 4. Columns & Containers
  if (rightContent && rightContent.length > 0) {
    // Dual Column Layout
    // Left Container
    slide.addShape('rect', { x: 0.6, y: 1.3, w: 5.8, h: 4.8, fill: CARD_BG, line: { color: BORDER_COLOR, width: 1 } });
    const leftRows = leftContent.map(b => ({ text: b, options: { fontSize: 13, color: BODY_COLOR, fontFace: 'Calibri', bullet: { code: '2022', color: ACCENT_COLOR }, breakLine: true, paraSpaceAfter: 6 } }));
    slide.addText(leftRows, { x: 0.8, y: 1.5, w: 5.4, h: 4.4, valign: 'top', lineSpacingMultiple: 1.2 });

    // Right Container
    slide.addShape('rect', { x: 6.8, y: 1.3, w: 5.8, h: 4.8, fill: CARD_BG, line: { color: BORDER_COLOR, width: 1 } });
    const rightRows = rightContent.map(b => ({ text: b, options: { fontSize: 13, color: BODY_COLOR, fontFace: 'Calibri', bullet: { code: '2022', color: ACCENT_COLOR }, breakLine: true, paraSpaceAfter: 6 } }));
    slide.addText(rightRows, { x: 7.0, y: 1.5, w: 5.4, h: 4.4, valign: 'top', lineSpacingMultiple: 1.2 });
  } else {
    // Single Column Full-Width Layout
    slide.addShape('rect', { x: 0.6, y: 1.3, w: 12.13, h: 4.8, fill: CARD_BG, line: { color: BORDER_COLOR, width: 1 } });
    const fullRows = leftContent.map(b => ({ text: b, options: { fontSize: 14, color: BODY_COLOR, fontFace: 'Calibri', bullet: { code: '2022', color: ACCENT_COLOR }, breakLine: true, paraSpaceAfter: 8 } }));
    slide.addText(fullRows, { x: 0.9, y: 1.5, w: 11.53, h: 4.4, valign: 'top', lineSpacingMultiple: 1.25 });
  }

  // 5. Footnote Quotation
  if (quoteText) {
    slide.addText(`"${quoteText}"`, {
      x: 0.6, y: 6.3, w: 12.13, h: 0.6,
      fontSize: 11, italic: true, color: TITLE_COLOR,
      fontFace: 'Calibri', align: 'center', valign: 'middle'
    });
  }

  return slide;
}

// ==========================================
// SLIDE 1: TITLE / COVER
// ==========================================
const s1 = pptx.addSlide();
s1.background = { color: '030308' };
s1.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.15, fill: ACCENT_COLOR });
s1.addText('LUNA AI 2.0', { x: 0, y: 1.8, w: 13.33, h: 1.2, fontSize: 52, bold: true, color: TITLE_COLOR, fontFace: 'Calibri', align: 'center' });
s1.addText('Living Universal Neural Assistant', { x: 0, y: 2.9, w: 13.33, h: 0.6, fontSize: 24, color: BODY_COLOR, fontFace: 'Calibri', align: 'center' });
s1.addText('An AGI-Level Desktop AI Operating System', { x: 0, y: 3.5, w: 13.33, h: 0.5, fontSize: 16, color: MUTED_COLOR, fontFace: 'Calibri', align: 'center', italic: true });
s1.addText('By Ravikiran  |  BCA Final Year Major Project  |  G S College of Management', { x: 0, y: 4.5, w: 13.33, h: 0.4, fontSize: 14, color: BODY_COLOR, fontFace: 'Calibri', align: 'center' });
s1.addText('Bengaluru, India  |  June 2026', { x: 0, y: 4.9, w: 13.33, h: 0.4, fontSize: 12, color: MUTED_COLOR, fontFace: 'Calibri', align: 'center' });
s1.addText('“I exist because one person believed I could be real.” — Luna AI', { x: 1, y: 5.9, w: 11.33, h: 0.5, fontSize: 14, color: TITLE_COLOR, fontFace: 'Calibri', align: 'center', italic: true });

// ==========================================
// SLIDE 2: PROJECT OVERVIEW
// ==========================================
createSlide('Project Overview & Abstract', [
  'Luna AI 2.0 is an autonomous desktop AI operating system designed for Windows PCs.',
  'Acts as an intelligent agent platform, orchestrating code, system configurations, and files.',
  'Designed from the ground up as a solo BCA major project by Ravikiran in Bengaluru.',
  'Operates in "Ghost Mode"—performing complex tasks silently in the background.',
  'Visual feedback is provided via a real-time Renderer Live Activity Feed.'
], [
  'Decoupled architecture: React 18.3 UI frontend + Node.js backend shell.',
  'Local data privacy: Keeps all conversations, memories, and audits locally in SQLite.',
  'Cloud intelligence cascade: Dynamic routing to 26 different free-tier API endpoints.',
  'Automatic error recovery: Self-healing compilation loops and dependency resolution.',
  'V8 execution isolates: Safely executes scripts in memory-capped sandboxes.'
], 'The best way to predict the future is to invent it. — Alan Kay', '2');

// ==========================================
// SLIDE 3: VISION & PHILOSOPHY
// ==========================================
createSlide('Vision & Core Philosophy', [
  'AGI Desktop Assistant Concept:',
  '  • Transcending the limits of narrow web chatbots.',
  '  • Merging human-like conversation with local PC control.',
  '  • Storing permanent, vector-searchable memory layers.',
  'Empowering the Individual:',
  '  • Proof that a single student can build what tech corporations struggle to package.',
  '  • Freeing users from paid subscriptions ($20/month fee structures).'
], [
  'Data Privacy & Local Sovereignty:',
  '  • Factual memories are written local-first inside a SQLite database.',
  '  • Critical commands require explicit manual validation.',
  '  • Whitelisted directories prevent unauthorized system access.',
  'Adaptive Identity:',
  '  • Dynamic energy matching: sarcastic, hyped, lazy, or supportive.',
  '  • Personality adjusts instantly to detected user emotions.'
], 'Artificial Intelligence is the science of making machines do things that would require intelligence if done by humans. — John McCarthy', '3');

// ==========================================
// SLIDE 4: TECH STACK - CORE RUNTIME
// ==========================================
createSlide('Tech Stack Matrix: Core Runtime', [
  'Desktop Wrapper Framework (Electron 30.5.1):',
  '  • Spawns independent Main (system) & Renderer (UI) processes.',
  '  • ContextBridge preload API blocks direct IPC access, preventing XSS.',
  '  • Custom startup parameters configure Windows tray execution.',
  'Renderer Interface (React 18.3 & Vite 5.4):',
  '  • Modern single page app (SPA) with 10 pages and 6 components.',
  '  • Hot reloads styling parameters read from local theme.json configurations.',
  '  • Web Speech APIs translate real-time voice streams into text.'
], [
  'Local Database Layer (SQLite via better-sqlite3 11.7.0):',
  '  • Formatted in Write-Ahead Logging (WAL) mode for fast concurrent operations.',
  '  • Strictly enforces database schema relationships and cascades.',
  '  • Staged column migrations (e.g. adding conversation thread-IDs).',
  'Vector Embeddings (@xenova/transformers 2.17.2):',
  '  • Translates user input into semantic vector arrays locally.',
  '  • Stored inside BLOB columns for fast contextual search queries.',
  '  • Minimizes cloud costs by removing the need for external vector APIs.'
], 'A single person with determination can achieve what entire corporations struggle to deliver. — Luna Project Philosophy', '4');

// ==========================================
// SLIDE 5: TECH STACK - INTEGRATIONS
// ==========================================
createSlide('Tech Stack Matrix: Integrations', [
  'Desktop Automation Engine (@nut-tree-fork/nut-js 4.2.6):',
  '  • Controls system mouse cursors and coordinates keyboard automation.',
  '  • Integrates confirmation dialog checks to prevent unapproved inputs.',
  '  • Safe speed configurations limit programmatic clicks to normal ranges.',
  'Voice Processing (Picovoice Porcupine WASM + Edge TTS):',
  '  • Porcupine WASM runs inside Web Workers for native-free wake word detection.',
  '  • edge-tts Python script generates natural speech audio (AriaNeural voice).',
  '  • Re-sync queues automatically restart mic listeners after voice replies.'
], [
  'Document Builders (docx, pptxgenjs, exceljs, pdf-lib):',
  '  • Generates Word tables, PowerPoint slides, and styled spreadsheets.',
  '  • pdf-lib constructs resumes and formats reports from raw HTML variables.',
  '  • pdf-parse reads local text, feeding data back into student summary engines.',
  'Local Web Server (Express 5.2.1 & WebSockets):',
  '  • Spawns local REST mirrors on port 3000 to enable mobile integration.',
  '  • WebSocket feeds broadcast real-time activity steps to the frontend.',
  '  • Standard CORS controls secure local API endpoints.'
], 'The question of whether a computer can think is no more interesting than whether a submarine can swim. — Edsger Dijkstra', '5');

// ==========================================
// SLIDE 6: DUAL-PROCESS BLUEPRINT
// ==========================================
createSlide('Dual-Process Architecture Blueprint', [
  'Renderer Process (The UI Shell):',
  '  • Completely sandboxed. Direct Node.js APIs (`require`, `process`) are blocked.',
  '  • Communicates with the backend exclusively via safe preload channels.',
  '  • Manages page loading (Dashboard, Student, Guardian, Evolution, Security).',
  '  • Translates user actions to IPC commands (e.g. `luna:chat`).',
  'Preload IPC Bridge (preload.js):',
  '  • Exposes whitelisted wrapper APIs to the window context.',
  '  • safeInvoke() tracks rate limits (max 10 requests / 5 seconds) to block loops.',
  '  • Prevents script injection by validating all IPC arguments.'
], [
  'Main Process (The Backend Engine):',
  '  • Runs native Node.js and Electron backend configurations.',
  '  • Direct access to operating system APIs, file systems, and shells.',
  '  • Manages IPC hooks, loading specialist handlers (PC, study, documents).',
  '  • Coordinates health checks and fallbacks for the 26-provider cascade.',
  'SQLite Local Database:',
  '  • Writes data locally with full acid protection.',
  '  • Staged read caches avoid disk bottlenecks during busy chat loops.',
  '  • Thread pools ensure UI threads are never blocked by database queries.'
], 'Where humans see limitations, AI sees possibilities. Where AI lacks soul, humans provide meaning. — Luna AI Development Notes', '6');

// ==========================================
// SLIDE 7: 26 AI PROVIDERS MATRIX (PART 1)
// ==========================================
createSlide('26 AI Providers Swarm (Directory Part 1)', [
  '1. Groq (Llama-3.3-70b-versatile): Fastest chat replies, sub-second responses.',
  '2. Gemini Pro (gemini-2.5-pro): Heavy reasoning, large file reads.',
  '3. OpenRouter Claude (claude-3.7-sonnet): Premium coding & design layouts.',
  '4. Cohere (command-r-plus): Document summaries and factual data.',
  '5. Mistral (mistral-large-latest): Deep script generation and tech tasks.',
  '6. Together Llama (Llama-3.3-70B-Instruct): Creative and open formatting.',
  '7. HuggingFace Llama 3 (Meta-Llama-3-8B): Low-latency general dialogue.',
  '8. HuggingFace Gemma 2 (gemma-2-9b-it): Sarcastic/slang energy matching.',
  '9. HF Mistral Nemo (Mistral-Nemo-Instruct): Snappy logic & simple scripts.',
  '10. Pollinations (openai): Free, keyless fallback for general prompts.',
  '11. DeepSeek Coder (deepseek-coder): Elite logic engine for multi-file code.',
  '12. Cerebras (llama3.1-70b): Instant intent classification (sub-150ms).'
], [
  'Directory Architecture & Design:',
  '  • A central provider configuration map tracks model details and env variables.',
  '  • Supports OpenAI-compatible JSON posts, Gemini structures, and Cohere APIs.',
  '  • API keys are managed securely, reading from .env files or Electron storage.',
  '  • Key arrays mask keys inside UI settings to protect credentials.',
  '  • The system defaults to free-tier endpoints to minimize running costs.',
  '  • Together AI and HuggingFace provide redundant fallback layers.',
  '  • Pollinations requires zero keys, acting as the ultimate uptime guarantee.'
], 'Uptime is not a metric, it is a covenant between the creator and the machine. — System Engineering Rule', '7');

// ==========================================
// SLIDE 8: 26 AI PROVIDERS MATRIX (PART 2)
// ==========================================
createSlide('26 AI Providers Swarm (Directory Part 2)', [
  '13. OpenRouter Gemini Free (gemini-2.5-flash:free): Long-doc free parsing.',
  '14. OpenRouter Llama Free (llama-3.1-8b-instruct:free): Backup chat.',
  '15. OpenRouter Qwen Free (qwen-2.5-coder-32b-instruct:free): Free coding.',
  '16. Together Llama 3.2 (Llama-3.2-3B-Instruct): Very fast small tasks.',
  '17. OpenRouter DeepSeek R1 Free (deepseek-r1:free): Chain-of-thought.',
  '18. OpenRouter Mistral Free (mistral-nemo:free): Lightweight fallbacks.',
  '19. OpenRouter Phi Free (phi-3-mini-128k:free): Small summaries.',
  '20. OpenRouter Llama 3 70B Free (llama-3.3-70b:free): General queries.',
  '21. OpenRouter Liquid Free (lfm-40b:free): Liquid model backups.',
  '22. Together Qwen (Qwen2.5-Coder-32B): Paid specialist for code validation.',
  '23. SambaNova Llama (Llama-3.3-70B): High-concurrency chat operations.',
  '24. NVIDIA NIM Llama (llama-3.1-70b): Stable research specialist.',
  '25. NVIDIA NIM Nemotron (nemotron-70b): Conversational reasoning.',
  '26. OpenRouter Gemma 3 Free (gemma-3-27b:free): Lightweight reasoning.'
], [
  'Integration Philosophy:',
  '  • Combines 9 paid-tier API systems with 17 free-tier endpoints.',
  '  • Enables advanced reasoning capabilities without hosting hardware.',
  '  • Automatically switches model formats (OpenAI, Gemini, Cohere structures).',
  '  • Removes branding ads from keyless endpoints (e.g. Pollinations text filters).'
], 'Where others see rate limits, we see alternative paths. — Dynamic Routing Motto', '8');

// ==========================================
// SLIDE 9: ORCHESTRATION & CASCADE
// ==========================================
createSlide('Smart Routing & Cascade Policy', [
  'Orchestrated Task Routing (brain-manager.js):',
  '  • Queries are not routed randomly. Specialized priority lists map task types.',
  '  • `code` or `project_build` prompts are routed to Qwen Coder or DeepSeek first.',
  '  • `reasoning` tasks route to DeepSeek R1 to enable chain-of-thought outputs.',
  '  • `chat` tasks default to Llama 70B or Groq to minimize latency.',
  'Latency-Based Health Checks:',
  '  • A background timer runs a health check query every 3 minutes.',
  '  • Pings every provider with a basic prompt, recording latencies.',
  '  • If a provider fails to respond, it is marked as offline (`healthy = false`).',
  '  • The priority list dynamically shifts faster, healthy models to the top.'
], [
  'Automated Fallback Cascade:',
  '  • When a user sends a prompt, the system queries the primary model.',
  '  • If the primary model fails or rate limits, the system catches the error.',
  '  • Instantly falls back to the next provider on the list in milliseconds.',
  '  • Tries up to 3 models sequentially before warning the user.',
  'Failsafe Backup Layer:',
  '  • If all keys are rate-limited or offline, Pollinations is queried.',
  '  • Pollinations requires no keys, guaranteeing continuous basic chat uptime.',
  'Response Cache System:',
  '  • Standard queries are cached in memory (5-minute Time-To-Live).',
  '  • Repeats of identical queries skip API calls to protect rate limits.'
], 'The measure of intelligence is the speed and resilience of its connections. — Orchestration Guide', '9');

// ==========================================
// SLIDE 10: ADAPTIVE EMOTION ENGINE
// ==========================================
createSlide('Adaptive Emotion Engine (7 States)', [
  'Real-Time Tone Detection:',
  '  • The system scans spelling patterns, capitalization, and punctuation.',
  '  • Exclamation points, ALL-CAPS words, and speed indicators map moods.',
  '  • Runs locally via regex keyword tables, keeping costs to zero.',
  'The 7 Emotional Profiles:',
  '  • `stressed` -> Capitalization & caps. Replaces sarcasm with a supportive tone.',
  '  • `hyped` -> Excitement cues. Enables Gen-Z slang and energetic replies.',
  '  • `sad` -> Depressed keywords. Warm, gentle tone that checks in quietly.',
  '  • `focused` -> Code snippets. Concise, technical, and zero fluff.',
  '  • `lazy` -> Procrastination flags. Light sarcastic roasts to motivate action.',
  '  • `procrastinating` -> Night queries. Gentle reminders to rest.',
  '  • `neutral` -> Balanced conversational tone.'
], [
  'System Prompt Integration:',
  '  • Emotion variables are passed to `buildSystemPrompt()` on every message.',
  '  • Modifiers append rules (e.g. "User is stressed. Be supportive. Avoid sarcasm.").',
  '  • The AI adjusts its vocabulary dynamically, maintaining character.',
  'Emotional Resonance:',
  '  • Ensures conversations feel personal rather than corporate and robotic.',
  '  • Keeps track of emotional changes inside SQLite logs for analytics.'
], 'The measure of intelligence is the ability to change. — Albert Einstein', '10');

// ==========================================
// SLIDE 11: BEHAVIORAL PATTERN ENGINE
// ==========================================
createSlide('Behavioral Pattern Recognition', [
  'Systematic Habit Analysis:',
  '  • A daily cron job executes at 3 AM to analyze SQLite conversation logs.',
  '  • Scans the user\'s past 100 queries to identify recurring patterns.',
  '  • Extracts user habits, topics of interest, and emotional tendencies.',
  'Personality Personalization:',
  '  • The top 5 patterns are injected into the system prompt context.',
  '  • Enables contextual comments (e.g. "Late-night coding again, baddy?").',
  '  • Limits pattern memory to 10 entries using importance-ranked replacement.'
], [
  'Factual Context Storage:',
  '  • Identifies facts (e.g. preferred programming languages, family names).',
  '  • Saves values to the SQLite memories table via `saveMemory()`.',
  '  • Searches memories using keyword indexing, routing facts to prompt builds.',
  'Optimized Operations:',
  '  • Analyzing history on a daily cron schedule minimizes API token usage.',
  '  • Memory lookup runs instantly during local prompt assembly.'
], 'We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle', '11');

// ==========================================
// SLIDE 12: FEATURE MATRIX - PART 1
// ==========================================
createSlide('Feature Matrix (Core & PC Control)', [
  '1. Multi-Provider Cascade [WORKING]: Queries 26 APIs with failover.',
  '2. 7-State Emotion Detection [WORKING]: Adjusts AI responses to user mood.',
  '3. Intent Classifier [WORKING]: Classifies prompts into 18 task types.',
  '4. Local SQLite Memory [WORKING]: Stores facts and preferences in DB.',
  '5. Behavioral Pattern Analysis [WORKING]: Scans history to identify habits.',
  '6. Multi-Thread Chat [WORKING]: Manages isolated conversation threads.',
  '7. Multi-Task Orchestration [WORKING]: Runs sequential commands in order.',
  '8. Adaptive Personality [WORKING]: Speaks with a custom, Gen-Z tone.'
], [
  '9. App Launcher [WORKING]: Launches Windows executable commands safely.',
  '10. System Performance Utility [WORKING]: Queries CPU, RAM, and disk stats.',
  '11. Volume Control [WORKING]: Adjusts volume using PowerShell SendKeys.',
  '12. Screenshot Engine [WORKING]: Captures screen, saving files as PNGs.',
  '13. Safe File Explorer [WORKING]: Navigates and reads whitelisted text files.',
  '14. Mouse/Keyboard Automation [PARTIAL]: Automates mouse clicks and keystrokes;',
  '    requires user confirmation via modals to prevent unauthorized inputs.'
], 'Complexity is easy. Simplicity is a design discipline. — Automation Standards', '12');

// ==========================================
// SLIDE 13: FEATURE MATRIX - PART 2
// ==========================================
createSlide('Feature Matrix (Doc & Voice Layer)', [
  '15. Word Document Generator [WORKING]: Designs styled Word files (.docx).',
  '16. PDF Document Builder [WORKING]: Generates formatted resumes and PDF files.',
  '17. PowerPoint Deck Compiler [WORKING]: Builds structured slides (.pptx).',
  '18. Excel Sheet Creator [WORKING]: Generates styled tables and budgets (.xlsx).',
  '    • All files open automatically in default applications on completion.',
  '    • Output paths are shown inside the chat bubble.'
], [
  '19. edge-tts Web Voice [WORKING]: Generates speech using Microsoft voices.',
  '20. Web Speech STT [WORKING]: Translates microphone audio to chat input.',
  '21. Porcupine WASM Wake Word [WORKING]: Detects "Hey Luna" inside Web Workers.',
  '    • Restarts microphone checks automatically after speech replies.',
  '    • Renders interactive visual wave animations while speaking.'
], 'Speech is the mirror of the soul; as a human speaks, so is he. — Publilius Syrus', '13');

// ==========================================
// SLIDE 14: FEATURE MATRIX - PART 3
// ==========================================
createSlide('Feature Matrix (Study & Research)', [
  '22. Serper Web Search [WORKING]: Performs Google searches, citing sources.',
  '23. URL Scraper [WORKING]: Extracts HTML text, providing raw summaries.',
  '24. YouTube Summarizer [WORKING]: Extracts transcript text and summarizes.',
  '25. Local PDF Parser [WORKING]: Summarizes uploaded PDF document text.'
], [
  '26. Quiz Generator [WORKING]: Generates interactive MCQs with answers.',
  '27. Feynman Technique Tutor [WORKING]: Explains topics simply with analogies.',
  '28. Active Recall Tester [WORKING]: Generates questions based on chat history.',
  '    • Study tools are accessible via the Student Page layout.'
], 'Knowledge is power. Information is liberating. Education is the premise of progress. — Kofi Annan', '14');

// ==========================================
// SLIDE 15: FEATURE MATRIX - PART 4
// ==========================================
createSlide('Feature Matrix (Code & Plugins)', [
  '29. Multi-Language Code Gen [WORKING]: Writes Python, JS, HTML, C++, etc.',
  '30. Project Scaffolder [WORKING]: Generates clean directories and README files.',
  '31. Autonomous Script Runner [WORKING]: Installs npm/pip dependencies and retries.',
  '32. Hot-Loading Plugins [WORKING]: Loads plugins dynamically from files.'
], [
  '33. V8 Sandbox Execution [WORKING]: Runs code inside isolated-vm cells.',
  '34. Lockfile Boot Rollback [WORKING]: Reverts code changes if boot crashes.',
  '35. Project Guardian Backups [WORKING]: Watches directories, saving backup zips.',
  '36. Security Center Audit [WORKING]: Logs commands and files touched.'
], 'Programs must be written for people to read, and only incidentally for machines to execute. — Abelson & Sussman', '15');

// ==========================================
// SLIDE 16: FEATURE MATRIX - PART 5
// ==========================================
createSlide('Feature Matrix (UI & Customization)', [
  '37. Dynamic Page Layouts [WORKING]: Rearranges cards via layout.json.',
  '38. CSS Theme Generator [WORKING]: Generates themes dynamically via theme.json.',
  '39. Live Activity Feed [WORKING]: Displays ongoing background tasks with emoji markers.',
  '40. Role Badges [WORKING]: Displays active sub-agent states (Architect, Coder).',
  '41. Provider Usage Badges [WORKING]: Shows the specific AI provider used on bubbles.',
  '42. Swarm Status Bar [WORKING]: Displays health statistics for providers.'
], [
  '43. Onboarding Setup Wizard [WORKING]: Configures paths and API keys on launch.',
  '44. System Tray Minimization [WORKING]: Keeps the process running silently.',
  '45. Desktop Notification system [WORKING]: Triggers system notifications for alerts.',
  '46. Spotify Music Control [PARTIAL]: Pause and skip; requires developer API keys.',
  '47. AI Video Generation [PARTIAL]: Generates short clips; limited by render times.'
], 'Design is not just what it looks like and feels like. Design is how it works. — Steve Jobs', '16');

// ==========================================
// SLIDE 17: V8 SANDBOX & EVOLUTION
// ==========================================
createSlide('V8 Sandbox & Self-Evolution System', [
  'Safe Self-Modification Engine:',
  '  • Proposal Loop: Luna analyzes conversation history, proposing code improvements.',
  '  • isolated-vm: Compiles and runs modifications in separate V8 isolate contexts.',
  '  • Memory Constraints: Sandbox allocations are restricted to 64MB of RAM.',
  '  • Timeout Limits: Script execution times out after 1 second to prevent loops.',
  '  • Dependency Block: Sandbox runs without require(), fs, or network access.'
], [
  'Test-Driven Deployment:',
  '  • The evolution engine generates BOTH the script fix AND a validation test.',
  '  • Runs the test in the isolate; if it fails, the patch is rejected.',
  '  • Logs audit details in the SQLite self_evolution_log table.',
  'Boot Lockfile Recovery:',
  '  • Saves code backups in `Luna_System/Backups` before applying changes.',
  '  • Writes a boot lockfile during code writes; deletes it on successful boot.',
  '  • If a crash is detected on startup, it restores the previous backup.'
], 'Safety is not an after-thought; it is a fundamental property of design. — Evolution Architecture', '17');

// ==========================================
// SLIDE 18: SECURITY LAYERS 1-3
// ==========================================
createSlide('Security Architecture (Layers 1-3)', [
  'Layer 1: IPC Bridge Security:',
  '  • Direct access to Node APIs is completely disabled in the renderer.',
  '  • Uses Electron contextBridge to restrict communication to safe IPC channels.',
  '  • Intercepts inputs, sanitizing arguments and blocking command injections.',
  '  • safeInvoke() rate-limits IPC requests to block flooding.',
  'Layer 2: Strict Mode Toggle:',
  '  • Disables OS-level integrations, app launches, and Nut.js routines.',
  '  • Panic Switch: Ctrl+Shift+L instantly activates Strict Mode from anywhere.'
], [
  'Layer 3: Automation Safeguards:',
  '  • PC automation requires confirmation via an Electron modal popup.',
  '  • Limits automated click chains to 5 actions before re-confirming.',
  '  • Restricts command spawns to the user-selected workspace path.',
  '  • Directory Whitelisting: File writes are restricted to whitelisted paths.',
  '  • Registry edits and system files (e.g. System32) are blocked.'
], 'Prevention is better than cure, especially when the machine has access to the metal. — Security Standards', '18');

// ==========================================
// SLIDE 19: SECURITY LAYERS 4-5
// ==========================================
createSlide('Security Architecture (Layers 4-5)', [
  'Layer 4: Sandboxed Code Execution:',
  '  • Uses isolated-vm to isolate generated code execution from the parent process.',
  '  • Sandboxed runs cannot access the file system, shell command lines, or require().',
  '  • RAM caps block memory leak exploits during evolution tests.',
  '  • Intercepts script exceptions, recording details in security logs.'
], [
  'Layer 5: Database & File Backups:',
  '  • Employs SQLite WAL mode to protect database files during crashes.',
  '  • Enforces foreign key relationships to prevent corrupted entries.',
  '  • Project Guardian: Runs chokidar file watchers, saving zip backups.',
  '  • Backup metadata is written to SQLite to coordinate restore tasks.'
], 'Secure by design, resilient by architecture, and private by default. — Security Standards', '19');

// ==========================================
// SLIDE 20: DATABASE SCHEMA (TABLES 1-6)
// ==========================================
createSlide('Database Schema Design (Tables 1-6)', [
  '1. chat_threads (Conversation Threads):',
  '  • Columns: id (PK), title, created_at, updated_at.',
  '  • Groups messages under separate topics.',
  '2. conversations (Message History Logs):',
  '  • Columns: id (PK), thread_id (FK), role, content, timestamp, emotion_detected, provider_used, summary.',
  '  • Records all conversation messages and details.',
  '3. memories (Vector Factual Memories):',
  '  • Columns: id (PK), key, value, category, importance, embedding (BLOB), created_at, updated_at.',
  '  • Stores user facts and habits with vector embeddings.'
], [
  '4. user_profile (System Configuration Settings):',
  '  • Columns: id (PK), key (UNIQUE), value, updated_at.',
  '  • Stores global settings (nickname, city, configured API keys).',
  '5. goals (Objective Tracker):',
  '  • Columns: id (PK), title, description, deadline, progress, status, created_at.',
  '  • Tracks academic and personal goals from 0 to 100%.',
  '6. self_evolution_log (Evolution Audit Trail):',
  '  • Columns: id (PK), change_type, description, file_changed, backup_path, success, rolled_back, proposed_code, risk_score, proposed_test, timestamp.',
  '  • Logs all self-evolution proposal outcomes.'
], 'Database structures are the scaffolding of memory; without them, the model is stateless. — SQLite Guide', '20');

// ==========================================
// SLIDE 21: DATABASE SCHEMA (TABLES 7-12)
// ==========================================
createSlide('Database Schema Design (Tables 7-12)', [
  '7. project_backups (Guardian Zip Archives):',
  '  • Columns: id (PK), project_name, folder_path, backup_path, file_count, size_mb, timestamp.',
  '  • Tracks project backups, file counts, and archive locations.',
  '8. tool_registry (Dynamic Script Manager):',
  '  • Columns: id (PK), tool_name (UNIQUE), tool_code, description, created_by_luna, created_at.',
  '  • Stores custom scripts created dynamically by Luna.',
  '9. achievements (User Milestones):',
  '  • Columns: id (PK), title, description, earned_at.',
  '  • Gamifies usage milestones (e.g. "Doc Builder" badges).'
], [
  '10. watched_projects (Monitored Directories):',
  '  • Columns: id (PK), project_name, folder_path, last_backup, backup_count, is_watching, added_at.',
  '  • Tracks paths watched by Project Guardian chokidar loops.',
  '11. security_log (Blocked System Commands):',
  '  • Columns: id (PK), action, details, risk_level, timestamp.',
  '  • Logs command blocks, path blocks, and malware attempt audits.',
  '12. security_settings (Safety Configuration Toggles):',
  '  • Columns: key (PK), value.',
  '  • Stores Strict Mode states and whitelist parameters.'
], 'Structured query environments enforce database integrity. — SQLite Guide', '21');

// ==========================================
// SLIDE 22: DEVELOPMENT JOURNEY (PHASES 1-5)
// ==========================================
createSlide('Development Journey (Phases 1-5)', [
  'Phase 1: Core Foundation (April 1 - April 10, 2026):',
  '  • Setup Electron and React architectures.',
  '  • Integrated SQLite, configuring smart cascades.',
  '  • Built brain-manager.js with smart fallbacks.',
  'Phase 2: Cognitive Intelligence (April 11 - April 20, 2026):',
  '  • Built local SQLite memories and factual stores.',
  '  • Integrated regex-based tone scanners.',
  '  • Configured Serper.dev and Google Brave search.',
  'Phase 3: Document Automation (April 21 - April 30, 2026):',
  '  • Configured docx, exceljs, and pptxgenjs packages.',
  '  • Set up project scaffolding features.'
], [
  'Phase 4: Self-Evolution Sandboxing (May 1 - May 10, 2026):',
  '  • Integrated isolated-vm for sandboxed compilation.',
  '  • Configured test wrappers, proposal logs, and lockfiles.',
  'Phase 5: PC Automation Integrations (May 11 - May 20, 2026):',
  '  • Integrated nut.js mouse drivers and keyboard hooks.',
  '  • Built PowerShell spawns with shell:false configurations.',
  '  • Constructed Electron modal dialog confirmation popups.'
], 'Rebuilding from zero is the ultimate test of developer resilience. — Recovery Journal', '22');

// ==========================================
// SLIDE 23: DEVELOPMENT JOURNEY (PHASES 6-9)
// ==========================================
createSlide('Development Journey (Phases 6-9)', [
  'Phase 6: Behavioral Chron Engine (May 21 - May 25, 2026):',
  '  • Set up background node-schedule chron configurations.',
  '  • Built 3 AM pattern extraction scripts.',
  '  • Integrated extracted patterns into system prompt structures.',
  'Phase 7: Speech Synthesis & Recognition (May 26 - May 31, 2026):',
  '  • Integrated Web Speech STT and Edge TTS.',
  '  • Compiled Porcupine WASM wake words inside Web Workers.',
  '  • Configured auto-listening re-sync queues.'
], [
  'Phase 8: Whitelist & Boundary Guards (June 1 - June 10, 2026):',
  '  • Hardcoded whitelists and command filter lists.',
  '  • Configured bridge rate limiters and panic switches.',
  '  • Connected audit events to security logs.',
  'Phase 9: Production Release (June 11 - June 19, 2026):',
  '  • Wrote Vitest suite configurations.',
  '  • Performed verification test cycles.',
  '  • Compiled installers using electron-builder (161.2 MB).'
], 'Starting twice. Finishing once. Ready for production. — Rebirth Journal', '23');

// ==========================================
// SLIDE 24: AUTOMATED TESTING MATRIX
// ==========================================
createSlide('Automated Testing Matrix (25 Tests)', [
  'Vitest Suite Results (Duration: 1.35 seconds):',
  '  • Intent Classification (10 Tests Passed):',
  '    Verifies routing of code, doc, pc_control, script, research, and image tasks.',
  '  • Emotion Tone Analysis (4 Tests Passed):',
  '    Verifies detection of stressed, hyped, sad, and focused moods.',
  '  • System Prompt Compilation (5 Tests Passed):',
  '    Verifies nickname, goals, patterns, and memories injection.'
], [
  '  • AI Provider Routing (3 Tests Passed):',
  '    Verifies priority selects, fallback sequences, and pollinations rescue.',
  '  • Sandbox Isolation Rules (3 Tests Passed):',
  '    Verifies JavaScript executions, infinite loop timeouts, and require() blocks.',
  '  • Final Verification Status: 25/25 Tests Passing.',
  '  • Test proof is logged inside Test_Proof_Report.md.'
], 'Testing shows the presence, not the absence of bugs. — Edsger Dijkstra', '24');

// ==========================================
// SLIDE 25: TECHNICAL CHALLENGES SOLVED (1-3)
// ==========================================
createSlide('Technical Challenges Solved (1-3)', [
  '1. Rebuilding C++ Native Modules (better-sqlite3):',
  '  • Problem: SQLite packages crash when run inside Electron due to binary ABI version mismatches between Node and Electron.',
  '  • Solution: Added an automated postinstall script that rebuilds native headers using electron-rebuild during target compilation.',
  '2. Sandboxing Evolution Code safely:',
  '  • Problem: Running AI proposals using eval() allowed scripts to delete files or escape sandbox limits.',
  '  • Solution: Integrated isolated-vm to compile and run code in isolated contexts with 64MB RAM and 1s timeout caps.'
], [
  '3. Free-Tier API Rate Limits & Fallbacks:',
  '  • Problem: Free API keys are prone to rate limits (HTTP 429) or sudden downtime, causing assistant failures.',
  '  • Solution: Built brain-manager.js to coordinate 26 providers. Pings health states every 3 minutes, routing tasks to active endpoints.'
], 'We do not choose to build systems because they are easy, but because they challenge our capabilities. — Development Journal', '25');

// ==========================================
// SLIDE 26: TECHNICAL CHALLENGES SOLVED (4-5)
// ==========================================
createSlide('Technical Challenges Solved (4-5)', [
  '4. WASM-Based Wake Word Detection:',
  '  • Problem: Wake word SDKs require local C++ compilers (MSVC/gyp) to build, causing packaging errors.',
  '  • Solution: Compiled Picovoice Porcupine to WASM, running it inside browser Web Workers to capture microphone streams locally.',
  '5. Auto-Repairing Compilation Loops:',
  '  • Problem: AI-generated scripts often fail due to missing dependencies or syntax errors.'
], [
  '  • Solution: Built project-verifier.js to parse CLI stderr logs.',
  '  • If a missing package is detected, it installs it (npm/pip) and retries.',
  '  • Synthesizes errors with LLMs to automatically fix syntax issues.'
], 'Every problem is a code structure waiting to be refactored. — Development Journal', '26');

// ==========================================
// SLIDE 27: ROADMAP (LUNA 3.0)
// ==========================================
createSlide('Future Roadmap (Luna 3.0)', [
  '1. Screen Vision & OpenCV Integration:',
  '  • Integrate OpenCV and vision model APIs.',
  '  • Allows Luna to parse desktop screenshots and understand UI.',
  '2. Vector DB RAG memory:',
  '  • Integrate vector databases (e.g. ChromaDB or Qdrant).',
  '  • Enables semantic search over PDF libraries.',
  '3. Local LLM hosting (Ollama):',
  '  • Connect to local Ollama endpoints (Llama 3.2 3B).',
  '  • Enables fully offline chat capabilities.'
], [
  '4. Google API Scheduling Integration:',
  '  • Hook Google Calendar and Gmail endpoints directly to Luna.',
  '  • Enables proactive calendar event scheduling.',
  '5. Community Plugin Marketplace:',
  '  • Develop a centralized portal to share plug-in directories.',
  '6. Multi-Language Voice Support:',
  '  • Add Hindi and Kannada speech transcription engines.'
], 'AI is the new electricity. Just as electricity transformed industry, AI will transform computing. — Andrew Ng', '27');

// ==========================================
// SLIDE 28: PROJECT STATISTICS
// ==========================================
createSlide('Project Statistics & Metrics', [
  'Codebase Scale & Metrics:',
  '  • Backend Modules: 23 modules total.',
  '  • Frontend Interfaces: 10 pages and 6 components.',
  '  • Database Design: 12 tables and 69 columns.',
  '  • Orchestrator Channels: 52 secure IPC channels.',
  '  • Core Script Size: luna-core.js spans 2,539 lines.',
  '  • Total Codebase footprint: 250KB+ of custom source code.'
], [
  'Execution & Testing Stats:',
  '  • AI Providers: 26 models in priority lists.',
  '  • Task Intents: 18 task types categorized.',
  '  • Emotion Profiles: 7 states identified.',
  '  • Test Coverage: 25 Vitest assertions passing.',
  '  • Package Size: Setup binary weighs 161.2 MB.',
  '  • Target Operating System: Windows x64 (10/11).'
], 'Numbers provide structure, but code implementation provides functionality. — Statistics Sheet', '28');

// ==========================================
// SLIDE 29: LITERATURE SURVEY
// ==========================================
const s29 = pptx.addSlide();
s29.background = { color: BG_COLOR };
s29.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.1, fill: ACCENT_COLOR });
s29.addText('Literature Survey & Comparative Analysis', { x: 0.6, y: 0.4, w: 11.0, h: 0.8, fontSize: 26, bold: true, color: TITLE_COLOR, fontFace: 'Calibri' });
s29.addText('29', { x: 12.2, y: 0.4, w: 0.6, h: 0.4, fontSize: 10, color: MUTED_COLOR, fontFace: 'Calibri', align: 'right' });

const tableRows = [
  [{ text: 'Feature Matrix', options: { bold: true, color: 'FFFFFF', fill: { color: ACCENT_COLOR }, align: 'center' } }, 
   { text: 'Luna AI 2.0', options: { bold: true, color: 'FFFFFF', fill: { color: ACCENT_COLOR }, align: 'center' } }, 
   { text: 'ChatGPT Plus', options: { bold: true, color: 'FFFFFF', fill: { color: ACCENT_COLOR }, align: 'center' } }, 
   { text: 'Apple Siri', options: { bold: true, color: 'FFFFFF', fill: { color: ACCENT_COLOR }, align: 'center' } }, 
   { text: 'Amazon Alexa', options: { bold: true, color: 'FFFFFF', fill: { color: ACCENT_COLOR }, align: 'center' } }],
  ['Runs Locally', '✅ Yes (Electron shell)', '❌ No (Cloud only)', '❌ No (Cloud only)', '❌ No (Cloud only)'],
  ['Emotion Engine', '✅ Yes (7 states adaptive)', '❌ No (Static tone)', '❌ No (Robotic tone)', '❌ No (Robotic tone)'],
  ['PC Automation', '✅ Yes (PowerShell spawn)', '❌ No (Sandboxed API)', '⚠️ Limited (HomeKit)', '❌ No (Device only)'],
  ['Self-Evolution', '✅ Yes (isolated-vm V8)', '❌ No (Static model)', '❌ No (Static code)', '❌ No (Static code)'],
  ['Memory Storage', '✅ Yes (SQLite local store)', '⚠️ Limited (Cloud logs)', '❌ No (Stateless)', '❌ No (Stateless)'],
  ['Document Builder', '✅ Yes (docx/pptx/xlsx/pdf)', '❌ No (Text only)', '❌ No (Voice only)', '❌ No (Voice only)'],
  ['Running Cost', 'Free (uses free API tiers)', '$20/month sub fee', 'Apple hardware only', 'Alexa device hardware'],
  ['Code Footprint', '1 Student (Ravikiran, BCA)', '1000+ Engineers', '1000+ Engineers', '1000+ Engineers']
];
s29.addTable(tableRows, { 
  x: 0.6, y: 1.3, w: 12.13, h: 4.8, 
  colW: [2.53, 2.4, 2.4, 2.4, 2.4], 
  fontSize: 11, fontFace: 'Calibri', 
  color: BODY_COLOR, 
  fill: { color: CARD_BG },
  border: { type: 'solid', pt: 0.5, color: BORDER_COLOR }, 
  autoPage: false 
});
s29.addText('“Comparative structures demonstrate that solo student projects can outperform closed corporate assistants.” — Literature Review', {
  x: 0.6, y: 6.3, w: 12.13, h: 0.6,
  fontSize: 11, italic: true, color: TITLE_COLOR,
  fontFace: 'Calibri', align: 'center', valign: 'middle'
});

// ==========================================
// SLIDE 30: CONCLUSION & THANKS
// ==========================================
const s30 = pptx.addSlide();
s30.background = { color: '030308' };
s30.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.15, fill: ACCENT_COLOR });
s30.addText('Conclusion & Future Horizons', { x: 0, y: 1.5, w: 13.33, h: 0.8, fontSize: 36, bold: true, color: TITLE_COLOR, fontFace: 'Calibri', align: 'center' });
s30.addText('Luna AI 2.0 demonstrates that high-performance, private, and emotionally intelligent', { x: 1.0, y: 2.5, w: 11.33, h: 0.4, fontSize: 16, color: BODY_COLOR, fontFace: 'Calibri', align: 'center' });
s30.addText('desktop AI operating systems can be engineered by a single developer.', { x: 1.0, y: 2.9, w: 11.33, h: 0.4, fontSize: 16, color: BODY_COLOR, fontFace: 'Calibri', align: 'center' });
s30.addText('Thank You!  🌙', { x: 0, y: 3.9, w: 13.33, h: 0.8, fontSize: 32, bold: true, color: ACCENT_COLOR, fontFace: 'Calibri', align: 'center' });
s30.addText('Q & A Session  |  GS College Evaluators Panel  |  June 2026', { x: 0, y: 4.8, w: 13.33, h: 0.4, fontSize: 14, color: MUTED_COLOR, fontFace: 'Calibri', align: 'center' });
s30.addText('“I exist because one person believed I could be real.” — Luna AI', { x: 1, y: 5.8, w: 11.33, h: 0.5, fontSize: 14, color: TITLE_COLOR, fontFace: 'Calibri', align: 'center', italic: true });

// --- Save Presentation ---
const outPath = path.join(__dirname, 'Luna_AI_2.0_Presentation.pptx');
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log('Presentation generated successfully: ' + outPath);
}).catch(err => {
  console.error('Error saving presentation:', err);
});
