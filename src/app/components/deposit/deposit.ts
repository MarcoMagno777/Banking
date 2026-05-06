import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-deposit',
  imports: [FormsModule],
  templateUrl: './deposit.html',
  styleUrl: './deposit.css',
})
export class Deposit {
  amount: number = 0;

  onSubmit() {
    if (this.amount > 0) {
      alert(`Deposito di €${this.amount} effettuato con successo!`);
      this.amount = 0;
    }
  }
}
