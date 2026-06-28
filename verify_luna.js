const path = require('path');
const fs = require('fs');
const core = require('./backend/luna-core');
const brain = require('./backend/brain-manager');
const memory = require('./backend/memory');

async function runVerification() {
  console.log("\n========================================================");
  console.log("   LUNA AI 2.0 - LIVE FUNCTIONAL VERIFICATION START     ");
  console.log("========================================================\n");

  // TEST 1 — Multi-Task Orchestration (PRIORITY)
  console.log("--------------------------------------------------");
  console.log("TEST 1 — Multi-Task Orchestration (PRIORITY)");
  console.log("Input: 'Open notepad, then take a screenshot, then tell me the CPU usage'");
  let res1 = await core.think("Open notepad, then take a screenshot, then tell me the CPU usage", [], "Ravikiran");
  console.log("Response:");
  console.log(res1.response);
  console.log("\nTask Type Detected:", res1.taskType);
  console.log("Provider Used:", res1.providerUsed);

  // TEST 2 — Multi-Task Orchestration (second case)
  console.log("\n--------------------------------------------------");
  console.log("TEST 2 — Multi-Task Orchestration (second case)");
  console.log("Input: \"Create a goal called 'finish exams', then summarize this url: https://example.com, then save a memory that I like coffee\"");
  let res2 = await core.think("Create a goal called 'finish exams', then summarize this url: https://example.com, then save a memory that I like coffee", [], "Ravikiran");
  console.log("Response:");
  console.log(res2.response);

  // TEST 3 — Intent Detection Live
  console.log("\n--------------------------------------------------");
  console.log("TEST 3 — Intent Detection Live");
  const t3Inputs = [
    "write a python script to rename files",
    "what's my RAM usage",
    "make a quiz on photosynthesis",
    "click at 500,300",
    "remember that my favorite color is blue"
  ];
  for (const input of t3Inputs) {
    console.log(`Input: "${input}" => EXACT Task Type: ${core.detectTaskType(input)}`);
  }

  // TEST 4 — Memory Round Trip
  console.log("\n--------------------------------------------------");
  console.log("TEST 4 — Memory Round Trip");
  const testFact = "Ravi's college is GS College of Management";
  console.log("Saving memory:", testFact);
  await memory.saveMemory("ravi_college_test", testFact, "fact", 5);
  console.log("Querying back: 'What is Ravi's college?'");
  const memRes = await memory.searchMemories("What is Ravi's college?");
  console.log("Retrieved Value:");
  console.log(memRes.length > 0 ? memRes[0].value : "Not found!");

  // TEST 5 — AI Provider Cascade Live
  console.log("\n--------------------------------------------------");
  console.log("TEST 5 — AI Provider Cascade Live");
  console.log("Sending chat request: 'Hello, what is 2+2?'");
  const startTime = Date.now();
  const brainRes = await brain.smartCall([{role: 'user', content: 'Hello, what is 2+2?'}], 'You are a math bot', 'chat');
  const duration = Date.now() - startTime;
  console.log(`Provider Responded: ${brainRes.providerUsed}`);
  console.log(`Response Time: ${duration}ms`);
  console.log(`Response Content: ${brainRes.content}`);
  
  console.log("\nRunning provider health check (this may take a moment)...");
  await brain.healthCheck();
  const stats = brain.getProviderStats();
  console.log("Health Check Status (First 5):");
  const first5 = Object.values(stats.providers).slice(0, 5);
  for (const p of first5) {
    console.log(`- ${p.name}: ${p.healthy ? '✅ Healthy' : '❌ Unhealthy'} (Latency: ${p.latency}ms, Has Key: ${p.hasKey})`);
  }

  // TEST 6 — Wake Word Status (Honesty Check)
  console.log("\n--------------------------------------------------");
  console.log("TEST 6 — Wake Word Status");
  const wakeWordFile = path.join(__dirname, 'src/components/WakeWordEngine.jsx');
  if (fs.existsSync(wakeWordFile)) {
    const wwContent = fs.readFileSync(wakeWordFile, 'utf8');
    if (wwContent.includes('builtin: "Computer"')) {
      console.log("Active wake word is currently HARDCODED as: 'Computer' (builtin picovoice keyword).");
      console.log("No custom .ppn file is present or loaded in WakeWordEngine.jsx.");
    } else {
      console.log("Wake word file appears modified. Looking for custom .ppn loading...");
    }
  } else {
    console.log("WakeWordEngine.jsx not found.");
  }

  // TEST 7 — Pattern Detection Status (Honesty Check)
  console.log("\n--------------------------------------------------");
  console.log("TEST 7 — Pattern Detection Status");
  const patternEngine = require('./backend/pattern-engine');
  const storedPatterns = patternEngine.getStoredPatterns();
  if (storedPatterns && storedPatterns.length > 0) {
    console.log(`Found ${storedPatterns.length} behavioral patterns currently existing in the memories table:`);
    storedPatterns.forEach(p => {
      console.log(`- ${p.pattern} (Importance: ${p.importance})`);
    });
  } else {
    console.log("Zero (0) behavioral patterns currently exist in the memories table.");
    console.log("The pattern system has not yet detected and saved any real patterns.");
  }

  console.log("\n========================================================");
  console.log("   VERIFICATION COMPLETE");
  console.log("========================================================\n");
  process.exit(0);
}

const { app } = require('electron');

app.on('window-all-closed', () => {
  // Prevent quitting when scraper background windows close
});

app.whenReady().then(() => {
  runVerification().catch(console.error).finally(() => {
    app.quit();
    process.exit(0);
  });
});
