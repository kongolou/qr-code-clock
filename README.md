# qr-code-clock

一个二维码时钟：每秒钟生成一个包含当前时间的二维码，并以淡入淡出效果切换。支持彩色/黑白模式切换开关。

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
  import { renderQrCodeClock } from 'qr-code-clock';
  renderQrCodeClock('#app');
</script>
```

## API

### `renderQrCodeClock(container, options)`

- **container** `string | HTMLElement` — 容器选择器或 DOM 元素。
- **options** `object` — 可选配置。

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `number` | `256` | 二维码尺寸（像素） |
| `backgroundColor` | `string` | `'#FEF9E7'` | 黑白模式背景颜色 |
| `colorBackground` | `string` | `'linear-gradient(135deg, #E3F2FD, #FFFFFF)'` | 彩色模式背景 |
| `gradientColors` | `string[]` | `['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA']` | 马卡龙渐变色 |
| `updateInterval` | `number` | `1000` | 更新间隔（毫秒） |
| `padding` | `number` | `4` | 静默区模块数 |
| `crossfadeDuration` | `number` | `300` | 淡入淡出时长（毫秒） |
| `showToggle` | `boolean` | `true` | 是否显示彩色/黑白切换开关 |

## 版本说明

### 2.0.0

- **Breaking Change**: 导出函数从 `renderQrClock` 重命名为 `renderQrCodeClock`。
- 新增颜色/黑白切换开关。

## 本地开发

```bash
pnpm install
pnpm dev
```

运行测试：

```bash
pnpm test:ci
```

构建 demo：

```bash
pnpm build
```

## 自动部署

推送 `main` 分支后，GitHub Actions 会自动运行测试、构建 demo 并部署到 `gh-pages` 分支。
