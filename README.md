# n8n-nodes-weread

这是一个 n8n 社区节点，让你可以在 n8n 工作流中使用微信读书 API。

微信读书是腾讯推出的一款阅读应用，提供丰富的图书资源和社交阅读功能。本节点支持获取书架、书籍信息、笔记、划线、阅读进度等数据。

## 安装

按照 n8n 社区节点文档中的[安装指南](https://docs.n8n.io/integrations/community-nodes/installation/)进行安装。

```bash
npm install n8n-nodes-weread
```

## 已支持功能

### ✅ 书架 (Bookshelf)
- **获取含笔记的书架** - 获取包含笔记、划线、想法的书籍列表
- **获取完整书架** - 获取书架上所有书籍及阅读进度

### ✅ 书籍 (Book)
- **获取书籍信息** - 获取指定书籍的详细信息（作者、出版社、ISBN、评分等）

### ✅ 笔记/想法 (Notes)
- **获取笔记和想法** - 获取指定书籍的所有笔记和想法

### ✅ 划线 (Bookmarks)
- **获取划线列表** - 获取指定书籍的所有划线记录

### ✅ 阅读进度 (Progress)
- **获取阅读进度** - 获取指定书籍的阅读进度和阅读时长

### ✅ 书评 (Reviews)
- **获取热门书评** - 获取指定书籍的热门书评列表

### ✅ 章节 (Chapters)
- **获取章节信息** - 获取指定书籍的所有章节信息

## 凭证配置

本节点支持两种 Cookie 获取方式：**手动输入** 和 **CookieCloud 自动同步**。

### 方式一：手动输入 Cookie

#### 如何获取 Cookie

1. 使用浏览器访问 [https://weread.qq.com](https://weread.qq.com) 并登录
2. 按 **F12** 打开浏览器开发者工具
3. 切换到 **Network**（网络）标签
4. 刷新页面或进行任意操作
5. 找到任意 `weread.qq.com` 域名的请求
6. 在 **Headers**（请求头）中找到并复制完整的 **Cookie** 值
7. 在 n8n 中创建**微信读书 API** 凭证，选择 **手动输入**，粘贴 Cookie

### 方式二：CookieCloud 自动同步

使用 [CookieCloud](https://github.com/easychen/CookieCloud) 可以自动同步浏览器 Cookie，无需手动复制粘贴。

#### 配置步骤

1. 部署 CookieCloud 服务器（参考 [CookieCloud 文档](https://github.com/easychen/CookieCloud)）
2. 在浏览器中安装 CookieCloud 扩展并配置
3. 在浏览器中登录微信读书，CookieCloud 会自动同步 Cookie
4. 在 n8n 中创建**微信读书 API** 凭证，选择 **CookieCloud**
5. 填写以下信息：
   - **CookieCloud 服务器地址** - 你的 CookieCloud 服务器 URL（例如：`https://your-cookiecloud-server.com`）
   - **CookieCloud UUID** - 在 CookieCloud 扩展中获取
   - **CookieCloud 密码** - 在 CookieCloud 扩展中设置的加密密码

#### CookieCloud 优势

- ✅ **自动同步** - Cookie 过期后自动从 CookieCloud 获取最新值
- ✅ **端对端加密** - Cookie 在传输和存储过程中都经过加密
- ✅ **多设备共享** - 可以在多个 n8n 实例中共享同一个 CookieCloud 配置
- ✅ **无需手动更新** - 浏览器 Cookie 更新后，n8n 会自动使用最新的 Cookie

#### 域名配置说明

CookieCloud 会自动从以下微信读书相关域名提取 Cookie：
- `.weread.qq.com` - 微信读书主域名
- `weread.qq.com` - 微信读书根域名
- `.qq.com` - QQ 通用域名

>  **提示**：确保你在安装了 CookieCloud 扩展的浏览器中访问并登录了 [https://weread.qq.com](https://weread.qq.com)，这样 CookieCloud 才能同步到相关的 Cookie。

### 凭证字段说明

- **Cookie 来源** (必选) - 选择 `手动输入` 或 `CookieCloud`
- **Cookie** (手动输入时必填) - 从浏览器开发者工具中获取的完整 Cookie 字符串
- **CookieCloud 服务器地址** (CookieCloud 模式必填) - CookieCloud 服务器 URL
- **CookieCloud UUID** (CookieCloud 模式必填) - CookieCloud 的 UUID
- **CookieCloud 密码** (CookieCloud 模式必填) - CookieCloud 的加密密码
- **User-Agent** (可选) - 浏览器 User-Agent，默认已提供

### 凭证测试说明

- **手动输入模式**：保存凭证时会自动测试 Cookie 有效性
- **CookieCloud 模式**：由于需要先从 CookieCloud 服务器获取并解密 Cookie，凭证测试在工作流执行时进行。保存后直接在节点中使用，如果配置正确会正常工作
- 如测试失败，常见原因：
  - CookieCloud 配置错误 - 检查服务器地址、UUID 和密码是否正确
  - Cookie 已过期 - 请刷新浏览器中的微信读书登录
  - 网络问题 - 检查网络连接，特别是到 CookieCloud 服务器的连接

### 其他注意事项

- Cookie 具有时效性，过期后需要重新获取（使用 CookieCloud 可自动同步）
- 请保护好你的 Cookie 和 CookieCloud 凭证，不要分享给他人
- 仅供个人学习和研究使用，请勿用于商业用途
- 建议请求间隔至少 500ms，避免频繁请求被限制

## 许可证

[MIT](LICENSE.md)

## 支持

如有问题或建议，请在 [GitHub Issues](https://github.com/funcodingdev/n8n-nodes-weread/issues) 中提出。

## 相关链接

- [n8n 社区节点文档](https://docs.n8n.io/integrations/#community-nodes)
- [微信读书官网](https://weread.qq.com/)
- [项目仓库](https://github.com/funcodingdev/n8n-nodes-weread)
