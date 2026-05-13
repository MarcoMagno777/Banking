import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Transaction } from '../../models/banking.model';

export type TxNodeKind = 'in' | 'out' | 'other';

/** Punto nel grafico: una transazione, un nodo. */
export type BalanceChartPoint = {
  tx: Transaction;
  index: number;
  x: number;
  y: number;
  balanceAfter: number;
  kind: TxNodeKind;
};

@Component({
  selector: 'app-movements-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-card">
      <header class="chart-head">
        <div>
          <h3>Andamento conto</h3>
          <p>
            Ogni punto è una transazione in ordine cronologico. I segmenti <strong class="hint-in">verdi</strong>
            seguono un <strong>deposito</strong>, i <strong class="hint-out">rossi</strong> un
            <strong>prelievo</strong> (o uscita). Passa il mouse sui nodi per importo e saldo dopo il movimento.
          </p>
        </div>
      </header>
      @if (points().length === 0) {
        <p class="empty">Non ci sono transazioni da mostrare nel grafico.</p>
      } @else {
        <div class="svg-wrap">
          <svg
            class="chart-svg"
            [attr.viewBox]="'0 0 ' + vbW + ' ' + vbH"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            [attr.aria-label]="
              'Andamento saldo: ' + legendCounts().in + ' depositi, ' + legendCounts().out + ' prelievi'
            "
          >
            <defs>
              <linearGradient [attr.id]="gid + '-area'" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" class="stop-area-top" />
                <stop offset="100%" class="stop-area-bot" />
              </linearGradient>
            </defs>
            @for (g of grid(); track g.y) {
              <line class="grid" [attr.x1]="pad" [attr.y1]="g.y" [attr.x2]="vbW - pad" [attr.y2]="g.y" />
            }
            <polygon class="area-fill" [attr.points]="areaPoints()" [attr.fill]="'url(#' + gid + '-area)'" />
            @for (seg of segments(); track seg.i) {
              <line
                class="seg-line"
                [class.seg-in]="seg.kind === 'in'"
                [class.seg-out]="seg.kind === 'out'"
                [class.seg-other]="seg.kind === 'other'"
                [attr.x1]="seg.x1"
                [attr.y1]="seg.y1"
                [attr.x2]="seg.x2"
                [attr.y2]="seg.y2"
              />
            }
            @for (p of points(); track p.tx.id) {
              <circle
                [class.node-in]="p.kind === 'in'"
                [class.node-out]="p.kind === 'out'"
                [class.node-other]="p.kind === 'other'"
                [attr.cx]="p.x"
                [attr.cy]="p.y"
                r="5"
              >
                <title>{{ tooltipLine(p) }}</title>
              </circle>
            }
          </svg>
        </div>
        <div class="legend">
          <span class="lg in"><i></i> Depositi {{ legendCounts().in }}</span>
          <span class="lg out"><i></i> Prelievi {{ legendCounts().out }}</span>
          @if (legendCounts().other > 0) {
            <span class="lg other"><i></i> Altri {{ legendCounts().other }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .chart-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem 1.35rem 1rem;
      box-shadow: var(--shadow);
      animation: chartIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .chart-head h3 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-strong);
      letter-spacing: -0.02em;
    }
    .chart-head p {
      margin: 0.35rem 0 0;
      font-size: 0.82rem;
      color: var(--muted);
      line-height: 1.45;
    }
    .hint-in {
      color: var(--accent-strong);
    }
    .hint-out {
      color: var(--danger);
    }
    .empty {
      margin: 1.5rem 0;
      color: var(--muted);
      font-size: 0.9rem;
    }
    .svg-wrap {
      margin-top: 0.75rem;
      width: 100%;
      height: min(240px, 44vw);
      min-height: 180px;
    }
    .chart-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .grid {
      stroke: var(--chart-grid);
      stroke-width: 1;
      stroke-dasharray: 4 6;
    }
    .seg-line {
      stroke-width: 2.85;
      stroke-linecap: round;
    }
    .seg-in {
      stroke: var(--accent);
    }
    .seg-out {
      stroke: var(--danger);
    }
    .seg-other {
      stroke: var(--muted-2);
    }
    .area-fill {
      opacity: 1;
    }
    .stop-area-top {
      stop-color: var(--accent);
      stop-opacity: 0.12;
    }
    .stop-area-bot {
      stop-color: var(--danger);
      stop-opacity: 0.06;
    }
    circle {
      cursor: default;
      transition: r 0.15s ease;
    }
    .node-in {
      fill: var(--surface);
      stroke: var(--accent);
      stroke-width: 2.6;
    }
    .node-out {
      fill: var(--surface);
      stroke: var(--danger);
      stroke-width: 2.6;
    }
    .node-other {
      fill: var(--surface);
      stroke: var(--muted-2);
      stroke-width: 2.6;
    }
    .node-in:hover,
    .node-out:hover,
    .node-other:hover {
      r: 6.5;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem 1.25rem;
      margin-top: 0.65rem;
      font-size: 0.78rem;
      color: var(--muted);
    }
    .lg {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .lg i {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      display: inline-block;
    }
    .lg.in i {
      background: var(--accent);
    }
    .lg.out i {
      background: var(--danger);
    }
    .lg.other i {
      background: var(--muted-2);
    }
    @keyframes chartIn {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `,
})
export class MovementsChart {
  readonly transactions = input<Transaction[]>([]);
  readonly currentBalance = input<number | null>(null);

  readonly gid = `mch-${Math.random().toString(36).slice(2, 9)}`;
  readonly vbW = 520;
  readonly vbH = 220;
  readonly pad = 32;

  readonly points = computed(() => this.buildPoints(this.transactions(), this.currentBalance()));

  readonly segments = computed(() => {
    const pts = this.points();
    const lines: { i: number; x1: number; y1: number; x2: number; y2: number; kind: TxNodeKind }[] = [];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      lines.push({
        i,
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        kind: b.kind,
      });
    }
    return lines;
  });

  readonly legendCounts = computed(() => {
    let inn = 0;
    let out = 0;
    let other = 0;
    for (const p of this.points()) {
      if (p.kind === 'in') inn++;
      else if (p.kind === 'out') out++;
      else other++;
    }
    return { in: inn, out, other };
  });

  readonly grid = computed(() => {
    const rows = 4;
    const innerH = this.vbH - 2 * this.pad;
    return Array.from({ length: rows }, (_, i) => ({
      y: this.pad + (innerH * i) / (rows - 1),
    }));
  });

  readonly areaPoints = computed(() => {
    const pts = this.points();
    if (pts.length === 0) return '';
    const baseY = this.vbH - this.pad;
    const firstX = pts[0].x;
    const lastX = pts[pts.length - 1].x;
    const top = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return `${firstX.toFixed(1)},${baseY} ${top} ${lastX.toFixed(1)},${baseY}`;
  });

  formatBal(n: number): string {
    return n.toFixed(2);
  }

  tooltipLine(p: BalanceChartPoint): string {
    const move =
      p.kind === 'in'
        ? `Deposito +${this.formatBal(p.tx.amount)} €`
        : p.kind === 'out'
          ? `Prelievo ${this.formatBal(p.tx.amount)} €`
          : `Movimento ${this.formatBal(p.tx.amount)} €`;
    return `${p.tx.date} — ${p.tx.description || 'Senza descrizione'} — ${move} — saldo dopo ${this.formatBal(p.balanceAfter)} €`;
  }

  private classifyTx(tx: Transaction): TxNodeKind {
    if (tx.type === 'withdrawal' || tx.amount < 0) return 'out';
    if (tx.type === 'deposit' || tx.amount > 0) return 'in';
    return 'other';
  }

  private buildPoints(txs: Transaction[], anchor: number | null): BalanceChartPoint[] {
    if (!txs.length) return [];

    const sorted = [...txs].sort((a, b) => {
      const da = (a.date ?? '').slice(0, 10);
      const db = (b.date ?? '').slice(0, 10);
      const c = da.localeCompare(db);
      if (c !== 0) return c;
      return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
    });

    const amounts = sorted.map((t) => t.amount);
    const sumAll = amounts.reduce((s, v) => s + v, 0);
    const start = anchor != null && Number.isFinite(anchor) ? anchor - sumAll : 0;

    const balancesAfter: number[] = [];
    let run = start;
    for (const a of amounts) {
      run += a;
      balancesAfter.push(run);
    }

    const innerW = this.vbW - 2 * this.pad;
    const innerH = this.vbH - 2 * this.pad;
    const n = sorted.length;

    let minB = Math.min(...balancesAfter);
    let maxB = Math.max(...balancesAfter);
    if (minB === maxB) {
      minB -= 1;
      maxB += 1;
    }
    const padY = (maxB - minB) * 0.12;
    minB -= padY;
    maxB += padY;
    const span = Math.max(maxB - minB, 1e-6);

    return sorted.map((tx, i) => {
      const x = n === 1 ? this.pad + innerW / 2 : this.pad + (innerW * i) / (n - 1);
      const bal = balancesAfter[i];
      const y = this.vbH - this.pad - ((bal - minB) / span) * innerH;
      return {
        tx,
        index: i,
        x,
        y,
        balanceAfter: bal,
        kind: this.classifyTx(tx),
      };
    });
  }
}
