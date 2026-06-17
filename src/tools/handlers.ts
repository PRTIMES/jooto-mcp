import { z } from 'zod';
import { jootoApiRequest, handleMcpOperation, withPagination } from './utils.js';
import { ToolSchemas } from './schemas.js';
import { formatBoardListResponse, formatListsResponse } from './formatters.js';

/**
 * ツールハンドラーのマップを作成
 * 取得系（list / get）は resources としても公開しているが、MCP クライアントの対応状況を鑑み tool としても公開する。
 */
export const toolHandlers = new Map();

// === Read（取得系） ===

export async function processGetOrganizationTool(_args: z.infer<ToolSchemas['jooto-get-organization']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', '/v1/organization'),
    '組織情報の取得に失敗しました'
  );
}

export async function processGetRateLimitTool(_args: z.infer<ToolSchemas['jooto-get-rate-limit']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', '/v1/rate_limit'),
    'レート制限情報の取得に失敗しました'
  );
}

export async function processListUsersTool(args: z.infer<ToolSchemas['jooto-list-users']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', withPagination('/v1/users', { page: args.page })),
    'ユーザー一覧の取得に失敗しました'
  );
}

export async function processGetUserTool(args: z.infer<ToolSchemas['jooto-get-user']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', `/v1/users/${args.user_id}`),
    'ユーザー情報の取得に失敗しました'
  );
}

export async function processListBoardsTool(args: z.infer<ToolSchemas['jooto-list-boards']>) {
  return handleMcpOperation(
    async () => formatBoardListResponse(
      await jootoApiRequest('GET', withPagination('/v1/boards?archived=false', { page: args.page })),
      args.detail_level
    ),
    'プロジェクト一覧の取得に失敗しました'
  );
}

export async function processListArchivedBoardsTool(args: z.infer<ToolSchemas['jooto-list-archived-boards']>) {
  return handleMcpOperation(
    async () => formatBoardListResponse(
      await jootoApiRequest('GET', withPagination('/v1/boards?archived=true', { page: args.page })),
      args.detail_level
    ),
    'アーカイブ済みプロジェクト一覧の取得に失敗しました'
  );
}

export async function processGetBoardTool(args: z.infer<ToolSchemas['jooto-get-board']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', `/v1/boards/${args.board_id}`),
    'プロジェクト情報の取得に失敗しました'
  );
}

export async function processListBoardMembersTool(args: z.infer<ToolSchemas['jooto-list-board-members']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', withPagination(`/v1/boards/${args.board_id}/users`, { page: args.page })),
    'プロジェクトメンバー一覧の取得に失敗しました'
  );
}

export async function processListListsTool(args: z.infer<ToolSchemas['jooto-list-lists']>) {
  return handleMcpOperation(
    async () => formatListsResponse(
      await jootoApiRequest('GET', withPagination(`/v1/boards/${args.board_id}/lists?archived=false`, { page: args.page })),
      args.detail_level
    ),
    'リスト一覧の取得に失敗しました'
  );
}

export async function processListArchivedListsTool(args: z.infer<ToolSchemas['jooto-list-archived-lists']>) {
  return handleMcpOperation(
    async () => formatListsResponse(
      await jootoApiRequest('GET', withPagination(`/v1/boards/${args.board_id}/lists?archived=true`, { page: args.page })),
      args.detail_level
    ),
    'アーカイブ済みリスト一覧の取得に失敗しました'
  );
}

export async function processGetListTool(args: z.infer<ToolSchemas['jooto-get-list']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', `/v1/boards/${args.board_id}/lists/${args.list_id}`),
    'リスト情報の取得に失敗しました'
  );
}

export async function processListLabelsTool(args: z.infer<ToolSchemas['jooto-list-labels']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', withPagination(`/v1/boards/${args.board_id}/categories`, { page: args.page })),
    'ラベル一覧の取得に失敗しました'
  );
}

