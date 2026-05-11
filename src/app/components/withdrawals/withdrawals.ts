import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BankingService } from '../../services/banking-service';

@Component({
  selector: 'app-withdrawals',
  imports: [FormsModule, CommonModule],
  templateUrl: './withdrawals.html',
  styleUrl: './withdrawals.css',
})
export class Withdrawals {
  private bankingService = inject(BankingService);

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
    const primaryAccount = this.bankingService.getPrimaryAccount();
    return primaryAccount?.balance ?? 0;
  }

  onSubmit() {
    if (this.amount > 0 && this.amount <= this.maxWithdrawal && this.description.trim()) {
      this.isLoading = true;
      
      // Simula un'operazione asincrona
      setTimeout(() => {
        const withdrawal = this.bankingService.addWithdrawal(
          this.amount,
          this.destination,
          this.description
        );
        
        // Rimuovi i fondi dal conto
        this.bankingService.withdrawFundsFromBalance(this.amount);

        this.statusMessage = `Prelievo di €${this.amount} verso ${this.destination} in corso!`;
        this.description = '';
        this.amount = 0;
        this.isLoading = false;
      }, 1000);
    } else if (this.amount > this.maxWithdrawal) {
      this.statusMessage = 'Importo superiore al saldo disponibile!';
    }
  }
}
