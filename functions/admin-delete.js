// 带密码验证的删除 API
const ADMIN_PASSWORD = '3.1415926'; // 与前端密码保持一致

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const { filename, password } = await request.json();
    
    // 验证密码
    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ 
        error: '密码错误或未提供密码' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!filename) {
      return new Response(JSON.stringify({ error: '文件名不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 删除图片
    await IMAGES.delete(filename);
    
    return new Response(JSON.stringify({
      success: true,
      message: '删除成功',
      filename: filename
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('删除错误:', error);
    return new Response(JSON.stringify({ error: '删除失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
