import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MovementsChart } from '../../shared/movements-chart/movements-chart';
import { BankingService } from '../../services/banking-service';
import { Account, Transaction } from '../../models/banking.model';

@Component({
  selector: 'app-balance',
  imports: [CommonModule, RouterLink, MovementsChart],
  templateUrl: './balance.html',
  styleUrl: './balance.css',
})
export class Balance {
  protected readonly banking = inject(BankingService);
  isLoading = false;
  statusMessage = '';

  get account(): Account | null {
    return this.banking.getCachedAccount();
  }

  get transactions(): Transaction[] {
    return this.banking.getCachedTransactions();
  }

  get movementsSorted(): Transaction[] {
    return [...this.transactions].sort((a, b) => b.date.localeCompare(a.date));
  }

  get recentMovements(): Transaction[] {
    return this.movementsSorted.slice(0, 6);
  }

  get transactionCount(): number {
    return this.transactions.length;
  }

  get totalIncome(): number {
    return this.transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  }

  get totalExpenses(): number {
    return Math.abs(
      this.transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)
    );
  }

  get depositCount(): number {
    return this.transactions.filter((t) => t.amount > 0).length;
  }

  get withdrawalCount(): number {
    return this.transactions.filter((t) => t.amount < 0).length;
  }

  get accountDisplayName(): string {
    return this.account?.name ?? 'Conto collegato';
  }

  get ibanLine(): string {
    const iban = this.account?.iban?.replace(/\s/g, '');
    if (!iban) return 'IBAN non disponibile in anteprima.';
    return iban.replace(/(.{4})/g, '$1 ').trim();
  }

  absAmount(n: number): number {
    return Math.abs(n);
  }

  refreshBalance(): void {
    this.isLoading = true;
    this.banking.refreshDashboardData().subscribe({
      next: () => {
        this.statusMessage = 'Saldo aggiornato dal server.';
        this.isLoading = false;
      },
      error: () => {
        this.statusMessage = 'Errore nel recupero del saldo.';
        this.isLoading = false;
      },
    });
  }
}
