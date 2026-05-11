import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankingService } from '../../services/banking-service';

@Component({
  selector: 'app-balance',
  imports: [CommonModule],
  templateUrl: './balance.html',
  styleUrl: './balance.css',
})
export class Balance {
  private bankingService = inject(BankingService);

  get primaryAccount() {
    return this.bankingService.getPrimaryAccount();
  }

  get totalBalance() {
    return this.bankingService.totalBalance;
  }

  get account() {
    return this.bankingService.getAccount();
  }

  statusMessage = '';

  refreshBalance() {
    this.statusMessage = 'Saldo aggiornato!';
  }
}
