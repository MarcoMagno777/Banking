import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  accountNumber: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (this.accountNumber.trim()) {
      // Qui puoi validare o salvare il numero del conto
      this.router.navigate(['/balance']);
    }
  }
}
