
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalesSummary {
  eventTitle: string;
  totalSales: number;
  ticketsSold: number;
  revenue: number;
}

export interface DailySales {
  date: string;
  totalSales: number;
  ticketCount: number;
}

export interface EventSales {
  ticketType: string;
  quantity: number;
  revenue: number;
  averagePrice: number;
}

export interface TopEvent {
  eventId: number;
  eventTitle: string;
  totalRevenue: number;
  ticketsSold: number;
}

export interface AttendanceStats {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  totalRegistered: number;
  totalAttended: number;
  attendanceRate: number;
}

export interface UserActivity {
  userId: number;
  userName: string;
  totalPurchases: number;
  totalSpent: number;
  eventsAttended: number;
  averageSpending: number;
  lastPurchase: string;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  totalSales: number;
  ticketsSold: number;
  uniqueCustomers: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
 private apiUrl = 'https://localhost:7177/api/Analytics';

  constructor(private http: HttpClient) {}

  getSalesSummary(): Observable<SalesSummary[]> {
    return this.http.get<SalesSummary[]>(`${this.apiUrl}/sales-summary`);
  }

  getDailySales(startDate?: string, endDate?: string): Observable<DailySales[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get<DailySales[]>(`${this.apiUrl}/daily-sales`, { params });
  }

  getEventSales(eventId: number): Observable<EventSales[]> {
    return this.http.get<EventSales[]>(`${this.apiUrl}/event/${eventId}/sales`);
  }

  getTopEvents(limit: number = 10): Observable<TopEvent[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TopEvent[]>(`${this.apiUrl}/top-events`, { params });
  }

  getAttendanceStats(): Observable<AttendanceStats[]> {
    return this.http.get<AttendanceStats[]>(`${this.apiUrl}/attendance-stats`);
  }

  getUserActivity(userId?: number): Observable<UserActivity[]> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId.toString());
    
    return this.http.get<UserActivity[]>(`${this.apiUrl}/user-activity`, { params });
  }

  getMonthlyTrends(): Observable<MonthlyTrend[]> {
    return this.http.get<MonthlyTrend[]>(`${this.apiUrl}/monthly-trends`);
  }
}
