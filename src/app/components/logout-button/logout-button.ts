import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-logout-button',
  imports: [CommonModule, RouterLink],
  templateUrl: './logout-button.html',
  styleUrls: ['./logout-button.css'],
})
export class LogoutButton {
  @Output() logout = new EventEmitter<void>();

  handleLogout() {
    this.logout.emit();
  }
}
