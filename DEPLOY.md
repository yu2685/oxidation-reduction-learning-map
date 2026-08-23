# 发布给测试者

本目录是可独立发布的静态站点。仓库根目录只需包含：

- `index.html`
- `app.js`
- `styles.css`
- `assets/`
- `.nojekyll`

不要把外层的高考整卷 PDF 目录加入公开仓库。线上页面会把“源 PDF”显示为“仅本地”，本地 `file://` 打开时仍可访问原文件。

## GitHub Pages

1. 将本目录作为单独 Git 仓库推送到 GitHub。
2. 在仓库 `Settings → Pages` 中选择 `Deploy from a branch`。
3. 选择 `main` 分支和 `/(root)` 目录，保存。
4. 等待 Pages 完成部署后，将生成的网址发给测试者。

站点不包含登录、数据库或学生数据持久化。测试者的断连标记只保存在当前浏览器页面内存中，刷新即清空。