export async function processGetLabelTool(args: z.infer<ToolSchemas['jooto-get-label']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', `/v1/boards/${args.board_id}/categories/${args.category_id}`),
    'ラベル情報の取得に失敗しました'
  );
}

export async function processListTasksTool(args: z.infer<ToolSchemas['jooto-list-tasks']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', withPagination(`/v1/boards/${args.board_id}/tasks?archived=false`, { page: args.page })),
    'タスク一覧の取得に失敗しました'
  );
}

export async function processListArchivedTasksTool(args: z.infer<ToolSchemas['jooto-list-archived-tasks']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', withPagination(`/v1/boards/${args.board_id}/tasks?archived=true`, { page: args.page })),
    'アーカイブ済みタスク一覧の取得に失敗しました'
  );
}

export async function processGetTaskTool(args: z.infer<ToolSchemas['jooto-get-task']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', `/v1/boards/${args.board_id}/tasks/${args.task_id}`),
    'タスク情報の取得に失敗しました'
  );
}

export async function processListCommentsTool(args: z.infer<ToolSchemas['jooto-list-comments']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', withPagination(`/v1/tasks/${args.task_id}/comments`, { page: args.page })),
    'コメント一覧の取得に失敗しました'
  );
}

export async function processGetCommentTool(args: z.infer<ToolSchemas['jooto-get-comment']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', `/v1/tasks/${args.task_id}/comments/${args.comment_id}`),
    'コメント情報の取得に失敗しました'
  );
}

export async function processListChecklistsTool(args: z.infer<ToolSchemas['jooto-list-checklists']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', withPagination(`/v1/tasks/${args.task_id}/checklists`, { page: args.page })),
    'チェックリスト一覧の取得に失敗しました'
  );
}

export async function processGetChecklistTool(args: z.infer<ToolSchemas['jooto-get-checklist']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', `/v1/tasks/${args.task_id}/checklists/${args.checklist_id}`),
    'チェックリスト情報の取得に失敗しました'
  );
}

export async function processListChecklistItemsTool(args: z.infer<ToolSchemas['jooto-list-checklist-items']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', withPagination(`/v1/checklists/${args.checklist_id}/items`, { page: args.page })),
    'チェックリストアイテム一覧の取得に失敗しました'
  );
}

export async function processGetChecklistItemTool(args: z.infer<ToolSchemas['jooto-get-checklist-item']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('GET', `/v1/checklists/${args.checklist_id}/items/${args.item_id}`),
    'チェックリストアイテム情報の取得に失敗しました'
  );
}

// === Board ===

export async function processCreateBoardTool(args: z.infer<ToolSchemas['jooto-create-board']>) {
  const requestBody: Record<string, any> = { title: args.title };
  if (args.description) requestBody.description = args.description;

  return handleMcpOperation(
    async () => await jootoApiRequest('POST', '/v1/boards', requestBody),
    'プロジェクトの作成に失敗しました'
  );
}

export async function processUpdateBoardTool(args: z.infer<ToolSchemas['jooto-update-board']>) {
  const { board_id, ...requestBody } = args;
  return handleMcpOperation(
    async () => await jootoApiRequest('PATCH', `/v1/boards/${board_id}`, requestBody),
    'プロジェクト情報の更新に失敗しました'
  );
}

export async function processDeleteBoardTool(args: z.infer<ToolSchemas['jooto-delete-board']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('DELETE', `/v1/boards/${args.board_id}`),
    'プロジェクトの削除に失敗しました'
  );
}

// === List ===

export async function processCreateBoardListTool(args: z.infer<ToolSchemas['jooto-create-list']>) {
  const boardId = args.board_id;
  const requestBody: Record<string, any> = { name: args.name };
  if (args.color) requestBody.color = args.color;
  if (args.auto_task_status !== undefined) requestBody.auto_task_status = args.auto_task_status;

  return handleMcpOperation(
    async () => await jootoApiRequest('POST', `/v1/boards/${boardId}/lists`, requestBody),
    'リストの作成に失敗しました'
  );
}

