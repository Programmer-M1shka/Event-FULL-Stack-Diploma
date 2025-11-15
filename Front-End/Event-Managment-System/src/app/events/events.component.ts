import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventService } from '../event.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventComponent implements OnInit {
  events: EventDTO[] = [];
  showCreateForm = false;
  eventForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  locations: LocationDTO[] = [];
   users: UserDTO[] = [];

  constructor(
    private eventService: EventService,
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      locationId: [null, Validators.required],
      organizerId: [null, Validators.required],
      // capacity: [1, [Validators.required, Validators.min(1)]],
      tickets: this.fb.array([]),
      agenda: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadLocations(); 
    this.loadUsers();
   
  }

loadUsers(): void {
  this.authService.getAllUsers().subscribe({
    next: (users) => this.users = users,
    error: (err) => console.error('Error loading users:', err)
  });
}

isAdmin(): boolean {
  return localStorage.getItem('guard') === 'ADMIN';
}





  // ლოკაციების ჩატვირთვის მეთოდი
  loadLocations(): void {
    this.eventService.getLocations().subscribe({
      next: (data) => {
        this.locations = data;
        console.log('Locations loaded:', this.locations);
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.error = 'ლოკაციების ჩატვირთვა ვერ მოხერხდა';
      }
    });
  }

  get tickets(): FormArray {
    return this.eventForm.get('tickets') as FormArray;
  }

  get agenda(): FormArray {
    return this.eventForm.get('agenda') as FormArray;
  }

  addTicket(): void {
    const ticketGroup = this.fb.group({
      type: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.tickets.push(ticketGroup);
  }

  removeTicket(index: number): void {
    this.tickets.removeAt(index);
  }

  addAgendaItem(): void {
    const agendaGroup = this.fb.group({
      title: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      speakerName: ['', Validators.required]
    });
    this.agenda.push(agendaGroup);
  }

  removeAgendaItem(index: number): void {
    this.agenda.removeAt(index);
  }

  loadEvents(): void {
    this.isLoading = true;
    this.error = null;

    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.error = 'Failed to load events';
        this.isLoading = false;
      }
    });
  }

  toggleForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.eventForm.reset();
      
      while (this.tickets.length) {
        this.tickets.removeAt(0);
      }
      while (this.agenda.length) {
        this.agenda.removeAt(0);
      }
      this.error = null;
    } else {
      // ფორმის გახსნისას ლოკაციების ხელახალი ჩატვირთვა
      this.loadLocations();
    }
  }

  createEvent(): void {
    if (this.eventForm.valid) {
      this.isLoading = true;
      this.error = null;

      const formValue = this.eventForm.value;

      if (new Date(formValue.startDate) >= new Date(formValue.endDate)) {
        this.error = 'დასაწყები დრო არ შეიძლება დიდები იყოს დამთავრებულზე';
        this.isLoading = false;
        return;
      }

      const payload = {
        ...formValue,
        tickets: formValue.tickets,
        agenda: formValue.agenda
      };

      this.eventService.createEvent(payload).subscribe({
        next: (response) => {
          this.loadEvents();
          this.eventForm.reset();
          this.showCreateForm = false;
          
          while (this.tickets.length) this.tickets.removeAt(0);
          while (this.agenda.length) this.agenda.removeAt(0);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Event creation failed:', error);
          this.error = 'ღონისძიების შექმნა ვერ მოხერხდა';
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.eventForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
}

// Interfaces
export interface LocationDTO {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface EventDTO {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: LocationDTO;
  capacity: number;
  organizer: UserDTO;
  status: string;
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  locationId: number;
  capacity: number;
}

export interface TicketDTO {
  id: number;
  eventId: number;
  type: string;
  price: number;
  quantity: number;
  status: string;
}

export interface SpeakerDTO {
  id: number;
  eventId: number;
  title: string;
  description?: string;
  speakerIds?: number[]; 
  startTime: Date;
  endTime: Date;
  location?: string;
}