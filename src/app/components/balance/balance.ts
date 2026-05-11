import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankingService } from '../../services/banking-service';
import { Account } from '../../models/banking.model';

@Component({
  selector: 'app-balance',
  imports: [CommonModule],
  templateUrl: './balance.html',
  styleUrl: './balance.css',
})
export class Balance implements OnInit {
  private bankingService = inject(BankingService);
  account: Account | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.refreshBalance();
  }

  totalBalance(): number {
    return this.account?.balance ?? 0;
  }

  statusMessage = '';

  refreshBalance() {
    this.isLoading = true;
    this.bankingService.fetchAccount().subscribe({
      next: (account) => {
        this.account = account;
        this.statusMessage = 'Saldo aggiornato dal server.';
        this.isLoading = false;
      },
      error: () => {
        this.statusMessage = 'Errore nel recupero del saldo.';
        this.isLoading = false;
      },
    });
  }
}
