import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transactions',
  imports: [FormsModule, CommonModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  filter: string = '';

  transactions = [
    { date: '2023-10-01', description: 'Deposito', amount: 500 },
    { date: '2023-10-02', description: 'Prelievo', amount: -200 },
    { date: '2023-10-03', description: 'Conversione', amount: -100 },
  ];

  get filteredTransactions() {
    return this.transactions.filter(t =>
      t.description.toLowerCase().includes(this.filter.toLowerCase())
    );
  }

  onSubmit() {
    // Filter is applied automatically
  }
}
