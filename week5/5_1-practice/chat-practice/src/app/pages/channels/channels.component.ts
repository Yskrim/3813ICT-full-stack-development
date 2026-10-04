import { Component, inject } from '@angular/core';
import { Channel, ChannelStateService } from '../../services/channel-state.service';
import { RouterLink } from '@angular/router';
import { PreferencesService } from '../../services/preferences.service';
import { ChannelSidebarComponent } from '../../components/channel-sidebar/channel-sidebar.component';
import { ChannelHeaderComponent } from '../../components/channel-header/channel-header.component';

@Component({
  imports: [RouterLink, ChannelSidebarComponent, ChannelHeaderComponent],
  selector: 'app-channels',
  styleUrl: './channels.component.css',
  templateUrl: './channels.component.html',
})

export class ChannelsComponent {
  cs = inject(ChannelStateService)
}
