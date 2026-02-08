// 带密码验证的图片列表 API
const ADMIN_PASSWORD = '3.1415926'; // 与前端密码保持一致

export async function onRequestGet(context) {
  try {
    const { request } = context;
    const url = new URL(request.url);
    const password = url.searchParams.get('password');
    
    // 验证密码
    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ 
        error: '密码错误或未提供密码',
        debug: { hasPassword: !!password, passwordLength: password ? password.length : 0 }
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 获取图片列表
    const list = await IMAGES.list();
    
    // 调试信息
    const debug = {
      list_keys_type: typeof list.keys,
      list_keys_length: list.keys ? list.keys.length : 0,
      first_key: null,
      errors: []
    };
    
    const images = [];
    
    if (list.keys && list.keys.length > 0) {
      const firstKey = list.keys[0];
      debug.first_key = {
        type: typeof firstKey,
        keys: Object.keys(firstKey || {}),
        name: firstKey?.name,
        key: firstKey?.key
      };
      
      for (const key of list.keys) {
        try {
          // EdgeOne Pages 使用 key.key 而不是 key.name
          const keyName = key.key || key.name;
          
          // 从 KV 获取数据（JSON 格式）
          const jsonData = await IMAGES.get(keyName);
          
          if (jsonData) {
            // 解析 JSON 数据
            const storageData = JSON.parse(jsonData);
            const metadata = storageData.metadata || {};
            
            images.push({
              filename: keyName,
              url: `/i/${keyName}`,
              metadata: metadata,
              uploadTime: metadata.uploadTime || null
            });
          } else {
            // 如果无法获取数据，只返回基本信息
            images.push({
              filename: keyName,
              url: `/i/${keyName}`,
              metadata: {},
              uploadTime: null
            });
          }
        } catch (e) {
          const keyName = key.key || key.name;
          debug.errors.push({ key: keyName, error: e.message });
          images.push({
            filename: keyName,
            url: `/i/${keyName}`,
            metadata: {},
            uploadTime: null
          });
        }
      }
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
      images: images,
      debug: debug // 添加调试信息
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('获取列表错误:', error);
    return new Response(JSON.stringify({ 
      error: '获取列表失败: ' + error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
