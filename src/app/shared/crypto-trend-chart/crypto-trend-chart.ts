import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

/** Serie indicativa (demo UI) ispirata a dashboard crypto: forma stabile per simbolo. */
@Component({
  selector: 'app-crypto-trend-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-card">
      <header class="chart-head">
        <div>
          <h3>Andamento indicativo {{ symbol() }}</h3>
          <p>Curva di riferimento per la coppia EUR → {{ symbol() }} (UI dimostrativa)</p>
        </div>
      </header>
      <div class="svg-wrap">
        <svg
          class="chart-svg"
          [attr.viewBox]="'0 0 ' + vbW + ' ' + vbH"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Grafico andamento crypto"
        >
          <defs>
            <linearGradient [attr.id]="gid + '-area'" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" class="stop-top" />
              <stop offset="100%" class="stop-bot" />
            </linearGradient>
          </defs>
          @for (g of grid(); track g.y) {
            <line class="grid" [attr.x1]="pad" [attr.y1]="g.y" [attr.x2]="vbW - pad" [attr.y2]="g.y" />
          }
          <polygon class="area" [attr.points]="area()" [attr.fill]="'url(#' + gid + '-area)'" />
          <polyline class="line" [attr.points]="line()" fill="none" />
          @for (p of dots(); track p.i) {
            <circle class="dot" [attr.cx]="p.x" [attr.cy]="p.y" r="4" />
          }
        </svg>
      </div>
      <ul class="ticks">
        @for (d of labels(); track d) {
          <li>{{ d }}</li>
        }
      </ul>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .chart-card {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem 1.35rem 1rem;
      box-shadow: var(--shadow);
      animation: chartIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .chart-head h3 {
      margin: 0;
      font-size: 1.02rem;
      font-weight: 700;
      color: var(--text-strong);
      letter-spacing: -0.02em;
    }
    .chart-head p {
      margin: 0.35rem 0 0;
      font-size: 0.8rem;
      color: var(--muted);
    }
    .svg-wrap {
      margin-top: 0.75rem;
      width: 100%;
      height: min(200px, 40vw);
      min-height: 150px;
    }
    .chart-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .grid {
      stroke: var(--chart-grid);
      stroke-width: 1;
      stroke-dasharray: 3 6;
    }
    .line {
      stroke: var(--accent-strong);
      stroke-width: 2.75;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .dot {
      fill: var(--accent-strong);
      stroke: var(--surface);
      stroke-width: 2;
    }
    .stop-top {
      stop-color: var(--accent);
      stop-opacity: 0.4;
    }
    .stop-bot {
      stop-color: var(--accent);
      stop-opacity: 0;
    }
    .ticks {
      display: flex;
      justify-content: space-between;
      list-style: none;
      margin: 0.5rem 0 0;
      padding: 0 0.25rem;
      font-size: 0.68rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    @keyframes chartIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class CryptoTrendChart {
  readonly symbol = input<string>('BTC');

  readonly gid = `cch-${Math.random().toString(36).slice(2, 9)}`;
  readonly vbW = 420;
  readonly vbH = 180;
  readonly pad = 24;

  readonly values = computed(() => this.seriesFor(this.symbol()));

  readonly labels = computed(() => ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']);

  readonly grid = computed(() =>
    Array.from({ length: 4 }, (_, i) => ({
      y: this.pad + ((this.vbH - 2 * this.pad) * i) / 3,
    }))
  );

  readonly line = computed(() => {
    const vals = this.values();
    const n = vals.length;
    const innerW = this.vbW - 2 * this.pad;
    const innerH = this.vbH - 2 * this.pad;
    const min = Math.min(...vals) * 0.92;
    const max = Math.max(...vals) * 1.08;
    const span = Math.max(max - min, 1e-6);
    return vals
      .map((v, i) => {
        const x = this.pad + (innerW * i) / (n - 1);
        const y = this.vbH - this.pad - ((v - min) / span) * innerH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  readonly area = computed(() => {
    const vals = this.values();
    const n = vals.length;
    const innerW = this.vbW - 2 * this.pad;
    const innerH = this.vbH - 2 * this.pad;
    const min = Math.min(...vals) * 0.92;
    const max = Math.max(...vals) * 1.08;
    const span = Math.max(max - min, 1e-6);
    const baseY = this.vbH - this.pad;
    const top: string[] = [];
    for (let i = 0; i < n; i++) {
      const x = this.pad + (innerW * i) / (n - 1);
      const y = this.vbH - this.pad - ((vals[i] - min) / span) * innerH;
      top.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const x0 = this.pad;
    const x1 = this.pad + innerW;
    return `${x0},${baseY} ` + top.join(' ') + ` ${x1},${baseY}`;
  });

  readonly dots = computed(() => {
    const vals = this.values();
    const n = vals.length;
    const innerW = this.vbW - 2 * this.pad;
    const innerH = this.vbH - 2 * this.pad;
    const min = Math.min(...vals) * 0.92;
    const max = Math.max(...vals) * 1.08;
    const span = Math.max(max - min, 1e-6);
    return vals.map((v, i) => ({
      i,
      x: this.pad + (innerW * i) / (n - 1),
      y: this.vbH - this.pad - ((v - min) / span) * innerH,
    }));
  });

  private seriesFor(sym: string): number[] {
    let h = 0;
    for (let i = 0; i < sym.length; i++) h = (h * 31 + sym.charCodeAt(i)) >>> 0;
    const base = 40 + (h % 35);
    return Array.from({ length: 7 }, (_, i) => {
      const wave = Math.sin((i / 6) * Math.PI * 1.2 + (h % 10) * 0.2) * 12;
      const drift = i * (2 + (h % 5) * 0.3);
      return base + wave + drift;
    });
  }
}
