import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TicketsComponent } from "./tickets/tickets.component";
import { RegistrationComponent } from "./registration/registration.component";
import { ParticipantsComponent } from "./participants/participants.component";
import { EventComponent } from "./events/events.component";
import { AnaliticComponent } from "./analitic/analitic.component";
import { SidebarComponent } from './sidebar/sidebar.component';
import { MainComponent } from './main/main.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { LocationComponent } from '../location/location.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TicketsComponent, RegistrationComponent,LocationComponent, ParticipantsComponent, EventComponent, AnaliticComponent,SidebarComponent,MainComponent,FormsModule,ReactiveFormsModule,AdminPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Event-Managment-System';
}
