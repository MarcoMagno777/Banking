import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-convert-crypto',
  imports: [FormsModule],
  templateUrl: './convert-crypto.html',
  styleUrl: './convert-crypto.css',
})
export class ConvertCrypto {
  amount: number = 0;
  cryptoType: string = 'BTC';

  onSubmit() {
    if (this.amount > 0) {
      alert(`Conversione di €${this.amount} in ${this.cryptoType} effettuata!`);
      this.amount = 0;
    }
  }
}