export async function processUpdateBoardListTool(args: z.infer<ToolSchemas['jooto-update-list']>) {
  const { board_id, list_id, ...requestBody } = args;
  return handleMcpOperation(
    async () => await jootoApiRequest('PATCH', `/v1/boards/${board_id}/lists/${list_id}`, requestBody),
    'リスト情報の更新に失敗しました'
  );
}

export async function processDeleteBoardListTool(args: z.infer<ToolSchemas['jooto-delete-list']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('DELETE', `/v1/boards/${args.board_id}/lists/${args.list_id}`),
    'リストの削除に失敗しました'
  );
}

export async function processArchiveBoardListTool(args: z.infer<ToolSchemas['jooto-archive-list']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('POST', `/v1/boards/${args.board_id}/lists/${args.list_id}/archive`),
    'リストのアーカイブに失敗しました'
  );
}

export async function processUpdateBoardListsOrderTool(args: z.infer<ToolSchemas['jooto-reorder-list']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('POST', `/v1/boards/${args.board_id}/lists/update_order`, { list_ids: args.list_ids }),
    'リスト順序の更新に失敗しました'
  );
}

// === Task ===

export async function processCreateBoardTaskTool(args: z.infer<ToolSchemas['jooto-create-task']>) {
  const boardId = args.board_id;
  const requestBody: Record<string, any> = {
    name: args.name,
    list_id: args.list_id,
  };
  if (args.description) requestBody.description = args.description;
  if (args.assigned_user_ids) requestBody.assigned_user_ids = args.assigned_user_ids;
  if (args.start_date_time) requestBody.start_date_time = args.start_date_time;
  if (args.deadline_date_time) requestBody.deadline_date_time = args.deadline_date_time;
  if (args.category_ids) requestBody.category_ids = args.category_ids;
  if (args.effort) requestBody.effort = args.effort;
  if (args.actual) requestBody.actual = args.actual;
  if (args.status) requestBody.status = args.status;

  return handleMcpOperation(
    async () => await jootoApiRequest('POST', `/v1/boards/${boardId}/tasks`, requestBody),
    'タスクの作成に失敗しました'
  );
}

export async function processUpdateBoardTaskTool(args: z.infer<ToolSchemas['jooto-update-task']>) {
  const { board_id, task_id, ...requestBody } = args;
  return handleMcpOperation(
    async () => await jootoApiRequest('PATCH', `/v1/boards/${board_id}/tasks/${task_id}`, requestBody),
    'タスク情報の更新に失敗しました'
  );
}

export async function processDeleteBoardTaskTool(args: z.infer<ToolSchemas['jooto-delete-task']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('DELETE', `/v1/boards/${args.board_id}/tasks/${args.task_id}`),
    'タスクの削除に失敗しました'
  );
}

export async function processSearchBoardTasksTool(args: z.infer<ToolSchemas['jooto-search-task']>) {
  const queryParams = new URLSearchParams();
  queryParams.append('search_query', args.search_query);
  if (args.page !== undefined) queryParams.append('page', args.page.toString());
  if (args.per_page !== undefined) queryParams.append('per_page', args.per_page.toString());
  if (args.order) queryParams.append('order', args.order);

  return handleMcpOperation(
    async () => await jootoApiRequest('GET', withPagination(`/v1/boards/${args.board_id}/search?${queryParams.toString()}`)),
    'タスク検索に失敗しました'
  );
}

export async function processMoveTaskTool(args: z.infer<ToolSchemas['jooto-move-task']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('POST', `/v1/tasks/${args.task_id}/move`, { board_id: args.board_id, list_id: args.list_id }),
    'タスクの移動に失敗しました'
  );
}

export async function processArchiveTaskTool(args: z.infer<ToolSchemas['jooto-archive-task']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('POST', `/v1/boards/${args.board_id}/tasks/${args.task_id}/archive`),
    'タスクのアーカイブに失敗しました'
  );
}

