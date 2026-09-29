import { Component, inject, AfterViewInit } from '@angular/core';
import { SessionService, SessionUser, TEST_USERS } from '../../services/session.service';


@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.component.css',
  templateUrl: './header.component.html',
})

export class HeaderComponent {
  private sessionService = inject(SessionService);
  private currentUser = this.sessionService.currentUser;
  private testUsers: SessionUser[] = TEST_USERS;

  loginAs(username: string): void {
    try{
      this.sessionService.login(username);
      // this.loadUser();
    } catch(err) {
      console.warn(err);
    }
    
  }

  logout(): void {
    this.sessionService.logout();
  }

  // loadUser(): void{
  //   this.currentUser = this.sessionService.currentUser();
  // }

  ngAfterViewInit(){
    this.sessionService.loadUser();
  }
}
