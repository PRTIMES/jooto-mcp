import { describe, expect, it } from 'vitest';
import { toolDefinitions } from '../src/tools/definitions.ts';
import {
  normalizeDatePairForCreate,
  normalizeDatePairForUpdate,
  shouldLoadDatePairForUpdate,
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

  it('explains how an existing task date is preserved or cleared on update', () => {
    const taskTool = toolDefinitions.find((tool) => tool.name === 'jooto-update-task');

    expect(taskTool?.description).toContain('反対側が設定済みなら変更対象だけを送信');
    expect(taskTool?.description).toContain('両方を新しい値に揃えます');
    expect(taskTool?.description).toContain('反対側が未設定の場合も');
    expect(taskTool?.description).toContain('空文字を明示的に指定');
    expect(taskTool?.description).toContain('パラメータ自体を省略');
    expect(taskTool?.inputSchema.properties.start_date_time.description).toContain('変更対象だけを送信');
    expect(taskTool?.inputSchema.properties.deadline_date_time.description).toContain('変更対象だけを送信');
  });

  it('explains checklist item date completion for create and update', () => {
    const createItemTool = toolDefinitions.find((tool) => tool.name === 'jooto-create-checklist-item');
    const updateItemTool = toolDefinitions.find((tool) => tool.name === 'jooto-update-checklist-item');

    expect(createItemTool?.description).toContain('未指定側にも同じ値を自動設定');
    expect(updateItemTool?.description).toContain('反対側が設定済みなら変更対象だけを送信');
    expect(updateItemTool?.description).toContain('両方を新しい値に揃えます');
    expect(updateItemTool?.description).toContain('反対側が未設定の場合も');
    expect(updateItemTool?.description).toContain('空文字を明示的に指定');
    expect(updateItemTool?.description).toContain('パラメータ自体を省略');
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

  it('sends only the specified date when the opposite side is already set', () => {
    expect(normalizeDatePairForUpdate(
      { start_date_time: '2026-07-25T09:00:00+09:00' },
      { deadline_date_time: '2026-07-30T18:00:00+09:00' }
    )).toEqual({
      start_date_time: '2026-07-25T09:00:00+09:00',
    });
    expect(normalizeDatePairForUpdate(
      { deadline_date_time: '2026-07-31T18:00:00+09:00' },
      { start_date_time: '2026-07-24T09:00:00+09:00' }
    )).toEqual({
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

  it('uses the new start date for both sides when it is after the current deadline', () => {
    expect(normalizeDatePairForUpdate(
      { start_date_time: '2026-08-01' },
      { deadline_date_time: '2026-07-31' }
    )).toEqual({
      start_date_time: '2026-08-01',
      deadline_date_time: '2026-08-01',
    });
  });

  it('uses the new deadline for both sides when it is before the current start date', () => {
    expect(normalizeDatePairForUpdate(
      { deadline_date_time: '2026-07-23T23:59:59Z' },
      { start_date_time: '2026-07-24T00:00:00Z' }
    )).toEqual({
      start_date_time: '2026-07-23T23:59:59Z',
      deadline_date_time: '2026-07-23T23:59:59Z',
    });
  });

  it('does not treat times on the same date as contradictory when either side is date-only', () => {
    expect(normalizeDatePairForUpdate(
      { start_date_time: '2026-07-24' },
      { deadline_date_time: '2026-07-24T00:00:00Z' }
    )).toEqual({
      start_date_time: '2026-07-24',
    });
  });

  it('sends only the explicitly cleared date', () => {
    expect(normalizeDatePairForUpdate(
      { start_date_time: '' },
      { deadline_date_time: '2026-07-30T18:00:00+09:00' }
    )).toEqual({
      start_date_time: '',
    });
  });

  it.each([
    [{ start_date_time: '2026-07-25' }, true],
    [{ deadline_date_time: '2026-07-25' }, true],
    [{ start_date_time: '' }, false],
    [{ deadline_date_time: '' }, false],
    [{ start_date_time: '2026-07-25', deadline_date_time: '2026-07-26' }, false],
    [{}, false],
  ])('decides whether the current date pair must be loaded for %j', (requestBody, expected) => {
    expect(shouldLoadDatePairForUpdate(requestBody)).toBe(expected);
  });
});
