import { Component } from '@angular/core';

@Component({
  selector: 'app-balance',
  imports: [],
  templateUrl: './balance.html',
  styleUrl: './balance.css',
})
export class Balance {
  refreshBalance() {
    alert('Saldo aggiornato!');
  }
}
