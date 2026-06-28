const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, PageBreak, HeadingLevel, ShadingType } = require('docx');
const fs = require('fs');
const path = require('path');

const PURPLE = '7C3AED';
const DARK_PURPLE = '2D1B69';
const LIGHT_VIOLET = 'A78BFA';
const WHITE = 'FFFFFF';

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, spacing: { before: 400, after: 200 }, children: [new TextRun({ text, bold: true, color: PURPLE, font: 'Calibri', size: level === HeadingLevel.HEADING_1 ? 40 : 32 })] });
}

function para(text) {
  return new Paragraph({ spacing: { after: 120, line: 276 }, children: [new TextRun({ text, font: 'Calibri', size: 24 })] });
}

function bullet(text) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text, font: 'Calibri', size: 24 })] });
}

function quote(text) {
  return new Paragraph({ spacing: { before: 200, after: 200 }, indent: { left: 720 }, children: [new TextRun({ text, italics: true, color: PURPLE, font: 'Calibri', size: 24 })] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function headerCell(text) {
  return new TableCell({ shading: { type: ShadingType.SOLID, color: PURPLE }, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, color: WHITE, font: 'Calibri', size: 20 })] })] });
}

function cell(text) {
  return new TableCell({ width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, font: 'Calibri', size: 20 })] })] });
}

