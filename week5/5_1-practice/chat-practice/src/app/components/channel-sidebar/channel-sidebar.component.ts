import { Component, inject } from '@angular/core';
import { ChannelStateService } from '../../services/channel-state.service';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-channel-sidebar',
  styleUrl: './channel-sidebar.component.css',
  templateUrl: './channel-sidebar.component.html',
})
export class ChannelSidebarComponent {
  private cs = inject(ChannelStateService);
}
