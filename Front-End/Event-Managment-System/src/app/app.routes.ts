import { Routes } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { TicketsComponent } from './tickets/tickets.component';
import { ParticipantsComponent } from './participants/participants.component';
import { AnaliticComponent } from './analitic/analitic.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MainComponent } from './main/main.component';
import { EventComponent } from './events/events.component';
import { LocationComponent } from '../location/location.component';
import { guardGuard } from './guard.guard';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';



export const routes: Routes = [
  { path: '', redirectTo: '/registration', pathMatch: 'full' },
  { path: 'registration', component: RegistrationComponent },
    { path: 'events', component: EventComponent,  },
    { path: 'tickets', component: TicketsComponent },
     { path: 'adminpanel', component: AdminPanelComponent, canActivate:[guardGuard] },
    { path: 'participants', component: ParticipantsComponent },
    { path: 'analitics', component: AnaliticComponent,canActivate:[guardGuard] },
    { path: 'location', component: LocationComponent, canActivate:[guardGuard] },
  {
    path: 'main',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'tickets', pathMatch: 'full' }, // Default child
    ]
  },
  { path: '**', redirectTo: 'registration' }
];