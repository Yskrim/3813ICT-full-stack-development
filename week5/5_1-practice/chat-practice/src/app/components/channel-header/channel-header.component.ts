import { Component, inject } from '@angular/core';
import { ChannelStateService } from '../../services/channel-state.service';

@Component({
  imports: [],
  selector: 'app-channel-header',
  styleUrl: './channel-header.component.css',
  templateUrl: './channel-header.component.html',
})
export class ChannelHeaderComponent {
  private cs = inject(ChannelStateService);
}
