import { effect, Injectable, signal } from '@angular/core';

export type BankingTheme = 'dark' | 'light';

const STORAGE_KEY = 'banking-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly theme = signal<BankingTheme>(this.readStored());

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.setAttribute('data-theme', t);
      try {
        localStorage.setItem(STORAGE_KEY, t);
      } catch {
        /* ignore */
      }
    });
  }

  toggle(): void {
    this.theme.update((v) => (v === 'dark' ? 'light' : 'dark'));
  }

  setTheme(theme: BankingTheme): void {
    this.theme.set(theme);
  }

  private readStored(): BankingTheme {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark') return v;
    } catch {
      /* ignore */
    }
    return 'dark';
  }
}
