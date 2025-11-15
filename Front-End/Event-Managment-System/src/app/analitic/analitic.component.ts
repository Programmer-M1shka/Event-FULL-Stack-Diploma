import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  AnalyticsService, 
  SalesSummary, 
  DailySales, 
  EventSales, 
  TopEvent, 
  AttendanceStats, 
  UserActivity, 
  MonthlyTrend 
} from '../../analytics.service';

@Component({
  selector: 'app-analitic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analitic.component.html',
  styleUrls: ['./analitic.component.css']
})
export class AnaliticComponent implements OnInit {
  // Data properties
  salesSummary: SalesSummary[] = [];
  dailySales: DailySales[] = [];
  topEvents: TopEvent[] = [];
  attendanceStats: AttendanceStats[] = [];
  userActivity: UserActivity[] = [];
  monthlyTrends: MonthlyTrend[] = [];
  

  startDate: string = '';
  endDate: string = '';
  selectedEventId: number | null = null;
  selectedUserId: number | null = null;
  topEventsLimit: number = 10;
  
 
  loadingSales = false;
  loadingAttendance = false;
  loadingUserActivity = false;
  loadingTrends = false;
  
  
  activeTab: string = 'sales';

  constructor(private analyticsService: AnalyticsService) {
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    this.endDate = today.toISOString().split('T')[0];
    this.startDate = thirtyDaysAgo.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadSalesData();
    this.loadAttendanceData();
    this.loadUserActivityData();
    this.loadTrendsData();
  }

  loadSalesData(): void {
    this.loadingSales = true;
    
    // Load sales summary
    this.analyticsService.getSalesSummary().subscribe({
      next: (data) => {
        this.salesSummary = data;
      },
      error: (error) => {
        console.error('Error loading sales summary:', error);
      }
    });

    // Load daily sales
   this.analyticsService.getDailySales(this.startDate, this.endDate).subscribe({
  next: (data) => {
    console.log('Success:', data);
    this.dailySales = data;
  },
  error: (error) => {
    console.error('Full error object:', error);
    console.error('Error status:', error.status);
    console.error('Error message:', error.message);
  }
});

    // Load top events
    this.analyticsService.getTopEvents(this.topEventsLimit).subscribe({
      next: (data) => {
        this.topEvents = data;
        this.loadingSales = false;
      },
      error: (error) => {
        console.error('Error loading top events:', error);
        this.loadingSales = false;
      }
    });
  }

  loadAttendanceData(): void {
    this.loadingAttendance = true;
    
    this.analyticsService.getAttendanceStats().subscribe({
      next: (data) => {
        this.attendanceStats = data;
        this.loadingAttendance = false;
      },
      error: (error) => {
        console.error('Error loading attendance stats:', error);
        this.loadingAttendance = false;
      }
    });
  }

  loadUserActivityData(): void {
    this.loadingUserActivity = true;
    
    this.analyticsService.getUserActivity(this.selectedUserId || undefined).subscribe({
      next: (data) => {
        this.userActivity = data;
        this.loadingUserActivity = false;
      },
      error: (error) => {
        console.error('Error loading user activity:', error);
        this.loadingUserActivity = false;
      }
    });
  }

  loadTrendsData(): void {
    this.loadingTrends = true;
    
    this.analyticsService.getMonthlyTrends().subscribe({
      next: (data) => {
        this.monthlyTrends = data;
        this.loadingTrends = false;
      },
      error: (error) => {
        console.error('Error loading monthly trends:', error);
        this.loadingTrends = false;
      }
    });
  }

  onDateRangeChange(): void {
    this.loadSalesData();
  }

  onTopEventsLimitChange(): void {
    this.loadSalesData();
  }

  onUserFilterChange(): void {
    this.loadUserActivityData();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ka-GE', {
      style: 'currency',
      currency: 'GEL'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ka-GE');
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getTotalRevenue(): number {
    return this.salesSummary.reduce((total, item) => total + item.totalSales, 0);
  }

  getTotalTicketsSold(): number {
    return this.salesSummary.reduce((total, item) => total + item.ticketsSold, 0);
  }

  getAverageAttendanceRate(): number {
    if (this.attendanceStats.length === 0) return 0;
    const totalRate = this.attendanceStats.reduce((sum, stat) => sum + stat.attendanceRate, 0);
    return totalRate / this.attendanceStats.length;
  }

  getTopSpender(): UserActivity | null {
    if (this.userActivity.length === 0) return null;
    return this.userActivity.reduce((top, current) => 
      current.totalSpent > top.totalSpent ? current : top
    );
  }
}