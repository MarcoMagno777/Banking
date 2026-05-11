import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BankingService } from '../../services/banking-service';

@Component({
  selector: 'app-deposit',
  imports: [FormsModule, CommonModule],
  templateUrl: './deposit.html',
  styleUrl: './deposit.css',
})
export class Deposit {
  private bankingService = inject(BankingService);

  description: string = '';
  amount: number = 0;
  method: string = 'bank-transfer';
  isLoading = false;
  statusMessage: string = '';

  methods = [
    { value: 'bank-transfer', label: 'Trasferimento Bancario' },
    { value: 'card', label: 'Carta di Credito' },
    { value: 'crypto', label: 'Criptovaluta' },
  ];

  onSubmit() {
    if (this.amount > 0 && this.description.trim()) {
      this.isLoading = true;
      this.bankingService
        .addDeposit(this.amount, this.method, this.description)
        .subscribe({
          next: () => {
            this.statusMessage = `Deposito di €${this.amount} inviato al server.`;
            this.description = '';
            this.amount = 0;
            this.isLoading = false;
          },
          error: () => {
            this.statusMessage = 'Errore durante il deposito.';
            this.isLoading = false;
          },
        });
    }
  }
}
