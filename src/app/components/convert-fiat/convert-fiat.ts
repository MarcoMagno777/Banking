import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-convert-fiat',
  imports: [FormsModule],
  templateUrl: './convert-fiat.html',
  styleUrl: './convert-fiat.css',
})
export class ConvertFiat {
  amount: number = 0;
  fiatType: string = 'USD';

  onSubmit() {
    if (this.amount > 0) {
      alert(`Conversione di €${this.amount} in ${this.fiatType} effettuata!`);
      this.amount = 0;
    }
  }
}