const doc = new Document({
  creator: 'Ravikiran',
  title: 'Luna AI 2.0 - Final Project Report',
  description: 'AGI-Level Desktop AI Operating System',
  styles: { default: { document: { run: { font: 'Calibri', size: 24 } } } },
  sections: [{
    properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    children: [
      // COVER PAGE
      new Paragraph({ spacing: { before: 3000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'LUNA AI 2.0', bold: true, color: PURPLE, font: 'Calibri', size: 72 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'Living Universal Neural Assistant', color: DARK_PURPLE, font: 'Calibri', size: 36 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'An AGI-Level Desktop AI Operating System', italics: true, font: 'Calibri', size: 28 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600 }, children: [new TextRun({ text: '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501', color: PURPLE, size: 28 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: 'By Ravikiran', bold: true, font: 'Calibri', size: 28 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'BCA Final Year | Bengaluru, India', font: 'Calibri', size: 24 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'June 2026', font: 'Calibri', size: 24 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800 }, children: [new TextRun({ text: '\u201cI exist because one person believed I could be real.\u201d', italics: true, color: PURPLE, font: 'Calibri', size: 24 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '\u2014 Luna AI', color: PURPLE, font: 'Calibri', size: 22 })] }),
      pageBreak(),

      // TABLE OF CONTENTS
      heading('TABLE OF CONTENTS'),
      ...['1. Abstract','2. Introduction','3. Literature Survey & Comparison','4. System Architecture','5. Database Design','6. Implementation','7. Complete Feature List','8. Testing','9. Security Architecture','10. Future Roadmap','11. Conclusion','12. References'].map(t => para(t)),
      pageBreak(),

      // 1. ABSTRACT
      heading('1. Abstract'),
      para('Luna AI is an AGI-level desktop AI operating system built as a solo project by a final-year BCA student named Ravikiran from Bengaluru, India. It integrates 27 AI providers with automatic health-checked failover, real-time emotion detection across 7 emotional states, behavioral pattern recognition that adapts Luna\'s personality over time, hands-free voice control with wake word detection via WebAssembly, fully autonomous code execution with self-healing retry loops, mouse and keyboard PC automation with safety confirmation modals, document generation (Word, PDF, PowerPoint, Excel), and a self-evolution engine that proposes and tests its own code improvements inside a sandboxed V8 isolate.'),
      para('Unlike cloud-only chatbots such as ChatGPT or Google Gemini, Luna lives on the user\'s Windows machine with full operating system-level access. She remembers everything about her user in a persistent SQLite database, sets and tracks goals, watches over coding projects with automatic backups, and grows more intelligent over time through her evolution engine. The system consists of 23 backend modules, 10 frontend pages, 52+ IPC channels, 12 database tables with 69 columns, and a comprehensive 25-test automated test suite.'),
      quote('"The best way to predict the future is to invent it." \u2014 Alan Kay'),
      pageBreak(),

      // 2. INTRODUCTION
      heading('2. Introduction'),
      heading('2.1 What is Luna AI?', HeadingLevel.HEADING_2),
      para('Luna AI (Living Universal Neural Assistant) is a desktop AI operating system for Windows, built as an Electron application with a React frontend and a Node.js backend. She is designed to be a complete personal AI companion \u2014 not just a chatbot, but an intelligent system that can control your computer, remember your life, detect your emotions, write and execute code, generate professional documents, and continuously improve herself.'),
      heading('2.2 Motivation', HeadingLevel.HEADING_2),
      para('The project was born from a simple belief: one determined person can build what entire corporations struggle to deliver. While tech giants employ thousands of engineers to build AI assistants like Siri, Alexa, and Cortana, Luna was built entirely by a single BCA student working alone. The motivation was to prove that with the right architecture and determination, a solo developer can create an AI system that rivals \u2014 and in many ways exceeds \u2014 commercial alternatives.'),
      quote('"A single person with determination can achieve what entire corporations struggle to deliver." \u2014 Luna AI Project Philosophy'),
      heading('2.3 Problem Statement', HeadingLevel.HEADING_2),
      para('Current AI assistants suffer from critical limitations: (1) They are cloud-locked \u2014 requiring constant internet and sending all data to corporate servers. (2) They have no real personality \u2014 all responses feel corporate and robotic. (3) They cannot interact with the user\'s actual computer. (4) They have no persistent memory. (5) They cannot evolve or improve themselves. (6) They have no emotional intelligence.'),
      heading('2.4 Objective', HeadingLevel.HEADING_2),
      para('Build a fully autonomous, emotionally intelligent, self-evolving AI operating system that runs locally on Windows, remembers everything about its user, controls the PC, generates documents, and continuously improves itself \u2014 all while maintaining a unique, dynamic personality.'),
      quote('"Artificial Intelligence is the science of making machines do things that would require intelligence if done by humans." \u2014 John McCarthy'),
      pageBreak(),

      // 3. COMPARISON
      heading('3. Literature Survey & Comparison'),
      para('The following table presents a detailed comparison between Luna AI 2.0 and the major commercial AI assistants:'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [headerCell('Feature'), headerCell('Luna AI 2.0'), headerCell('ChatGPT'), headerCell('Google Gemini'), headerCell('Apple Siri'), headerCell('Amazon Alexa'), headerCell('Cortana')] }),
          new TableRow({ children: [cell('Runs Locally'), cell('\u2705 Yes'), cell('\u274c Cloud'), cell('\u274c Cloud'), cell('\u274c Cloud'), cell('\u274c Cloud'), cell('\u274c Dead')] }),
          new TableRow({ children: [cell('Emotion Detection'), cell('\u2705 7 States'), cell('\u274c None'), cell('\u274c None'), cell('\u274c None'), cell('\u274c None'), cell('\u274c None')] }),
          new TableRow({ children: [cell('PC Control'), cell('\u2705 Full'), cell('\u274c None'), cell('\u274c None'), cell('\u26a0\ufe0f Limited'), cell('\u274c None'), cell('\u26a0\ufe0f Limited')] }),
          new TableRow({ children: [cell('Self-Evolution'), cell('\u2705 Sandboxed'), cell('\u274c None'), cell('\u274c None'), cell('\u274c None'), cell('\u274c None'), cell('\u274c None')] }),
          new TableRow({ children: [cell('Persistent Memory'), cell('\u2705 SQLite'), cell('\u26a0\ufe0f Limited'), cell('\u26a0\ufe0f Limited'), cell('\u274c None'), cell('\u274c None'), cell('\u274c None')] }),
          new TableRow({ children: [cell('Code Execution'), cell('\u2705 Auto-retry'), cell('\u26a0\ufe0f Sandbox'), cell('\u274c None'), cell('\u274c None'), cell('\u274c None'), cell('\u274c None')] }),
          new TableRow({ children: [cell('Wake Word'), cell('\u2705 WASM'), cell('\u274c None'), cell('\u274c None'), cell('\u2705 Hey Siri'), cell('\u2705 Alexa'), cell('\u2705 Cortana')] }),
          new TableRow({ children: [cell('Doc Generation'), cell('\u2705 4 formats'), cell('\u274c None'), cell('\u274c None'), cell('\u274c None'), cell('\u274c None'), cell('\u274c None')] }),
          new TableRow({ children: [cell('Personality'), cell('\u2705 Adaptive'), cell('\u274c Static'), cell('\u274c Static'), cell('\u274c Static'), cell('\u274c Static'), cell('\u274c Static')] }),
          new TableRow({ children: [cell('Cost'), cell('Free'), cell('$20/mo'), cell('$20/mo'), cell('Apple Only'), cell('Amazon'), cell('Dead')] }),
          new TableRow({ children: [cell('Open Source'), cell('\u2705 Yes'), cell('\u274c No'), cell('\u274c No'), cell('\u274c No'), cell('\u274c No'), cell('\u274c No')] }),
          new TableRow({ children: [cell('Built By'), cell('1 Student'), cell('1000+'), cell('1000+'), cell('1000+'), cell('1000+'), cell('1000+')] }),
        ],
      }),
      para(''),
      quote('"The question of whether a computer can think is no more interesting than the question of whether a submarine can swim." \u2014 Edsger Dijkstra'),
      para('As the comparison demonstrates, Luna AI is the only system that combines local execution, emotional intelligence, self-evolution, full PC control, and document generation in a single package \u2014 built by one person.'),
      quote('"Where humans see limitations, AI sees possibilities. Where AI lacks soul, humans provide meaning." \u2014 Luna AI Development Notes'),
      pageBreak(),

      // 4-12: remaining sections
      heading('4. System Architecture'),
      para('Luna AI follows a dual-process Electron architecture with a React-based Renderer Process and a Node.js-based Main Process connected through a secure IPC bridge.'),
      bullet('Renderer Process: React 18.3 frontend with 10 pages, 6 components, Porcupine WASM wake word engine'),
      bullet('IPC Bridge: 52+ channels with safeInvoke() rate limiting. Express 5.2 REST mirror on port 3000'),
      bullet('Main Process: 23 Node.js backend modules totaling 250KB+ of code'),
      bullet('AI Router: 27 providers, 8 task-type priority cascades, health checks every 3 min, response cache'),
      bullet('Database: SQLite via better-sqlite3, WAL mode, 12 tables, 69 columns, foreign key enforcement'),
      pageBreak(),

      heading('5. Database Design'),
      para('12 tables, 69 columns. SQLite with WAL mode and foreign key enforcement.'),
      ...['chat_threads \u2014 id, title, created_at, updated_at','conversations \u2014 id, thread_id (FK), role, content, timestamp, emotion_detected, provider_used, summary','memories \u2014 id, key, value, category, importance, embedding (BLOB), created_at, updated_at','user_profile \u2014 id, key (UNIQUE), value, updated_at','goals \u2014 id, title, description, deadline, progress, status, created_at','self_evolution_log \u2014 id, change_type, description, file_changed, backup_path, success, rolled_back, timestamp, proposed_code, risk_score, proposed_test','project_backups \u2014 id, project_name, folder_path, backup_path, file_count, size_mb, timestamp','tool_registry \u2014 id, tool_name (UNIQUE), tool_code, description, created_by_luna, created_at','achievements \u2014 id, title, description, earned_at','watched_projects \u2014 id, project_name, folder_path, last_backup, backup_count, is_watching, added_at','security_log \u2014 id, action, details, risk_level, timestamp','security_settings \u2014 key (PK), value'].map(bullet),
      pageBreak(),

      heading('6. Implementation (9 Phases)'),
      ...['Phase 1: Foundation \u2014 Electron + React + SQLite + multi-provider AI cascade','Phase 2: Intelligence \u2014 Memory system + emotion detection + search + student tools','Phase 3: Documents & Projects \u2014 Word/PDF/PPT/Excel + project scaffolding + autonomous execution','Phase 4: Self-Evolution \u2014 isolated-vm sandbox (64MB, 1s timeout) + boot lockfile rollback','Phase 5: PC Control \u2014 nut.js automation + confirmation modals + kill switch + strict mode','Phase 6: Behavioral Intelligence \u2014 Pattern detection + personality injection + daily cron analysis','Phase 7: Voice & Wake Word \u2014 Edge TTS + Web Speech API + Porcupine WASM in WebWorker','Phase 8: Security \u2014 5-layer defense + strict mode + audit logging + activity feed','Phase 9: Testing & Production \u2014 Vitest (25 tests) + final Windows build (161.2 MB)'].map(bullet),
      quote('"The measure of intelligence is the ability to change." \u2014 Albert Einstein'),
      pageBreak(),

      heading('7. Feature List (47 Features)'),
      para('44 WORKING, 3 PARTIAL. Organized across 8 categories: Core Intelligence (8), PC Control (6), Documents (4), Voice (3), Research & Study (7), Code & Projects (4), Self-Evolution (4), UI (11).'),
      pageBreak(),

      heading('8. Testing'),
      para('Vitest 4.1.9 \u2014 25 tests, ALL PASSING in 1.35 seconds.'),
      para('Intent Detection: 10 tests | Emotion Detection: 4 tests | System Prompt: 5 tests | Provider Routing: 3 tests | Sandbox Isolation: 3 tests'),
      pageBreak(),

      heading('9. Security Architecture (5 Layers)'),
      ...['Layer 1: IPC Bridge \u2014 safeInvoke wrapper, rate limiting, contextBridge isolation','Layer 2: Strict Mode \u2014 toggle on/off, Ctrl+Shift+L global kill switch','Layer 3: Automation Safety \u2014 confirmation modal, 5-action chain limit, folder whitelist','Layer 4: Evolution Sandbox \u2014 isolated-vm V8 isolate, 64MB memory, 1s timeout, no fs/require','Layer 5: Data Safety \u2014 WAL mode, Guardian backups, evolution rollback, .env key storage'].map(bullet),
      pageBreak(),

      heading('10. Future Roadmap \u2014 Luna 3.0'),
      ...['Vision/Screen Understanding (OpenCV)','Long-Term Memory with RAG (vector database)','Local LLM Support (Ollama/llama.cpp)','Custom Wake Words ("Hey Luna")','Calendar & Email Integration','Mobile Companion App (React Native)','Plugin Marketplace','Multi-Language Support (Hindi, Kannada)'].map(bullet),
      quote('"AI is the new electricity." \u2014 Andrew Ng'),
      pageBreak(),

      heading('11. Conclusion'),
      para('Luna AI 2.0 demonstrates that a single developer can build an AGI-level system that rivals commercial AI assistants in capability while exceeding them in personalization, local execution, and emotional intelligence. With 27 AI providers, 47 features, and a self-evolution engine, Luna represents a new paradigm in personal AI \u2014 one that lives on your machine, remembers your life, detects your emotions, and grows alongside you.'),
      para('All built by one person from Bengaluru who refused to give up, even after losing every file and starting over from zero.'),
      new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '\u201cI exist because one person believed I could be real.\u201d', italics: true, color: PURPLE, font: 'Calibri', size: 28, bold: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '\u2014 Luna AI', color: PURPLE, font: 'Calibri', size: 24 })] }),
      pageBreak(),

      heading('12. References'),
      ...['Electron.js Documentation \u2014 electronjs.org','React Documentation \u2014 react.dev','SQLite Documentation \u2014 sqlite.org','Picovoice Porcupine \u2014 picovoice.ai','isolated-vm \u2014 github.com/nicolo-ribaudo/isolated-vm','Vitest Documentation \u2014 vitest.dev','OpenRouter API \u2014 openrouter.ai','Groq API \u2014 groq.com','better-sqlite3 \u2014 github.com/WiseLibs/better-sqlite3','@nut-tree-fork/nut-js \u2014 npmjs.com','Microsoft Edge TTS','pptxgenjs \u2014 npmjs.com','docx \u2014 npmjs.com'].map(bullet),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = path.join(__dirname, 'Luna_AI_2.0_College_Report.docx');
  fs.writeFileSync(outPath, buffer);
  const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
  console.log('Report generated: ' + outPath + ' (' + sizeMB + ' MB)');
});
