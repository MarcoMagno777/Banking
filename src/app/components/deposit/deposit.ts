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
      
      // Simula un'operazione asincrona
      setTimeout(() => {
        const deposit = this.bankingService.addDeposit(
          this.amount,
          this.method,
          this.description
        );
        
        // Aggiungi i fondi al conto
        this.bankingService.addFundsToBalance(this.amount);

        this.statusMessage = `Deposito di €${this.amount} in corso via ${this.method}!`;
        this.description = '';
        this.amount = 0;
        this.isLoading = false;
      }, 1000);
    }
  }
}
