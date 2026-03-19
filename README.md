# Jooto API MCP サーバー

この MCP サーバーは、[Jooto](https://www.jooto.com/)の API を利用してタスク管理機能を提供します。

## 前提条件

- Jooto API キー (エンタープライズプランが必要)
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
- `env.JOOTO_API_KEY`: Jooto エンタープライズプランの API キー（必須）。

## 注意事項

- この MCP サーバーを使用するには、Jooto のエンタープライズプランと API キーが必要です。
- API リクエストは app.jooto.com に対して行われます。

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
