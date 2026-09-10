import { Temporal } from 'temporal-polyfill';
import qrcode from 'qrcode-generator';

export const DEFAULT_OPTIONS = {
  size: 256,
  backgroundColor: '#FEF9E7',
  colorBackground: 'linear-gradient(135deg, #E3F2FD, #FFFFFF)',
  gradientColors: ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'],
  updateInterval: 1000,
  padding: 4,
  crossfadeDuration: 300,
  showToggle: true
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

function createToggle(isColorMode, onChange) {
  const label = document.createElement('label');
  label.className = 'qr-toggle';
  Object.assign(label.style, {
    position: 'relative',
    display: 'inline-block',
    width: '48px',
    height: '24px',
    marginTop: '24px',
    cursor: 'pointer'
  });

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = isColorMode;
  Object.assign(input.style, {
    opacity: '0',
    width: '0',
    height: '0',
    position: 'absolute'
  });

  const slider = document.createElement('span');
  Object.assign(slider.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: isColorMode ? '#81D4FA' : '#ccc',
    borderRadius: '24px',
    transition: 'background-color 0.3s'
  });

  const knob = document.createElement('span');
  Object.assign(knob.style, {
    position: 'absolute',
    height: '18px',
    width: '18px',
    left: '3px',
    bottom: '3px',
    backgroundColor: 'white',
    borderRadius: '50%',
    transition: 'transform 0.3s',
    transform: isColorMode ? 'translateX(24px)' : 'translateX(0)'
  });

  slider.appendChild(knob);
  label.appendChild(input);
  label.appendChild(slider);

  input.addEventListener('change', () => {
    const checked = input.checked;
    slider.style.backgroundColor = checked ? '#81D4FA' : '#ccc';
    knob.style.transform = checked ? 'translateX(24px)' : 'translateX(0)';
    onChange(checked);
  });

  return label;
}

export function renderQrClock(container, userOptions = {}) {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };
  const root = resolveContainer(container);
  let isColorMode = true;
  let currentText = formatTime();

  Object.assign(root.style, {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    margin: '0',
    padding: '0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: options.colorBackground
  });

  const wrapper = document.createElement('div');
  Object.assign(wrapper.style, {
    position: 'relative',
    width: `${options.size}px`,
    height: `${options.size}px`,
    flexShrink: '0'
  });
  root.appendChild(wrapper);

  const canvases = [document.createElement('canvas'), document.createElement('canvas')];
  canvases.forEach(canvas => {
    Object.assign(canvas.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      transition: `opacity ${options.crossfadeDuration}ms ease-in-out`,
      opacity: '0'
    });
    wrapper.appendChild(canvas);
  });

  canvases[0].style.opacity = '1';
  let currentIndex = 0;
  let intervalId = null;
  let toggleEl = null;

  function getRenderOptions() {
    return {
      ...options,
      gradientColors: isColorMode ? options.gradientColors : ['#000000']
    };
  }

  function applyBackground() {
    root.style.background = isColorMode ? options.colorBackground : options.backgroundColor;
  }

  function renderFrame() {
    const nextIndex = currentIndex ^ 1;
    renderQrToCanvas(canvases[nextIndex], currentText, getRenderOptions());
    canvases[currentIndex].style.opacity = '0';
    canvases[nextIndex].style.opacity = '1';
    currentIndex = nextIndex;
  }

  function tick() {
    currentText = formatTime();
    renderFrame();
  }

  if (options.showToggle) {
    toggleEl = createToggle(isColorMode, (checked) => {
      isColorMode = checked;
      applyBackground();
      renderFrame();
    });
    root.appendChild(toggleEl);
  }

  tick();
  intervalId = setInterval(tick, options.updateInterval);

  return {
    destroy() {
      if (intervalId) clearInterval(intervalId);
      canvases.forEach(c => c.remove());
      if (toggleEl) toggleEl.remove();
      wrapper.remove();
      intervalId = null;
    }
  };
}
