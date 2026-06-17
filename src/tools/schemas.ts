import { z } from 'zod';

const pageSchema = z.number({
  invalid_type_error: '"page"パラメータは数値でなければなりません',
}).int('"page"パラメータは整数でなければなりません').positive('"page"パラメータは1以上でなければなりません').optional();

/**
 * ツール引数のZodスキーマ定義
 * 取得系（list / get）は resources としても公開しているが、MCP クライアントの対応状況を鑑み tool としても公開する。
 */
export const toolSchemas = {
  // === Read（取得系） ===
  'jooto-get-organization': z.object({}),
  'jooto-get-rate-limit': z.object({}),
  'jooto-list-users': z.object({
    page: pageSchema,
  }),
  'jooto-get-user': z.object({
    user_id: z.number({
      required_error: '"user_id"パラメータは必須です',
      invalid_type_error: '"user_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-boards': z.object({
    page: pageSchema,
  }),
  'jooto-get-board': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-board-members': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
  }),
  'jooto-list-lists': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
  }),
  'jooto-get-list': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    list_id: z.number({
      required_error: '"list_id"パラメータは必須です',
      invalid_type_error: '"list_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-labels': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
  }),
  'jooto-get-label': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    category_id: z.number({
      required_error: '"category_id"パラメータは必須です',
      invalid_type_error: '"category_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-tasks': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
  }),
  'jooto-get-task': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-comments': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
  }),
  'jooto-get-comment': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    comment_id: z.number({
      required_error: '"comment_id"パラメータは必須です',
      invalid_type_error: '"comment_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-checklists': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
  }),
  'jooto-get-checklist': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-checklist-items': z.object({
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
  }),
  'jooto-get-checklist-item': z.object({
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
    item_id: z.number({
      required_error: '"item_id"パラメータは必須です',
      invalid_type_error: '"item_id"パラメータは数値でなければなりません',
    }),
  }),
  // === Board ===
  'jooto-create-board': z.object({
    title: z.string({
      required_error: '"title"パラメータは必須です',
      invalid_type_error: '"title"パラメータは文字列でなければなりません',
    }),
    description: z.string().optional(),
  }),
  'jooto-update-board': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    title: z.string().optional(),
    description: z.string().optional(),
  }),
  'jooto-delete-board': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
  }),
  // === List ===
  'jooto-create-list': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    name: z.string({
      required_error: '"name"パラメータは必須です',
      invalid_type_error: '"name"パラメータは文字列でなければなりません',
    }),
    color: z.string().optional(),
    is_done_list: z.boolean().optional(),
  }),
  'jooto-update-list': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    list_id: z.number({
      required_error: '"list_id"パラメータは必須です',
      invalid_type_error: '"list_id"パラメータは数値でなければなりません',
    }),
    name: z.string().optional(),
    color: z.string().optional(),
    is_done_list: z.boolean().optional(),
  }),
  'jooto-delete-list': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    list_id: z.number({
      required_error: '"list_id"パラメータは必須です',
      invalid_type_error: '"list_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-archive-list': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    list_id: z.number({
      required_error: '"list_id"パラメータは必須です',
      invalid_type_error: '"list_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-reorder-list': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    list_ids: z.array(z.number(), {
      required_error: '"list_ids"パラメータは必須です',
      invalid_type_error: '"list_ids"パラメータは数値の配列でなければなりません',
    }),
  }),
  // === Task ===
  'jooto-create-task': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    name: z.string({
      required_error: '"name"パラメータは必須です',
      invalid_type_error: '"name"パラメータは文字列でなければなりません',
    }),
    list_id: z.number({
      required_error: '"list_id"パラメータは必須です',
      invalid_type_error: '"list_id"パラメータは数値でなければなりません',
    }),
    description: z.string().optional(),
    assigned_user_ids: z.array(z.number()).optional(),
    start_date_time: z.string().optional(),
    deadline_date_time: z.string().optional(),
    category_ids: z.array(z.number()).optional(),
    effort: z.string().optional(),
    actual: z.string().optional(),
    status: z.enum(['to_do', 'done', 'cancel', 'pending']).optional(),
  }),
  'jooto-update-task': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    name: z.string().optional(),
    description: z.string().optional(),
    assigned_user_ids: z.array(z.number()).optional(),
    start_date_time: z.string().optional(),
    deadline_date_time: z.string().optional(),
    list_id: z.number().optional(),
    category_ids: z.array(z.number()).optional(),
    effort: z.string().optional(),
    actual: z.string().optional(),
    status: z.enum(['to_do', 'done', 'cancel', 'pending']).optional(),
  }),
  'jooto-delete-task': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-search-task': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    search_query: z.string({
      required_error: '"search_query"パラメータは必須です',
      invalid_type_error: '"search_query"パラメータは文字列でなければなりません',
    }),
    page: z.number({
      invalid_type_error: '"page"パラメータは数値でなければなりません',
    }).optional(),
    per_page: z.number({
      invalid_type_error: '"per_page"パラメータは数値でなければなりません',
    }).int('"per_page"パラメータは整数でなければなりません').positive('"per_page"パラメータは1以上でなければなりません').optional(),
    order: z.string({
      invalid_type_error: '"order"パラメータは文字列でなければなりません',
    }).optional(),
  }),
  'jooto-move-task': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    list_id: z.number({
      required_error: '"list_id"パラメータは必須です',
      invalid_type_error: '"list_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-archive-task': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
  }),
  // === Comment ===
  'jooto-create-comment': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    content: z.string({
      required_error: '"content"パラメータは必須です',
      invalid_type_error: '"content"パラメータは文字列でなければなりません',
    }),
  }),
  'jooto-update-comment': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    comment_id: z.number({
      required_error: '"comment_id"パラメータは必須です',
      invalid_type_error: '"comment_id"パラメータは数値でなければなりません',
    }),
    content: z.string().optional(),
  }),
  // === Label ===
  'jooto-create-label': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    name: z.string({
      required_error: '"name"パラメータは必須です',
      invalid_type_error: '"name"パラメータは文字列でなければなりません',
    }),
    color: z.string().optional(),
  }),
  'jooto-update-label': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    category_id: z.number({
      required_error: '"category_id"パラメータは必須です',
      invalid_type_error: '"category_id"パラメータは数値でなければなりません',
    }),
    name: z.string().optional(),
    color: z.string().optional(),
  }),
  'jooto-delete-label': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    category_id: z.number({
      required_error: '"category_id"パラメータは必須です',
      invalid_type_error: '"category_id"パラメータは数値でなければなりません',
    }),
  }),
  // === Checklist ===
  'jooto-create-checklist': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    title: z.string({
      required_error: '"title"パラメータは必須です',
      invalid_type_error: '"title"パラメータは文字列でなければなりません',
    }),
  }),
  'jooto-update-checklist': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
    title: z.string().optional(),
  }),
  'jooto-delete-checklist': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
  }),
  // === Checklist Item ===
  'jooto-create-checklist-item': z.object({
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
    content: z.string({
      required_error: '"content"パラメータは必須です',
      invalid_type_error: '"content"パラメータは文字列でなければなりません',
    }),
  }),
  'jooto-update-checklist-item': z.object({
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
    item_id: z.number({
      required_error: '"item_id"パラメータは必須です',
      invalid_type_error: '"item_id"パラメータは数値でなければなりません',
    }),
    content: z.string().optional(),
    checked: z.boolean().optional(),
  }),
  'jooto-delete-checklist-item': z.object({
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
    item_id: z.number({
      required_error: '"item_id"パラメータは必須です',
      invalid_type_error: '"item_id"パラメータは数値でなければなりません',
    }),
  }),
};

// 型安全のためのツールスキーマの型
export type ToolSchemas = typeof toolSchemas;

/**
 * ツールハンドラーの型定義
 */
export type ToolHandler<T = any> = (args: T) => Promise<{
  content: Array<{
    type: string;
    text: string;
  }>;
}>;
