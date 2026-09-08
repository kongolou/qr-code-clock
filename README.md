# qr-code-clock

一个纯净的二维码时钟：使用柔和淡黄色背景，每秒钟以马卡龙渐变色生成一个包含当前时间的二维码，并以淡入淡出效果切换。

## 在线预览

<https://kongolou.github.io/qr-code-clock>

## 安装

```bash
npm install qr-code-clock
```

## 使用

```html
<div id="app"></div>
<script type="module">
  import { renderQrClock } from 'qr-code-clock';
  renderQrClock('#app');
</script>
```

## API

### `renderQrClock(container, options)`

- **container** `string | HTMLElement` — 容器选择器或 DOM 元素。
- **options** `object` — 可选配置。

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `number` | `256` | 二维码尺寸（像素） |
| `backgroundColor` | `string` | `'#FEF9E7'` | 背景颜色 |
| `gradientColors` | `string[]` | `['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA']` | 马卡龙渐变色 |
| `updateInterval` | `number` | `1000` | 更新间隔（毫秒） |
| `padding` | `number` | `4` | 静默区模块数 |
| `crossfadeDuration` | `number` | `300` | 淡入淡出时长（毫秒） |

## 本地开发

```bash
npm install
npm run dev
```

构建 demo：

```bash
npm run build
```

## 自动部署

推送 `main` 分支后，GitHub Actions 会自动构建 demo 并部署到 `gh-pages` 分支。
