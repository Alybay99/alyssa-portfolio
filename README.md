# 个人网页

这是一个可直接打开的静态个人作品集网页，用来展示照片、视频、长文章和短文。

## 如何预览

建议用本地预览地址打开网页，例如：

`http://127.0.0.1:8000/index.html`

这个版本的网页内容保存在 `content/site.json`，后台也会修改这个文件。

## 在线后台方式

这个版本已经加了 `/admin` 后台入口。发布到 Netlify 并连接 GitHub 后，可以访问：

`https://你的网站地址/admin/`

注意：如果只是把文件夹拖到 Netlify Drop，网页可以看，但后台不能保存内容。后台保存需要 GitHub 仓库，因为后台会把修改写回 GitHub，再由 Netlify 自动更新网页。

第一次启用后台需要：

1. 把这个文件夹上传到一个 GitHub 仓库
2. 在 Netlify 里选择 “Import from Git”，连接这个 GitHub 仓库
3. 在 Netlify 里打开 Identity
4. 在 Netlify 里打开 Git Gateway
5. 邀请你自己的邮箱成为后台用户
6. 打开 `https://你的网站地址/admin/` 登录编辑

后台编辑的数据保存在 `content/site.json`。以后主要用后台更新内容即可，不需要再改 `网站内容.txt`。

## 生成的示例封面

示例封面图由内置图像生成工具创建，并已复制到：

`assets/hero-archive.png`
