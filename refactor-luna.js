const fs = require('fs');

let code = fs.readFileSync('backend/luna-core.js', 'utf8');

// Inject requires at top (after const pc = require('./pc-control'); or similar)
if (!code.includes('require(\'./memory-service\')')) {
  code = code.replace(
    /(const brain = require\('\.\/brain-manager'\);)/,
    `$1\nconst memoryService = require('./memory-service');\nconst researchService = require('./research-service');\nconst studyService = require('./study-service');\nconst documentService = require('./document-service');`
  );
}

// Inject dependency setting
if (!code.includes('researchService.setDependencies')) {
  code = code.replace(
    /(function emitActivity\(message, icon\) \{.*?\})/s,
    `$1\n\n// Inject dependencies into extracted services\nresearchService.setDependencies({ emitActivity });\nstudyService.setDependencies({ emitActivity });\ndocumentService.setDependencies({ emitActivity, brain });\n`
  );
}

// Replace calls
code = code.replace(/autoExtractMemories\(/g, 'memoryService.autoExtractMemories(');
code = code.replace(/await executeResearch\(/g, 'await researchService.executeResearch.call({emitActivity}, ');
code = code.replace(/await executeSummarizeLink\(/g, 'await researchService.executeSummarizeLink.call({emitActivity}, ');
code = code.replace(/await executeStudent\(/g, 'await studyService.executeStudent.call({emitActivity}, ');
code = code.replace(/await executePdfRead\(/g, 'await documentService.executePdfRead.call({emitActivity, brain}, ');
code = code.replace(/await executeDocCreate\(/g, 'await documentService.executeDocCreate.call({emitActivity, brain}, ');

// Replace the function bodies with empty strings to remove them
code = code.replace(/\/\/ ══════════════════════════════════════════════\s*\n\/\/ AGENTIC: RESEARCH EXECUTION\s*\n\/\/ ══════════════════════════════════════════════[\s\S]*?(?=\/\/ ══════════════════════════════════════════════\s*\n\/\/ AGENTIC: IMAGE GENERATION)/, '');

code = code.replace(/\/\/ ══════════════════════════════════════════════\s*\n\/\/ AGENTIC: PDF READING\s*\n\/\/ ══════════════════════════════════════════════[\s\S]*?(?=\/\/ ══════════════════════════════════════════════\s*\n\/\/ AGENTIC: AUTONOMOUS SCRIPT EXECUTION)/, '');

code = code.replace(/\/\/ ══════════════════════════════════════════════\s*\n\/\/ AGENTIC: STUDENT TOOLS.*?[\s\S]*?(?=\/\/ ══════════════════════════════════════════════\s*\n\/\/ AGENTIC: CODE EXECUTION)/, '');

code = code.replace(/\/\/ Auto-extract important info from user messages\s*\nfunction autoExtractMemories[\s\S]*?(?=\/\/ ══════════════════════════════════════════════\s*\n\/\/ AGENTIC: VIDEO GENERATION)/, '');

code = code.replace(/\/\/ ══════════════════════════════════════════════\s*\n\/\/ AGENTIC: DOCUMENT CREATION.*?[\s\S]*?(?=\/\/ ══════════════════════════════════════════════\s*\n\/\/ AGENTIC: SPOTIFY)/, '');

fs.writeFileSync('backend/luna-core.js', code);
console.log('Refactored luna-core.js successfully!');
