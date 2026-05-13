import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BankingService } from '../../services/banking-service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  accountNumber = '';
  statusMessage = '';
  isLoggingIn = false;
  protected readonly theme = inject(ThemeService);

  constructor(
    private readonly router: Router,
    private readonly bankingService: BankingService
  ) {}
  onSubmit(): void {
    const normalized = this.accountNumber.trim();
    if (!normalized) {
      return;
    }

    if (!Number.isFinite(Number(normalized))) {
      this.statusMessage = 'Inserisci un numero conto valido (solo numeri).';
      return;
    }

    this.bankingService.setCurrentAccountNumber(normalized);
    this.statusMessage = '';
    this.isLoggingIn = true;
    this.bankingService.refreshDashboardData().subscribe({
      next: () => {
        this.isLoggingIn = false;
        this.router.navigate(['/home']);
      },
      error: () => {
        this.isLoggingIn = false;
        this.bankingService.clearSession();
        this.statusMessage = 'Impossibile caricare i dati del conto. Verifica il numero e riprova.';
      },
    });
  }
}
