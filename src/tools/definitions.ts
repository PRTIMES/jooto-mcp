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
    description: '取得したいページ番号（未指定時は1）。レスポンスのmeta.total_pagesで次ページがある場合でも、一気に全ページを取得せず、必要に応じてユーザーに何ページ分まで取得するか確認してください。',
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

function searchableDescription(description: string, keywords: string): string {
  return `${description} Search keywords: ${keywords}.`;
}

const projectSelectionGuidance = 'プロジェクトが指定されていない場合は、先にユーザーへ対象プロジェクトを確認してください。候補が必要な場合はjooto-list-projectsを使用します。';
const taskProjectIdDescription = `プロジェクトのID。${projectSelectionGuidance}`;
const destinationProjectIdDescription = `移動先のプロジェクトのID。移動先プロジェクトが指定されていない場合は、先にユーザーへ対象プロジェクトを確認してください。候補が必要な場合はjooto-list-projectsを使用します。`;
const datePairGuidance = 'Jootoでは開始日時と締切日時を両方設定する必要があります。';
const dateCreateGuidance = '新規作成時に片方だけを指定した場合は、未指定側にも同じ値を自動設定します。';
const taskDateUpdateGuidance = '更新時に片方だけを指定した場合は、現在のタスクの反対側が設定済みなら変更対象だけを送信し、既存値を維持します。ただし、新しい開始日時が締切日時より後、または新しい締切日時が開始日時より前になる場合は、両方を新しい値に揃えます。反対側が未設定の場合も、指定された値を両方に設定します。';
const itemDateUpdateGuidance = '更新時に片方だけを指定した場合は、現在のアイテムの反対側が設定済みなら変更対象だけを送信し、既存値を維持します。ただし、新しい開始日時が締切日時より後、または新しい締切日時が開始日時より前になる場合は、両方を新しい値に揃えます。反対側が未設定の場合も、指定された値を両方に設定します。';
const dateFormatGuidance = '日付だけの場合はYYYY-MM-DD、時刻を含む場合はJooto APIが要求するUTCのYYYY-MM-DDTHH:mm:ss.0Z形式で送信します。YYYY/MM/DDや+09:00付き日時など変換可能な入力は正規化し、変換できない入力はエラーになります。';
const dateClearGuidance = '更新時に日付をクリアする場合は空文字を明示的に指定してください。日付を変更しない場合は、そのパラメータ自体を省略してください。';

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

const taskListFilterProperties = {
  category_ids: {
    type: 'array',
    description: '絞り込み対象のラベルID配列。タスク一覧は件数が多くなりやすいため、可能なら指定してください。',
    items: {
      type: 'number',
    },
  },
  assignee_ids: {
    type: 'array',
    description: '絞り込み対象の担当者ID配列。タスク一覧は件数が多くなりやすいため、可能なら指定してください。',
    items: {
      type: 'number',
    },
  },
  deadline_since: {
    type: 'string',
    description: 'この日時以降が締切のタスクに絞り込みます。ISO 8601形式を指定してください。',
    format: 'date-time',
  },
  deadline_until: {
    type: 'string',
    description: 'この日時以前が締切のタスクに絞り込みます。ISO 8601形式を指定してください。',
    format: 'date-time',
  },
  status: {
    type: 'array',
    description: '絞り込み対象のタスクステータス配列。',
    items: {
      type: 'string',
      enum: ['to_do', 'in_progress', 'done', 'cancel', 'pending'],
    },
  },
};

