# 🤝 Contributing to Luna AI

Thank you for your interest in contributing to Luna AI! We welcome contributions from developers, designers, and enthusiasts of all levels.

---

## 💡 Types of Contributions

We appreciate all kinds of contributions:

- **Code** - Bug fixes, new features, performance improvements
- **Documentation** - README updates, guides, examples
- **Bug Reports** - Help us identify and fix issues
- **Feature Requests** - Suggest new capabilities
- **Testing** - Test Luna on different systems
- **Design** - UI/UX improvements, icons, themes
- **Translation** - Help localize Luna to other languages

---

## 🚀 Getting Started

### 1. Fork the Repository

```bash
gh repo fork R22-b/luna-AI
```

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/luna-AI.git
cd luna-AI
```

### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/add-voice-commands`
- `fix/memory-leak-in-cache`
- `docs/add-api-reference`
- `test/improve-coverage`

### 4. Install Dependencies

```bash
npm install
npx electron-rebuild -f -w better-sqlite3
```

### 5. Make Your Changes

- Follow the existing code style
- Add comments for complex logic
- Test your changes locally
- Update documentation if needed

### 6. Commit Your Changes

```bash
git add .
git commit -m "type: description"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Adding or updating tests

**Examples:**
```bash
git commit -m "feat: add voice command support"
git commit -m "fix: resolve memory leak in response cache"
git commit -m "docs: add API reference guide"
```

### 7. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 8. Open a Pull Request

1. Go to [Luna AI Repository](https://github.com/R22-b/luna-AI)
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit!

---

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style guide
- [ ] Tests pass locally (`npm test`)
- [ ] No console errors or warnings
- [ ] Documentation updated
- [ ] Commit messages are clear and descriptive
- [ ] No unrelated changes included

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
How to test this change:
1. Step 1
2. Step 2
3. Step 3

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented complex code
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] I have tested this locally
```

---

## 🎨 Code Style Guide

### JavaScript/React

**Naming Conventions:**
```javascript
// Variables and functions: camelCase
const myVariable = 'value';
function myFunction() {}

// Classes and components: PascalCase
class MyClass {}
function MyComponent() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_TIMEOUT = 5000;
```

**Formatting:**
```javascript
// Use 2 spaces for indentation
// Use semicolons
// Use single quotes for strings
// Use arrow functions for callbacks

const result = data.map((item) => {
  return item.value * 2;
});
```

**Comments:**
```javascript
// Use // for single-line comments
// Use /** */ for documentation comments

/**
 * Sends a message to Luna AI
 * @param {string} message - The user's message
 * @returns {Promise<string>} Luna's response
 */
async function sendMessage(message) {
  // Implementation
}
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/brain-manager.test.js

# Run with coverage
npm test -- --coverage
```

### Writing Tests

```javascript
// test/my-feature.test.js
const assert = require('assert');
const { myFunction } = require('../src/my-feature');

describe('My Feature', () => {
  it('should do something', () => {
    const result = myFunction('input');
    assert.strictEqual(result, 'expected');
  });

  it('should handle errors', () => {
    assert.throws(() => {
      myFunction(null);
    }, Error);
  });
});
```

---

## 📚 Documentation

### Updating README

- Keep it concise and clear
- Update table of contents
- Add examples for new features
- Include links to related docs

### Adding New Docs

1. Create file in `docs/` folder
2. Use clear headings and structure
3. Include code examples
4. Link from README

### Code Comments

```javascript
// Good: Explains why, not what
// We use FIFO eviction to prevent unbounded memory growth
if (cache.size > 500) {
  const firstKey = cache.keys().next().value;
  cache.delete(firstKey);
}

// Bad: Obvious from code
// Delete the first key
cache.delete(firstKey);
```

---

## 🐛 Bug Reports

### Creating a Bug Report

1. Check if bug already exists
2. Use clear, descriptive title
3. Provide steps to reproduce
4. Include expected vs actual behavior
5. Add screenshots/logs if possible

**Template:**
```markdown
## Description
Brief description of the bug.

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: Windows 11
- Node: 18.0.0
- Luna Version: 2.0.0

## Logs
Paste relevant error logs or screenshots.
```

---

## ✨ Feature Requests

### Proposing a Feature

1. Check if feature already requested
2. Describe the use case
3. Explain the benefit
4. Provide examples if possible

**Template:**
```markdown
## Feature Description
What should Luna AI be able to do?

## Use Case
Why is this useful?

## Example
How would users interact with this?

## Alternative Solutions
Any other ways to solve this?
```

---

## 🔄 Review Process

### What to Expect

1. **Automated Checks** - Tests and linting run automatically
2. **Code Review** - Maintainers review your code
3. **Feedback** - We may request changes
4. **Approval** - Once approved, we merge!

### Response Time

- Bug fixes: 1-2 days
- Features: 3-7 days
- Documentation: 1-3 days

---

## 📞 Getting Help

### Questions?

- **GitHub Discussions** - Ask questions
- **GitHub Issues** - Report bugs
- **Discord** (coming soon) - Chat with community
- **Email** - Contact maintainers

---

## 🎓 Development Tips

### Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Create Windows installer
npm run dist:win

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test
```

### Debugging

```javascript
// Use console.log for debugging
console.log('Value:', myVariable);

// Use debugger statement
debugger; // Execution pauses here

// Check logs
cat .manus-logs/devserver.log
```

### Common Issues

**Issue:** `electron-rebuild` fails
```bash
# Solution: Rebuild with specific module
npx electron-rebuild -f -w better-sqlite3
```

**Issue:** Dependencies not installing
```bash
# Solution: Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🌟 Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- Project documentation

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Thank you for helping make Luna AI better! Your contributions, no matter how small, make a big difference.

**Happy coding!** 🚀

---

**Questions?** Open an issue or start a discussion on GitHub!
