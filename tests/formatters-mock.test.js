import { describe, expect, it } from 'vitest';
import { formatBoardListResponse } from '../src/tools/formatters.ts';

describe('formatBoardListResponse', () => {
  const response = {
    boards: [
      {
        id: 10,
        title: 'Product Project',
        description: 'Project description',
        archived: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
    ],
    page: 1,
    per_page: 200,
    total: 1,
    total_pages: 1,
  };

  it('returns compact board fields by default', () => {
    expect(formatBoardListResponse(response)).toEqual({
      boards: [
        {
          id: 10,
          title: 'Product Project',
        },
      ],
      meta: {
        page: 1,
        per_page: 200,
        total: 1,
        total_pages: 1,
        detail_level: 'compact',
      },
    });
  });

  it('returns standard board fields when requested', () => {
    expect(formatBoardListResponse(response, 'standard')).toEqual({
      boards: [
        {
          id: 10,
          title: 'Product Project',
          description: 'Project description',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      meta: {
        page: 1,
        per_page: 200,
        total: 1,
        total_pages: 1,
        detail_level: 'standard',
      },
    });
  });

  it('normalizes missing standard fields to null', () => {
    expect(formatBoardListResponse({ boards: [{}] }, 'standard').boards[0]).toEqual({
      id: null,
      title: null,
      description: null,
      created_at: null,
    });
  });
});
