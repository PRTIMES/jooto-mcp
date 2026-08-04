import { describe, expect, it, vi, beforeEach } from 'vitest';

const jootoApiRequest = vi.fn();

vi.mock('../src/tools/utils.js', async (importOriginal) => ({
  ...(await importOriginal()),
  jootoApiRequest,
}));

const { toolDefinitions } = await import('../src/tools/definitions.ts');
const { toolSchemas } = await import('../src/tools/schemas.ts');
const { toolHandlers } = await import('../src/tools/handlers.ts');
const { resourceTemplateDefinitions } = await import('../src/resources/definitions.ts');
const { readResource } = await import('../src/resources/handlers.ts');

const apiResponse = {
  notifications: [
    {
      id: 1,
      type: 'add_task',
      data: 'タスクを追加しました',
      sender: {
        id: 20,
        name: 'sender_name',
        display_name: 'Sender Name',
        email: 'sender@example.com',
        role: 'staff',
      },
      task: {
        id: 30,
        name: 'Review invoice',
        status: 'to_do',
        list_id: 40,
        description: 'Task description',
        categories: [{ id: 50, name: 'Accounting' }],
      },
      board: {
        id: 60,
        title: 'Product Project',
        description: 'Board description',
      },
      created_at: '2026-01-03T00:00:00Z',
    },
  ],
  total: 1,
};

beforeEach(() => {
  jootoApiRequest.mockReset();
  jootoApiRequest.mockResolvedValue(apiResponse);
});

describe('jooto-list-notifications tool registration', () => {
  it('is exposed as a tool with a schema and a handler', () => {
    expect(toolDefinitions.map((tool) => tool.name)).toContain('jooto-list-notifications');
    expect(toolSchemas['jooto-list-notifications']).toBeDefined();
    expect(toolHandlers.get('jooto-list-notifications')).toBeTypeOf('function');
  });

  it('takes no argument at all', () => {
    const tool = toolDefinitions.find((t) => t.name === 'jooto-list-notifications');

    expect(tool.inputSchema.properties).toEqual({});
    expect(Object.keys(toolSchemas['jooto-list-notifications'].shape)).toEqual([]);
    expect(toolSchemas['jooto-list-notifications'].parse({})).toEqual({});
  });
});

describe('jooto-list-notifications handler', () => {
  it('requests /v1/notifications without any query parameter', async () => {
    await toolHandlers.get('jooto-list-notifications')({});

    expect(jootoApiRequest).toHaveBeenCalledTimes(1);
    expect(jootoApiRequest).toHaveBeenCalledWith('GET', '/v1/notifications');
  });

  it('returns the Jooto API response unchanged', async () => {
    const result = await toolHandlers.get('jooto-list-notifications')({});

    expect(JSON.parse(result.content[0].text)).toEqual(apiResponse);
  });

  it('wraps an API failure in a descriptive error', async () => {
    jootoApiRequest.mockRejectedValue(new Error('403 Forbidden'));

    await expect(toolHandlers.get('jooto-list-notifications')({}))
      .rejects.toThrow('通知一覧の取得に失敗しました');
  });
});

describe('jooto:///notifications resource', () => {
  it('is exposed as a resource template without any parameter', () => {
    const template = resourceTemplateDefinitions.find((r) => r.uriTemplate.startsWith('jooto:///notifications'));

    expect(template).toBeDefined();
    expect(template.uriTemplate).toBe('jooto:///notifications');
  });

  it('returns the same unchanged response as the tool', async () => {
    const result = await readResource('jooto:///notifications');

    expect(jootoApiRequest).toHaveBeenCalledWith('GET', '/v1/notifications');
    expect(JSON.parse(result.contents[0].text)).toEqual(apiResponse);
  });
});
