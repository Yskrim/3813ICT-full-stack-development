import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('ngModel');

  // --- форма 1: live binding через ngModel ---
  name = '';
  lastname = '';

  // --- форма 2: значения читаем в обработчике ---
  email = '';
  password = '';
  loginMessage = ''; // HTML сообщения, которое показывает значения ввода
  clickCount = 0;

  // вызывается при submit формы: (ngSubmit)="onLogin()"
  onLogin() {
    this.loginMessage = `Отправлено: ${this.email} / ${this.password}`;
    console.log('form submitted', { email: this.email, password: this.password });
  }

  // вызывается при клике: (click)="onButtonClick()"
  onButtonClick() {
    this.clickCount++;
  }
}
