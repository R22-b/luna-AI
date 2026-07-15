import { describe, it, expect } from 'vitest';
import { SQUADS, routeToSquad, pruneContext } from '../backend/brain-swarm.js';

describe('Brain Swarm Routing & Context Pruning', () => {
  
  describe('routeToSquad()', () => {
    it('routes code tasks to the coding squad', () => {
      const squad = routeToSquad('code');
      expect(squad).toEqual(SQUADS.coding);
      expect(squad).toContain('nvidia_qwen25_coder');
    });

    it('routes summarize tasks to the fast squad', () => {
      const squad = routeToSquad('summarize');
      expect(squad).toEqual(SQUADS.fast);
    });

    it('defaults to chat squad for unknown tasks', () => {
      const squad = routeToSquad('unknown_weird_task');
      expect(squad).toEqual(SQUADS.chat);
    });
  });

  describe('pruneContext()', () => {
    it('keeps short messages intact', () => {
      const messages = [
        { role: 'system', content: 'You are an AI.' },
        { role: 'user', content: 'Hello' }
      ];
      const pruned = pruneContext(messages, 4000);
      expect(pruned).toEqual(messages);
    });

    it('always preserves the system prompt as the first message', () => {
      const messages = [
        { role: 'system', content: 'System Prompt' },
        // A huge message that exceeds 10 tokens (we'll limit to 5 tokens for test, i.e., 20 chars)
        { role: 'user', content: 'A'.repeat(100) },
        { role: 'user', content: 'Small recent message' } // 20 chars
      ];
      // Max tokens = 10 (~40 characters)
      const pruned = pruneContext(messages, 10);
      
      expect(pruned[0].role).toBe('system');
      expect(pruned[0].content).toBe('System Prompt');
      expect(pruned.length).toBe(2);
      expect(pruned[1].content).toBe('Small recent message');
    });
    
    it('truncates the most recent message if it alone exceeds the limit', () => {
      const messages = [
        { role: 'system', content: 'Sys' },
        { role: 'user', content: 'A'.repeat(100) } // This single message is too big
      ];
      // Max tokens = 5 (~20 characters)
      // "Sys" takes 3 characters. 17 chars remaining.
      const pruned = pruneContext(messages, 5);
      
      expect(pruned[0].content).toBe('Sys');
      expect(pruned[1].content).toContain('... [TRUNCATED]');
      expect(pruned[1].content.length).toBeLessThanOrEqual(40); // 17 chars + length of "... [TRUNCATED]"
    });
  });
});
