import { describe, expect, it } from 'vitest';
import { toolDefinitions } from '../src/tools/definitions.ts';
import { normalizeJootoDateTime, toolSchemas } from '../src/tools/schemas.ts';

describe('date normalization', () => {
  it.each([
    ['2026-07-24', '2026-07-24'],
    ['2026/07/24', '2026-07-24'],
    ['2026/7/4', '2026-07-04'],
    ['2024-02-29', '2024-02-29'],
  ])('normalizes a date-only value: %s', (input, expected) => {
    expect(normalizeJootoDateTime(input)).toBe(expected);
  });

  it.each([
    ['2026-07-24T09:30:00Z', '2026-07-24T09:30:00Z'],
    ['2026-07-24T09:30Z', '2026-07-24T09:30:00Z'],
    ['2026-07-24T09:30:00+09:00', '2026-07-24T00:30:00Z'],
    ['2026/07/24 09:30:00+0900', '2026-07-24T00:30:00Z'],
    ['2026-07-24T09:30:00.123Z', '2026-07-24T09:30:00Z'],
  ])('normalizes a date-time value to UTC: %s', (input, expected) => {
    expect(normalizeJootoDateTime(input)).toBe(expected);
  });

  it.each([
    '2026-02-30',
    '2025-02-29',
    '2026-07-24T09:30:00',
    '2026-07-24Z09:30:00',
    '2026-07-24T25:00:00Z',
    '2026-07-24T09:30:00+24:00',
    '7月24日',
  ])('rejects a value that cannot be normalized: %s', (input) => {
    expect(() => normalizeJootoDateTime(input)).toThrow();
  });

  it('normalizes task date fields while parsing tool arguments', () => {
    const result = toolSchemas['jooto-create-task'].parse({
      board_id: 1,
      name: 'Test task',
      list_id: 2,
      start_date_time: '2026/07/24',
      deadline_date_time: '2026-07-24T18:00:00+09:00',
    });

    expect(result.start_date_time).toBe('2026-07-24');
    expect(result.deadline_date_time).toBe('2026-07-24T09:00:00Z');
  });

  it('normalizes checklist item date fields while parsing tool arguments', () => {
    const result = toolSchemas['jooto-create-checklist-item'].parse({
      checklist_id: 1,
      content: 'Test item',
      start_date_time: '2026/07/24',
      deadline_date_time: '2026-07-24T18:00:00+09:00',
    });

    expect(result.start_date_time).toBe('2026-07-24');
    expect(result.deadline_date_time).toBe('2026-07-24T09:00:00Z');
  });

  it('returns a field-specific validation error for an invalid task date', () => {
    const result = toolSchemas['jooto-update-task'].safeParse({
      board_id: 1,
      task_id: 2,
      start_date_time: '2026-07-24T09:30:00',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('"start_date_time"は日付のみならYYYY-MM-DD');
  });

  it.each([
    'jooto-create-task',
    'jooto-update-task',
    'jooto-create-checklist-item',
    'jooto-update-checklist-item',
  ])(
    'documents both supported canonical formats for %s',
    (toolName) => {
      const tool = toolDefinitions.find((definition) => definition.name === toolName);
      const startDateProperty = tool?.inputSchema.properties.start_date_time;
      const deadlineDateProperty = tool?.inputSchema.properties.deadline_date_time;

      expect(startDateProperty.format).toBeUndefined();
      expect(deadlineDateProperty.format).toBeUndefined();
      expect(tool.description).toContain('YYYY-MM-DDTHH:mm:ssZ');
      expect(startDateProperty.description).toContain('YYYY-MM-DD');
      expect(startDateProperty.description).toContain('YYYY-MM-DDTHH:mm:ssZ');
      expect(deadlineDateProperty.description).toContain('YYYY-MM-DD');
      expect(deadlineDateProperty.description).toContain('YYYY-MM-DDTHH:mm:ssZ');
    }
  );
});
