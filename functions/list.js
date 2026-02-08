export async function onRequestGet(context) {
  try {
    const { env } = context;
    // 兼容全局变量和环境变量
    const IMAGES_KV = env.IMAGES || IMAGES;
    
    // 获取所有图片列表
    const list = await IMAGES_KV.list();
    const keys = list.keys || [];
    
    // 并发限制：一次处理 5 个请求，防止瞬间超时
    const CONCURRENCY_LIMIT = 5;
    const images = [];
    
    // 分批处理函数
    async function processBatch(batchKeys) {
      const promises = batchKeys.map(async (key) => {
        try {
          const keyName = key.key || key.name;
          // 从 KV 获取数据
          const jsonData = await IMAGES_KV.get(keyName);
          
          if (jsonData) {
            const storageData = JSON.parse(jsonData);
            const metadata = storageData.metadata || {};
            return {
              filename: keyName,
              url: `/i/${keyName}`,
              metadata: metadata,
              uploadTime: metadata.uploadTime || null
            };
          }
          return null; // 数据为空
        } catch (e) {
          console.error(`读取失败: ${key.name}`, e);
          return null; // 单个失败不影响整体
        }
      });
      
      const results = await Promise.all(promises);
      return results.filter(item => item !== null);
    }
    
    // 分批执行
    for (let i = 0; i < keys.length; i += CONCURRENCY_LIMIT) {
      const batch = keys.slice(i, i + CONCURRENCY_LIMIT);
      const batchResults = await processBatch(batch);
      images.push(...batchResults);
    }
    
    // 按上传时间倒序排列
    images.sort((a, b) => {
      const timeA = a.uploadTime ? new Date(a.uploadTime).getTime() : 0;
      const timeB = b.uploadTime ? new Date(b.uploadTime).getTime() : 0;
      return timeB - timeA;
    });
    
    return new Response(JSON.stringify({
      success: true,
      count: images.length,
      images: images
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('获取列表错误:', error);
    return new Response(JSON.stringify({ error: '获取列表失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}