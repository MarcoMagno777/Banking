import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MovementsChart } from '../../shared/movements-chart/movements-chart';
import { BankingService } from '../../services/banking-service';
import { Account, Transaction } from '../../models/banking.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, MovementsChart],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly router = inject(Router);
  protected readonly banking = inject(BankingService);
  statusMessage = '';

  ngOnInit(): void {
    if (!this.banking.getCurrentAccountNumber()) {
      this.router.navigate(['/login']);
      return;
    }
  }

  loadOverview(): void {
    this.statusMessage = '';
    this.banking.refreshDashboardData().subscribe({
      error: () => {
        this.statusMessage = 'Errore nel caricamento della panoramica conto.';
      },
    });
  }

  get accountNumber(): string {
    return this.banking.getCurrentAccountNumber() ?? '-';
  }

  get account(): Account | null {
    return this.banking.getCachedAccount();
  }

  get transactions(): Transaction[] {
    return this.banking.getCachedTransactions();
  }

  get recentTransactions(): Transaction[] {
    return this.transactions.slice(0, 5);
  }

  get totalIncome(): number {
    return this.transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalExpenses(): number {
    return Math.abs(
      this.transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );
  }

  get absNetCashflow(): number {
    return Math.abs(this.totalIncome - this.totalExpenses);
  }

  get netCashflowDirection(): 'up' | 'down' {
    return this.totalIncome >= this.totalExpenses ? 'up' : 'down';
  }

  get transactionCount(): number {
    return this.transactions.length;
  }

  get depositCount(): number {
    return this.transactions.filter((t) => t.amount > 0).length;
  }

  get withdrawalCount(): number {
    return this.transactions.filter((t) => t.amount < 0).length;
  }

  absAmount(amount: number): number {
    return Math.abs(amount);
  }
}
