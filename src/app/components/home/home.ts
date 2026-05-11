import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BankingService } from '../../services/banking-service';
import { Account, Transaction } from '../../models/banking.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  account: Account | null = null;
  transactions: Transaction[] = [];
  isLoading = false;
  statusMessage = '';

  constructor(
    private readonly router: Router,
    private readonly bankingService: BankingService
  ) {}

  ngOnInit(): void {
    if (!this.bankingService.getCurrentAccountNumber()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadOverview();
  }

  loadOverview(): void {
    this.isLoading = true;
    forkJoin({
      account: this.bankingService.fetchAccount(),
      transactions: this.bankingService.fetchTransactions(),
    }).subscribe({
      next: ({ account, transactions }) => {
        this.account = account;
        this.transactions = transactions;
        this.statusMessage = '';
        this.isLoading = false;
      },
      error: () => {
        this.statusMessage = 'Errore nel caricamento della panoramica conto.';
        this.isLoading = false;
      },
    });
  }

  get accountNumber(): string {
    return this.bankingService.getCurrentAccountNumber() ?? '-';
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
