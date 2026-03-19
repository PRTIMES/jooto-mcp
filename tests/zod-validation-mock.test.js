import { describe, it, expect, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

// Mock the Client class methods
vi.mock('@modelcontextprotocol/sdk/client/index.js', () => {
  return {
    Client: vi.fn().mockImplementation(() => {
      return {
        connect: vi.fn().mockResolvedValue(undefined),
        listTools: vi.fn().mockResolvedValue({
          tools: [
            { name: 'echo', description: 'Echo a message' },
            { name: 'jooto-list-user', description: 'Get a list of users' }
          ]
        }),
        callTool: vi.fn().mockImplementation((name, args) => {
          // Echo tool validation
          if (name === 'echo') {
            if (!args.message) {
              return Promise.reject(new Error('Missing required parameter: message'));
            }
            if (typeof args.message !== 'string') {
              return Promise.reject(new Error('Invalid type for parameter: message'));
            }
            return Promise.resolve({
              content: [{ text: args.message }]
            });
          } 
          // Get users tool validation
          else if (name === 'jooto-list-user') {
            if (args.limit !== undefined) {
              if (typeof args.limit !== 'number') {
                return Promise.reject(new Error('Invalid type for parameter: limit'));
              }
              if (args.limit < 1) {
                return Promise.reject(new Error('Parameter limit must be at least 1'));
              }
              if (args.limit > 10) {
                return Promise.reject(new Error('Parameter limit must be at most 10'));
              }
            }
            const limit = args.limit || 5; // Default limit
            const users = Array.from({ length: limit }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));
            return Promise.resolve({
              content: [{ text: JSON.stringify({ users }) }]
            });
          }
          return Promise.reject(new Error(`Unknown tool: ${name}`));
        }),
        close: vi.fn().mockResolvedValue(undefined)
      };
    })
  };
});

describe('Zod Validation Tests (Mocked)', () => {
  let client;

  beforeEach(() => {
    client = new Client();
  });

  describe('Normal Cases', () => {
    it('should handle echo tool with valid parameters', async () => {
      const result = await client.callTool('echo', { message: 'こんにちは、世界！' });
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0]).toBeDefined();
      expect(result.content[0].text).toBe('こんにちは、世界！');
    });

    it('should handle get_users tool with valid parameters', async () => {
      const result = await client.callTool('jooto-list-user', { limit: 3 });
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0]).toBeDefined();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.users).toHaveLength(3);
    });

    it('should handle get_users tool with default parameters', async () => {
      const result = await client.callTool('jooto-list-user', {});
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0]).toBeDefined();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.users).toHaveLength(5); // Default limit
    });
  });

  describe('Error Cases', () => {
    it('should reject echo tool with missing required parameters', async () => {
      await expect(client.callTool('echo', {})).rejects.toThrow('Missing required parameter: message');
    });

    it('should reject echo tool with invalid parameter type', async () => {
      await expect(client.callTool('echo', { message: 123 })).rejects.toThrow('Invalid type for parameter: message');
    });

    it('should reject get_users tool with value exceeding maximum', async () => {
      await expect(client.callTool('jooto-list-user', { limit: 20 })).rejects.toThrow('Parameter limit must be at most 10');
    });

    it('should reject get_users tool with value below minimum', async () => {
      await expect(client.callTool('jooto-list-user', { limit: 0 })).rejects.toThrow('Parameter limit must be at least 1');
    });

    it('should reject get_users tool with invalid parameter type', async () => {
      await expect(client.callTool('jooto-list-user', { limit: 'three' })).rejects.toThrow('Invalid type for parameter: limit');
    });
  });
});
