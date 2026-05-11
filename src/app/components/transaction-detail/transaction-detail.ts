import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/banking.model';

@Component({
  selector: 'app-transaction-detail',
  imports: [CommonModule],
  templateUrl: './transaction-detail.html',
  styleUrl: './transaction-detail.css',
})
export class TransactionDetail {
  @Input() transaction: Transaction | null = null;
  @Output() closeDetail = new EventEmitter<void>();

  close() {
    this.closeDetail.emit();
  }

  get transactionType(): string {
    if (this.transaction?.amount && this.transaction.amount > 0) {
      return 'Entrata';
    } else if (this.transaction?.amount && this.transaction.amount < 0) {
      return 'Uscita';
    }
    return 'Neutra';
  }

  get amountClass(): string {
    if (this.transaction?.amount && this.transaction.amount > 0) {
      return 'positive';
    } else if (this.transaction?.amount && this.transaction.amount < 0) {
      return 'negative';
    }
    return 'neutral';
  }

  getAbsAmount(): number {
    return Math.abs(this.transaction?.amount || 0);
  }
}
