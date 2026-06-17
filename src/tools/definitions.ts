/**
 * ツール定義を提供するファイル
 * 取得系（list / get）は resources としても公開しているが、MCP クライアントの対応状況を鑑み tool としても公開する。
 */

/**
 * 利用可能なツールの定義
 */
const paginationProperties = {
  page: {
    type: 'integer',
    description: '取得したいページ番号（未指定時は1）',
    minimum: 1,
    default: 1,
  },
};

function detailLevelProperty(description: string) {
  return {
    detail_level: {
      type: 'string',
      enum: ['compact', 'standard'],
      description,
      default: 'compact',
    },
  };
}

const boardListDetailLevelProperty = detailLevelProperty(
  '返却する情報量。通常はcompactを使用してください。descriptionや作成日時が必要な場合のみstandardを指定します。'
);

const boardActivityListDetailLevelProperty = detailLevelProperty(
  '返却する情報量。通常はcompactを使用してください。送信者名やタスクの状態・リストIDが必要な場合のみstandardを指定します。'
);

const projectListDetailLevelProperty = detailLevelProperty(
  '返却する情報量。通常はcompactを使用してください。並び順、色、自動ステータスが必要な場合のみstandardを指定します。'
);

const taskDetailLevelProperty = detailLevelProperty(
  '返却する情報量。通常はcompactを使用してください。description、category_ids、更新日時が必要な場合のみstandardを指定します。'
);

const commentListDetailLevelProperty = detailLevelProperty(
  '返却する情報量。通常はcompactを使用してください。更新日時、mentioned_user_ids、attachment_idsが必要な場合のみstandardを指定します。'
);

const userListDetailLevelProperty = detailLevelProperty(
  '返却する情報量。通常はcompactを使用してください。email、role、作成日時が必要な場合のみstandardを指定します。'
);

const boardMemberListDetailLevelProperty = detailLevelProperty(
  '返却する情報量。通常はcompactを使用してください。emailが必要な場合のみstandardを指定します。'
);

const labelListDetailLevelProperty = detailLevelProperty(
  '返却する情報量。通常はcompactを使用してください。色が必要な場合のみstandardを指定します。'
);

const checklistListDetailLevelProperty = detailLevelProperty(
  '返却する情報量。通常はcompactを使用してください。作成日時や更新日時が必要な場合のみstandardを指定します。'
);

const checklistItemListDetailLevelProperty = detailLevelProperty(
  '返却する情報量。通常はcompactを使用してください。更新日時が必要な場合のみstandardを指定します。'
);

