import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatTime,
  resolveContainer,
  renderQrToCanvas,
  renderQrClock,
  DEFAULT_OPTIONS
} from '../src/index.js';

describe('formatTime', () => {
  it('returns HH:MM:SS format', () => {
    const time = formatTime();
    expect(time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});

describe('DEFAULT_OPTIONS', () => {
  it('has expected defaults', () => {
    expect(DEFAULT_OPTIONS.size).toBe(256);
    expect(DEFAULT_OPTIONS.backgroundColor).toBe('#FEF9E7');
    expect(DEFAULT_OPTIONS.gradientColors).toHaveLength(5);
    expect(DEFAULT_OPTIONS.updateInterval).toBe(1000);
    expect(DEFAULT_OPTIONS.padding).toBe(4);
    expect(DEFAULT_OPTIONS.crossfadeDuration).toBe(300);
  });
});

describe('resolveContainer', () => {
  it('resolves a selector string', () => {
    const el = document.createElement('div');
    el.id = 'qr-root';
    document.body.appendChild(el);
    expect(resolveContainer('#qr-root')).toBe(el);
    el.remove();
  });

  it('resolves an HTMLElement', () => {
    const el = document.createElement('div');
    expect(resolveContainer(el)).toBe(el);
  });

  it('throws when selector is not found', () => {
    expect(() => resolveContainer('#missing')).toThrow('not found');
  });

  it('throws for invalid input', () => {
    expect(() => resolveContainer(123)).toThrow('must be a selector string or HTMLElement');
  });
});

describe('renderQrToCanvas', () => {
  function createMockCanvas() {
    const gradient = { addColorStop: vi.fn() };
    const ctx = {
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      arcTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      createLinearGradient: vi.fn(() => gradient)
    };
    return {
      ctx,
      gradient,
      canvas: {
        getContext: vi.fn(() => ctx),
        width: 0,
        height: 0,
        style: {}
      }
    };
  }

  it('draws QR modules on the canvas', () => {
    const { canvas, ctx } = createMockCanvas();
    renderQrToCanvas(canvas, '12:34:56', DEFAULT_OPTIONS);

    expect(canvas.getContext).toHaveBeenCalledWith('2d');
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.createLinearGradient).toHaveBeenCalled();
    expect(ctx.fill.mock.calls.length).toBeGreaterThan(0);
  });
});

function createMockContext() {
  const gradient = { addColorStop: vi.fn() };
  return {
    gradient,
    ctx: {
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      arcTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      createLinearGradient: vi.fn(() => gradient)
    }
  };
}

describe('renderQrClock', () => {
  let app;
  let originalGetContext;

  beforeEach(() => {
    app = document.createElement('div');
    app.id = 'app';
    document.body.appendChild(app);
    vi.useFakeTimers();

    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type) {
      if (type === '2d') return createMockContext().ctx;
      return originalGetContext.call(this, type);
    };
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    vi.useRealTimers();
    app.remove();
  });

  it('creates two canvases inside the container', () => {
    renderQrClock('#app');
    const canvases = app.querySelectorAll('canvas');
    expect(canvases.length).toBe(2);
  });

  it('applies background color to the container', () => {
    renderQrClock('#app', { backgroundColor: '#123456' });
    expect(app.style.backgroundColor).toBe('rgb(18, 52, 86)');
  });

  it('sets one canvas visible and the other hidden', () => {
    renderQrClock('#app');
    const canvases = app.querySelectorAll('canvas');
    const opacities = Array.from(canvases).map(c => c.style.opacity);
    expect(opacities).toContain('1');
    expect(opacities).toContain('0');
  });

  it('destroy removes canvases and clears interval', () => {
    const clock = renderQrClock('#app');
    expect(app.querySelectorAll('canvas').length).toBe(2);
    clock.destroy();
    expect(app.querySelectorAll('canvas').length).toBe(0);
  });
});
