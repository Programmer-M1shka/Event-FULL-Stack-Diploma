import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AssignAdminDTO {
  email: string;
}

interface ApiResponse {
  message: string;
}

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss'],
  standalone: true,
   imports: [CommonModule, FormsModule],
})
export class AdminPanelComponent implements OnInit {
  admins: Admin[] = [];
  newAdminEmail: string = '';
  removeAdminEmail: string = '';
  loading: boolean = false;
  error: string = '';
  success: string = '';

  
  private apiBaseUrl = 'https://localhost:7177/api/Auth';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.loading = true;
    this.error = '';
    
   
    this.http.get<Admin[]>(`${this.apiBaseUrl}/get-all-admins`).subscribe({
      next: (data) => {
        this.admins = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load admins';
        this.loading = false;
        console.error('Error loading admins:', error);
      }
    });
  }

  assignAdmin(): void {
    if (!this.newAdminEmail.trim()) {
      this.error = 'Please enter an email address';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const request: AssignAdminDTO = { email: this.newAdminEmail };

 
    this.http.post<ApiResponse>(`${this.apiBaseUrl}/assign-admin`, request).subscribe({
      next: (response) => {
        this.success = response.message;
        this.newAdminEmail = '';
        this.loadAdmins();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to assign admin role';
        this.loading = false;
        console.error('Error assigning admin:', error);
      }
    });
  }

 removeAdmin(): void {
  const email = this.removeAdminEmail.trim();
  if (!email) {
    Swal.fire({
      icon: 'warning',
      title: 'შეცდომა',
      text: 'გთხოვთ შეიყვანოთ ელ-ფოსტა'
    });
    return;
  }

  // 🚫 საკუთარი როლი
  const currentUserEmail = localStorage.getItem('email');
  if (email === currentUserEmail) {
    Swal.fire({
      icon: 'error',
      title: 'მოქმედება აკრძალულია',
      text: 'თქვენი საკუთარი როლის მოხსნა არ შეიძლება'
    });
    return;
  }


  if (email === 'xaritona12@gmail.com') {
    Swal.fire({
      icon: 'error',
      title: 'მოქმედება აკრძალულია',
      text: 'ამ ადმინის როლის მოხსნა არ შეიძლება'
    });
    return;
  }


  this.executeRemoveAdmin(email);
}

  private executeRemoveAdmin(email: string): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    const request: AssignAdminDTO = { email };

    this.http.post<ApiResponse>(`${this.apiBaseUrl}/remove-admin`, request).subscribe({
      next: (response) => {
        this.success = response.message;
Swal.fire({
  title: '✅ წარმატება!',
  text: response.message || 'ოპერაცია დასრულდა წარმატებით',
  icon: 'success',
  confirmButtonText: 'კარგი',
  confirmButtonColor: '#28a745',
  background: '#f0fdf4',
  iconColor: '#28a745',
  color: '#155724',
  showClass: { popup: 'animate__animated animate__fadeInDown' },
  hideClass: { popup: 'animate__animated animate__fadeOutUp' },
  customClass: {
    popup: 'sweet-success-popup',
    title: 'sweet-title',
    htmlContainer: 'sweet-text'
  }
});
        this.removeAdminEmail = '';
        this.loadAdmins();
        this.loading = false;
      },
      error: (error) => {
        const msg = error.error?.message || 'როლის მოხსნა ვერ მოხერხდა';
        this.error = msg;
        Swal.fire({
          icon: 'error',
          title: 'შეცდომა',
          text: msg
        });
        this.loading = false;
      }
    });
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }
}