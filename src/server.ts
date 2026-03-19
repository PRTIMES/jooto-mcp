import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import {
  toolSchemas,
  toolHandlers,
  toolDefinitions
} from './tools/index.js';
import {
  resourceTemplateDefinitions,
  readResource,
} from './resources/index.js';

/**
 * シンプルなMCPサーバーの実装
 */
export class MyMcpServer {
  private server: Server;

  constructor() {
    // メタデータでMCPサーバーを初期化
    this.server = new Server(
      {
        name: 'jooto-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
        instructions:
          'MCP server for Jooto, a project management tool. ' +
          'Use this server when the user asks to manage projects, tasks, lists, labels, checklists, or comments in Jooto. ' +
          'Start by fetching project and user lists via resources to identify IDs, then use tools to perform operations. ' +
          'Concept mapping: Board = Project, List = List, Task = Task, Category = Label.',
      }
    );

    // リクエストハンドラーを設定
    this.setupResourceHandlers();
    this.setupToolHandlers();

    // エラー処理
    this.server.onerror = (error) => console.error('[MCP Error]', error);
  }

  /**
   * リソース関連のリクエストハンドラーを設定
   */
  private setupResourceHandlers(): void {
    // リソーステンプレート一覧
    this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
      resourceTemplates: resourceTemplateDefinitions,
    }));

    // リソース読み取り
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      return readResource(request.params.uri);
    });
  }

  /**
   * ツール関連のリクエストハンドラーを設定
   */
  private setupToolHandlers(): void {
    // 利用可能なツールを一覧表示
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: toolDefinitions,
    }));

    // ツール呼び出しリクエストを処理
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const handler = toolHandlers.get(request.params.name);

      if (!handler) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `不明なツール: ${request.params.name}`
        );
      }

      try {
        // Zodスキーマを使用して引数を検証
        const schema = toolSchemas[request.params.name as keyof typeof toolSchemas];
        if (schema) {
          const validatedArgs = schema.parse(request.params.arguments);
          return handler(validatedArgs);
        }

        // スキーマが定義されていない場合は、そのまま引数を渡す
        return handler(request.params.arguments);
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Zodバリデーションエラーを適切なMCPエラーに変換
          const errorMessage = error.errors.map(e =>
            `${e.path.join('.')}: ${e.message}`
          ).join(', ');

          throw new McpError(
            ErrorCode.InvalidParams,
            `引数検証エラー: ${errorMessage}`
          );
        }
        throw error;
      }
    });
  }

  /**
   * MCPサーバーを起動
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCPサーバーがstdioで実行中');
  }

  /**
   * MCPサーバーを閉じる
   */
  async close(): Promise<void> {
    await this.server.close();
  }
}
