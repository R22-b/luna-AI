import { describe, it, expect } from 'vitest';
import { detectTaskType } from '../backend/task-router.js';

describe('Task Router logic', () => {
  it('detects pc_control correctly', () => {
    expect(detectTaskType('open notepad')).toBe('pc_control');
    expect(detectTaskType('volume max')).toBe('pc_control');
    expect(detectTaskType('shutdown')).toBe('pc_control');
  });

  it('detects student tools correctly', () => {
    expect(detectTaskType('explain this to me like im 10')).toBe('student');
    expect(detectTaskType('quiz me on biology')).toBe('student');
  });

  it('detects coding tasks correctly', () => {
    expect(detectTaskType('write a python script')).toBe('code');
    expect(detectTaskType('create a javascript function')).toBe('code');
  });

  it('detects project build correctly', () => {
    expect(detectTaskType('build a react website')).toBe('project_build');
    expect(detectTaskType('create a snake game')).toBe('project_build');
  });

  it('defaults to chat for general talk', () => {
    expect(detectTaskType('hello how are you')).toBe('chat');
    expect(detectTaskType('who are you')).toBe('chat');
  });
});
