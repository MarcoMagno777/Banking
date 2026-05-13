import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Navbar } from './components/navbar/navbar';
import { BankingService } from './services/banking-service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Banking');
  private readonly router = inject(Router);
  private readonly banking = inject(BankingService);
  /** Inizializza tema da localStorage prima della prima vista. */
  private readonly _theme = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);
  showNavbar = signal(false);

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        const path = event.urlAfterRedirects.split('?')[0];
        this.showNavbar.set(path !== '/login');
        if (path !== '/login' && this.banking.getCurrentAccountNumber()) {
          this.banking.refreshDashboardData().subscribe();
        }
      });
  }
}
