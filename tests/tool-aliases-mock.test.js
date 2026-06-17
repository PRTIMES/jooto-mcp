import { describe, expect, it } from 'vitest';
import { toolDefinitions } from '../src/tools/definitions.ts';
import { toolHandlers } from '../src/tools/handlers.ts';
import { toolSchemas } from '../src/tools/schemas.ts';

describe('tool aliases', () => {
  it('exposes project list aliases with schemas and handlers', () => {
    const toolNames = toolDefinitions.map((tool) => tool.name);

    expect(toolNames).toContain('jooto-list-projects');
    expect(toolNames).toContain('jooto-list-archived-projects');
    expect(toolSchemas['jooto-list-projects']).toBeDefined();
    expect(toolSchemas['jooto-list-archived-projects']).toBeDefined();
    expect(toolHandlers.get('jooto-list-projects')).toBe(toolHandlers.get('jooto-list-boards'));
    expect(toolHandlers.get('jooto-list-archived-projects')).toBe(toolHandlers.get('jooto-list-archived-boards'));
  });

  it('guides task tools to confirm the project before use', () => {
    const searchTaskTool = toolDefinitions.find((tool) => tool.name === 'jooto-search-task');

    expect(searchTaskTool?.description).toContain('プロジェクトが指定されていない場合');
    expect(searchTaskTool?.description).toContain('jooto-list-projects');
    expect(() => toolSchemas['jooto-search-task'].parse({ search_query: 'keyword' })).toThrow(/プロジェクトが指定されていない場合/);
  });
});
