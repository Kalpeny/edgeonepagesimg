# 🖼️ EdgeOne Pages 图床

<p align="center">
  <a href="https://edgeone.cloud.tencent.com/pages">
    <img src="https://img.shields.io/badge/Powered%20by-EdgeOne%20Pages-orange?style=flat-square" alt="EdgeOne Pages">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License">
  </a>
  <img src="https://img.shields.io/badge/Stack-Vanilla%20JS-green.svg?style=flat-square" alt="Stack">
  <img src="https://img.shields.io/badge/Storage-KV%20Storage-blueviolet.svg?style=flat-square" alt="Storage">
</p>

<p align="center">
  一个基于 EdgeOne Pages 和 KV 存储的开源图床服务，无需服务器即可部署
</p>

<p align="center">
  <a href="#-部署到-edgeone-pages">快速部署</a>
  ·
  <a href="#-功能特性">功能介绍</a>
  ·
  <a href="#-使用演示">使用演示</a>
</p>

## 📸 项目演示

### 主界面
![主界面](https://img.shields.io/badge/-%E4%B8%8A%E4%BC%A0%E7%95%8C%E9%9D%A2-blue)
简洁的拖拽上传界面，支持点击和拖拽两种方式上传图片。

### 后台管理
![后台管理](https://img.shields.io/badge/-%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86-green)
查看所有已上传的图片，支持复制链接和删除操作。

## ✨ 功能特性

| 功能 | 描述 | 状态 |
|------|------|------|
| 🌍 **全球加速** | 基于 EdgeOne 全球边缘网络 | ✅ |
| 💾 **KV 存储** | 无需数据库，使用 EdgeOne KV 存储 | ✅ |
| 📤 **拖拽上传** | 支持拖拽和点击上传 | ✅ |
| 🎨 **在线预览** | 上传后立即预览图片 | ✅ |
| 📋 **一键复制** | 支持 Markdown、HTML 和直接链接 | ✅ |
| 🗂️ **图片管理** | 查看、复制、删除图片 | ✅ |
| 📱 **响应式设计** | 完美适配手机和电脑 | ✅ |
| 🔒 **密码保护** | 后台管理支持密码验证 | ✅ |
| 🚀 **一键部署** | 支持 CLI 和控制台部署 | ✅ |

## 🚀 快速开始

### 📦 一键部署到 EdgeOne Pages

<p align="center">
  <a href="https://edgeone.cloud.tencent.com/pages/templates/detail/image-hosting">
    <img src="https://cdn.jsdelivr.net/gh/lencx/static@main/2024/04/button-2.svg" alt="Deploy to EdgeOne Pages" height="40">
  </a>
</p>

### 🔧 手动部署

#### 1. 克隆项目

```bash
git clone https://github.com/yourusername/image-hosting.git
cd image-hosting
```

#### 2. 配置 KV 存储

在 `wrangler.toml` 中替换你的 KV 命名空间 ID：

```toml
[[kv_namespaces]]
binding = "IMAGES"
id = "your_kv_namespace_id"
```

#### 3. 部署到 EdgeOne Pages

**方式一：使用 CLI（推荐）**

```bash
# 安装 CLI
npm install -g @edgeone/pages-cli

# 登录
eop auth login

# 部署
eop deploy
```

**方式二：使用控制台**

1. 登录 [EdgeOne Pages 控制台](https://console.cloud.tencent.com/edgeone/pages)
2. 创建项目
3. 上传项目文件
4. 绑定 KV 命名空间（变量名：`IMAGES`）
5. 部署

## 📁 项目结构

```
.
├── functions/                          # EdgeOne Pages Functions
│   ├── upload.js                      # POST /upload - 图片上传
│   ├── list.js                        # GET /list - 图片列表
│   ├── delete.js                      # POST /delete - 删除图片
│   ├── admin-list.js                  # GET /admin-list - 管理列表
│   ├── admin-delete.js                # POST /admin-delete - 管理删除
│   ├── debug-list.js                  # GET /debug-list - 调试用
│   ├── test.js                        # GET /test - 测试接口
│   ├── simple-test.js                 # GET /simple-test - 简单测试
│   ├── _middleware.js                 # 中间件
│   ├── _config.js                     # 配置文件
│   └── i/
│       └── [filename].js              # GET /i/:filename - 图片访问
├── src/
│   └── index.js                       # 源代码入口
├── index.html                         # 主页面（上传功能）
├── admin.html                         # 后台管理页面
├── wrangler.toml                      # EdgeOne 配置
├── package.json                       # 项目配置
├── _routes.json                       # 路由配置
├── _config.yml                        # 页面配置
├── deploy.sh                          # 部署脚本
└── README.md                          # 项目说明
```

## 🔌 API 文档

### 上传图片

```http
POST /upload
Content-Type: multipart/form-data

image: <文件>
```

**响应示例：**
```json
{
  "success": true,
  "filename": "xfpr70vz.jpg",
  "url": "/i/xfpr70vz.jpg",
  "originalName": "300.jpg",
  "size": 62081
}
```

### 获取图片列表

```http
GET /list
```

**响应示例：**
```json
{
  "success": true,
  "count": 10,
  "images": [
    {
      "filename": "xfpr70vz.jpg",
      "url": "/i/xfpr70vz.jpg",
      "metadata": {
        "name": "300.jpg",
        "type": "image/jpeg",
        "size": 62081,
        "uploadTime": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

### 删除图片

```http
POST /delete
Content-Type: application/json

{
  "filename": "xfpr70vz.jpg"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "删除成功",
  "filename": "xfpr70vz.jpg"
}
```

### 访问图片

```http
GET /i/{filename}
```

直接返回图片文件。

## 🎨 使用示例

### 在 Markdown 中使用

```markdown
![图片描述](https://your-domain.com/i/xfpr70vz.jpg)
```

### 在 HTML 中使用

```html
<img src="https://your-domain.com/i/xfpr70vz.jpg" alt="图片描述">
```

### 在论坛/社交媒体中使用

```
https://your-domain.com/i/xfpr70vz.jpg
```

## ⚙️ 配置说明

### KV 存储配置

在 `wrangler.toml` 中配置：

```toml
name = "image-hosting"
main = "src/index.js"
compatibility_date = "2024-01-01"

# KV 命名空间绑定
[[kv_namespaces]]
binding = "IMAGES"              # 函数中使用的变量名
id = "your_kv_namespace_id"     # 在控制台创建后获取
```

### 路由配置

`_routes.json`：

```json
{
  "routes": [
    {
      "pattern": "/i/*",
      "function": "i/[filename]"
    }
  ]
}
```

### 后台管理密码配置

后台管理页面（`/admin`）支持密码保护，防止未授权访问。

#### 修改密码

编辑 `functions/admin-list.js` 和 `functions/admin-delete.js`：

```javascript
// functions/admin-list.js 第 2 行
const ADMIN_PASSWORD = 'your-password';  // 修改为你的密码

// functions/admin-delete.js 第 2 行
const ADMIN_PASSWORD = 'your-password';  // 修改为你的密码
```

#### 默认密码

默认密码为：`admin123`

**⚠️ 重要提示**：
- 部署前务必修改默认密码
- 前后端密码必须保持一致
- 建议设置强密码（包含字母、数字、特殊字符）

#### 访问后台

1. 部署后访问：`https://your-domain.com/admin`
2. 输入密码后即可管理图片
3. 密码验证通过后会话期间无需再次输入

## 📊 存储限制

### EdgeOne Pages KV 免费额度

| 资源 | 限制 |
|------|------|
| **总存储容量** | 1 GB |
| **单文件大小** | 25 MB |
| **每日读取** | 100,000 次 |
| **每日写入** | 1,000 次 |
| **每日删除** | 1,000 次 |
| **每日列出** | 1,000 次 |

### 估算存储量

| 图片类型 | 平均大小 | 1GB 可存储 |
|---------|---------|-----------|
| 小图片（表情包） | 100 KB | ~10,000 张 |
| 中等图片（普通照片） | 500 KB | ~2,000 张 |
| 大图片（高清照片） | 2 MB | ~500 张 |

**保守估算**：1GB KV 存储 ≈ **2,000 张图片**

## 🚀 高级功能扩展

你可以根据需求扩展以下功能：

- [ ] **用户认证** - 添加登录功能
- [ ] **图片分类** - 添加标签和分类
- [ ] **批量操作** - 批量上传和删除
- [ ] **图片优化** - 自动压缩和转换
- [ ] **访问统计** - 统计图片访问次数
- [ ] **自定义域名** - 绑定自己的域名
- [ ] **图片水印** - 自动添加水印
- [ ] **权限控制** - 私有/公开切换

## 🐛 常见问题

### Q: 部署后提示 "KV 存储未正确绑定"

**A**: 检查以下步骤：
1. KV 命名空间是否创建
2. 变量名是否为 `IMAGES`（全大写）
3. 重新绑定后是否重新部署

### Q: 上传成功但无法访问图片

**A**: 
1. 检查图片读取函数是否正确部署
2. 确认 KV 中已存储数据
3. 检查路由配置是否正确

### Q: 如何查看已用存储容量？

**A**: 在 EdgeOne Pages 控制台「KV 存储」页面查看。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发环境搭建

```bash
# 克隆项目
git clone https://github.com/yourusername/image-hosting.git
cd image-hosting

# 安装依赖（如果需要）
npm install

# 本地测试
npm run dev
```

### 提交规范

- 使用清晰的提交信息
- 添加必要的注释
- 更新相关文档

## 📄 开源协议

[MIT License](LICENSE)

## 💡 相关链接

- [EdgeOne Pages 官方文档](https://edgeone.cloud.tencent.com/pages)
- [EdgeOne KV 存储文档](https://edgeone.cloud.tencent.com/pages/document/162936897742577664)
- [腾讯云控制台](https://console.cloud.tencent.com/)

---

<p align="center">
  ⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
</p>

<p align="center">
  🐛 遇到问题？欢迎 <a href="https://github.com/yourusername/image-hosting/issues">提交 Issue</a>
</p>

<p align="center">
  💬 想要贡献代码？欢迎 <a href="https://github.com/yourusername/image-hosting/pulls">提交 Pull Request</a>
</p>
