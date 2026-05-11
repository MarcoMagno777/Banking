import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransactionDetail } from '../transaction-detail/transaction-detail';
import { BankingService } from '../../services/banking-service';
import { Transaction } from '../../models/banking.model';

@Component({
  selector: 'app-transactions',
  imports: [FormsModule, CommonModule, TransactionDetail],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  private bankingService = inject(BankingService);
  
  filter: string = '';
  selectedTransaction: Transaction | null = null;

  get allTransactions() {
    return this.bankingService.getTransactions();
  }

  get filteredTransactions() {
    return this.allTransactions.filter((t) =>
      t.description.toLowerCase().includes(this.filter.toLowerCase()) ||
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
