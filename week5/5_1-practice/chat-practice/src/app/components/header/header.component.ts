import { Component, inject, AfterViewInit, computed } from '@angular/core';
import { AuthService, TEST_USERS, User } from '../../services/auth.service';


@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.component.css',
  templateUrl: './header.component.html',
})

export class HeaderComponent {
  private auth = inject(AuthService);
  private currentUser = this.auth.currentUser;
  private testUsers: User[] = TEST_USERS;

  loginAs(username: string): void {
    const user = TEST_USERS.find(u => u.username === username)
    if(user) this.auth.loginAs(user);
  }

  logout(): void {
    this.auth.logout();
  }
}
