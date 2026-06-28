import { describe, it, expect } from 'vitest';
import sandbox from '../backend/evolution-sandbox.js';

describe('Evolution Sandbox', () => {
  it('allows valid scripts', () => {
    const validCode = `
      const math = { add: (a, b) => a + b };
      global.add = math.add;
    `;
    const validTest = `
      if (global.add(2, 3) !== 5) throw new Error("Math is broken");
      console.log("Math works!");
    `;
    const result = sandbox.testCode(validCode, validTest, 'backend/math.js');
    expect(result.passed).toBe(true);
    expect(result.output).toContain('Math works!');
  });

  it('blocks infinite loops via timeout', () => {
    const loopCode = `while (true) {}`;
    const result = sandbox.testCode(loopCode, null, 'backend/loop.js');
    expect(result.passed).toBe(false);
    expect(result.errors[0]).toContain('timed out');
  });

  it('blocks out of bounds native imports', () => {
    const oobCode = `const fs = require('fs');`;
    const result = sandbox.testCode(oobCode, null, 'backend/oob.js');
    expect(result.passed).toBe(false);
    expect(result.errors[0]).toContain('not defined');
  });
});
