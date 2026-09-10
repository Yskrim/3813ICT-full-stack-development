import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})

export class Login {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router) { }

  onSubmit() {
    const found = this.users.find(u => (u.email === this.email && u.password === this.password))
    if (found) {
      this.router.navigate(['/profile'])
    } else {
      this.errorMessage = "Invalid credentials, try again";
    }
  }

  onInput() {
    if (this.errorMessage) {
      if (!this.email || !this.password) {
        this.errorMessage = '';
      }
    }
  }

  onReset() {
    this.errorMessage = '';
  }

  users = [
    { email: 'anton', password: '123' },
    { email: 'bob', password: '123' },
    { email: 'charlie', password: '123' },
  ];
}