// === Comment ===

export async function processCreateTaskCommentTool(args: z.infer<ToolSchemas['jooto-create-comment']>) {
  const { task_id, ...requestBody } = args;
  return handleMcpOperation(
    async () => await jootoApiRequest('POST', `/v1/tasks/${task_id}/comments`, requestBody),
    'コメントの作成に失敗しました'
  );
}

export async function processUpdateTaskCommentTool(args: z.infer<ToolSchemas['jooto-update-comment']>) {
  const { task_id, comment_id, ...requestBody } = args;
  return handleMcpOperation(
    async () => await jootoApiRequest('PATCH', `/v1/tasks/${task_id}/comments/${comment_id}`, requestBody),
    'コメントの更新に失敗しました'
  );
}

// === Label ===

export async function processCreateBoardCategoryTool(args: z.infer<ToolSchemas['jooto-create-label']>) {
  const { board_id, ...requestBody } = args;
  return handleMcpOperation(
    async () => await jootoApiRequest('POST', `/v1/boards/${board_id}/categories`, requestBody),
    'ラベルの作成に失敗しました'
  );
}

export async function processUpdateBoardCategoryTool(args: z.infer<ToolSchemas['jooto-update-label']>) {
  const { board_id, category_id, ...requestBody } = args;
  return handleMcpOperation(
    async () => await jootoApiRequest('PATCH', `/v1/boards/${board_id}/categories/${category_id}`, requestBody),
    'ラベルの更新に失敗しました'
  );
}

export async function processDeleteBoardCategoryTool(args: z.infer<ToolSchemas['jooto-delete-label']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('DELETE', `/v1/boards/${args.board_id}/categories/${args.category_id}`),
    'ラベルの削除に失敗しました'
  );
}

// === Checklist ===

export async function processCreateTaskChecklistTool(args: z.infer<ToolSchemas['jooto-create-checklist']>) {
  const { task_id, ...requestBody } = args;
  return handleMcpOperation(
    async () => await jootoApiRequest('POST', `/v1/tasks/${task_id}/checklists`, requestBody),
    'チェックリストの作成に失敗しました'
  );
}

export async function processUpdateTaskChecklistTool(args: z.infer<ToolSchemas['jooto-update-checklist']>) {
  const { task_id, checklist_id, ...requestBody } = args;
  return handleMcpOperation(
    async () => await jootoApiRequest('PATCH', `/v1/tasks/${task_id}/checklists/${checklist_id}`, requestBody),
    'チェックリストの更新に失敗しました'
  );
}

export async function processDeleteTaskChecklistTool(args: z.infer<ToolSchemas['jooto-delete-checklist']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('DELETE', `/v1/tasks/${args.task_id}/checklists/${args.checklist_id}`),
    'チェックリストの削除に失敗しました'
  );
}

// === Checklist Item ===

export async function processCreateChecklistItemTool(args: z.infer<ToolSchemas['jooto-create-checklist-item']>) {
  const { checklist_id, ...requestBody } = args;
  return handleMcpOperation(
    async () => await jootoApiRequest('POST', `/v1/checklists/${checklist_id}/items`, requestBody),
    'チェックリストアイテムの作成に失敗しました'
  );
}

export async function processUpdateChecklistItemTool(args: z.infer<ToolSchemas['jooto-update-checklist-item']>) {
  const { checklist_id, item_id, ...requestBody } = args;
  return handleMcpOperation(
    async () => await jootoApiRequest('PATCH', `/v1/checklists/${checklist_id}/items/${item_id}`, requestBody),
    'チェックリストアイテムの更新に失敗しました'
  );
}

export async function processDeleteChecklistItemTool(args: z.infer<ToolSchemas['jooto-delete-checklist-item']>) {
  return handleMcpOperation(
    async () => await jootoApiRequest('DELETE', `/v1/checklists/${args.checklist_id}/items/${args.item_id}`),
    'チェックリストアイテムの削除に失敗しました'
  );
}

