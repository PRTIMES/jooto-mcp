import { describe, expect, it } from 'vitest';
import { toolDefinitions } from '../src/tools/definitions.ts';
import {
  normalizeDatePairForCreate,
  normalizeDatePairForUpdate,
  toolHandlers,
} from '../src/tools/handlers.ts';
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

  it('explains how a single task date is normalized on creation', () => {
    const taskTool = toolDefinitions.find((tool) => tool.name === 'jooto-create-task');

    expect(taskTool?.description).toContain('開始日時と締切日時を両方設定する必要があります');
    expect(taskTool?.description).toContain('未指定側にも同じ値を自動設定');
    expect(taskTool?.inputSchema.properties.start_date_time.description).toContain('未指定側にも同じ値を自動設定');
    expect(taskTool?.inputSchema.properties.deadline_date_time.description).toContain('未指定側にも同じ値を自動設定');
  });

  it('explains how an existing task date is preserved on update', () => {
    const taskTool = toolDefinitions.find((tool) => tool.name === 'jooto-update-task');

    expect(taskTool?.description).toContain('現在のタスクから反対側の値を取得して維持');
    expect(taskTool?.description).toContain('反対側が未設定の場合のみ');
    expect(taskTool?.inputSchema.properties.start_date_time.description).toContain('反対側の値を取得して維持');
    expect(taskTool?.inputSchema.properties.deadline_date_time.description).toContain('反対側の値を取得して維持');
  });

  it('explains checklist item date completion for create and update', () => {
    const createItemTool = toolDefinitions.find((tool) => tool.name === 'jooto-create-checklist-item');
    const updateItemTool = toolDefinitions.find((tool) => tool.name === 'jooto-update-checklist-item');

    expect(createItemTool?.description).toContain('未指定側にも同じ値を自動設定');
    expect(updateItemTool?.description).toContain('現在のアイテムから反対側の値を取得して維持');
    expect(updateItemTool?.description).toContain('反対側が未設定の場合のみ');
  });

  it('copies a single date to the missing side on creation', () => {
    expect(normalizeDatePairForCreate({ start_date_time: '2026-07-24T09:00:00+09:00' })).toEqual({
      start_date_time: '2026-07-24T09:00:00+09:00',
      deadline_date_time: '2026-07-24T09:00:00+09:00',
    });
    expect(normalizeDatePairForCreate({ deadline_date_time: '2026-07-24T18:00:00+09:00' })).toEqual({
      start_date_time: '2026-07-24T18:00:00+09:00',
      deadline_date_time: '2026-07-24T18:00:00+09:00',
    });
  });

  it('keeps explicitly specified dates unchanged', () => {
    expect(normalizeDatePairForCreate({
      start_date_time: '2026-07-24T09:00:00+09:00',
      deadline_date_time: '2026-07-24T18:00:00+09:00',
    })).toEqual({
      start_date_time: '2026-07-24T09:00:00+09:00',
      deadline_date_time: '2026-07-24T18:00:00+09:00',
    });
  });

  it('preserves the existing opposite date on update', () => {
    expect(normalizeDatePairForUpdate(
      { start_date_time: '2026-07-25T09:00:00+09:00' },
      { deadline_date_time: '2026-07-30T18:00:00+09:00' }
    )).toEqual({
      start_date_time: '2026-07-25T09:00:00+09:00',
      deadline_date_time: '2026-07-30T18:00:00+09:00',
    });
    expect(normalizeDatePairForUpdate(
      { deadline_date_time: '2026-07-31T18:00:00+09:00' },
      { start_date_time: '2026-07-24T09:00:00+09:00' }
    )).toEqual({
      start_date_time: '2026-07-24T09:00:00+09:00',
      deadline_date_time: '2026-07-31T18:00:00+09:00',
    });
  });

  it('uses the specified date for both sides when the opposite side is unset', () => {
    expect(normalizeDatePairForUpdate(
      { deadline_date_time: '2026-07-31T18:00:00+09:00' },
      {}
    )).toEqual({
      start_date_time: '2026-07-31T18:00:00+09:00',
      deadline_date_time: '2026-07-31T18:00:00+09:00',
    });
  });
});
