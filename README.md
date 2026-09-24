# Moonpost · 月球来信

保留原来的五种游戏机制，重做为月球邮局主题。首页参考用户提供的构图，以银河和月面岩石为背景、暖金色按钮与月牙标志、可交互的真实月球，以及坐在岩石上抱着月信的小白兔。游戏页面沿用邮局视觉规范。

## 运行

```sh
npm install
npm run dev
```

打开 http://127.0.0.1:4173/ 。`npm run build` 执行 TypeScript 检查并输出 dist；`npm run preview` 预览构建产物。链接为本机预览，不是公网地址。

## 这版完成的变化

- 首页：新版月面场景、独立旋转的月球、岩石坐姿小白兔、玩法类型筛选、5站地图、完成状态、游园护照和下一未完成站推荐。
- 导航：各玩法共用五站切换与护照入口，返回直接定位探索地图。
- 月饼：60 秒分类挑战；开场及结算弹窗可选简单 / 中等 / 困难，整局固定难度并在成绩栏显示。传送速度分别为每秒 8% / 11% / 15% 带宽，出饼间隔 3.6 / 2.5 / 1.75 秒，开场 1 / 2 / 3 枚，同时在带上限 3 / 4 / 5 枚。正确归盘有 420ms 浮起、缩小、淡出与加分反馈（减少动态偏好下仅淡出）。保留连击、图鉴、暂停/继续、空格快捷键、离开标签页自动暂停和下一站入口；手机支持触屏玉盘和可滚动的难度弹窗。
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
  components/scene/              CosmicBackground 星空 / LunarScene 自转月球
  data/content.ts                问答题库、人格题与结果
  hooks/useSound.tsx             用户主动开启的合成音效
  lib/storage.ts                本机记录、集章事件
  lib/parkourEngine.js           双跳/碰撞/道具/三段路程
```

原深色版本保存在 `月满游园-国风参考版.zip`。更早的浅色版本在 `legacy/`。根目录旧 app.js/style.css/games 不参与当前 React 构建。

## 数据与素材

成绩、留言、印章仍保存在当前浏览器 localStorage，沿用已有键，不清除历史记录。没有多人实时留言和跨设备排行；没有替用户发送邮件或公开发布。明信片在本机生成并下载。

首页银河与月面背景来自用户提供的参考图，移出背景里原有的兔子后，单独叠放用户提供的透明坐姿兔子，使姿势和岩石座位对齐。明信片使用可编辑 SVG；月球使用原生 WebGL 球面渲染，接入 NASA CGI Moon Kit 的月面颜色与高程纹理，表现月海、陨石坑与偏左上方的暖色光照。支持缓慢自动自转、上下左右拖动旋转、四个方向键旋转及 Home 复位；拖动后暂停 3.5 秒再恢复自转，不提供缩放和月面功能标记。手机在月球上滑动旋转月球，在月球外滑动滚动页面。月球有轻微悬浮动画；离开视口或切到后台时暂停；系统开启减少动态效果时关闭自动旋转与悬浮，但仍支持手动旋转。WebGL 或月面纹理不可用时展示静态月球。public/images/moon-night.png 是上版生成插画，目前新版不使用。题材和玩法设计研究见 docs/中秋设计与玩法调研.md。

月球纹理来源：[NASA’s Scientific Visualization Studio · CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/)。素材随项目本地提供，无运行时第三方请求；详见 `public/images/moon/SOURCES.md`。

当前分支 `feat/floating-moon` 保留原首页布局。曾探索的整屏月球版本保存在 `feat/interactive-moon`，未合入当前页面。

月球经度接缝已修正：球面经度跨界使用连续双线性采样，避免隐式 mip 层级跳变；极点法线使用安全切线计算。

## Cloudflare Pages deployment

Connect the GitHub repository `Yiyang0659/Moonpost` through **Workers & Pages > Create > Pages > Import an existing Git repository**.

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | React (Vite), or None with the settings below |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Leave empty (repository root) |
| Node.js version | `22` (specified in `.nvmrc`) |

No API keys or runtime environment variables are required. After deployment, use the actual `*.pages.dev` URL shown by Cloudflare. Future pushes to `main` trigger automatic builds. Use the Pages workflow, not the Workers script deployment workflow; no Wrangler deploy command is needed.

The app uses hash routes such as `/#/parkour`, so no server-side route rewriting is needed. Only `dist` is published. Player progress and wishes remain local to each browser; hosting does not enable shared messages or cross-device saves.

Official configuration reference: https://developers.cloudflare.com/pages/configuration/build-configuration/