// ツールハンドラーを初期化
// === Read（取得系） ===
toolHandlers.set('jooto-get-organization', processGetOrganizationTool);
toolHandlers.set('jooto-get-rate-limit', processGetRateLimitTool);
toolHandlers.set('jooto-list-users', processListUsersTool);
toolHandlers.set('jooto-get-user', processGetUserTool);
toolHandlers.set('jooto-list-boards', processListBoardsTool);
toolHandlers.set('jooto-list-archived-boards', processListArchivedBoardsTool);
toolHandlers.set('jooto-get-board', processGetBoardTool);
toolHandlers.set('jooto-list-board-members', processListBoardMembersTool);
toolHandlers.set('jooto-list-lists', processListListsTool);
toolHandlers.set('jooto-list-archived-lists', processListArchivedListsTool);
toolHandlers.set('jooto-get-list', processGetListTool);
toolHandlers.set('jooto-list-labels', processListLabelsTool);
toolHandlers.set('jooto-get-label', processGetLabelTool);
toolHandlers.set('jooto-list-tasks', processListTasksTool);
toolHandlers.set('jooto-list-archived-tasks', processListArchivedTasksTool);
toolHandlers.set('jooto-get-task', processGetTaskTool);
toolHandlers.set('jooto-list-comments', processListCommentsTool);
toolHandlers.set('jooto-get-comment', processGetCommentTool);
toolHandlers.set('jooto-list-checklists', processListChecklistsTool);
toolHandlers.set('jooto-get-checklist', processGetChecklistTool);
toolHandlers.set('jooto-list-checklist-items', processListChecklistItemsTool);
toolHandlers.set('jooto-get-checklist-item', processGetChecklistItemTool);

// === Board ===
toolHandlers.set('jooto-create-board', processCreateBoardTool);
toolHandlers.set('jooto-update-board', processUpdateBoardTool);
toolHandlers.set('jooto-delete-board', processDeleteBoardTool);

// === List ===
toolHandlers.set('jooto-create-list', processCreateBoardListTool);
toolHandlers.set('jooto-update-list', processUpdateBoardListTool);
toolHandlers.set('jooto-delete-list', processDeleteBoardListTool);
toolHandlers.set('jooto-archive-list', processArchiveBoardListTool);
toolHandlers.set('jooto-reorder-list', processUpdateBoardListsOrderTool);

// === Task ===
toolHandlers.set('jooto-create-task', processCreateBoardTaskTool);
toolHandlers.set('jooto-update-task', processUpdateBoardTaskTool);
toolHandlers.set('jooto-delete-task', processDeleteBoardTaskTool);
toolHandlers.set('jooto-search-task', processSearchBoardTasksTool);
toolHandlers.set('jooto-move-task', processMoveTaskTool);
toolHandlers.set('jooto-archive-task', processArchiveTaskTool);

// === Comment ===
toolHandlers.set('jooto-create-comment', processCreateTaskCommentTool);
toolHandlers.set('jooto-update-comment', processUpdateTaskCommentTool);

// === Label ===
toolHandlers.set('jooto-create-label', processCreateBoardCategoryTool);
toolHandlers.set('jooto-update-label', processUpdateBoardCategoryTool);
toolHandlers.set('jooto-delete-label', processDeleteBoardCategoryTool);

// === Checklist ===
toolHandlers.set('jooto-create-checklist', processCreateTaskChecklistTool);
toolHandlers.set('jooto-update-checklist', processUpdateTaskChecklistTool);
toolHandlers.set('jooto-delete-checklist', processDeleteTaskChecklistTool);

// === Checklist Item ===
toolHandlers.set('jooto-create-checklist-item', processCreateChecklistItemTool);
toolHandlers.set('jooto-update-checklist-item', processUpdateChecklistItemTool);
toolHandlers.set('jooto-delete-checklist-item', processDeleteChecklistItemTool);
