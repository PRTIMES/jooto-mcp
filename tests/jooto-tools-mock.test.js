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
            { name: 'jooto-list-task', description: 'Get tasks from a board' },
            { name: 'jooto-create-task', description: 'Create a new task on a board' }
          ]
        }),
        callTool: vi.fn().mockImplementation((name, args) => {
          // Get board tasks
          if (name === 'jooto-list-task') {
            if (!args.board_id) {
              return Promise.reject(new Error('Missing required parameter: board_id'));
            }
            
            const tasks = [
              { id: 1, name: 'タスク1', description: '説明1' },
              { id: 2, name: 'タスク2', description: '説明2' }
            ];
            
            return Promise.resolve({
              content: [{ text: JSON.stringify({ tasks }) }]
            });
          } 
          // Create board task
          else if (name === 'jooto-create-task') {
            if (!args.board_id) {
              return Promise.reject(new Error('Missing required parameter: board_id'));
            }
            if (!args.name) {
              return Promise.reject(new Error('Missing required parameter: name'));
            }
            if (!args.list_id) {
              return Promise.reject(new Error('Missing required parameter: list_id'));
            }
            
            return Promise.resolve({
              content: [{ 
                text: JSON.stringify({ 
                  id: 123, 
                  name: args.name,
                  description: args.description || '',
                  list_id: args.list_id,
                  assigned_user_ids: args.assigned_user_ids || []
                }) 
              }]
            });
          }
          
          return Promise.reject(new Error(`Unknown tool: ${name}`));
        }),
        close: vi.fn().mockResolvedValue(undefined)
      };
    })
  };
});

describe('Jooto Tools Tests (Mocked)', () => {
  let client;
  let tools;

  beforeEach(async () => {
    client = new Client();
    tools = await client.listTools();
  });

  it('should list available tools', () => {
    expect(tools.tools).toHaveLength(2);
    expect(tools.tools[0].name).toBe('jooto-list-task');
    expect(tools.tools[1].name).toBe('jooto-create-task');
  });

  it('should have get_board_tasks tool', () => {
    const hasTool = tools.tools.some(tool => tool.name === 'jooto-list-task');
    expect(hasTool).toBe(true);
  });

  it('should have create_board_task tool', () => {
    const hasTool = tools.tools.some(tool => tool.name === 'jooto-create-task');
    expect(hasTool).toBe(true);
  });

  it('should get board tasks', async () => {
    // Skip if tool doesn't exist
    if (!tools.tools.some(tool => tool.name === 'jooto-list-task')) {
      return;
    }
    
    const result = await client.callTool('jooto-list-task', { 
      board_id: 123,
      page: 1,
      per_page: 2
    });
    
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content[0]).toBeDefined();
    
    const tasksData = JSON.parse(result.content[0].text);
    expect(tasksData.tasks).toBeDefined();
    expect(tasksData.tasks.length).toBeGreaterThan(0);
    expect(tasksData.tasks[0].name).toBeDefined();
  });

  it('should create a board task', async () => {
    // Skip if tool doesn't exist
    if (!tools.tools.some(tool => tool.name === 'jooto-create-task')) {
      return;
    }
    
    const result = await client.callTool('jooto-create-task', { 
      board_id: 123,
      name: 'テストタスク',
      list_id: 456,
      description: 'これはテスト用のタスクです',
      assigned_user_ids: [1, 2]
    });
    
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content[0]).toBeDefined();
    
    const taskData = JSON.parse(result.content[0].text);
    expect(taskData.name).toBe('テストタスク');
    expect(taskData.id).toBeDefined();
  });
});
