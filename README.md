# QR Code Clock

一个极简的二维码时钟：每秒钟生成一个包含当前时间的二维码。

## 预览

访问 GitHub Pages 查看效果：
https://kongolou.github.io/qr-code-clock

## 文件

- `index.html` — 完整实现（单文件 HTML + JS）

## 原理

使用 [QRCode.js](https://github.com/davidshimjs/qrcodejs) 库，每秒读取当前时间并渲染为二维码。
