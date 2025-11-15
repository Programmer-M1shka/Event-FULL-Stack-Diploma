import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateEventDTO, EventDTO, LocationDTO, UserDTO } from './events/events.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'https://localhost:7177/api/Events';
  private apiUrl1 = 'https://localhost:7177/api/Events/all'

  constructor(private http: HttpClient) {}

  
  private getHttpOptions() {
    const token = localStorage.getItem('token'); 
    
    const headers: any = {
      'Content-Type': 'application/json'
    };

   
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return {
      headers: new HttpHeaders(headers)
    };
  }

  getEvents(): Observable<EventDTO[]> {
    return this.http.get<EventDTO[]>(this.apiUrl1, this.getHttpOptions()); 
  }

  getEvent(id: number): Observable<EventDTO> {
    return this.http.get<EventDTO>(`${this.apiUrl}/${id}`, this.getHttpOptions()); 
  }

  createEvent(event: CreateEventDTO): Observable<any> {
    return this.http.post(this.apiUrl, event, this.getHttpOptions()); 
  }

  updateEvent(id: number, event: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, event, this.getHttpOptions()); 
  }
 getLocations(): Observable<LocationDTO[]> {
    return this.http.get<LocationDTO[]>(`${this.apiUrl}/locations`, this.getHttpOptions());
  }
  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHttpOptions()); 
  }

  private logTokenStatus() {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔑 Token found in localStorage:', token.substring(0, 20) + '...');
    } else {
      console.log('❌ No token found in localStorage');
    }
  }
}