export const toolDefinitions = [
  // === Read（取得系） ===
  {
    name: 'jooto-get-organization',
    description: searchableDescription('組織情報を取得します', 'jooto-get-organization, organization, workspace, company'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'jooto-get-rate-limit',
    description: searchableDescription('APIのレート制限情報を取得します', 'jooto-get-rate-limit, rate limit, api limit, quota'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'jooto-list-users',
    description: searchableDescription('組織に所属するユーザーの一覧を取得します。通常はdetail_level=compactを使用してください。email、role、作成日時が必要な場合のみstandardを指定します。', 'jooto-list-users, user list, users, organization users, members'),
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
    description: searchableDescription('特定のユーザー情報を取得します', 'jooto-get-user, user detail, user info, member detail'),
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
    name: 'jooto-list-projects',
    description: searchableDescription('未アーカイブのプロジェクト一覧を取得します。jooto-list-boardsと同じ結果を返すプロジェクト名のエイリアスです。通常はdetail_level=compactを使用してください。descriptionや作成日時が必要な場合のみstandardを指定します。', 'jooto-list-projects, project list, projects list, list projects, プロジェクト一覧, 未アーカイブ プロジェクト一覧'),
    inputSchema: {
      type: 'object',
      properties: {
        ...paginationProperties,
        ...boardListDetailLevelProperty,
      },
    },
  },
  {
    name: 'jooto-list-boards',
    description: searchableDescription('未アーカイブのプロジェクト一覧を取得します。通常はdetail_level=compactを使用してください。descriptionや作成日時が必要な場合のみstandardを指定します。', 'jooto-list-boards, プロジェクト一覧, ボード一覧, project list, board list, list boards, active projects'),
    inputSchema: {
      type: 'object',
      properties: {
        ...paginationProperties,
        ...boardListDetailLevelProperty,
      },
    },
  },
  {
    name: 'jooto-list-archived-projects',
    description: searchableDescription('アーカイブ済みプロジェクト一覧を取得します。jooto-list-archived-boardsと同じ結果を返すプロジェクト名のエイリアスです。通常はdetail_level=compactを使用してください。descriptionや作成日時が必要な場合のみstandardを指定します。', 'jooto-list-archived-projects, archived project list, archived projects list, list archived projects, アーカイブ済みプロジェクト一覧'),
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
    description: searchableDescription('アーカイブ済みプロジェクト一覧を取得します。通常はdetail_level=compactを使用してください。descriptionや作成日時が必要な場合のみstandardを指定します。', 'jooto-list-archived-boards, アーカイブ済みプロジェクト一覧, アーカイブ済みボード一覧, archived project list, archived board list, archived boards'),
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
    description: searchableDescription('特定のプロジェクト情報を取得します', 'jooto-get-board, プロジェクト詳細, ボード詳細, project detail, board detail, project info'),
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
    description: searchableDescription('プロジェクトの履歴一覧を取得します。1ページあたり20件取得します。通常はdetail_level=compactを使用してください。送信者名やタスクの状態・リストIDが必要な場合のみstandardを指定します。', 'jooto-list-board-activities, プロジェクト履歴, ボード履歴, 行動履歴, project activity, board activity, history, activity log'),
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
    description: searchableDescription('プロジェクトのメンバー一覧を取得します。通常はdetail_level=compactを使用してください。emailが必要な場合のみstandardを指定します。', 'jooto-list-board-members, プロジェクトメンバー, ボードメンバー, project members, board members, member list, users'),
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
    description: searchableDescription('プロジェクト内の未アーカイブのリスト一覧を取得します。通常はdetail_level=compactを使用してください。並び順、色、自動ステータスが必要な場合のみstandardを指定します。', 'jooto-list-lists, list list, project lists, board lists, active lists'),
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
    description: searchableDescription('プロジェクト内のアーカイブ済みリスト一覧を取得します。通常はdetail_level=compactを使用してください。並び順、色、自動ステータスが必要な場合のみstandardを指定します。', 'jooto-list-archived-lists, archived lists, archived project lists, archived board lists'),
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
    description: searchableDescription('プロジェクト内の特定のリスト情報を取得します', 'jooto-get-list, list detail, project list detail, board list detail'),
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
    description: searchableDescription('プロジェクトのラベル一覧を取得します。通常はdetail_level=compactを使用してください。色が必要な場合のみstandardを指定します。', 'jooto-list-labels, label list, category list, labels, categories'),
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
    description: searchableDescription('特定のラベルを取得します', 'jooto-get-label, label detail, category detail, label info'),
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
    description: searchableDescription(`プロジェクト内の未アーカイブのタスク一覧を取得します。${projectSelectionGuidance}1ページあたり20件取得します。件数が多くなりやすいため、可能ならcategory_ids、assignee_ids、deadline_since/deadline_until、statusで絞り込むか、キーワードがある場合はjooto-search-taskを使用してください。通常はdetail_level=compactを使用してください。`, 'jooto-list-tasks, task list, project tasks, board tasks, active tasks'),
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: taskProjectIdDescription,
        },
        ...paginationProperties,
        ...taskListFilterProperties,
        ...taskDetailLevelProperty,
      },
      required: ['board_id'],
    },
  },
  {
    name: 'jooto-list-archived-tasks',
    description: searchableDescription(`プロジェクト内のアーカイブ済みタスク一覧を取得します。${projectSelectionGuidance}1ページあたり20件取得します。件数が多くなりやすいため、可能ならcategory_ids、assignee_ids、deadline_since/deadline_until、statusで絞り込むか、キーワードがある場合はjooto-search-taskを使用してください。通常はdetail_level=compactを使用してください。`, 'jooto-list-archived-tasks, archived task list, archived tasks, archived project tasks'),
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: taskProjectIdDescription,
        },
        ...paginationProperties,
        ...taskListFilterProperties,
        ...taskDetailLevelProperty,
      },
      required: ['board_id'],
    },
  },
  {
    name: 'jooto-get-task',
    description: searchableDescription(`特定のプロジェクト内の特定のタスク情報を取得します。${projectSelectionGuidance}`, 'jooto-get-task, task detail, task info, project task detail'),
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: taskProjectIdDescription,
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
    description: searchableDescription('タスクのコメント一覧を取得します。通常はdetail_level=compactを使用してください。更新日時、mentioned_user_ids、attachment_idsが必要な場合のみstandardを指定します。', 'jooto-list-comments, comment list, task comments, comments'),
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
    description: searchableDescription('特定のコメントを取得します', 'jooto-get-comment, comment detail, comment info'),
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
    description: searchableDescription('タスクのチェックリスト一覧を取得します。通常はdetail_level=compactを使用してください。作成日時や更新日時が必要な場合のみstandardを指定します。', 'jooto-list-checklists, checklist list, task checklists, checklists'),
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
    description: searchableDescription('特定のチェックリストを取得します', 'jooto-get-checklist, checklist detail, checklist info'),
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
    description: searchableDescription('チェックリストのアイテム一覧を取得します。通常はdetail_level=compactを使用してください。更新日時が必要な場合のみstandardを指定します。', 'jooto-list-checklist-items, checklist item list, checklist items, checklist entries'),
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
    description: searchableDescription('特定のチェックリストアイテムを取得します', 'jooto-get-checklist-item, checklist item detail, checklist entry detail'),
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
    description: searchableDescription('プロジェクトを新規作成します', 'jooto-create-board, プロジェクト作成, ボード作成, create project, create board, new project'),
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
    description: searchableDescription('プロジェクト情報を更新します', 'jooto-update-board, プロジェクト更新, ボード更新, update project, update board, edit project'),
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
    description: searchableDescription('プロジェクトを削除します', 'jooto-delete-board, プロジェクト削除, ボード削除, delete project, delete board, remove project'),
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
    description: searchableDescription('プロジェクト内に新しいリストを作成します', 'jooto-create-list, create list, new list, create board list'),
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
    description: searchableDescription('プロジェクト内の特定のリスト情報を更新します', 'jooto-update-list, update list, edit list, update board list'),
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
    description: searchableDescription('プロジェクト内のリストを削除します', 'jooto-delete-list, delete list, remove list, delete board list'),
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
    description: searchableDescription('プロジェクト内のリストをアーカイブします', 'jooto-archive-list, archive list, archive board list'),
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
    description: searchableDescription('プロジェクト内のリストの並び順を変更します', 'jooto-reorder-list, reorder list, sort lists, list order'),
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
    description: searchableDescription(`プロジェクト内に新しいタスクを作成します。${dateFormatGuidance}${datePairGuidance}${dateCreateGuidance}${projectSelectionGuidance}`, 'jooto-create-task, create task, new task, add task'),
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: taskProjectIdDescription,
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
          description: `タスクの開始日時。${dateFormatGuidance}${datePairGuidance}${dateCreateGuidance}`,
        },
        deadline_date_time: {
          type: 'string',
          description: `タスクの締め切り日時。${dateFormatGuidance}${datePairGuidance}${dateCreateGuidance}`,
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
    description: searchableDescription(`特定のプロジェクト内の特定のタスク情報を更新します。${dateFormatGuidance}${datePairGuidance}${taskDateUpdateGuidance}${dateClearGuidance}${projectSelectionGuidance}`, 'jooto-update-task, update task, edit task, task update'),
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: taskProjectIdDescription,
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
          description: `タスクの開始日時。${dateFormatGuidance}${datePairGuidance}${taskDateUpdateGuidance}${dateClearGuidance}`,
        },
        deadline_date_time: {
          type: 'string',
          description: `タスクの締め切り日時。${dateFormatGuidance}${datePairGuidance}${taskDateUpdateGuidance}${dateClearGuidance}`,
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
    description: searchableDescription(`プロジェクト内のタスクを削除します。${projectSelectionGuidance}`, 'jooto-delete-task, delete task, remove task'),
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: taskProjectIdDescription,
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
    description: searchableDescription(`プロジェクト内のタスクをフリーワードで検索します。${projectSelectionGuidance}通常はdetail_level=compactを使用してください。description、category_ids、更新日時が必要な場合のみstandardを指定します。`, 'jooto-search-task, task search, search tasks, keyword search'),
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: taskProjectIdDescription,
        },
        search_query: {
          type: 'string',
          description: 'フリーワード検索用のクエリ',
        },
        page: {
          type: 'integer',
          description: '取得したいページ番号（未指定時は1）。レスポンスのmeta.total_pagesで次ページがある場合でも、一気に全ページを取得せず、必要に応じてユーザーに何ページ分まで取得するか確認してください。',
          minimum: 1,
          default: 1,
        },
        per_page: {
          type: 'integer',
          description: '1ページあたりの取得件数（未指定時は20、最大20）',
          minimum: 1,
          maximum: 20,
          default: 20,
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
    description: searchableDescription(`タスクを別のプロジェクトやリストに移動します。${projectSelectionGuidance}`, 'jooto-move-task, move task, transfer task, move to list'),
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'number',
          description: 'タスクのID',
        },
        board_id: {
          type: 'number',
          description: destinationProjectIdDescription,
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
    description: searchableDescription(`タスクをアーカイブします。${projectSelectionGuidance}`, 'jooto-archive-task, archive task, archived task'),
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'number',
          description: taskProjectIdDescription,
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
    description: searchableDescription('タスクにコメントを追加します', 'jooto-create-comment, create comment, add comment, task comment'),
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
    description: searchableDescription('コメントを更新します', 'jooto-update-comment, update comment, edit comment'),
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
    description: searchableDescription('プロジェクトにラベルを追加します', 'jooto-create-label, create label, create category, add label'),
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
    description: searchableDescription('ラベルを更新します', 'jooto-update-label, update label, update category, edit label'),
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
    description: searchableDescription('ラベルを削除します', 'jooto-delete-label, delete label, delete category, remove label'),
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
    description: searchableDescription('タスクにチェックリストを追加します', 'jooto-create-checklist, create checklist, add checklist, task checklist'),
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
    description: searchableDescription('チェックリストを更新します', 'jooto-update-checklist, update checklist, edit checklist'),
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
    description: searchableDescription('チェックリストを削除します', 'jooto-delete-checklist, delete checklist, remove checklist'),
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
    description: searchableDescription(`チェックリストにアイテムを追加します。${dateFormatGuidance}${datePairGuidance}${dateCreateGuidance}`, 'jooto-create-checklist-item, create checklist item, add checklist item, checklist entry'),
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
        start_date_time: {
          type: 'string',
          description: `アイテムの開始日時。${dateFormatGuidance}${datePairGuidance}${dateCreateGuidance}`,
        },
        deadline_date_time: {
          type: 'string',
          description: `アイテムの締め切り日時。${dateFormatGuidance}${datePairGuidance}${dateCreateGuidance}`,
        },
      },
      required: ['checklist_id', 'content'],
    },
  },
  {
    name: 'jooto-update-checklist-item',
    description: searchableDescription(`チェックリストアイテムを更新します。${dateFormatGuidance}${datePairGuidance}${itemDateUpdateGuidance}${dateClearGuidance}`, 'jooto-update-checklist-item, update checklist item, edit checklist item, checklist entry'),
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
        start_date_time: {
          type: 'string',
          description: `アイテムの開始日時。${dateFormatGuidance}${datePairGuidance}${itemDateUpdateGuidance}${dateClearGuidance}`,
        },
        deadline_date_time: {
          type: 'string',
          description: `アイテムの締め切り日時。${dateFormatGuidance}${datePairGuidance}${itemDateUpdateGuidance}${dateClearGuidance}`,
        },
      },
      required: ['checklist_id', 'item_id'],
    },
  },
  {
    name: 'jooto-delete-checklist-item',
    description: searchableDescription('チェックリストアイテムを削除します', 'jooto-delete-checklist-item, delete checklist item, remove checklist item, checklist entry'),
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
