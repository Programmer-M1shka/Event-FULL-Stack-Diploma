import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
   private lastLocationId: number | null = null;
  private apiUrl = 'https://localhost:7177/api/Location';

  constructor(private http: HttpClient) { }

createLocation(location: LocationCreateDTO): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}/create-location`, location, { headers });
  }


  setLastLocationId(id: number): void {
    this.lastLocationId = id;
  }

  getLastLocationId(): number | null {
    return this.lastLocationId;
  }

  
}
export interface LocationDTO {
  id: number;
  address: string;
  city: string;
  country: string;
  zipCode?: string;
}

export interface LocationCreateDTO {
  name: string;
  address: string;
  city: string;
  country: string;
  zipCode?: string;
}

export interface CreateLocationResponse {
  message: string;
  id: number;
}

