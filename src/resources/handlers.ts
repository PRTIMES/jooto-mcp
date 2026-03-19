/**
 * MCP Resource ハンドラー
 *
 * jooto:/// URI をパースし、対応する Jooto REST API を呼び出す。
 */

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { jootoApiRequest } from '../tools/utils.js';

/**
 * URI パスからパラメータを抽出するヘルパー
 */
function parseResourceUri(uri: string): { path: string; params: Record<string, string> } {
  // jooto:///path → /path
  const match = uri.match(/^jooto:\/\/\/(.*)$/);
  if (!match) {
    throw new McpError(ErrorCode.InvalidRequest, `無効なリソースURI: ${uri}`);
  }
  return { path: match[1], params: {} };
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
    handler: async () => jootoApiRequest('GET', '/v1/users'),
  },
  {
    pattern: /^users\/(?<userId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/users/${p.userId}`),
  },
  // Projects (= boards)
  {
    pattern: /^projects$/,
    handler: async () => jootoApiRequest('GET', '/v1/boards'),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/boards/${p.projectId}`),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/members$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/boards/${p.projectId}/users`),
  },
  // Lists
  {
    pattern: /^projects\/(?<projectId>\d+)\/lists$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/boards/${p.projectId}/lists`),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/lists\/(?<listId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/boards/${p.projectId}/lists/${p.listId}`),
  },
  // Labels (= categories)
  {
    pattern: /^projects\/(?<projectId>\d+)\/labels$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/boards/${p.projectId}/categories`),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/labels\/(?<labelId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/boards/${p.projectId}/categories/${p.labelId}`),
  },
  // Tasks
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/boards/${p.projectId}/tasks`),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/(?<taskId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/boards/${p.projectId}/tasks/${p.taskId}`),
  },
  // Comments
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/(?<taskId>\d+)\/comments$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/tasks/${p.taskId}/comments`),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/(?<taskId>\d+)\/comments\/(?<commentId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/tasks/${p.taskId}/comments/${p.commentId}`),
  },
  // Checklists
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/(?<taskId>\d+)\/checklists$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/tasks/${p.taskId}/checklists`),
  },
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/(?<taskId>\d+)\/checklists\/(?<checklistId>\d+)$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/tasks/${p.taskId}/checklists/${p.checklistId}`),
  },
  // Checklist Items
  {
    pattern: /^projects\/(?<projectId>\d+)\/tasks\/(?<taskId>\d+)\/checklists\/(?<checklistId>\d+)\/items$/,
    handler: async (p) => jootoApiRequest('GET', `/v1/checklists/${p.checklistId}/items`),
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
  const { path } = parseResourceUri(uri);

  for (const route of routes) {
    const match = path.match(route.pattern);
    if (match) {
      const params = match.groups ?? {};
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
