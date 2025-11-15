import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {

private apiUrl = 'https://localhost:7177/api/Tickets';

  constructor(private http: HttpClient) {}

  getTicket(id: number): Observable<TicketDTO> {
    return this.http.get<TicketDTO>(`${this.apiUrl}/${id}`);
  }
 getTicketsByEvent(eventId: number): Observable<TicketDTO[]> {
    return this.http.get<TicketDTO[]>(`${this.apiUrl}/event/${eventId}`);
  }
  createTicket(ticket: CreateTicketDTO): Observable<any> {
    return this.http.post<any>(this.apiUrl, ticket);
  }

  purchaseTicket(purchase: CreatePurchaseDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/purchase`, purchase); 
  }

  validateTicket(purchaseId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/validate`, purchaseId);
  }
}





export interface TicketDTO {
  id: number;
  eventId: number;
  type: string;
  price: number;
  quantity: number;
  status: string;
}

export interface CreateTicketDTO {
  eventId: number;
  type: string;
  price: number;
  quantity: number;
  promoCode?: string;
}

export interface CreatePurchaseDTO {
  eventId: number;          // ✅ EventId
  ticketType: string;       // ✅ TicketType (შეცვლილია 'type'-იდან)
  userId: number;           // ✅ UserId
  promoCode?: string;       // ✅ PromoCode
  quantity: number;         // ✅ Quantity
}