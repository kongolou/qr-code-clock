import { Temporal } from 'temporal-polyfill';
import qrcode from 'qrcode-generator';

export const DEFAULT_OPTIONS = {
  size: 256,
  backgroundColor: '#FEF9E7',
  gradientColors: ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'],
  updateInterval: 1000,
  padding: 4,
  crossfadeDuration: 300
};

export function formatTime() {
  const now = Temporal.Now.plainTimeISO();
  return now.toString({ smallestUnit: 'seconds' });
}

export function resolveContainer(container) {
  if (typeof container === 'string') {
    const el = document.querySelector(container);
    if (!el) throw new Error(`qr-code-clock: container "${container}" not found`);
    return el;
  }
  if (container instanceof HTMLElement) return container;
  throw new Error('qr-code-clock: container must be a selector string or HTMLElement');
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function createGradient(ctx, size, colors) {
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  const step = 1 / Math.max(1, colors.length - 1);
  colors.forEach((color, i) => gradient.addColorStop(i * step, color));
  return gradient;
}

export function renderQrToCanvas(canvas, text, options) {
  const { size, padding, gradientColors } = options;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const qr = qrcode(0, 'H');
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const cellSize = size / (count + padding * 2);
  const offset = padding * cellSize;
  const dotSize = cellSize * 0.82;
  const gap = (cellSize - dotSize) / 2;
  const radius = dotSize * 0.25;

  const gradient = createGradient(ctx, size, gradientColors);
  ctx.fillStyle = gradient;

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        const x = offset + col * cellSize + gap;
        const y = offset + row * cellSize + gap;
        roundRect(ctx, x, y, dotSize, dotSize, radius);
      }
    }
  }
}

export function renderQrClock(container, userOptions = {}) {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };
  const root = resolveContainer(container);

  Object.assign(root.style, {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    margin: '0',
    padding: '0',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: options.backgroundColor
  });

  const canvases = [document.createElement('canvas'), document.createElement('canvas')];
  canvases.forEach(canvas => {
    Object.assign(canvas.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      transition: `opacity ${options.crossfadeDuration}ms ease-in-out`,
      opacity: '0'
    });
    root.appendChild(canvas);
  });

  canvases[0].style.opacity = '1';
  let currentIndex = 0;
  let intervalId = null;

  function tick() {
    const text = formatTime();
    const nextIndex = currentIndex ^ 1;
    renderQrToCanvas(canvases[nextIndex], text, options);
    canvases[currentIndex].style.opacity = '0';
    canvases[nextIndex].style.opacity = '1';
    currentIndex = nextIndex;
  }

  tick();
  intervalId = setInterval(tick, options.updateInterval);

  return {
    destroy() {
      if (intervalId) clearInterval(intervalId);
      canvases.forEach(c => c.remove());
      intervalId = null;
    }
  };
}
