# 贡献指南

感谢你考虑为 Zimmer 项目做出贡献！

## 行为准则

本项目采用 Contributor Covenant 行为准则。通过参与本项目，你同意遵守其条款。

## 如何贡献

### 报告 Bug

1. 使用 GitHub Issues 搜索确认该 Bug 尚未被报告
2. 如果你找不到相关的 issue，创建一个新的
3. 请尽可能详细地描述问题，包括：
   - 问题的具体表现
   - 复现步骤
   - 预期行为
   - 截图（如果适用）
   - 运行环境（操作系统、浏览器版本等）

### 提交新功能建议

1. 先在 Issues 中提出建议
2. 说明新功能的使用场景和预期效果
3. 等待社区反馈和讨论

### 提交代码

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m '添加某个特性'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起 Pull Request

### 代码风格

- 使用2空格缩进
- 遵循 ESLint 配置
- CSS 类名使用 kebab-case
- JavaScript 变量和函数使用 camelCase
- 保持代码简洁清晰，添加必要的注释

### 提交信息规范

使用清晰的提交信息，格式如下：

```
类型: 简短的描述

详细的说明文本（如果需要）
```

类型可以是：
- feat: 新功能
- fix: 修复
- docs: 文档更新
- style: 代码格式（不影响代码运行的变动）
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

### 分支管理

- main: 主分支，保持稳定
- develop: 开发分支
- feature/*: 新功能分支
- fix/*: 修复分支

## 开发设置

1. 安装依赖
```bash
npm install
```

2. 运行开发服务器
```bash
npm run dev
```

3. 运行测试
```bash
npm test
```

## 发布流程

1. 更新版本号
2. 更新 CHANGELOG.md
3. 创建发布标签
4. 推送到 GitHub

## 获取帮助

如果你在贡献过程中需要帮助：
- 查看文档
- 在 Issues 中提问
- 通过电子邮件联系维护者

再次感谢你的贡献！ 