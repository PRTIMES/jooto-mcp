#!/usr/bin/env node
import { MyMcpServer } from './server.js';

// 未キャッチエラーをstderrに出力（Claude Desktopログで確認可能）
process.on('uncaughtException', (error) => {
  console.error('uncaughtException:', error);
});
process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection:', reason);
});

// サーバーを作成して実行
const server = new MyMcpServer();
server.run().catch(error => {
  console.error('サーバーエラー:', error);
  process.exit(1);
});

// 終了シグナルを処理
process.on('SIGINT', async () => {
  console.error('sigint サーバーをシャットダウンしています...');
  await server.close();
  process.exit(0);
});

// process.on('SIGTERM', async () => {
//   console.log('sigterm サーバーをシャットダウンしています...');
//   await server.close();
//   process.exit(0);
// });
