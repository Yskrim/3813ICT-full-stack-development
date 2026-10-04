import { Component, inject } from '@angular/core';
import { ChannelStateService } from '../../services/channel-state.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [RouterLink, FormsModule],
  selector: 'app-channel-sidebar',
  styleUrl: './channel-sidebar.component.css',
  templateUrl: './channel-sidebar.component.html',
})
export class ChannelSidebarComponent {
  private cs = inject(ChannelStateService);

  chName = '';

  handleSubmit(e: Event){
    e.preventDefault();
    this.cs.add(this.chName);
    this.chName = '';
  }
}
