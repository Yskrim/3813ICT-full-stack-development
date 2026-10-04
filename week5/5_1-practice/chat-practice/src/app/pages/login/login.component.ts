import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TEST_USERS } from '../../services/auth.service';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.component.css',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private auth = inject(AuthService);

  protected username: string = '';
  protected password: string = '';
  protected error: string = '';

  login(): void {
    const user = TEST_USERS.find(u => u.username === this.username && u.password === this.password)

    if (!user) {
      this.error = "Invalid credentials, try again"
    } else {
      this.auth.loginAs(user);
    }
  }

  handleWrongCreds() {
    if (this.error){
      if (!this.username || !this.password) {
        this.error = '';
        return
      }
    }
  }
}
