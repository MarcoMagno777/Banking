import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-withdrawals',
  imports: [FormsModule],
  templateUrl: './withdrawals.html',
  styleUrl: './withdrawals.css',
})
export class Withdrawals {
  amount: number = 0;

  onSubmit() {
    if (this.amount > 0) {
      alert(`Prelievo di €${this.amount} effettuato con successo!`);
      this.amount = 0;
    }
  }
}
