export async function onRequest(context) {
  const { request, next, env } = context;

  // 1. 处理 OPTIONS 预检请求 (CORS)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // 2. 身份验证 (仅针对 list/delete)
  const url = new URL(request.url);
  if (url.pathname === '/list' || url.pathname === '/delete') {
    // 优先从环境变量获取，若无则使用默认值（请务必在 EdgeOne 控制台设置 API_KEY 环境变量）
    const VALID_KEY = env.API_KEY || 'your-secret-api-key-123456'; 
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || authHeader !== `Bearer ${VALID_KEY}`) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized: Invalid API Key' 
      }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer'
        }
      });
    }
  }

  // 3. 执行后续逻辑
  const response = await next();

  // 4. 添加统一的安全响应头
  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", "*");
  newHeaders.set("X-Content-Type-Options", "nosniff");
  // newHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload"); // 生产环境建议开启

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}