import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database to avoid native module Node/Electron version mismatch
vi.mock('../backend/database.js', () => {
  return {
    default: {
      pragma: vi.fn(),
      exec: vi.fn(),
      prepare: vi.fn(() => ({
        run: vi.fn(() => ({ lastInsertRowid: 1, changes: 1 })),
        get: vi.fn(() => null),
        all: vi.fn(() => [])
      }))
    }
  };
});

vi.mock('../backend/memory.js', () => {
  return {
    default: {
      saveUserProfile: vi.fn(),
      saveMemory: vi.fn(),
      saveGoal: vi.fn()
    }
  };
});

import memoryService from '../backend/memory-service.js';
import lunaCore from '../backend/luna-core.js';
import memory from '../backend/memory.js';
import brainManager from '../backend/brain-manager.js';

beforeEach(() => {
  vi.clearAllMocks();
});


describe('Luna Core Routing', () => {
  it('detects code task', () => {
    const type = lunaCore.detectTaskType('write a function to sort array');
    expect(type).toBe('code');
  });

  it('detects doc create task', () => {
    const type = lunaCore.detectTaskType('create a pdf document about space');
    expect(type).toBe('doc_create');
  });

  it('detects pc control task', () => {
    const type = lunaCore.detectTaskType('open google chrome');
    expect(type).toBe('pc_control');
  });

  it('detects autonomous script task', () => {
    const type = lunaCore.detectTaskType('write a script to delete old temp files');
    expect(type).toBe('autonomous_script');
  });

  it('detects research task', () => {
    const type = lunaCore.detectTaskType('research latest ai news');
    expect(type).toBe('research');
  });

  it('detects automation task', () => {
    const type = lunaCore.detectTaskType('click at the center of the screen');
    expect(type).toBe('automation');
  });

  it('detects image generation task', () => {
    const type = lunaCore.detectTaskType('generate a picture of a cat');
    expect(type).toBe('image_gen');
  });

  it('detects video generation task', () => {
    const type = lunaCore.detectTaskType('create a video of a sunset');
    expect(type).toBe('video_gen');
  });

  it('detects pdf read task', () => {
    const type = lunaCore.detectTaskType('read the local file C:\\docs\\report.pdf');
    expect(type).toBe('pdf_read');
  });

  it('detects theme change task', () => {
    const type = lunaCore.detectTaskType('change to dark mode');
    expect(type).toBe('theme');
  });
});

describe('Luna Core Emotion Detection', () => {
  it('detects stressed emotion', () => {
    const emotion = lunaCore.detectEmotion('I am so stressed about this urgent deadline I need help!!!');
    expect(emotion).toBe('stressed');
  });

  it('detects hyped emotion', () => {
    const emotion = lunaCore.detectEmotion('let\'s gooooo this is amazing bro!!!');
    expect(emotion).toBe('hyped');
  });

  it('detects sad emotion', () => {
    const emotion = lunaCore.detectEmotion('I am tired and just sad today whatever');
    expect(emotion).toBe('sad');
  });

  it('detects focused emotion', () => {
    const emotion = lunaCore.detectEmotion('const data = fetch("/api"); return data;');
    expect(emotion).toBe('focused');
  });
});

describe('Luna Core System Prompt Building', () => {
  it('includes custom nickname', () => {
    const prompt = lunaCore.buildSystemPrompt('Ravi', 'neutral', [], [], null, []);
    expect(prompt).toContain('Call the user "Ravi" naturally');
  });

  it('includes active goals', () => {
    const goals = [{ title: 'Build Luna MVP', progress: 80 }];
    const prompt = lunaCore.buildSystemPrompt('baddy', 'neutral', [], goals, null, []);
    expect(prompt).toContain('Build Luna MVP (80% done)');
  });

  it('includes behavioral patterns', () => {
    const patterns = [{ pattern: 'Works best at night' }];
    const prompt = lunaCore.buildSystemPrompt('baddy', 'neutral', [], [], null, patterns);
    expect(prompt).toContain('Behavioral Patterns');
    expect(prompt).toContain('Works best at night');
  });

  it('includes recent memories', () => {
    const memories = [{ key: 'brother', value: 'Aditya' }];
    const prompt = lunaCore.buildSystemPrompt('baddy', 'neutral', memories, [], null, []);
    expect(prompt).toContain('brother: Aditya');
  });

  it('applies emotion modifier for stressed', () => {
    const prompt = lunaCore.buildSystemPrompt('baddy', 'stressed', [], [], null, []);
    expect(prompt).toContain('CURRENT MOOD: User is stressed');
  });
});

describe('Brain Manager Provider Routing', () => {
  it('returns a provider for chat task type', () => {
    const best = brainManager.getBestProvider('chat');
    expect(typeof best).toBe('string');
  });

  it('returns a provider for code task type', () => {
    const best = brainManager.getBestProvider('code');
    expect(typeof best).toBe('string');
  });

  it('falls back to pollinations if no providers are healthy', () => {
    // By default in a test environment without keys/health checks, it should fallback to pollinations
    const best = brainManager.getBestProvider('unknown_task_type');
    expect(best).toBe('pollinations');
  });
});
