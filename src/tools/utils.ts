import https from 'https';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

export const DEFAULT_PER_PAGE = 200;

/**
 * MCPレスポンスをフォーマットする関数
 * @param response APIレスポンス
 * @returns MCPサーバーのハンドラーが返すべき形式のオブジェクト
 */
export function formatMcpResponse(response: any) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}

/**
 * MCPエラーをハンドリングするラッパー関数
 * @param operation 実行する非同期操作
 * @param errorMessage エラー時のメッセージ
 * @returns フォーマットされたMCPレスポンス
 */
export async function handleMcpOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string
) {
  try {
    console.error("handle operation")
    const response = await operation();
    return formatMcpResponse(response);
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw new McpError(
      ErrorCode.InternalError,
      `${errorMessage}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * HTTPSリクエストを行う関数
 */
export function httpsRequest(options: https.RequestOptions, data?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`HTTP Error: ${res.statusCode} - ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

/**
 * 一覧取得系のAPIパスにデフォルトのper_pageを付与する。
 * 明示的にper_pageが指定されている場合は呼び出し側の値を優先する。
 */
export function withDefaultPerPage(path: string, perPage = DEFAULT_PER_PAGE): string {
  const [pathname, query = ''] = path.split('?');
  const queryParams = new URLSearchParams(query);
  if (!queryParams.has('per_page')) {
    queryParams.set('per_page', perPage.toString());
  }

  const queryString = queryParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

/**
 * Jooto APIにリクエストを送信する関数
 */
export async function jootoApiRequest(
  method: string, 
  path: string, 
  data?: any
): Promise<any> {
  // APIキーを環境変数から取得
  const apiKey = process.env.JOOTO_API_KEY;
  if (!apiKey) {
    throw new McpError(
      ErrorCode.InternalError,
      'JOOTO_API_KEY環境変数が設定されていません'
    );
  }

  const hostName = process.env.JOOTO_API_HOST ? process.env.JOOTO_API_HOST :'api.jooto.com' ;
  const options: https.RequestOptions = {
    hostname: hostName,
    port: 443,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'X-Jooto-Api-Key': apiKey
    }
  };
  
  let requestData: string | undefined;
  if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    requestData = JSON.stringify(data);
    options.headers = {
      ...options.headers,
      'Content-Length': Buffer.byteLength(requestData)
    };
  }
  
  try {
    const responseData = await httpsRequest(options, requestData);
    if (!responseData) return { success: true };
    return JSON.parse(responseData);
  } catch (error) {
    console.error('Jooto API request error:', error);
    throw error;
  }
}
