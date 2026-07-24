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
    expect(taskTool?.description).toContain('時刻付きなら開始日時と締切日時が1分差');
    expect(taskTool?.description).toContain('日付のみは同日を許容');
    expect(taskTool?.inputSchema.properties.start_date_time.description).toContain('1分差');
    expect(taskTool?.inputSchema.properties.deadline_date_time.description).toContain('1分差');
  });

  it('explains how an existing task date is preserved or cleared on update', () => {
    const taskTool = toolDefinitions.find((tool) => tool.name === 'jooto-update-task');

    expect(taskTool?.description).toContain('反対側が設定済みなら変更対象だけを送信');
    expect(taskTool?.description).toContain('時刻付きなら新しい値を基準に1分差');
    expect(taskTool?.description).toContain('反対側が未設定の場合も同様に補完');
    expect(taskTool?.description).toContain('空文字を明示的に指定');
    expect(taskTool?.description).toContain('パラメータ自体を省略');
    expect(taskTool?.inputSchema.properties.start_date_time.description).toContain('変更対象だけを送信');
    expect(taskTool?.inputSchema.properties.deadline_date_time.description).toContain('変更対象だけを送信');
  });

  it('explains checklist item date completion for create and update', () => {
    const createItemTool = toolDefinitions.find((tool) => tool.name === 'jooto-create-checklist-item');
    const updateItemTool = toolDefinitions.find((tool) => tool.name === 'jooto-update-checklist-item');

    expect(createItemTool?.description).toContain('時刻付きなら開始日時と締切日時が1分差');
    expect(updateItemTool?.description).toContain('反対側が設定済みなら変更対象だけを送信');
    expect(updateItemTool?.description).toContain('時刻付きなら新しい値を基準に1分差');
    expect(updateItemTool?.description).toContain('反対側が未設定の場合も同様に補完');
    expect(updateItemTool?.description).toContain('空文字を明示的に指定');
    expect(updateItemTool?.description).toContain('パラメータ自体を省略');
  });

  it('separates a single date-time by one minute on creation', () => {
    expect(normalizeDatePairForCreate({ start_date_time: '2026-07-24T09:00:00.0Z' })).toEqual({
      start_date_time: '2026-07-24T09:00:00.0Z',
      deadline_date_time: '2026-07-24T09:01:00.0Z',
    });
    expect(normalizeDatePairForCreate({ deadline_date_time: '2026-07-24T18:00:00.0Z' })).toEqual({
      start_date_time: '2026-07-24T17:59:00.0Z',
      deadline_date_time: '2026-07-24T18:00:00.0Z',
    });
  });

  it('copies a single date-only value to the missing side on creation', () => {
    expect(normalizeDatePairForCreate({ start_date_time: '2026-07-24' })).toEqual({
      start_date_time: '2026-07-24',
      deadline_date_time: '2026-07-24',
    });
  });

  it('keeps explicitly specified dates unchanged', () => {
    expect(normalizeDatePairForCreate({
      start_date_time: '2026-07-24T09:00:00.0Z',
      deadline_date_time: '2026-07-24T18:00:00.0Z',
    })).toEqual({
      start_date_time: '2026-07-24T09:00:00.0Z',
      deadline_date_time: '2026-07-24T18:00:00.0Z',
    });
  });

  it('moves an explicitly identical deadline date-time one minute after the start', () => {
    expect(normalizeDatePairForCreate({
      start_date_time: '2026-07-24T09:00:00.0Z',
      deadline_date_time: '2026-07-24T09:00:00.0Z',
    })).toEqual({
      start_date_time: '2026-07-24T09:00:00.0Z',
      deadline_date_time: '2026-07-24T09:01:00.0Z',
    });
    expect(normalizeDatePairForCreate({
      start_date_time: '2026-07-24',
      deadline_date_time: '2026-07-24',
    })).toEqual({
      start_date_time: '2026-07-24',
      deadline_date_time: '2026-07-24',
    });
  });

  it('sends only the specified date when the opposite side is already set', () => {
    expect(normalizeDatePairForUpdate(
      { start_date_time: '2026-07-25T09:00:00.0Z' },
      { deadline_date_time: '2026-07-30T18:00:00.0Z' }
    )).toEqual({
      start_date_time: '2026-07-25T09:00:00.0Z',
    });
    expect(normalizeDatePairForUpdate(
      { deadline_date_time: '2026-07-31T18:00:00.0Z' },
      { start_date_time: '2026-07-24T09:00:00.0Z' }
    )).toEqual({
      deadline_date_time: '2026-07-31T18:00:00.0Z',
    });
  });

  it('completes an unset opposite date-time with a one-minute difference', () => {
    expect(normalizeDatePairForUpdate(
      { deadline_date_time: '2026-07-31T18:00:00.0Z' },
      {}
    )).toEqual({
      start_date_time: '2026-07-31T17:59:00.0Z',
      deadline_date_time: '2026-07-31T18:00:00.0Z',
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
      { deadline_date_time: '2026-07-23T23:59:59.0Z' },
      { start_date_time: '2026-07-24T00:00:00.0Z' }
    )).toEqual({
      start_date_time: '2026-07-23T23:58:59.0Z',
      deadline_date_time: '2026-07-23T23:59:59.0Z',
    });
  });

  it('separates a date-time from an identical existing opposite value', () => {
    expect(normalizeDatePairForUpdate(
      { start_date_time: '2026-07-24T09:00:00.0Z' },
      { deadline_date_time: '2026-07-24T09:00:00.0Z' }
    )).toEqual({
      start_date_time: '2026-07-24T09:00:00.0Z',
      deadline_date_time: '2026-07-24T09:01:00.0Z',
    });
    expect(normalizeDatePairForUpdate(
      {
        start_date_time: '2026-07-24T09:00:00.0Z',
        deadline_date_time: '2026-07-24T09:00:00.0Z',
      },
      {}
    )).toEqual({
      start_date_time: '2026-07-24T09:00:00.0Z',
      deadline_date_time: '2026-07-24T09:01:00.0Z',
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
