import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDTO } from './events/events.component';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private baseApiUrl = 'https://localhost:7177/api/Participants';

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<ParticipantDTO> {
    return this.http.get<ParticipantDTO>(`${this.baseApiUrl}/${id}`);
  }

  register(model: RegisterParticipantDTO): Observable<ParticipantDTO> {
    return this.http.post<ParticipantDTO>(`${this.baseApiUrl}/register`, model);
  }
getAllParticipants(): Observable<ParticipantDTO[]> {
  return this.http.get<ParticipantDTO[]>(`${this.baseApiUrl}/all`);
}

    toggleAttendance(participantId: number, attendance: boolean): Observable<ParticipantDTO> {
    const model: AttendanceUpdateDTO = { attendance };
    return this.http.put<ParticipantDTO>(`${this.baseApiUrl}/${participantId}/attendance`, model);
  }
}


export interface ParticipantDTO {
  id: number;
  eventId: number;
  eventTitle: string;
  user: UserDTO;
  ticketId?: number;
  ticketType?: string;
  registrationDate: string;
  attendance: boolean;
}

export interface RegisterParticipantDTO {
  eventId: number;
  userId: number;
  ticketId?: number;
}

export interface AttendanceUpdateDTO {
  attendance: boolean;
}