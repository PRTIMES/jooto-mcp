# Jooto API MCP サーバー

この MCP サーバーは、[Jooto](https://www.jooto.com/)の API を利用してタスク管理機能を提供します。

## 前提条件

- Jooto API キー (ビジネスプランが必要)
- Node.js v18 以上（MCPB を使わず直接セットアップする場合）

## インストール

### Claude Desktop (MCPB バンドル)

Claude Desktop には `.mcpb` 形式でバンドル化したサーバーをドラッグ＆ドロップでインストールできます。

1. GitHub Releases ページから `jooto-mcp-server-<version>.mcpb` をダウンロードします。
2. ダウンロードした `.mcpb` ファイルを Claude Desktop のウィンドウにドラッグ＆ドロップする、またはファイルを開くと Claude Desktop がインストールダイアログを表示します。
3. インストール時に `JOOTO_API_KEY` を入力するよう求められます。

### その他の MCP クライアント (Claude Code、Cursor 等)

`.mcpb` を使わずに直接セットアップしたい場合の手順です。

1. GitHub Releases ページから `jooto-mcp-server-<version>.zip` をダウンロードし、任意のディレクトリに展開します。展開物に含まれる `server.cjs` がエントリポイントです（単一ファイルに依存を内包しているため `npm install` 等は不要）。
2. 使用する MCP クライアントの設定ファイルに以下を追加します。

```json
{
  "mcpServers": {
    "jooto": {
      "command": "node",
      "args": ["/absolute/path/to/server.cjs"],
      "env": {
        "JOOTO_API_KEY": "YOUR_JOOTO_API_KEY_HERE"
      }
    }
  }
}
```

フィールドの意味:

- `command`: 実行するコマンド。macOS / Linux では `node`、Windows では `node.exe`。`PATH` が通っていない場合は `node` のフルパス（例: macOS Homebrew なら `/opt/homebrew/bin/node` や `/usr/local/bin/node`、nvm 利用時は `~/.nvm/versions/node/vXX.X.X/bin/node`）を指定してください。
- `args`: `server.cjs` への**絶対パス**を配列で渡します。
- `env.JOOTO_API_KEY`: Jooto ビジネスプランの API キー（必須）。

## 注意事項

- この MCP サーバーを使用するには、Jooto のビジネスプランと API キーが必要です。
- API リクエストは api.jooto.com に対して行われます。

## MCP ツールの使い方

Jooto API の `board` は、MCP 上ではユーザー向けの語彙として「プロジェクト」と説明しています。ツール引数では API に合わせて `board_id` を使います。Jooto API の `category` は「ラベル」として扱います。

### 一覧取得の情報量

一覧取得系ツールは、AI へ渡すトークン量を抑えるため `detail_level` を持ちます。未指定時は `compact` です。

- `compact`: 通常利用向けの最小情報。まずはこちらを使います。
- `standard`: 説明文、更新日時、関連 ID など追加情報が必要な場合だけ使います。

一覧取得では `page` を指定できます。未指定時は `page=1` です。API 呼び出し時の `per_page` はサーバー側で既定値 `200` を付与します。ただし、タスク一覧、タスク検索、プロジェクト履歴一覧は返却量が大きいため `per_page=20` を付与します。レスポンスの `meta.total_pages` で次ページがある場合でも、一気に全ページを取得せず、必要に応じてユーザーに何ページ分まで取得するか確認してください。

プロジェクト、リスト、タスクの通常一覧は未アーカイブのみを返します。アーカイブ済みを見たい場合は、専用のアーカイブ一覧ツールを使います。

タスク一覧は返却件数が多くなりやすいため、`jooto-list-tasks` では可能な限り `category_ids`, `assignee_ids`, `deadline_since`, `deadline_until`, `status` で絞り込んでください。キーワードが分かっている場合は `jooto-search-task` を優先してください。開始日は一覧レスポンスの `start_date_time` で確認できますが、現在のOpenAPIでは開始日による絞り込みパラメータは提供されていません。

### `detail_level` ごとの返却フィールド

`standard` は `compact` への追加差分ではなく、その `detail_level` で返却されるフィールド一式です。一覧レスポンスには、各アイテム配列とは別に `page`, `per_page`, `total`, `total_pages`, `detail_level` を含む `meta` が返ります。

| ツール | `compact` | `standard` |
| --- | --- | --- |
| `jooto-list-users` | `id`, `name`, `display_name` | `id`, `name`, `display_name`, `email`, `role`, `created_at` |
| `jooto-list-projects` (`jooto-list-boards`), `jooto-list-archived-projects` (`jooto-list-archived-boards`) | `id`, `title` | `id`, `title`, `description`, `created_at` |
| `jooto-list-board-activities` | `id`, `type`, `data`, `sender_id`, `task_id`, `task_name`, `created_at` | `id`, `type`, `data`, `sender_id`, `sender_name`, `sender_display_name`, `task_id`, `task_name`, `task_status`, `task_list_id`, `created_at` |
| `jooto-list-board-members` | `id`, `name`, `display_name`, `role` | `id`, `name`, `display_name`, `email`, `role` |
| `jooto-list-lists`, `jooto-list-archived-lists` | `id`, `name` | `id`, `name`, `order`, `color`, `auto_task_status` |
| `jooto-list-labels` | `id`, `name` | `id`, `name`, `color` |
| `jooto-list-tasks`, `jooto-list-archived-tasks` | `id`, `name`, `list_id`, `status`, `assigned_user_ids`, `start_date_time`, `deadline_date_time` | `id`, `name`, `description`, `list_id`, `status`, `assigned_user_ids`, `start_date_time`, `deadline_date_time`, `category_ids`, `updated_at` |
| `jooto-search-task` | `id`, `name`, `list_id`, `status`, `start_date_time`, `deadline_date_time` | `id`, `name`, `description`, `list_id`, `status`, `start_date_time`, `deadline_date_time`, `category_ids`, `updated_at` |
| `jooto-list-comments` | `id`, `content`, `sender_id`, `created_at` | `id`, `content`, `sender_id`, `created_at`, `updated_at`, `mentioned_user_ids`, `attachment_ids` |
| `jooto-list-checklists` | `id`, `title`, `percentage` | `id`, `title`, `percentage`, `created_at`, `updated_at` |
| `jooto-list-checklist-items` | `id`, `content`, `checked`, `assigned_user_ids`, `start_date_time`, `deadline_date_time` | `id`, `content`, `checked`, `assigned_user_ids`, `start_date_time`, `deadline_date_time`, `updated_at` |

### ID の引き直し先

`compact` / `standard` では、ネストしたオブジェクトを丸ごと返さず `*_id` や `*_ids` に変換することがあります。名前や詳細が必要な場合は、以下のツールで引き直します。

| 返却される ID | 意味 | 対照表・詳細を取得するツール |
| --- | --- | --- |
| `board_id` | プロジェクトID | `jooto-list-projects`, `jooto-list-archived-projects`, `jooto-list-boards`, `jooto-list-archived-boards`, `jooto-get-board` |
| `list_id`, `task_list_id` | リストID | `jooto-list-lists`, `jooto-list-archived-lists`, `jooto-get-list` |
| `task_id` | タスクID | `jooto-list-tasks`, `jooto-list-archived-tasks`, `jooto-search-task`, `jooto-get-task` |
| `user_id`, `sender_id`, `assigned_user_ids`, `mentioned_user_ids` | ユーザーID | `jooto-list-users`, `jooto-list-board-members`, `jooto-get-user` |
| `category_id`, `category_ids` | ラベルID | `jooto-list-labels`, `jooto-get-label` |
| `comment_id` | コメントID | `jooto-list-comments`, `jooto-get-comment` |
| `checklist_id` | チェックリストID | `jooto-list-checklists`, `jooto-get-checklist` |
| `item_id` | チェックリストアイテムID | `jooto-list-checklist-items`, `jooto-get-checklist-item` |
| `attachment_ids` | 添付ファイルID | 現時点では添付ファイル詳細取得ツールは未実装です |

### 主な一覧取得ツール

| ツール | 用途 |
| --- | --- |
| `jooto-list-users` | 組織ユーザー一覧 |
| `jooto-list-projects` (`jooto-list-boards`) | 未アーカイブのプロジェクト一覧 |
| `jooto-list-archived-projects` (`jooto-list-archived-boards`) | アーカイブ済みプロジェクト一覧 |
| `jooto-list-board-activities` | プロジェクト履歴一覧 |
| `jooto-list-board-members` | プロジェクトメンバー一覧 |
| `jooto-list-lists` | 未アーカイブのリスト一覧 |
| `jooto-list-archived-lists` | アーカイブ済みリスト一覧 |
| `jooto-list-labels` | ラベル一覧 |
| `jooto-list-tasks` | 未アーカイブのタスク一覧 |
| `jooto-list-archived-tasks` | アーカイブ済みタスク一覧 |
| `jooto-search-task` | タスク検索 |
| `jooto-list-comments` | コメント一覧 |
| `jooto-list-checklists` | チェックリスト一覧 |
| `jooto-list-checklist-items` | チェックリストアイテム一覧 |

### 主な更新系ツール

| 対象 | ツール |
| --- | --- |
| プロジェクト | `jooto-create-board`, `jooto-update-board`, `jooto-delete-board` |
| リスト | `jooto-create-list`, `jooto-update-list`, `jooto-delete-list`, `jooto-archive-list`, `jooto-reorder-list` |
| タスク | `jooto-create-task`, `jooto-update-task`, `jooto-delete-task`, `jooto-move-task`, `jooto-archive-task` |
| コメント | `jooto-create-comment`, `jooto-update-comment` |
| ラベル | `jooto-create-label`, `jooto-update-label`, `jooto-delete-label` |
| チェックリスト | `jooto-create-checklist`, `jooto-update-checklist`, `jooto-delete-checklist` |
| チェックリストアイテム | `jooto-create-checklist-item`, `jooto-update-checklist-item`, `jooto-delete-checklist-item` |

## 開発・テスト

このプロジェクトは TypeScript で実装されています。リリース済みバンドルを使わず、ソースからビルドして利用する場合もこちらの手順に従ってください。

### 依存関係のインストール

```bash
pnpm install
```

### ビルド

TypeScript コードをコンパイルします：

```bash
pnpm build
```

### サーバーの起動

```bash
pnpm start
```

ソースからビルドして MCP クライアントで利用する場合は、`mcp-config.json` 等の設定ファイルを編集して、Jooto の API キーを設定します：

```json
{
  "mcpServers": {
    "jooto-api": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "JOOTO_API_KEY": "YOUR_JOOTO_API_KEY_HERE"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### 開発モード

```bash
pnpm dev
```

### テスト

Vitest を使用しており、MCP クライアントのモックを利用したテストが含まれています。サーバーを起動せずにテストが可能です。

```bash
pnpm test
```

ウォッチモードでのテスト実行：

```bash
pnpm test:watch
```

### MCPB バンドルのビルド

Claude Desktop 向け `.mcpb` 形式のバンドルをローカルで生成する場合:

```bash
pnpm build:mcpb
```

`scripts/build-mcpb.sh` が実行され、以下の処理が行われます:

1. esbuild で `src/index.ts` を単一 CJS ファイル（`dist/bundle.cjs`）にバンドル（依存関係もすべて内包）
2. `manifest.json` と `server.cjs` をステージングディレクトリに配置
3. ZIP 圧縮して `dist/jooto-mcp-server-<version>.mcpb` を生成

バージョンは `package.json` の `version` フィールドから取得されます。

## リリース

バージョン更新は `pnpm version` コマンドで一括処理します。

```bash
pnpm version patch   # 例: 0.0.1 → 0.0.2
pnpm version minor   # 例: 0.0.1 → 0.1.0
pnpm version major   # 例: 0.0.1 → 1.0.0
```

実行すると以下が自動で行われます:

1. `package.json` の `version` を更新
2. `version` ライフサイクルスクリプト (`scripts/sync-manifest-version.mjs`) が `manifest.json` の `version` を同期
3. 両ファイルを含むコミットを作成 (メッセージは新バージョン番号)
4. `vX.Y.Z` 形式の git tag を付与

前提として working tree がクリーンである必要があります。未コミットの変更があると `pnpm version` は失敗します。

### リモートへの反映

```bash
git push --follow-tags
```

`v*` タグの push を検知して `.github/workflows/release.yml` が走り、`.mcpb` とソース zip を添付した GitHub Release が自動生成されます。

## プロジェクト構成

- `src/`: ソースコード
  - `index.ts`: メインエントリーポイント
  - `server.ts`: MCP サーバー実装
- `tests/`: テストファイル
- `dist/`: ビルド後の JavaScript ファイル
- `scripts/build-mcpb.sh`: Claude Desktop 向け `.mcpb` バンドル生成スクリプト
- `scripts/sync-manifest-version.mjs`: `pnpm version` hook。`package.json` の version を `manifest.json` に同期
- `manifest.json`: MCPB バンドルのメタデータ（Claude Desktop が参照）
- `.github/workflows/release.yml`: `v*` タグ push で GitHub Release を生成する Actions
