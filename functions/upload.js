export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    // 兼容全局变量和环境变量
    const IMAGES_KV = env.IMAGES || IMAGES;
    
    // 获取上传的文件
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return new Response(JSON.stringify({ error: '请上传图片文件' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: '仅支持 JPG、PNG、GIF、WebP 格式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 验证文件大小（25MB限制）
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: '文件大小不能超过 25MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 生成简洁文件名：8位随机字符 + 扩展名
    const random = Math.random().toString(36).substring(2, 10);
    const extension = file.name.split('.').pop().toLowerCase();
    const filename = `${random}.${extension}`;
    
    // 内存优化：ArrayBuffer 转 Base64
    const arrayBuffer = await file.arrayBuffer();
    let base64Data;
    
    if (typeof Buffer !== 'undefined') {
        // Node.js 环境或兼容层
        base64Data = Buffer.from(arrayBuffer).toString('base64');
    } else {
        // 浏览器/Edge 环境：分片处理防止栈溢出
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        const CHUNK_SIZE = 0x8000; // 32KB 分片
        let binary = '';
        for (let i = 0; i < len; i += CHUNK_SIZE) {
            const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, len));
            binary += String.fromCharCode.apply(null, chunk);
        }
        base64Data = btoa(binary);
    }
    
    // 打包数据和元数据
    const storageData = {
      data: base64Data,
      metadata: {
        name: file.name,
        type: file.type,
        size: file.size,
        uploadTime: new Date().toISOString()
      }
    };
    
    // 存储到 KV
    try {
      await IMAGES_KV.put(filename, JSON.stringify(storageData));
    } catch (kvError) {
      console.error('KV put error:', kvError);
      throw new Error('存储到 KV 失败: ' + kvError.message);
    }
    
    // 返回成功响应
    return new Response(JSON.stringify({
      success: true,
      filename: filename,
      url: `/i/${filename}`,
      originalName: file.name,
      size: file.size
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('上传错误:', error);
    return new Response(JSON.stringify({ error: '上传失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}