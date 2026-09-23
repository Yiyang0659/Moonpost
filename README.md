# 月球来信 · 中秋探索计划

保留原来的五种游戏机制，重做为现代月球邮局主题。深灰星空、冷白星尘、少量暖金色点缀，以及自转月球和互动玉兔；游戏页面也使用同一视觉规范。

## 运行

```sh
npm install
npm run dev
```

打开 http://127.0.0.1:4173/ 。`npm run build` 执行 TypeScript 检查并输出 dist；`npm run preview` 预览构建产物。链接为本机预览，不是公网地址。

## 这版完成的变化

- 首页：玩法类型筛选、5站地图、完成状态、游园护照和下一未完成站推荐。
- 导航：各玩法共用五站切换与护照入口，返回直接定位探索地图。
- 月饼：保留60秒分类、连击、提速和图鉴；新增暂停/继续、空格快捷键、离开标签页自动暂停、当前待分拣文字提示与结果下一站入口。
- 问答、人格、留言、跑酷：保留已有核心流程，统一到深空邮局视觉。
- 明信片：3种配色、昵称与60字祝福、实时预览、SVG图片导出、复制祝福；无需服务器。

## 文件职责

```
src/
  App.tsx                        路由、返回定位、提示
  index.css                      新主题变量、基础排版、全站导航
  theme-post.css                 五种玩法的邮局主题外观
  pages/
    HomePage.tsx + home.css       邮局首页、筛选、护照、SVG插画
    MooncakePage.tsx              月饼计时/移动/归盘/暂停
    QuizPage.tsx                  随机八题、解析与成绩
    PersonaPage.tsx               十二题、六类结果
    WallPage.tsx                  本机留言与漂浮祝福
    ParkourPage.tsx               Canvas跑酷引擎挂载
    PostcardPage.tsx              明信片编辑与SVG导出
    postcard.css                 明信片布局
  components/game/
    GameLayout.tsx               游戏共用导航、护照计数、下一站
    MooncakeSprite.tsx           五种月饼表情和花瓣
    SoundToggle.tsx              互动音效开关
  components/scene/              CosmicBackground 星空 / LunarScene 自转月球与互动玉兔
  data/content.ts                问答题库、人格题与结果
  hooks/useSound.tsx             用户主动开启的合成音效
  lib/storage.ts                本机记录、集章事件
  lib/parkourEngine.js           双跳/碰撞/道具/三段路程
```

原深色版本保存在 `月满游园-国风参考版.zip`。更早的浅色版本在 `legacy/`。根目录旧 app.js/style.css/games 不参与当前 React 构建。

## 数据与素材

成绩、留言、印章仍保存在当前浏览器 localStorage，沿用已有键，不清除历史记录。没有多人实时留言和跨设备排行；没有替用户发送邮件或公开发布。明信片在本机生成并下载。

玉兔与明信片使用可编辑SVG代码，月球使用 Canvas 球面纹理采样实现自转。星尘预先缓存绘制；月球在离开视口时暂停，全局动画在切到后台或系统开启减少动态效果时暂停。设计参考本地「宇宙星空前端交互」的星尘层次、细线和留白。public/images/moon-night.png是上版生成插画，目前新版不使用。题材和玩法设计研究见 docs/中秋设计与玩法调研.md；其中明确区分来源事实与本项目设计建议。
