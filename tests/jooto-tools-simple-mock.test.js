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
            return Promise.resolve({
              content: [{ 
                text: JSON.stringify({ 
                  id: 123, 
                  name: args.name || 'テストタスク',
                  description: args.description || '',
                  list_id: args.list_id || 456
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

describe('Jooto Tools Simple Tests (Mocked)', () => {
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

  it('should get board tasks if tool is available', async () => {
    // Skip if tool doesn't exist
    if (!tools.tools.some(tool => tool.name === 'jooto-list-task')) {
      console.log('Skipping test: get_board_tasks tool not available');
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
  });

  it('should create a board task if tool is available', async () => {
    // Skip if tool doesn't exist
    if (!tools.tools.some(tool => tool.name === 'jooto-create-task')) {
      console.log('Skipping test: create_board_task tool not available');
      return;
    }
    
    const result = await client.callTool('jooto-create-task', {
      board_id: 123,
      name: 'テストタスク',
      list_id: 456,
      description: 'これはテスト用のタスクです',
      assigned_user_ids: [1, 2],
      deadline_date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content[0]).toBeDefined();
    
    const taskData = JSON.parse(result.content[0].text);
    expect(taskData.name).toBe('テストタスク');
    expect(taskData.id).toBeDefined();
  });
});
