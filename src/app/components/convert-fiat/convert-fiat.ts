import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BankingService } from '../../services/banking-service';

@Component({
  selector: 'app-convert-fiat',
  imports: [FormsModule, CommonModule],
  templateUrl: './convert-fiat.html',
  styleUrl: './convert-fiat.css',
})
export class ConvertFiat {
  private bankingService = inject(BankingService);

  description: string = '';
  amount: number = 0;
  fromCurrency: string = 'EUR';
  toFiat: string = 'USD';
  isLoading = false;
  statusMessage: string = '';

  fiats = [
    { value: 'USD', label: 'Dollaro USA (USD)', rate: 1.1 },
    { value: 'GBP', label: 'Sterlina Britannica (GBP)', rate: 0.95 },
    { value: 'JPY', label: 'Yen Giapponese (JPY)', rate: 160 },
    { value: 'CAD', label: 'Dollaro Canadese (CAD)', rate: 1.5 },
    { value: 'AUD', label: 'Dollaro Australiano (AUD)', rate: 1.7 },
  ];

  get selectedFiatRate(): number {
    const fiat = this.fiats.find((f) => f.value === this.toFiat);
    return fiat?.rate ?? 0;
  }

  get convertedAmount(): number {
    return this.amount * this.selectedFiatRate;
  }

  onSubmit() {
    if (this.amount > 0 && this.description.trim()) {
      this.isLoading = true;
      this.bankingService
        .addFiatConversion(
          this.amount,
          this.fromCurrency,
          this.toFiat,
          this.selectedFiatRate,
          this.description
        )
        .subscribe({
          next: () => {
            this.statusMessage = `Conversione in ${this.toFiat} inviata al server.`;
            this.description = '';
            this.amount = 0;
            this.isLoading = false;
          },
          error: () => {
            this.statusMessage = 'Errore durante la conversione fiat.';
            this.isLoading = false;
          },
        });
    }
  }
}
