import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BankingService } from '../../services/banking-service';

@Component({
  selector: 'app-convert-crypto',
  imports: [FormsModule, CommonModule],
  templateUrl: './convert-crypto.html',
  styleUrl: './convert-crypto.css',
})
export class ConvertCrypto {
  private bankingService = inject(BankingService);

  description: string = '';
  amount: number = 0;
  fromCurrency: string = 'EUR';
  toCrypto: string = 'BTC';
  isLoading = false;
  statusMessage: string = '';

  cryptos = [
    { value: 'BTC', label: 'Bitcoin (BTC)', rate: 0.000025 },
    { value: 'ETH', label: 'Ethereum (ETH)', rate: 0.0005 },
    { value: 'XRP', label: 'Ripple (XRP)', rate: 0.01 },
    { value: 'LTC', label: 'Litecoin (LTC)', rate: 0.0001 },
  ];

  get selectedCryptoRate(): number {
    const crypto = this.cryptos.find((c) => c.value === this.toCrypto);
    return crypto?.rate ?? 0;
  }

  get convertedAmount(): number {
    return this.amount * this.selectedCryptoRate;
  }

  onSubmit() {
    if (this.amount > 0 && this.description.trim()) {
      this.isLoading = true;
      this.bankingService
        .addCryptoConversion(
          this.amount,
          this.fromCurrency,
          this.toCrypto,
          this.selectedCryptoRate,
          this.description
        )
        .subscribe({
          next: () => {
            this.statusMessage = `Conversione in ${this.toCrypto} inviata al server.`;
            this.description = '';
            this.amount = 0;
            this.isLoading = false;
          },
          error: () => {
            this.statusMessage = 'Errore durante la conversione crypto.';
            this.isLoading = false;
          },
        });
    }
  }
}
