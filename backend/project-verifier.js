// ============================================
// 🌙 LUNA AI — Project Verifier (Phase 3 Hardening)
// Post-generation validation to prevent false success
// ============================================

const fs = require('fs');
const path = require('path');

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function verifyProject(projectDir) {
  const errors = [];
  const packageJsonPath = path.join(projectDir, 'package.json');
  const hasPackageJson = fs.existsSync(packageJsonPath);

  if (hasPackageJson) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (!pkg.scripts || (!pkg.scripts.start && !pkg.scripts.dev)) {
        errors.push('package.json is missing a "start" or "dev" script. Luna cannot auto-run it.');
      }
    } catch (e) {
      errors.push('package.json is invalid JSON and cannot be parsed.');
    }
  }

  // Check for critical missing imports/entry files
  const entryPoints = ['server.js', 'index.js', 'app.js', 'main.js', 'index.html', 'src/index.js', 'src/App.jsx', 'src/App.js'];
  let foundEntry = false;
  for (const ep of entryPoints) {
    if (fs.existsSync(path.join(projectDir, path.normalize(ep)))) {
      foundEntry = true;
      break;
    }
  }

  if (!foundEntry && hasPackageJson) {
    errors.push('No main entry file found (e.g. server.js, src/index.js). The project will not start.');
  }

  const allFiles = getAllFiles(projectDir);
  const codeFiles = allFiles.filter(f => f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.html'));

  const expressRoutes = new Set();
  const fetchEndpoints = new Set();

  for (const file of codeFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativeSource = path.relative(projectDir, file);

    // 1. Check for fallback corruption strings
    if (content.includes('brains are down') || content.includes('baddy all my brains')) {
      errors.push(`File ${relativeSource} contains fallback/corrupted error content.`);
    }

    // 2. Scan for relative Express static folders (like express.static('public'))
    const staticMatch = content.match(/express\.static\s*\(\s*['"]([^'"]+)['"]\s*\)/);
    if (staticMatch) {
      errors.push(`File ${relativeSource} uses relative express.static('${staticMatch[1]}') which will fail outside cwd. Use 'express.static(path.join(__dirname, '${staticMatch[1]}'))' instead.`);
    }

    // 3. Scan for Express Routes Definition
    const routeMatches = content.matchAll(/app\.(get|post|put|delete|use)\s*\(\s*['"]\/([^'"]*)['"]/g);
    for (const match of routeMatches) {
      expressRoutes.add(match[2]);
    }

    // 4. Scan for Client-side fetch Endpoints
    const fetchMatches = content.matchAll(/fetch\s*\(\s*['"]\/([^'"]*)['"]/g);
    for (const match of fetchMatches) {
      fetchEndpoints.add(match[1]);
    }
  }

  // 5. DEEP SCAN: Check for hallucinated relative imports
  const jsFiles = allFiles.filter(f => f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx'));
  for (const file of jsFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativeImports = content.matchAll(/(?:import.*?from\s+['"](\.[^'"]+)['"])|(?:require\s*\(\s*['"](\.[^'"]+)['"]\s*\))/g);
    
    for (const match of relativeImports) {
      const importPath = match[1] || match[2];
      if (!importPath) continue;

      const baseDir = path.dirname(file);
      const targetPath = path.join(baseDir, importPath);
      
      const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];
      let targetExists = false;
      for (const ext of extensions) {
        if (fs.existsSync(targetPath + ext)) {
          targetExists = true;
          break;
        }
      }

      if (!targetExists) {
        const relativeSource = path.relative(projectDir, file);
        errors.push(`File ${relativeSource} imports '${importPath}' but that file does not exist.`);
      }
    }
  }

  // 6. Endpoint path mismatch verifier
  for (const endpoint of fetchEndpoints) {
    // If the endpoint is like "notes" but routes only defines "api/notes" (or vice versa), warn and fail
    if (!expressRoutes.has(endpoint)) {
      // Find similar routes
      const normalizedEndpoint = endpoint.replace(/^api\//, '').replace(/\/:\w+/g, '');
      let foundMismatch = false;
      for (const route of expressRoutes) {
        const normalizedRoute = route.replace(/^api\//, '').replace(/\/:\w+/g, '');
        if (normalizedEndpoint === normalizedRoute && endpoint !== route) {
          errors.push(`Endpoint mismatch: Frontend requests '/${endpoint}' but Server serves '/${route}'.`);
          foundMismatch = true;
          break;
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { verifyProject };