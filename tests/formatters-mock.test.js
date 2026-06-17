import { describe, expect, it } from 'vitest';
import {
  formatBoardListResponse,
  formatBoardMembersResponse,
  formatChecklistsResponse,
  formatCommentsResponse,
  formatLabelsResponse,
  formatListsResponse,
  formatTaskSearchResponse,
  formatTasksResponse,
  formatUsersResponse,
} from '../src/tools/formatters.ts';

describe('formatUsersResponse', () => {
  const response = {
    users: [
      {
        id: 10,
        name: 'user_name',
        display_name: 'User Name',
        email: 'user@example.com',
        role: 'admin',
        avatar_url: 'https://example.com/avatar.png',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
    ],
    page: 1,
    per_page: 200,
    total: 1,
    total_pages: 1,
  };

  it('returns compact user fields by default', () => {
    expect(formatUsersResponse(response)).toEqual({
      users: [
        {
          id: 10,
          name: 'user_name',
          display_name: 'User Name',
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

  it('returns standard user fields when requested', () => {
    expect(formatUsersResponse(response, 'standard')).toEqual({
      users: [
        {
          id: 10,
          name: 'user_name',
          display_name: 'User Name',
          email: 'user@example.com',
          role: 'admin',
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

  it('normalizes missing standard user fields to null', () => {
    expect(formatUsersResponse({ users: [{}] }, 'standard').users[0]).toEqual({
      id: null,
      name: null,
      display_name: null,
      email: null,
      role: null,
      created_at: null,
    });
  });
});

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

describe('formatBoardMembersResponse', () => {
  const response = {
    users: [
      {
        id: 10,
        name: 'member_name',
        display_name: 'Member Name',
        email: 'member@example.com',
        role: 'admin',
        organization_role: 'member',
        avatar_url: 'https://example.com/avatar.png',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
    ],
    page: 1,
    per_page: 200,
    total: 1,
    total_pages: 1,
  };

  it('returns compact board member fields by default', () => {
    expect(formatBoardMembersResponse(response)).toEqual({
      users: [
        {
          id: 10,
          name: 'member_name',
          display_name: 'Member Name',
          role: 'admin',
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

  it('returns standard board member fields when requested', () => {
    expect(formatBoardMembersResponse(response, 'standard')).toEqual({
      users: [
        {
          id: 10,
          name: 'member_name',
          display_name: 'Member Name',
          email: 'member@example.com',
          role: 'admin',
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

  it('normalizes missing standard board member fields to null', () => {
    expect(formatBoardMembersResponse({ users: [{}] }, 'standard').users[0]).toEqual({
      id: null,
      name: null,
      display_name: null,
      email: null,
      role: null,
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

describe('formatLabelsResponse', () => {
  const response = {
    categories: [
      {
        id: 10,
        board_id: 20,
        name: 'Accounting',
        color: '#00ff00',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
    ],
    page: 1,
    per_page: 200,
    total: 1,
    total_pages: 1,
  };

  it('returns compact label fields by default', () => {
    expect(formatLabelsResponse(response)).toEqual({
      categories: [
        {
          id: 10,
          name: 'Accounting',
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

  it('returns standard label fields when requested', () => {
    expect(formatLabelsResponse(response, 'standard')).toEqual({
      categories: [
        {
          id: 10,
          name: 'Accounting',
          color: '#00ff00',
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

  it('normalizes missing standard label fields to null', () => {
    expect(formatLabelsResponse({ categories: [{}] }, 'standard').categories[0]).toEqual({
      id: null,
      name: null,
      color: null,
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

describe('formatCommentsResponse', () => {
  const response = {
    comments: [
      {
        id: 10,
        content: 'Please review this invoice.',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
        task_id: 20,
        sender: {
          id: 30,
          name: 'sender',
          display_name: 'Sender',
        },
        mentioned_users: [
          {
            id: 40,
            name: 'mentioned',
            display_name: 'Mentioned',
          },
        ],
        attachments: [
          {
            id: 50,
            name: 'invoice.pdf',
            url: 'https://example.com/invoice.pdf',
          },
        ],
      },
    ],
    page: 1,
    per_page: 200,
    total: 1,
    total_pages: 1,
  };

  it('returns compact comment fields by default', () => {
    expect(formatCommentsResponse(response)).toEqual({
      comments: [
        {
          id: 10,
          content: 'Please review this invoice.',
          sender_id: 30,
          created_at: '2026-01-01T00:00:00Z',
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

  it('returns standard comment fields when requested', () => {
    expect(formatCommentsResponse(response, 'standard')).toEqual({
      comments: [
        {
          id: 10,
          content: 'Please review this invoice.',
          sender_id: 30,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
          mentioned_user_ids: [40],
          attachment_ids: [50],
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

  it('normalizes missing standard comment fields to null', () => {
    expect(formatCommentsResponse({ comments: [{}] }, 'standard').comments[0]).toEqual({
      id: null,
      content: null,
      sender_id: null,
      created_at: null,
      updated_at: null,
      mentioned_user_ids: null,
      attachment_ids: null,
    });
  });
});

describe('formatChecklistsResponse', () => {
  const response = {
    checklists: [
      {
        id: 10,
        title: 'Review steps',
        task_id: 20,
        percentage: 50,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
    ],
    page: 1,
    per_page: 200,
    total: 1,
    total_pages: 1,
  };

  it('returns compact checklist fields by default', () => {
    expect(formatChecklistsResponse(response)).toEqual({
      checklists: [
        {
          id: 10,
          title: 'Review steps',
          percentage: 50,
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

  it('returns standard checklist fields when requested', () => {
    expect(formatChecklistsResponse(response, 'standard')).toEqual({
      checklists: [
        {
          id: 10,
          title: 'Review steps',
          percentage: 50,
          created_at: '2026-01-01T00:00:00Z',
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

  it('normalizes missing standard checklist fields to null', () => {
    expect(formatChecklistsResponse({ checklists: [{}] }, 'standard').checklists[0]).toEqual({
      id: null,
      title: null,
      percentage: null,
      created_at: null,
      updated_at: null,
    });
  });
});
