import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BankingService } from '../../services/banking-service';

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  accountNumber: string = '';
  statusMessage = '';

  constructor(
    private router: Router,
    private bankingService: BankingService
  ) {}

  onSubmit() {
    if (this.accountNumber.trim()) {
      if (Number.isFinite(Number(this.accountNumber))) {
        this.bankingService.setCurrentAccountNumber(this.accountNumber);
        this.statusMessage = '';
        this.router.navigate(['/balance']);
      } else {
        this.statusMessage = 'Inserisci un numero conto valido (numerico).';
      }
    }
  }
}
