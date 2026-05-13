import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionDetail } from '../transaction-detail/transaction-detail';
import { MovementsChart } from '../../shared/movements-chart/movements-chart';
import { BankingService } from '../../services/banking-service';
import { Transaction } from '../../models/banking.model';

@Component({
  selector: 'app-transactions',
  imports: [FormsModule, CommonModule, TransactionDetail, MovementsChart],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  protected readonly banking = inject(BankingService);

  filter: string = '';
  selectedTransaction: Transaction | null = null;
  statusMessage = '';

  get filteredTransactions() {
    return this.banking.getCachedTransactions().filter((t) =>
      (t.description ?? '').toLowerCase().includes(this.filter.toLowerCase()) ||
      t.type.toLowerCase().includes(this.filter.toLowerCase())
    );
  }

  selectTransaction(transaction: Transaction) {
    this.selectedTransaction = transaction;
  }

  closeDetail() {
    this.selectedTransaction = null;
  }

  getAbsAmount(amount: number): number {
    return Math.abs(amount);
  }

  onSubmit() {
    // Filter is applied automatically
  }
}
