import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BankingService } from '../../services/banking-service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  accountNumber = '';
  statusMessage = '';

  constructor(
    private readonly router: Router,
    private readonly bankingService: BankingService
  ) {}

  onSubmit(): void {
    const normalized = this.accountNumber.trim();
    if (!normalized) {
      return;
    }

    if (!Number.isFinite(Number(normalized))) {
      this.statusMessage = 'Inserisci un numero conto valido (solo numeri).';
      return;
    }

    this.bankingService.setCurrentAccountNumber(normalized);
    this.statusMessage = '';
    this.router.navigate(['/home']);
  }
}
