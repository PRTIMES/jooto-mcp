/**
 * MCP Resource Template 定義
 *
 * URI スキーム: jooto:///...
 * Jooto ドメイン語彙: board→project, category→label
 */

export interface ResourceTemplateDefinition {
  uriTemplate: string;
  name: string;
  description: string;
  mimeType: string;
}

export const resourceTemplateDefinitions: ResourceTemplateDefinition[] = [
  // === Organization ===
  {
    uriTemplate: 'jooto:///organization',
    name: '組織情報',
    description: '組織情報を取得します',
    mimeType: 'application/json',
  },
  // === Rate Limit ===
  {
    uriTemplate: 'jooto:///rate-limit',
    name: 'レート制限情報',
    description: 'APIのレート制限情報を取得します',
    mimeType: 'application/json',
  },
  // === Users ===
  {
    uriTemplate: 'jooto:///users{?page,detail_level}',
    name: 'ユーザー一覧',
    description: 'ユーザー一覧を取得します。通常はdetail_level=compactを使用してください。',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'jooto:///users/{userId}',
    name: 'ユーザー詳細',
    description: '特定のユーザー情報を取得します',
    mimeType: 'application/json',
  },
  // === Projects (= boards) ===
  {
    uriTemplate: 'jooto:///projects{?page,detail_level}',
    name: 'プロジェクト一覧',
    description: '未アーカイブのプロジェクト一覧を取得します。通常はdetail_level=compactを使用してください。',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'jooto:///projects/archived{?page,detail_level}',
    name: 'アーカイブ済みプロジェクト一覧',
    description: 'アーカイブ済みプロジェクト一覧を取得します。通常はdetail_level=compactを使用してください。',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'jooto:///projects/{projectId}',
    name: 'プロジェクト詳細',
    description: '特定のプロジェクト情報を取得します',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'jooto:///projects/{projectId}/members{?page,detail_level}',
    name: 'プロジェクトメンバー一覧',
    description: 'プロジェクトのメンバー一覧を取得します。通常はdetail_level=compactを使用してください。',
    mimeType: 'application/json',
  },
  // === Lists ===
  {
    uriTemplate: 'jooto:///projects/{projectId}/lists{?page,detail_level}',
    name: 'リスト一覧',
    description: 'プロジェクト内の未アーカイブのリスト一覧を取得します。通常はdetail_level=compactを使用してください。',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'jooto:///projects/{projectId}/lists/archived{?page,detail_level}',
    name: 'アーカイブ済みリスト一覧',
    description: 'プロジェクト内のアーカイブ済みリスト一覧を取得します。通常はdetail_level=compactを使用してください。',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'jooto:///projects/{projectId}/lists/{listId}',
    name: 'リスト詳細',
    description: 'プロジェクト内の特定のリスト情報を取得します',
    mimeType: 'application/json',
  },
  // === Labels (= categories) ===
  {
    uriTemplate: 'jooto:///projects/{projectId}/labels{?page,detail_level}',
    name: 'ラベル一覧',
    description: 'プロジェクトのラベル一覧を取得します。通常はdetail_level=compactを使用してください。',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'jooto:///projects/{projectId}/labels/{labelId}',
    name: 'ラベル詳細',
    description: '特定のラベルを取得します',
    mimeType: 'application/json',
  },
  // === Tasks ===
  {
    uriTemplate: 'jooto:///projects/{projectId}/tasks{?page,detail_level}',
    name: 'タスク一覧',
    description: 'プロジェクト内の未アーカイブのタスク一覧を取得します。通常はdetail_level=compactを使用してください。',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'jooto:///projects/{projectId}/tasks/archived{?page,detail_level}',
    name: 'アーカイブ済みタスク一覧',
    description: 'プロジェクト内のアーカイブ済みタスク一覧を取得します。通常はdetail_level=compactを使用してください。',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'jooto:///projects/{projectId}/tasks/{taskId}',
    name: 'タスク詳細',
    description: '特定のプロジェクト内の特定のタスク情報を取得します',
    mimeType: 'application/json',
  },
  // === Comments ===
  {
    uriTemplate: 'jooto:///projects/{projectId}/tasks/{taskId}/comments{?page,detail_level}',
    name: 'コメント一覧',
    description: 'タスクのコメント一覧を取得します。通常はdetail_level=compactを使用してください。',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'jooto:///projects/{projectId}/tasks/{taskId}/comments/{commentId}',
    name: 'コメント詳細',
    description: '特定のコメントを取得します',
    mimeType: 'application/json',
  },
  // === Checklists ===
  {
    uriTemplate: 'jooto:///projects/{projectId}/tasks/{taskId}/checklists{?page,detail_level}',
    name: 'チェックリスト一覧',
    description: 'タスクのチェックリスト一覧を取得します。通常はdetail_level=compactを使用してください。',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'jooto:///projects/{projectId}/tasks/{taskId}/checklists/{checklistId}',
    name: 'チェックリスト詳細',
    description: '特定のチェックリストを取得します',
    mimeType: 'application/json',
  },
  // === Checklist Items ===
  {
    uriTemplate: 'jooto:///projects/{projectId}/tasks/{taskId}/checklists/{checklistId}/items{?page,detail_level}',
    name: 'チェックリストアイテム一覧',
    description: 'チェックリストのアイテム一覧を取得します。通常はdetail_level=compactを使用してください。',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'jooto:///projects/{projectId}/tasks/{taskId}/checklists/{checklistId}/items/{itemId}',
    name: 'チェックリストアイテム詳細',
    description: '特定のチェックリストアイテムを取得します',
    mimeType: 'application/json',
  },
];
