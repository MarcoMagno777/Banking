import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BankingService } from '../../services/banking-service';

@Component({
  selector: 'app-withdrawals',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './withdrawals.html',
  styleUrl: './withdrawals.css',
})
export class Withdrawals {
  protected readonly banking = inject(BankingService);

  description: string = '';
  amount: number = 0;
  destination: string = 'Bancomat';
  isLoading = false;
  statusMessage: string = '';

  destinations = [
    { value: 'Bancomat', label: 'Bancomat' },
    { value: 'Conto esterno', label: 'Conto esterno' },
    { value: 'Bonifico', label: 'Bonifico' },
  ];

  get maxWithdrawal(): number {
    return this.banking.getCachedAccount()?.balance ?? 0;
  }

  onSubmit() {
    if (this.amount > 0 && this.amount <= this.maxWithdrawal && this.description.trim()) {
      this.isLoading = true;
      this.banking
        .addWithdrawal(this.amount, this.destination, this.description)
        .subscribe({
          next: () => {
            this.statusMessage = `Prelievo di €${this.amount} inviato al server.`;
            this.description = '';
            this.amount = 0;
            this.isLoading = false;
          },
          error: () => {
            this.statusMessage = 'Errore durante il prelievo.';
            this.isLoading = false;
          },
        });
    } else if (this.amount > this.maxWithdrawal) {
      this.statusMessage = 'Importo superiore al saldo disponibile!';
    }
  }
}
