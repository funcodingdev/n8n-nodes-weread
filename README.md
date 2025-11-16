# n8n-nodes-weread

这是一个 n8n 社区节点，让你可以在 n8n 工作流中使用微信读书 API。

微信读书是腾讯推出的一款阅读应用，提供丰富的图书资源和社交阅读功能。本节点支持获取书架、书籍信息、笔记、划线、阅读进度等数据。

## 安装

按照 n8n 社区节点文档中的[安装指南](https://docs.n8n.io/integrations/community-nodes/installation/)进行安装。

```bash
npm install n8n-nodes-weread
```

## 支持的功能

### 📚 书架 (Bookshelf)
- 获取含笔记的书架 - 获取包含笔记、划线、想法的书籍列表
- 获取完整书架 - 获取书架上所有书籍及阅读进度

### 📖 书籍 (Book)
- 获取书籍信息 - 获取指定书籍的详细信息（作者、出版社、ISBN、评分等）

### 📝 笔记/想法 (Notes)
- 获取笔记和想法 - 获取指定书籍的所有笔记和想法

### 🎨 划线 (Bookmarks)
- 获取划线列表 - 获取指定书籍的所有划线记录

### ⏱️ 阅读进度 (Progress)
- 获取阅读进度 - 获取指定书籍的阅读进度和阅读时长

### ⭐ 书评 (Reviews)
- 获取热门书评 - 获取指定书籍的热门书评列表

### 📑 章节 (Chapters)
- 获取章节信息 - 获取指定书籍的所有章节信息

## 凭证配置

### 获取 Cookie

1. 访问 [https://weread.qq.com](https://weread.qq.com) 并登录
2. 按 **F12** 打开浏览器开发者工具
3. 切换到 **Network** 标签
4. 刷新页面或进行任意操作
5. 找到任意 `weread.qq.com` 域名的请求
6. 在 **Headers** 中复制完整的 **Cookie** 值
7. 在 n8n 中创建凭证，粘贴 Cookie 值

### 凭证参数说明

- **Cookie** - 从浏览器开发者工具中获取的完整 Cookie 字符串
- **User-Agent** (可选) - 浏览器 User-Agent，默认已提供

### 注意事项

- Cookie 具有时效性，过期后需要重新获取
- 请保护好你的 Cookie 和凭证，不要分享给他人
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
