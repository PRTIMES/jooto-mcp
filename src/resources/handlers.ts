/**
 * MCP Resource ハンドラー
 *
 * jooto:/// URI をパースし、対応する Jooto REST API を呼び出す。
 */

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { jootoApiRequest, withPagination } from '../tools/utils.js';
import { formatBoardListResponse, formatBoardMembersResponse, formatCommentsResponse, formatListsResponse, formatTasksResponse, formatUsersResponse, type DetailLevel } from '../tools/formatters.js';

/**
 * URI パスからパラメータを抽出するヘルパー
 */
function parseResourceUri(uri: string): { path: string; params: Record<string, string> } {
  // jooto:///path → /path
  const match = uri.match(/^jooto:\/\/\/([^?]*)(?:\?(.*))?$/);
  if (!match) {
    throw new McpError(ErrorCode.InvalidRequest, `無効なリソースURI: ${uri}`);
  }
  return {
    path: match[1],
    params: Object.fromEntries(new URLSearchParams(match[2] ?? '')),
  };
}

function parsePage(page?: string): number | undefined {
  if (page === undefined || page === '') return undefined;
  const parsed = Number(page);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 1) {
    throw new McpError(ErrorCode.InvalidRequest, `pageパラメータは1以上の整数でなければなりません: ${page}`);
  }
  return parsed;
}

function parseDetailLevel(detailLevel?: string): DetailLevel {
  if (detailLevel === undefined || detailLevel === '') return 'compact';
  if (detailLevel === 'compact' || detailLevel === 'standard') return detailLevel;
  throw new McpError(
    ErrorCode.InvalidRequest,
    `detail_levelパラメータは"compact"または"standard"でなければなりません: ${detailLevel}`
  );
}

/**
 * URI パターンマッチング用ルート定義
 */
interface Route {
  pattern: RegExp;
  handler: (params: Record<string, string>) => Promise<any>;
}

const routes: Route[] = [
  // Organization
  {
    pattern: /^organization$/,
    handler: async () => jootoApiRequest('GET', '/v1/organization'),
  },
  // Rate Limit
  {
    pattern: /^rate-limit$/,
    handler: async () => jootoApiRequest('GET', '/v1/rate_limit'),
  },
  // Users
  {
    pattern: /^users$/,
    handler: async (p) => formatUsersResponse(
      await jootoApiRequest('GET', withPagination('/v1/users', { page: parsePage(p.page) })),
      parseDetailLevel(p.detail_level)
    ),
  },
  {
    pattern: /^users\/(?<userId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/users/${p.userId}`),
  },
  // Projects (= boards)
  {
    pattern: /^projects$/,
    handler: async (p) => formatBoardListResponse(
      await jootoApiRequest('GET', withPagination('/v1/boards?archived=false', { page: parsePage(p.page) })),
      parseDetailLevel(p.detail_level)
    ),
  },
  {
    pattern: /^projects\/archived$/,
    handler: async (p) => formatBoardListResponse(
      await jootoApiRequest('GET', withPagination('/v1/boards?archived=true', { page: parsePage(p.page) })),
      parseDetailLevel(p.detail_level)
    ),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/boards/${p.projectId}`),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/members$/,
    handler: async (p) => formatBoardMembersResponse(
      await jootoApiRequest('GET', withPagination(`/v1/boards/${p.projectId}/users`, { page: parsePage(p.page) })),
      parseDetailLevel(p.detail_level)
    ),
  },
  // Lists
  {
    pattern: /^projects\/(?<projectId>\d+)\/lists$/,
    handler: async (p) => formatListsResponse(
      await jootoApiRequest('GET', withPagination(`/v1/boards/${p.projectId}/lists?archived=false`, { page: parsePage(p.page) })),
      parseDetailLevel(p.detail_level)
    ),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/lists\/archived$/,
    handler: async (p) => formatListsResponse(
      await jootoApiRequest('GET', withPagination(`/v1/boards/${p.projectId}/lists?archived=true`, { page: parsePage(p.page) })),
      parseDetailLevel(p.detail_level)
    ),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/lists\/(?<listId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/boards/${p.projectId}/lists/${p.listId}`),
  },
  // Labels (= categories)
  {
    pattern: /^projects\/(?<projectId>\d+)\/labels$/,
    handler: async (p) => jootoApiRequest('GET', withPagination(`/v1/boards/${p.projectId}/categories`, { page: parsePage(p.page) })),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/labels\/(?<labelId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/boards/${p.projectId}/categories/${p.labelId}`),
  },
  // Tasks
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks$/,
    handler: async (p) => formatTasksResponse(
      await jootoApiRequest('GET', withPagination(`/v1/boards/${p.projectId}/tasks?archived=false`, { page: parsePage(p.page) })),
      parseDetailLevel(p.detail_level)
    ),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/archived$/,
    handler: async (p) => formatTasksResponse(
      await jootoApiRequest('GET', withPagination(`/v1/boards/${p.projectId}/tasks?archived=true`, { page: parsePage(p.page) })),
      parseDetailLevel(p.detail_level)
    ),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/(?<taskId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/boards/${p.projectId}/tasks/${p.taskId}`),
  },
  // Comments
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/(?<taskId>\d+)\/comments$/,
    handler: async (p) => formatCommentsResponse(
      await jootoApiRequest('GET', withPagination(`/v1/tasks/${p.taskId}/comments`, { page: parsePage(p.page) })),
      parseDetailLevel(p.detail_level)
    ),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/(?<taskId>\d+)\/comments\/(?<commentId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/tasks/${p.taskId}/comments/${p.commentId}`),
  },
  // Checklists
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/(?<taskId>\d+)\/checklists$/,
    handler: async (p) => jootoApiRequest('GET', withPagination(`/v1/tasks/${p.taskId}/checklists`, { page: parsePage(p.page) })),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/(?<taskId>\d+)\/checklists\/(?<checklistId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/tasks/${p.taskId}/checklists/${p.checklistId}`),
  },
  // Checklist Items
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/(?<taskId>\d+)\/checklists\/(?<checklistId>\d+)\/items$/,
    handler: async (p) => jootoApiRequest('GET', withPagination(`/v1/checklists/${p.checklistId}/items`, { page: parsePage(p.page) })),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/(?<taskId>\d+)\/checklists\/(?<checklistId>\d+)\/items\/(?<itemId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/checklists/${p.checklistId}/items/${p.itemId}`),
  },
];

/**
 * リソースURIに対応するデータを読み取る
 */
export async function readResource(uri: string): Promise<{
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}> {
  const { path, params: queryParams } = parseResourceUri(uri);

  for (const route of routes) {
    const match = path.match(route.pattern);
    if (match) {
      const params = { ...queryParams, ...(match.groups ?? {}) };
      try {
        const data = await route.handler(params);
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `リソースの取得に失敗しました (${uri}): ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  throw new McpError(ErrorCode.InvalidRequest, `不明なリソースURI: ${uri}`);
}
