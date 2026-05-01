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

  // DEEP SCAN: Check for hallucinated relative imports
  const allFiles = getAllFiles(projectDir);
  const codeFiles = allFiles.filter(f => f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx'));

  for (const file of codeFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativeImports = content.matchAll(/(?:import.*?from\s+['"](\.[^'"]+)['"])|(?:require\s*\(\s*['"](\.[^'"]+)['"]\s*\))/g);
    
    for (const match of relativeImports) {
      const importPath = match[1] || match[2];
      if (!importPath) continue;

      const baseDir = path.dirname(file);
      const targetPath = path.join(baseDir, importPath);
      
      // Check if target exists with common extensions
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

  return { valid: errors.length === 0, errors };
}

module.exports = { verifyProject };