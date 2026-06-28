const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');
const backendDir = path.join(rootDir, 'backend');

function getFiles(dir, exts, exclude) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const full = path.join(dir, file);
        if (exclude && exclude.includes(file)) continue;
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            results = results.concat(getFiles(full, exts, exclude));
        } else {
            if (exts.some(ext => full.endsWith(ext))) {
                results.push(full);
            }
        }
    }
    return results;
}

const allJsFiles = getFiles(rootDir, ['.js', '.jsx'], ['node_modules', 'dist', '.git', 'Luna_Media', 'Luna_Data', 'Luna_Code', 'release']);

const allFiles = new Set(allJsFiles.map(f => f.replace(rootDir + '\\', '').replace(rootDir + '/', '')));

// Trace from main.js
const coreFiles = new Set(['main.js', 'preload.js']);
const queue = ['main.js', 'preload.js'];

// Read src/index.jsx to trace renderer
coreFiles.add('src/index.jsx');
queue.push('src/index.jsx');

function resolveImport(currentFile, importPath) {
    if (!importPath.startsWith('.')) return null; // Node module
    let target = path.join(path.dirname(currentFile), importPath);
    // add .js or .jsx if needed
    if (fs.existsSync(target + '.js')) target += '.js';
    else if (fs.existsSync(target + '.jsx')) target += '.jsx';
    else if (fs.existsSync(target)) {
        if (fs.statSync(target).isDirectory()) {
            if (fs.existsSync(path.join(target, 'index.js'))) target = path.join(target, 'index.js');
            else if (fs.existsSync(path.join(target, 'index.jsx'))) target = path.join(target, 'index.jsx');
        }
    }
    if (!fs.existsSync(target)) return null;
    return target.replace(rootDir + '\\', '').replace(rootDir + '/', '');
}

while(queue.length > 0) {
    const file = queue.shift();
    if (!fs.existsSync(file)) continue;
    const code = fs.readFileSync(file, 'utf8');
    
    // Find requires
    const reqRegex = /require\(['"]([^'"]+)['"]\)/g;
    let match;
    while ((match = reqRegex.exec(code)) !== null) {
        const resolved = resolveImport(file, match[1]);
        if (resolved && !coreFiles.has(resolved)) {
            coreFiles.add(resolved);
            queue.push(resolved);
        }
    }
    
    // Find imports
    const impRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    while ((match = impRegex.exec(code)) !== null) {
        const resolved = resolveImport(file, match[1]);
        if (resolved && !coreFiles.has(resolved)) {
            coreFiles.add(resolved);
            queue.push(resolved);
        }
    }
}

// Now coreFiles contains everything strictly imported from main.js or main.jsx.
// What about features that get imported dynamically?
// Let's add feature entry points to trace them.

const featureEntryPoints = [
    'backend/luna-core.js', // Chat
    'backend/pc-control.js', // PC
    'backend/brain-manager.js', // Multi-task
    'backend/memory.js', // Memory
    'backend/document-service.js', // Document
    'backend/self-evolution.js', // Evolution
    'backend/pattern-engine.js', // Pattern
];

const featureFiles = new Set();
for (const entry of featureEntryPoints) {
    featureFiles.add(entry.replace(/\//g, '\\')); // normalize
}
// Expand feature dependencies (only if they are not already core files)
const featureQueue = [...featureEntryPoints];
while(featureQueue.length > 0) {
    const file = featureQueue.shift();
    if (!fs.existsSync(file)) continue;
    const code = fs.readFileSync(file, 'utf8');
    
    const reqRegex = /require\(['"]([^'"]+)['"]\)/g;
    let match;
    while ((match = reqRegex.exec(code)) !== null) {
        const resolved = resolveImport(file, match[1]);
        if (resolved && !coreFiles.has(resolved) && !featureFiles.has(resolved)) {
            featureFiles.add(resolved);
            featureQueue.push(resolved);
        }
    }
}

// Remove feature files that are actually in coreFiles
for (const f of featureFiles) {
    if (coreFiles.has(f)) featureFiles.delete(f);
}

// Dev/Build scripts
const devScripts = [
    'vite.config.js', 'tailwind.config.js', 'postcss.config.js',
    'generate-pptx.js', 'generate-report.js', 'find-functions.js',
    'refactor-luna.js', 'test.js', 'test-runner.js', 'test-selfheal.js',
    'run-all-tests.js', 'verify_luna.js', 'analyze_trace.js',
    'MASTER_VERIFICATION.js', 'scripts/acceptance-test.js', 
    'scripts/full-test.js', 'scripts/ui-test.js', 'scripts/wait-and-launch.js',
    'tests/luna.test.js', 'tests/sandbox.test.js'
];
const devBuildFiles = new Set(devScripts.map(f => f.replace(/\//g, '\\')));

// The rest are Dead
const deadFiles = new Set();
for (let f of allFiles) {
    f = f.replace(/\//g, '\\');
    if (!coreFiles.has(f) && !featureFiles.has(f) && !devBuildFiles.has(f)) {
        deadFiles.add(f);
    }
}

console.log("CATEGORY A - Core Runtime Files:", coreFiles.size);
for (const f of coreFiles) console.log("A: " + f);

console.log("CATEGORY B - Feature Files:", featureFiles.size);
for (const f of featureFiles) console.log("B: " + f);

console.log("CATEGORY C - Dev/Build Only:", devBuildFiles.size);
for (const f of devBuildFiles) console.log("C: " + f);

console.log("CATEGORY D - Dead/Unused Files:", deadFiles.size);
for (const f of deadFiles) console.log("D: " + f);

