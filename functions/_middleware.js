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

  // 2. 身份验证 (针对 list, delete, upload)
  const url = new URL(request.url);
  // 需要鉴权的路径
  const protectedPaths = ['/list', '/delete', '/upload'];
  
  // 如果是根路径的 POST 请求 (通常也是上传)，也需要鉴权
  const isRootPost = url.pathname === '/' && request.method === 'POST';

  if (protectedPaths.includes(url.pathname) || isRootPost) {
    // 优先从环境变量获取，若无则使用默认值
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
  // newHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}