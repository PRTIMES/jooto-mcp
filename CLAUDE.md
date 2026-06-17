# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Jooto API MCP サーバー。Jooto（プロジェクト管理ツール）の REST API を MCP (Model Context Protocol) ツールとしてラップし、Claude Desktop 等の MCP クライアントから操作可能にする。ビジネスプラン API キーが必要。

## Commands

```bash
pnpm build           # TypeScript → dist/ にコンパイル (tsc)
pnpm start           # サーバー起動 (node dist/index.js)
pnpm dev             # ウォッチモードで開発（tsc -w + node --watch）
pnpm test            # テスト実行 (vitest run tests/*-mock.test.js)
pnpm test:watch      # ウォッチモードでテスト (vitest)
pnpm build:mcpb      # Claude Desktop 用 .mcpb バンドル作成
```

## Architecture

ESM (`"type": "module"`) の TypeScript プロジェクト。`@modelcontextprotocol/sdk` で MCP サーバーを構築。

### エントリポイントと通信

- `src/index.ts` → `src/server.ts` の `MyMcpServer` を起動。stdio トランスポートで MCP クライアントと通信。
- 環境変数 `JOOTO_API_KEY` が必須。`JOOTO_API_HOST` で API ホストの上書きが可能（デフォルト: `api.jooto.com`）。

### ツール追加の3ファイル構成

新しい MCP ツールを追加する際は以下の3ファイルを同時に更新する必要がある:

1. **`src/tools/definitions.ts`** — JSON Schema 形式のツール定義（MCP クライアントに公開される inputSchema）
2. **`src/tools/schemas.ts`** — Zod スキーマ（サーバー側バリデーション）。`toolSchemas` オブジェクトのキーがツール名。
3. **`src/tools/handlers.ts`** — ハンドラー関数の実装 + `toolHandlers` Map への登録。`handleMcpOperation` ラッパーで共通エラー処理。

`src/tools/index.ts` が各モジュールを re-export し、`src/server.ts` がそれらを利用して `ListTools` / `CallTool` ハンドラーを登録する。

### API リクエスト

`src/tools/utils.ts` の `jootoApiRequest()` が Node.js 組み込み `https` モジュールで Jooto REST API (`/v1/...`) を呼び出す。認証は `X-Jooto-Api-Key` ヘッダー。

### Jooto API の概念マッピング

Jooto の概念と API パスの対応:
- Board = プロジェクト (`/v1/boards`)
- List = リスト (`/v1/boards/{id}/lists`)
- Task = タスク (`/v1/boards/{id}/tasks`)
- Category = ラベル (`/v1/boards/{id}/categories`)
- Checklist / Checklist Item = チェックリスト (`/v1/tasks/{id}/checklists`, `/v1/checklists/{id}/items`)
- Comment = コメント (`/v1/tasks/{id}/comments`)

### テスト

`tests/` 配下のモックテスト（`*-mock.test.js`）。MCP クライアントを使わずにハンドラーロジックを検証する。Vitest を使用。

### MCPB バンドル

`scripts/build-mcpb.sh` で `manifest.json` + コンパイル済み JS + 本番依存のみの node_modules を ZIP 化し `.mcpb` ファイルを生成。Claude Desktop にドラッグ＆ドロップでインストール可能。