export const toolDefinitions = [
  // === Read（取得系） ===
  {
    name: 'jooto-get-organization',
    description: '組織情報を取得します',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'jooto-get-rate-limit',
    description: 'APIのレート制限情報を取得します',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'jooto-list-users',
    description: '組織に所属するユーザーの一覧を取得します。通常はdetail_level=compactを使用してください。email、role、作成日時が必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        ...paginationProperties,
        ...userListDetailLevelProperty,
      },
    },
  },
  {
    name: 'jooto-get-user',
    description: '特定のユーザー情報を取得します',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'number',
          description: 'ユーザーのID',
        },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'jooto-list-boards',
    description: '未アーカイブのプロジェクト一覧を取得します。通常はdetail_level=compactを使用してください。descriptionや作成日時が必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        ...paginationProperties,
        ...boardListDetailLevelProperty,
      },
    },
  },
  {
    name: 'jooto-list-archived-boards',
    description: 'アーカイブ済みプロジェクト一覧を取得します。通常はdetail_level=compactを使用してください。descriptionや作成日時が必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        ...paginationProperties,
        ...boardListDetailLevelProperty,
      },
    },
  },
  {
    name: 'jooto-get-board',
    description: '特定のプロジェクト情報を取得します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
      },
      required: ['board_id'],
    },
  },
  {
    name: 'jooto-list-board-activities',
    description: 'プロジェクトの履歴一覧を取得します。通常はdetail_level=compactを使用してください。送信者名やタスクの状態・リストIDが必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        ...paginationProperties,
        ...boardActivityListDetailLevelProperty,
      },
      required: ['board_id'],
    },
  },
  {
    name: 'jooto-list-board-members',
    description: 'プロジェクトのメンバー一覧を取得します。通常はdetail_level=compactを使用してください。emailが必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        ...paginationProperties,
        ...boardMemberListDetailLevelProperty,
      },
      required: ['board_id'],
    },
  },
  {
    name: 'jooto-list-lists',
    description: 'プロジェクト内の未アーカイブのリスト一覧を取得します。通常はdetail_level=compactを使用してください。並び順、色、自動ステータスが必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        ...paginationProperties,
        ...projectListDetailLevelProperty,
      },
      required: ['board_id'],
    },
  },
  {
    name: 'jooto-list-archived-lists',
    description: 'プロジェクト内のアーカイブ済みリスト一覧を取得します。通常はdetail_level=compactを使用してください。並び順、色、自動ステータスが必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        ...paginationProperties,
        ...projectListDetailLevelProperty,
      },
      required: ['board_id'],
    },
  },
  {
    name: 'jooto-get-list',
    description: 'プロジェクト内の特定のリスト情報を取得します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        list_id: {
          type: 'number',
          description: 'リストのID',
        },
      },
      required: ['board_id', 'list_id'],
    },
  },
  {
    name: 'jooto-list-labels',
    description: 'プロジェクトのラベル一覧を取得します。通常はdetail_level=compactを使用してください。色が必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        ...paginationProperties,
        ...labelListDetailLevelProperty,
      },
      required: ['board_id'],
    },
  },
  {
    name: 'jooto-get-label',
    description: '特定のラベルを取得します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        category_id: {
          type: 'number',
          description: 'ラベルのID',
        },
      },
      required: ['board_id', 'category_id'],
    },
  },
  {
    name: 'jooto-list-tasks',
    description: 'プロジェクト内の未アーカイブのタスク一覧を取得します。通常はdetail_level=compactを使用してください。description、category_ids、更新日時が必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        ...paginationProperties,
        ...taskDetailLevelProperty,
      },
      required: ['board_id'],
    },
  },
  {
    name: 'jooto-list-archived-tasks',
    description: 'プロジェクト内のアーカイブ済みタスク一覧を取得します。通常はdetail_level=compactを使用してください。description、category_ids、更新日時が必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        ...paginationProperties,
        ...taskDetailLevelProperty,
      },
      required: ['board_id'],
    },
  },
  {
    name: 'jooto-get-task',
    description: '特定のプロジェクト内の特定のタスク情報を取得します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
      },
      required: ['board_id', 'task_id'],
    },
  },
  {
    name: 'jooto-list-comments',
    description: 'タスクのコメント一覧を取得します。通常はdetail_level=compactを使用してください。更新日時、mentioned_user_ids、attachment_idsが必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
        ...paginationProperties,
        ...commentListDetailLevelProperty,
      },
      required: ['task_id'],
    },
  },
  {
    name: 'jooto-get-comment',
    description: '特定のコメントを取得します',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
        comment_id: {
          type: 'number',
          description: 'コメントのID',
        },
      },
      required: ['task_id', 'comment_id'],
    },
  },
  {
    name: 'jooto-list-checklists',
    description: 'タスクのチェックリスト一覧を取得します。通常はdetail_level=compactを使用してください。作成日時や更新日時が必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
        ...paginationProperties,
        ...checklistListDetailLevelProperty,
      },
      required: ['task_id'],
    },
  },
  {
    name: 'jooto-get-checklist',
    description: '特定のチェックリストを取得します',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
        checklist_id: {
          type: 'number',
          description: 'チェックリストのID',
        },
      },
      required: ['task_id', 'checklist_id'],
    },
  },
  {
    name: 'jooto-list-checklist-items',
    description: 'チェックリストのアイテム一覧を取得します。通常はdetail_level=compactを使用してください。更新日時が必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        checklist_id: {
          type: 'number',
          description: 'チェックリストのID',
        },
        ...paginationProperties,
        ...checklistItemListDetailLevelProperty,
      },
      required: ['checklist_id'],
    },
  },
  {
    name: 'jooto-get-checklist-item',
    description: '特定のチェックリストアイテムを取得します',
    inputSchema: {
      type: 'object',
      properties: {
        checklist_id: {
          type: 'number',
          description: 'チェックリストのID',
        },
        item_id: {
          type: 'number',
          description: 'アイテムのID',
        },
      },
      required: ['checklist_id', 'item_id'],
    },
  },
  // === Board ===
  {
    name: 'jooto-create-board',
    description: 'プロジェクトを新規作成します',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'プロジェクト名',
        },
        description: {
          type: 'string',
          description: 'プロジェクトの説明',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'jooto-update-board',
    description: 'プロジェクト情報を更新します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        title: {
          type: 'string',
          description: 'プロジェクト名',
        },
        description: {
          type: 'string',
          description: 'プロジェクトの説明',
        },
      },
      required: ['board_id'],
    },
  },
  {
    name: 'jooto-delete-board',
    description: 'プロジェクトを削除します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
      },
      required: ['board_id'],
    },
  },
  // === List ===
  {
    name: 'jooto-create-list',
    description: 'プロジェクト内に新しいリストを作成します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        name: {
          type: 'string',
          description: 'リストの名前',
        },
        color: {
          type: 'string',
          description: 'リストの色コード',
        },
        auto_task_status: {
          type: 'string',
          enum: ['to_do', 'in_progress', 'done', 'cancel', 'pending', ''],
          description: 'このリストに移動したタスクへ自動設定するステータス。空文字を指定するとクリアします',
        },
      },
      required: ['board_id', 'name'],
    },
  },
  {
    name: 'jooto-update-list',
    description: 'プロジェクト内の特定のリスト情報を更新します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        list_id: {
          type: 'number',
          description: 'リストのID',
        },
        name: {
          type: 'string',
          description: 'リストの名前',
        },
        color: {
          type: 'string',
          description: 'リストの色コード',
        },
        auto_task_status: {
          type: 'string',
          enum: ['to_do', 'in_progress', 'done', 'cancel', 'pending', ''],
          description: 'このリストに移動したタスクへ自動設定するステータス。空文字を指定するとクリアします',
        },
      },
      required: ['board_id', 'list_id'],
    },
  },
  {
    name: 'jooto-delete-list',
    description: 'プロジェクト内のリストを削除します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        list_id: {
          type: 'number',
          description: 'リストのID',
        },
      },
      required: ['board_id', 'list_id'],
    },
  },
  {
    name: 'jooto-archive-list',
    description: 'プロジェクト内のリストをアーカイブします',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        list_id: {
          type: 'number',
          description: 'リストのID',
        },
      },
      required: ['board_id', 'list_id'],
    },
  },
  {
    name: 'jooto-reorder-list',
    description: 'プロジェクト内のリストの並び順を変更します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        list_ids: {
          type: 'array',
          items: {
            type: 'number',
          },
          description: 'リストのIDの配列（新しい順序で並べる）',
        },
      },
      required: ['board_id', 'list_ids'],
    },
  },
  // === Task ===
  {
    name: 'jooto-create-task',
    description: 'プロジェクト内に新しいタスクを作成します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        name: {
          type: 'string',
          description: 'タスクの名前',
        },
        list_id: {
          type: 'number',
          description: 'リストのID',
        },
        description: {
          type: 'string',
          description: 'タスクの説明',
        },
        assigned_user_ids: {
          type: 'array',
          items: {
            type: 'number',
          },
          description: 'アサインされているユーザーIDの配列',
        },
        start_date_time: {
          type: 'string',
          format: 'date-time',
          description: 'タスクの開始日時',
        },
        deadline_date_time: {
          type: 'string',
          format: 'date-time',
          description: 'タスクの締め切り日時',
        },
        category_ids: {
          type: 'array',
          items: {
            type: 'number',
          },
          description: 'カテゴリーのID',
        },
        effort: {
          type: 'string',
          description: 'タスクの予定',
        },
        actual: {
          type: 'string',
          description: 'タスクの実績',
        },
        status: {
          type: 'string',
          enum: ['to_do', 'done', 'cancel', 'pending', 'in_progress'],
          description: 'タスクのステータス',
        },
      },
      required: ['board_id', 'name', 'list_id'],
    },
  },
  {
    name: 'jooto-update-task',
    description: '特定のプロジェクト内の特定のタスク情報を更新します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
        name: {
          type: 'string',
          description: 'タスクの名前',
        },
        description: {
          type: 'string',
          description: 'タスクの説明',
        },
        assigned_user_ids: {
          type: 'array',
          items: {
            type: 'number',
          },
          description: 'アサインされているユーザーIDの配列',
        },
        start_date_time: {
          type: 'string',
          format: 'date-time',
          description: 'タスクの開始日時',
        },
        deadline_date_time: {
          type: 'string',
          format: 'date-time',
          description: 'タスクの締め切り日時',
        },
        list_id: {
          type: 'number',
          description: 'リストのID',
        },
        category_ids: {
          type: 'array',
          items: {
            type: 'number',
          },
          description: 'カテゴリーのID',
        },
        effort: {
          type: 'string',
          description: 'タスクの予定',
        },
        actual: {
          type: 'string',
          description: 'タスクの実績',
        },
        status: {
          type: 'string',
          enum: ['to_do', 'done', 'cancel', 'pending', 'in_progress'],
          description: 'タスクのステータス',
        },
      },
      required: ['board_id', 'task_id'],
    },
  },
  {
    name: 'jooto-delete-task',
    description: 'プロジェクト内のタスクを削除します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
      },
      required: ['board_id', 'task_id'],
    },
  },
  {
    name: 'jooto-search-task',
    description: 'プロジェクト内のタスクをフリーワードで検索します。通常はdetail_level=compactを使用してください。description、category_ids、更新日時が必要な場合のみstandardを指定します。',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        search_query: {
          type: 'string',
          description: 'フリーワード検索用のクエリ',
        },
        page: {
          type: 'integer',
          description: '取得したいページ番号（未指定時は1）',
          minimum: 1,
          default: 1,
        },
        per_page: {
          type: 'integer',
          description: '1ページあたりの取得件数（未指定時は200）',
          minimum: 1,
          default: 200,
        },
        order: {
          type: 'string',
          description: '並び順（"asc"または"desc"）',
        },
        ...taskDetailLevelProperty,
      },
      required: ['board_id', 'search_query'],
    },
  },
  {
    name: 'jooto-move-task',
    description: 'タスクを別のプロジェクトやリストに移動します',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
        board_id: {
          type: 'number',
          description: '移動先のプロジェクトのID',
        },
        list_id: {
          type: 'number',
          description: '移動先のリストのID',
        },
      },
      required: ['task_id', 'board_id', 'list_id'],
    },
  },
  {
    name: 'jooto-archive-task',
    description: 'タスクをアーカイブします',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
      },
      required: ['board_id', 'task_id'],
    },
  },
  // === Comment ===
  {
    name: 'jooto-create-comment',
    description: 'タスクにコメントを追加します',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
        content: {
          type: 'string',
          description: 'コメントの内容',
        },
      },
      required: ['task_id', 'content'],
    },
  },
  {
    name: 'jooto-update-comment',
    description: 'コメントを更新します',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
        comment_id: {
          type: 'number',
          description: 'コメントのID',
        },
        content: {
          type: 'string',
          description: 'コメントの内容',
        },
      },
      required: ['task_id', 'comment_id'],
    },
  },
  // === Label ===
  {
    name: 'jooto-create-label',
    description: 'プロジェクトにラベルを追加します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        name: {
          type: 'string',
          description: 'ラベルの名前',
        },
        color: {
          type: 'string',
          description: 'ラベルの色コード',
        },
      },
      required: ['board_id', 'name'],
    },
  },
  {
    name: 'jooto-update-label',
    description: 'ラベルを更新します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        category_id: {
          type: 'number',
          description: 'ラベルのID',
        },
        name: {
          type: 'string',
          description: 'ラベルの名前',
        },
        color: {
          type: 'string',
          description: 'ラベルの色コード',
        },
      },
      required: ['board_id', 'category_id'],
    },
  },
  {
    name: 'jooto-delete-label',
    description: 'ラベルを削除します',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: 'プロジェクトのID',
        },
        category_id: {
          type: 'number',
          description: 'ラベルのID',
        },
      },
      required: ['board_id', 'category_id'],
    },
  },
  // === Checklist ===
  {
    name: 'jooto-create-checklist',
    description: 'タスクにチェックリストを追加します',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
        title: {
          type: 'string',
          description: 'チェックリストのタイトル',
        },
      },
      required: ['task_id', 'title'],
    },
  },
  {
    name: 'jooto-update-checklist',
    description: 'チェックリストを更新します',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
        checklist_id: {
          type: 'number',
          description: 'チェックリストのID',
        },
        title: {
          type: 'string',
          description: 'チェックリストのタイトル',
        },
      },
      required: ['task_id', 'checklist_id'],
    },
  },
  {
    name: 'jooto-delete-checklist',
    description: 'チェックリストを削除します',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
        checklist_id: {
          type: 'number',
          description: 'チェックリストのID',
        },
      },
      required: ['task_id', 'checklist_id'],
    },
  },
  // === Checklist Item ===
  {
    name: 'jooto-create-checklist-item',
    description: 'チェックリストにアイテムを追加します',
    inputSchema: {
      type: 'object',
      properties: {
        checklist_id: {
          type: 'number',
          description: 'チェックリストのID',
        },
        content: {
          type: 'string',
          description: 'アイテムの内容',
        },
      },
      required: ['checklist_id', 'content'],
    },
  },
  {
    name: 'jooto-update-checklist-item',
    description: 'チェックリストアイテムを更新します',
    inputSchema: {
      type: 'object',
      properties: {
        checklist_id: {
          type: 'number',
          description: 'チェックリストのID',
        },
        item_id: {
          type: 'number',
          description: 'アイテムのID',
        },
        content: {
          type: 'string',
          description: 'アイテムの内容',
        },
        checked: {
          type: 'boolean',
          description: 'チェック状態',
        },
      },
      required: ['checklist_id', 'item_id'],
    },
  },
  {
    name: 'jooto-delete-checklist-item',
    description: 'チェックリストアイテムを削除します',
    inputSchema: {
      type: 'object',
      properties: {
        checklist_id: {
          type: 'number',
          description: 'チェックリストのID',
        },
        item_id: {
          type: 'number',
          description: 'アイテムのID',
        },
      },
      required: ['checklist_id', 'item_id'],
    },
  },
];
