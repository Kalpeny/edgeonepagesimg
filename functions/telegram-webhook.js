// EdgeOne Pages Function for Telegram Webhook

// 辅助函数：发送消息给 Telegram 用户
async function sendMessage(chatId, text, replyToMessageId, token) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_to_message_id: replyToMessageId,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });
  } catch (e) {
    console.error('Failed to send message:', e);
  }
}

// 辅助函数：获取文件信息
async function getFile(fileId, token) {
  const url = `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`;
  const response = await fetch(url);
  return response.json();
}

// 主函数
export async function onRequestPost(context) {
  const { request, env } = context;
  const IMAGES_KV = env.IMAGES || IMAGES;
  const TG_BOT_TOKEN = env.TG_BOT_TOKEN;
  const TG_SECRET_TOKEN = env.TG_SECRET_TOKEN; // 可选，用于验证 Webhook

  if (!TG_BOT_TOKEN) {
    // 如果没有配置 Token，返回 404 防止被滥用探测
    return new Response('TG_BOT_TOKEN not configured', { status: 404 });
  }

  // 1. 验证 Webhook Secret (如果配置了)
  if (TG_SECRET_TOKEN) {
    const headerSecret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (headerSecret !== TG_SECRET_TOKEN) {
      return new Response('Unauthorized', { status: 403 });
    }
  }

  try {
    const update = await request.json();
    
    // 2. 检查是否有消息
    if (!update.message) {
      return new Response('OK'); // 不是消息，忽略
    }

    const message = update.message;
    const chatId = message.chat.id;
    
    // 3. 检查是否有图片 (photo 数组)
    // Telegram 发送图片时，photo 是一个数组，包含不同尺寸的图片。最后一个尺寸最大。
    if (!message.photo || message.photo.length === 0) {
      // 也可以考虑支持 document 类型的图片 (文件形式发送)
      if (message.document && message.document.mime_type && message.document.mime_type.startsWith('image/')) {
        // 是以文件形式发送的图片
        const fileId = message.document.file_id;
        const fileName = message.document.file_name || 'image';
        await processImage(fileId, fileName, chatId, message.message_id, TG_BOT_TOKEN, IMAGES_KV, request);
        return new Response('OK');
      }
      
      return new Response('OK'); // 忽略非图片消息
    }

    // 获取最大尺寸的图片
    const bestPhoto = message.photo[message.photo.length - 1];
    const fileId = bestPhoto.file_id;
    
    await processImage(fileId, 'photo.jpg', chatId, message.message_id, TG_BOT_TOKEN, IMAGES_KV, request);
    return new Response('OK');

  } catch (error) {
    console.error('Telegram Bot Error:', error);
    return new Response('Error: ' + error.message, { status: 500 });
  }
}

// 核心处理逻辑
async function processImage(fileId, originalName, chatId, messageId, token, kv, request) {
    // 4. 获取文件路径
    const fileInfo = await getFile(fileId, token);
    if (!fileInfo.ok) {
      await sendMessage(chatId, '❌ 获取图片信息失败', messageId, token);
      return;
    }

    const filePath = fileInfo.result.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

    // 5. 下载图片
    const imageRes = await fetch(downloadUrl);
    if (!imageRes.ok) {
        await sendMessage(chatId, '❌ 下载图片失败', messageId, token);
        return;
    }
    const imageBuffer = await imageRes.arrayBuffer();

    // 检查大小 (25MB 限制)
    if (imageBuffer.byteLength > 25 * 1024 * 1024) {
        await sendMessage(chatId, '❌ 图片过大 (>25MB)', messageId, token);
        return;
    }

    // 6. 生成文件名 (随机 + 扩展名)
    // 优先从 filePath 提取扩展名，如果没有则默认 jpg
    let ext = filePath.split('.').pop().toLowerCase();
    if (!ext || ext.length > 4) ext = 'jpg';
    
    const random = Math.random().toString(36).substring(2, 10);
    const filename = `${random}.${ext}`;

    // 7. 处理 Base64 (复用 upload.js 的优化逻辑)
    let base64Data;
    if (typeof Buffer !== 'undefined') {
        base64Data = Buffer.from(imageBuffer).toString('base64');
    } else {
        const bytes = new Uint8Array(imageBuffer);
        const len = bytes.byteLength;
        const CHUNK_SIZE = 0x8000;
        let binary = '';
        for (let i = 0; i < len; i += CHUNK_SIZE) {
            const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, len));
            binary += String.fromCharCode.apply(null, chunk);
        }
        base64Data = btoa(binary);
    }

    // 8. 存入 KV
    const storageData = {
      data: base64Data,
      metadata: {
        name: `tg_${fileId}.${ext}`, // 记录原始来源
        type: imageRes.headers.get('content-type') || 'image/jpeg',
        size: imageBuffer.byteLength,
        uploadTime: new Date().toISOString(),
        source: 'telegram'
      }
    };

    try {
        await kv.put(filename, JSON.stringify(storageData));
    } catch (e) {
        await sendMessage(chatId, `❌ 存储失败: ${e.message}`, messageId, token);
        return;
    }

    // 9. 构造返回链接
    // 获取当前请求的域名 (EdgeOne 分配的或自定义的)
    const urlObj = new URL(request.url);
    const domain = urlObj.origin;
    const imageUrl = `${domain}/i/${filename}`;

    // 10. 发送回复
    // 使用 Markdown 格式，代码块 `...` 点击即可自动复制
    const replyText = `✅ *上传成功！*\n\n` +
                      `🔗 *直链*\n` +
                      `\`${imageUrl}\`\n\n` +
                      `📝 *Markdown*\n` +
                      `\`![](${imageUrl})\`\n\n` +
                      `🌐 *HTML*\n` +
                      `\`<img src="${imageUrl}" />\`\n\n` +
                      `🤖 *BBCode*\n` +
                      `\`[img]${imageUrl}[/img]\``;

    await sendMessage(chatId, replyText, messageId, token);
}