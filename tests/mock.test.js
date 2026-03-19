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
            { name: 'jooto-list-user', description: 'Get a list of users' },
            { name: 'jooto-list-task', description: 'Get tasks from a board' },
            { name: 'jooto-create-task', description: 'Create a new task on a board' }
          ]
        }),
        callTool: vi.fn().mockImplementation((name, args) => {
          if (name === 'echo') {
            return Promise.resolve({
              content: [{ text: args.message }]
            });
          } else if (name === 'jooto-list-user') {
            return Promise.resolve({
              content: [{ text: JSON.stringify({ users: [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }] }) }]
            });
          } else if (name === 'jooto-list-task') {
            return Promise.resolve({
              content: [{ text: JSON.stringify({ tasks: [{ id: 1, name: 'Task 1' }, { id: 2, name: 'Task 2' }] }) }]
            });
          } else if (name === 'jooto-create-task') {
            if (!args.name) {
              return Promise.reject(new Error('Missing required parameter: name'));
            }
            return Promise.resolve({
              content: [{ text: JSON.stringify({ id: 123, name: args.name }) }]
            });
          }
          return Promise.reject(new Error(`Unknown tool: ${name}`));
        }),
        close: vi.fn().mockResolvedValue(undefined)
      };
    })
  };
});

describe('MCP Client Tests (Mocked)', () => {
  let client;

  beforeEach(() => {
    client = new Client();
  });

  it('should list available tools', async () => {
    const tools = await client.listTools();
    expect(tools.tools).toHaveLength(4);
    expect(tools.tools[0].name).toBe('echo');
  });

  it('should call echo tool', async () => {
    const result = await client.callTool('echo', { message: 'Hello, world!' });
    expect(result.content[0].text).toBe('Hello, world!');
  });

  it('should get users', async () => {
    const result = await client.callTool('jooto-list-user', { limit: 2 });
    const data = JSON.parse(result.content[0].text);
    expect(data.users).toHaveLength(2);
    expect(data.users[0].name).toBe('User 1');
  });

  it('should get board tasks', async () => {
    const result = await client.callTool('jooto-list-task', { board_id: 123 });
    const data = JSON.parse(result.content[0].text);
    expect(data.tasks).toHaveLength(2);
    expect(data.tasks[0].name).toBe('Task 1');
  });

  it('should create a board task', async () => {
    const result = await client.callTool('jooto-create-task', { 
      board_id: 123,
      name: 'New Task',
      list_id: 456
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.name).toBe('New Task');
  });

  it('should reject create_board_task with missing name', async () => {
    await expect(client.callTool('jooto-create-task', { 
      board_id: 123,
      list_id: 456
    })).rejects.toThrow('Missing required parameter: name');
  });
});
