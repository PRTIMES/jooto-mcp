import { describe, expect, it } from 'vitest';
import {
  formatBoardListResponse,
  formatListsResponse,
  formatTaskSearchResponse,
  formatTasksResponse,
} from '../src/tools/formatters.ts';

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

describe('formatListsResponse', () => {
  const response = {
    lists: [
      {
        id: 10,
        name: 'Todo',
        order: 1,
        color: '#ff0000',
        archived: false,
        auto_task_status: 'to_do',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
    ],
    page: 1,
    per_page: 200,
    total: 1,
    total_pages: 1,
  };

  it('returns compact list fields by default', () => {
    expect(formatListsResponse(response)).toEqual({
      lists: [
        {
          id: 10,
          name: 'Todo',
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

  it('returns standard list fields when requested', () => {
    expect(formatListsResponse(response, 'standard')).toEqual({
      lists: [
        {
          id: 10,
          name: 'Todo',
          order: 1,
          color: '#ff0000',
          auto_task_status: 'to_do',
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
    expect(formatListsResponse({ lists: [{}] }, 'standard').lists[0]).toEqual({
      id: null,
      name: null,
      order: null,
      color: null,
      auto_task_status: null,
    });
  });
});

describe('formatTasksResponse', () => {
  const response = {
    tasks: [
      {
        id: 10,
        task_number: 12,
        name: 'Review invoice',
        description: 'Check the invoice amount and due date.',
        list_id: 20,
        status: 'in_progress',
        assigned_user_ids: [1, 2],
        start_date_time: '2026-01-01T00:00:00Z',
        deadline_date_time: '2026-01-05T00:00:00Z',
        categories: [
          {
            id: 30,
            board_id: 40,
            name: 'Accounting',
            color: '#00ff00',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
          },
        ],
        updated_at: '2026-01-02T00:00:00Z',
      },
    ],
    page: 1,
    per_page: 200,
    total: 1,
    total_pages: 1,
  };

  it('returns compact task fields by default', () => {
    expect(formatTasksResponse(response)).toEqual({
      tasks: [
        {
          id: 10,
          name: 'Review invoice',
          list_id: 20,
          status: 'in_progress',
          assigned_user_ids: [1, 2],
          start_date_time: '2026-01-01T00:00:00Z',
          deadline_date_time: '2026-01-05T00:00:00Z',
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

  it('returns standard task fields when requested', () => {
    expect(formatTasksResponse(response, 'standard')).toEqual({
      tasks: [
        {
          id: 10,
          name: 'Review invoice',
          description: 'Check the invoice amount and due date.',
          list_id: 20,
          status: 'in_progress',
          assigned_user_ids: [1, 2],
          start_date_time: '2026-01-01T00:00:00Z',
          deadline_date_time: '2026-01-05T00:00:00Z',
          category_ids: [30],
          updated_at: '2026-01-02T00:00:00Z',
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
    expect(formatTasksResponse({ tasks: [{}] }, 'standard').tasks[0]).toEqual({
      id: null,
      name: null,
      description: null,
      list_id: null,
      status: null,
      assigned_user_ids: null,
      start_date_time: null,
      deadline_date_time: null,
      category_ids: null,
      updated_at: null,
    });
  });
});

describe('formatTaskSearchResponse', () => {
  const response = {
    tasks: [
      {
        id: 10,
        task_number: 12,
        name: 'Review invoice',
        description: 'Check the invoice amount and due date.',
        list_id: 20,
        status: 'in_progress',
        start_date_time: '2026-01-01T00:00:00Z',
        deadline_date_time: '2026-01-05T00:00:00Z',
        categories: [
          {
            id: 30,
            board_id: 40,
            name: 'Accounting',
            color: '#00ff00',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
          },
        ],
        comments: [
          {
            id: 40,
            content: 'Comment body',
          },
        ],
        checklists: [
          {
            id: 50,
            title: 'Checklist',
          },
        ],
        updated_at: '2026-01-02T00:00:00Z',
      },
    ],
    page: 1,
    per_page: 200,
    total: 1,
    total_pages: 1,
  };

  it('returns compact task search fields by default', () => {
    expect(formatTaskSearchResponse(response)).toEqual({
      tasks: [
        {
          id: 10,
          name: 'Review invoice',
          list_id: 20,
          status: 'in_progress',
          start_date_time: '2026-01-01T00:00:00Z',
          deadline_date_time: '2026-01-05T00:00:00Z',
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

  it('returns standard task search fields when requested', () => {
    expect(formatTaskSearchResponse(response, 'standard')).toEqual({
      tasks: [
        {
          id: 10,
          name: 'Review invoice',
          description: 'Check the invoice amount and due date.',
          list_id: 20,
          status: 'in_progress',
          start_date_time: '2026-01-01T00:00:00Z',
          deadline_date_time: '2026-01-05T00:00:00Z',
          category_ids: [30],
          updated_at: '2026-01-02T00:00:00Z',
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

  it('normalizes missing standard task search fields to null', () => {
    expect(formatTaskSearchResponse({ tasks: [{}] }, 'standard').tasks[0]).toEqual({
      id: null,
      name: null,
      description: null,
      list_id: null,
      status: null,
      start_date_time: null,
      deadline_date_time: null,
      category_ids: null,
      updated_at: null,
    });
  });
});
