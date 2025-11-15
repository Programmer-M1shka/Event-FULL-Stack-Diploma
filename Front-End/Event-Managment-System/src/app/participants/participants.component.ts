import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParticipantService } from '../participant.service';
import Swal from 'sweetalert2';
import { UserDTO } from '../events/events.component';
import { AuthService } from '../auth.service';
import { EventService } from '../event.service';

export interface ParticipantDTO {
  id: number;
  eventId: number;
  eventTitle: string;
  user: any;
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

@Component({
  selector: 'app-participants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './participants.component.html',
  styleUrl: './participants.component.css'
})
export class ParticipantsComponent implements OnInit {
  participants: ParticipantDTO[] = [];
  selectedParticipant: ParticipantDTO | null = null;
  loading: boolean = false;
  error: string = '';
   events: any[] = [];        
  users: UserDTO[] = [];
 getParticipants: ParticipantDTO[] = [];

  registrationData: RegisterParticipantDTO = {
    eventId: 0,
    userId: 0,
    ticketId: undefined
  };


  rating: number = 0;
  ratingComment: string = '';

  constructor(private participantService: ParticipantService,private eventService: EventService, 
  private authService: AuthService ) {}

  ngOnInit(): void {
    this.loadEvents();  
  this.loadUsers();
  this.loadAllParticipants();
  }

loadAllParticipants(): void {
  this.participantService.getAllParticipants().subscribe({
    next: (data) => {
      this.getParticipants = data;
      console.log('✅ Participants loaded:', data); 
    },
    error: (err) => console.error('❌ Error loading participants:', err)
  });
}
loadEvents(): void {
  this.eventService.getEvents().subscribe({
    next: (events) => this.events = events,
    error: (err) => console.error('Error loading events:', err)
  });
}

 loadUsers(): void {
  this.authService.getAllUsers().subscribe({
    next: (users) => {
      const currentRole = localStorage.getItem('guard');

      
      if (currentRole === 'PARTICIPANT') {
        this.users = users.filter((u: any) => u.role !== 0);
      } else {
        this.users = users;
      }

      console.log('Filtered users:', this.users);
    },
    error: (err) => console.error('Error loading users:', err)
  });
}

  getParticipantById(id: number): void {
    if (!id || id <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'შეცდომა!',
        text: 'არასწორი მონაწილის ID',
        confirmButtonText: 'გასაგებია',
        confirmButtonColor: '#dc3545',
        background: '#fff',
        customClass: {
          popup: 'swal-popup-error'
        }
      });
      return;
    }

    this.loading = true;
    this.error = '';

    
    Swal.fire({
      title: 'იტვირთება...',
      html: 'მონაწილის მონაცემების ჩატვირთვა',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.participantService.getById(id).subscribe({
      next: (participant: ParticipantDTO) => {
        this.selectedParticipant = participant;
        this.loading = false;
        
     Swal.fire({
  icon: 'success',
  title: 'წარმატება!',
  html: `
    <div style="
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #2c3e50;
      text-align: left;
      margin-top: 15px;
      line-height: 1.6;
    ">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 1.2em; margin-right: 10px;">👤</span>
        <strong>მონაწილე:</strong> ${participant.user?.name || 'უცნობი'}
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 1.2em; margin-right: 10px;">🎉</span>
        <strong>ღონისძიება:</strong> ${participant.eventTitle}
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 1.2em; margin-right: 10px;">📅</span>
        <strong>რეგისტრაციის თარიღი:</strong> ${new Date(participant.registrationDate).toLocaleDateString('ka-GE')}
      </div>
      <div style="display: flex; align-items: center;">
        <span style="font-size: 1.2em; margin-right: 10px;">${participant.attendance ? '✅' : '❌'}</span>
        <strong>დასწრება:</strong> 
        <span style="margin-left: 5px; font-weight: 600; color: ${participant.attendance ? '#27ae60' : '#e74c3c'};">
          ${participant.attendance ? 'დაუდასტურდა' : 'დაუდასტურებელი'}
        </span>
      </div>
    </div>
  `,
  confirmButtonText: 'კარგი',
  confirmButtonColor: '#27ae60',
  showConfirmButton: true,
  timer: 800,
  background: '#ffffff',
  customClass: {
    popup: 'swal-popup-success',
    title: 'swal-title-custom',
    htmlContainer: 'swal-html-custom'
  }
});
        
        console.log('Participant retrieved:', participant);
      },
      error: (error) => {
        this.loading = false;
        
        Swal.fire({
          icon: 'error',
          title: 'შეცდომა!',
          text: `მონაწილის ჩატვირთვისას მოხდა შეცდომა: ${error.message || 'უცნობი შეცდომა'}`,
          confirmButtonText: 'სცადე თავიდან',
          confirmButtonColor: '#dc3545',
          showCancelButton: true,
          cancelButtonText: 'გაუქმება',
          cancelButtonColor: '#6c757d',
          customClass: {
            popup: 'swal-popup-error'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            this.getParticipantById(id);
          }
        });
        
        console.error('Error fetching participant:', error);
      }
    });
  }

  
  toggleAttendance(): void {
    if (!this.selectedParticipant) {
      Swal.fire({
        icon: 'info',
        title: 'ინფორმაცია',
        text: 'მონაწილე არ არის არჩეული',
        confirmButtonText: 'გასაგებია',
        confirmButtonColor: '#17a2b8',
        customClass: {
          popup: 'swal-popup-info'
        }
      });
      return;
    }

    const currentAttendance = this.selectedParticipant.attendance;
    const newAttendance = !currentAttendance;
    
  
    Swal.fire({
      title: 'დასწრების სტატუსის შეცვლა',
      html: `
        <div style="text-align: left;">
          <p><strong>მონაწილე:</strong> ${this.selectedParticipant.user?.name || 'უცნობი'}</p>
          <p><strong>ღონისძიება:</strong> ${this.selectedParticipant.eventTitle}</p>
          <p><strong>მიმდინარე სტატუსი:</strong> ${currentAttendance ? '✅ დასწრებული' : '❌ დაუსწრებელი'}</p>
          <p><strong>ახალი სტატუსი:</strong> ${newAttendance ? '✅ დასწრებული' : '❌ დაუსწრებელი'}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'დიახ, შეცვლა',
      cancelButtonText: 'არა, გაუქმება',
      confirmButtonColor: newAttendance ? '#28a745' : '#dc3545',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'swal-popup-confirm'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.performAttendanceToggle(newAttendance);
      }
    });
  }

  private performAttendanceToggle(newAttendance: boolean): void {
    if (!this.selectedParticipant) return;

    this.loading = true;
    this.error = '';

    
    Swal.fire({
      title: 'იცვლება დასწრების სტატუსი...',
      html: 'გთხოვთ დაელოდოთ',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.participantService.toggleAttendance(this.selectedParticipant.id, newAttendance).subscribe({
      next: (updatedParticipant: ParticipantDTO) => {
        
        this.selectedParticipant = updatedParticipant;
        
       
        const index = this.participants.findIndex(p => p.id === updatedParticipant.id);
        if (index !== -1) {
          this.participants[index] = updatedParticipant;
        }
        
        this.loading = false;
        
        Swal.fire({
          icon: 'success',
          title: 'სტატუსი წარმატებით შეიცვალა!',
          html: `
            <div style="text-align: center; margin-top: 15px;">
              <p style="font-size: 18px;">${newAttendance ? '🎉 დასწრება დადასტურდა!' : '⚠️ დასწრება გაუქმდა'}</p>
              <p><strong>მონაწილე:</strong> ${updatedParticipant.user?.name || 'უცნობი'}</p>
              <p><strong>ღონისძიება:</strong> ${updatedParticipant.eventTitle}</p>
              <p><strong>ახალი სტატუსი:</strong> ${updatedParticipant.attendance ? '✅ დასწრებული' : '❌ დაუსწრებელი'}</p>
            </div>
          `,
          confirmButtonText: 'შესანიშნავია!',
          confirmButtonColor: newAttendance ? '#28a745' : '#dc3545',
          showConfirmButton: true,
          timer: 6000,
          customClass: {
            popup: 'swal-popup-success'
          }
        });
        
        console.log('Attendance updated successfully:', updatedParticipant);
      },
      error: (error) => {
        this.loading = false;
        
        Swal.fire({
          icon: 'error',
          title: 'სტატუსის შეცვლა ვერ მოხერხდა!',
          text: `შეცდომა: ${error.message || 'უცნობი შეცდომა'}`,
          confirmButtonText: 'სცადე თავიდან',
          confirmButtonColor: '#dc3545',
          showCancelButton: true,
          cancelButtonText: 'გაუქმება',
          cancelButtonColor: '#6c757d',
          customClass: {
            popup: 'swal-popup-error'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            this.performAttendanceToggle(newAttendance);
          }
        });
        
        console.error('Error updating attendance:', error);
      }
    });
  }

  registerParticipant(): void {
    if (!this.registrationData.eventId || !this.registrationData.userId) {
      Swal.fire({
        icon: 'warning',
        title: 'გაფრთხილება!',
        text: 'ღონისძიების ID და მომხმარებლის ID აუცილებელია',
        confirmButtonText: 'გასაგებია',
        confirmButtonColor: '#ffc107',
        customClass: {
          popup: 'swal-popup-warning'
        }
      });
      return;
    }

    
    Swal.fire({
      title: 'დარწმუნებული ხართ?',
      html: `
        <div style="text-align: left;">
          <p><strong>ღონისძიების ID:</strong> ${this.registrationData.eventId}</p>
          <p><strong>მომხმარებლის ID:</strong> ${this.registrationData.userId}</p>
          ${this.registrationData.ticketId ? `<p><strong>ბილეთის ID:</strong> ${this.registrationData.ticketId}</p>` : ''}
          <p style="color: #28a745;"><strong>დასწრება:</strong> ✅ ავტომატურად დადასტურდება</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'დიახ, რეგისტრაცია',
      cancelButtonText: 'არა, გაუქმება',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      customClass: {
        popup: 'swal-popup-confirm'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.performRegistration();
      }
    });
  }

  private performRegistration(): void {
    this.loading = true;
    this.error = '';

   
    Swal.fire({
      title: 'რეგისტრაცია მიმდინარეობს...',
      html: 'გთხოვთ დაელოდოთ',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.participantService.register(this.registrationData).subscribe({
      next: (newParticipant: ParticipantDTO) => {
        
        newParticipant.attendance = true;
        
        this.participants.push(newParticipant);
        this.selectedParticipant = newParticipant;
        this.resetRegistrationForm();
        this.loading = false;
        
        Swal.fire({
          icon: 'success',
          title: 'წარმატებული რეგისტრაცია!',
          html: `
            <div style="text-align: center; margin-top: 15px;">
              <p style="font-size: 18px; color: #28a745;">🎉 გილოცავთ! 🎉</p>
              <p><strong>ღონისძიება:</strong> ${newParticipant.eventTitle}</p>
              <p><strong>რეგისტრაციის თარიღი:</strong> ${new Date(newParticipant.registrationDate).toLocaleDateString('ka-GE')}</p>
              <p style="color: #28a745;"><strong>დასწრება:</strong> ✅ დადასტურებულია</p>
            </div>
          `,
          confirmButtonText: 'შესანიშნავია!',
          confirmButtonColor: '#28a745',
          showConfirmButton: true,
          timer: 8000,
          customClass: {
            popup: 'swal-popup-success'
          }
        });
        
        console.log('Participant registered successfully with attendance true:', newParticipant);
      },
      error: (error) => {
        this.loading = false;
        
        Swal.fire({
          icon: 'error',
          title: 'რეგისტრაცია ვერ მოხერხდა!',
          text: `შეცდომა: ${error.message || 'უცნობი შეცდომა'}`,
          confirmButtonText: 'სცადე თავიდან',
          confirmButtonColor: '#dc3545',
          showCancelButton: true,
          cancelButtonText: 'გაუქმება',
          cancelButtonColor: '#6c757d',
          customClass: {
            popup: 'swal-popup-error'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            this.performRegistration();
          }
        });
        
        console.error('Error registering participant:', error);
      }
    });
  }


  addToCalendar(): void {
    if (!this.selectedParticipant) {
      Swal.fire({
        icon: 'info',
        title: 'ინფორმაცია',
        text: 'მონაწილე არ არის არჩეული',
        confirmButtonText: 'გასაგებია',
        confirmButtonColor: '#17a2b8',
        customClass: {
          popup: 'swal-popup-info'
        }
      });
      return;
    }

    const eventDate = new Date(this.selectedParticipant.registrationDate);
    const eventTitle = encodeURIComponent(this.selectedParticipant.eventTitle);
    const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startDate}/${startDate}&details=Event%20ID:%20${this.selectedParticipant.eventId}`;
    
    Swal.fire({
      title: 'კალენდარში დამატება',
      html: `
        <div style="text-align: center;">
          <p>📅 <strong>${this.selectedParticipant.eventTitle}</strong></p>
          <p>Google კალენდარში დამატება?</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'დიახ, დამატება',
      cancelButtonText: 'არა',
      confirmButtonColor: '#4285f4',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'swal-popup-calendar'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(googleCalendarUrl, '_blank');
        
        Swal.fire({
          icon: 'success',
          title: 'კალენდარი გაიხსნა!',
          text: 'Google კალენდარი ახალ ფანჯარაში გაიხსნა',
          timer: 3000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-popup-success'
          }
        });
      }
    });
  }

  
  async submitRating(): Promise<void> {
    if (!this.selectedParticipant) {
      Swal.fire({
        icon: 'info',
        title: 'ინფორმაცია',
        text: 'მონაწილე არ არის არჩეული',
        confirmButtonText: 'გასაგებია',
        confirmButtonColor: '#17a2b8'
      });
      return;
    }

    if (this.rating < 1 || this.rating > 5) {
      Swal.fire({
        icon: 'warning',
        title: 'გაფრთხილება!',
        text: 'გთხოვთ აირჩიოთ რეიტინგი 1-დან 5-მდე',
        confirmButtonText: 'გასაგებია',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

   
    const { value: finalComment } = await Swal.fire({
      title: 'რეიტინგის დადასტურება',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <p><strong>ღონისძიება:</strong> ${this.selectedParticipant.eventTitle}</p>
          <p><strong>რეიტინგი:</strong> ${'⭐'.repeat(this.rating)} (${this.rating}/5)</p>
        </div>
        <div style="text-align: left;">
          <label for="swal-input1" style="font-weight: bold;">კომენტარი (არასავალდებულო):</label>
        </div>
      `,
      input: 'textarea',
      inputPlaceholder: 'თქვენი კომენტარი...',
      inputValue: this.ratingComment,
      showCancelButton: true,
      confirmButtonText: 'რეიტინგის შენახვა',
      cancelButtonText: 'გაუქმება',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => {
        
        return null;
      }
    });

    if (finalComment !== undefined) {
      const ratingData = {
        id: Date.now(),
        participantId: this.selectedParticipant.id,
        eventId: this.selectedParticipant.eventId,
        eventTitle: this.selectedParticipant.eventTitle,
        rating: this.rating,
        comment: finalComment || '',
        createdAt: new Date().toISOString()
      };

     
      const existingRatings = this.getStoredRatings();
      
     
      const existingIndex = existingRatings.findIndex(r => 
        r.participantId === ratingData.participantId && r.eventId === ratingData.eventId
      );

      if (existingIndex !== -1) {
        
        existingRatings[existingIndex] = { ...existingRatings[existingIndex], ...ratingData };
      } else {
        
        existingRatings.push(ratingData);
      }

      console.log('Rating saved:', ratingData);
      
      
      Swal.fire({
        icon: 'success',
        title: 'რეიტინგი შენახულია!',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 20px;">🎉 მადლობა თქვენი შეფასებისთვის! 🎉</p>
            <p><strong>რეიტინგი:</strong> ${'⭐'.repeat(this.rating)} (${this.rating}/5)</p>
            ${finalComment ? `<p><strong>კომენტარი:</strong> "${finalComment}"</p>` : ''}
            <p style="color: #6c757d; font-size: 14px;">რეიტინგი შენახულია</p>
          </div>
        `,
        confirmButtonText: 'შესანიშნავია!',
        confirmButtonColor: '#28a745',
        timer: 6000,
        customClass: {
          popup: 'swal-popup-success'
        }
      });
      
     
      this.rating = 0;
      this.ratingComment = '';
    }
  }


  private ratingsStorage: any[] = [];

  
  getStoredRatings(): any[] {
    return this.ratingsStorage;
  }


  getParticipantRatings(): any[] {
    if (!this.selectedParticipant) return [];
    
    const allRatings = this.getStoredRatings();
    return allRatings.filter(r => 
      r.participantId === this.selectedParticipant!.id && 
      r.eventId === this.selectedParticipant!.eventId
    );
  }

 
  getAllStoredRatings(): any[] {
    return this.getStoredRatings();
  }

  // Social Share
  shareOnSocial(platform: string): void {
    if (!this.selectedParticipant) {
      Swal.fire({
        icon: 'info',
        title: 'ინფორმაცია',
        text: 'მონაწილე არ არის არჩეული',
        confirmButtonText: 'გასაგებია',
        confirmButtonColor: '#17a2b8'
      });
      return;
    }

    const shareText = encodeURIComponent(`მე ვმონაწილეობ ${this.selectedParticipant.eventTitle}-ში!`);
    const shareUrl = encodeURIComponent(window.location.href);
    
    let socialUrl = '';
    let platformName = '';
    let platformIcon = '';
    
    switch (platform) {
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
        platformName = 'Facebook';
        platformIcon = '📘';
        break;
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
        platformName = 'Twitter';
        platformIcon = '🐦';
        break;
      case 'linkedin':
        socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        platformName = 'LinkedIn';
        platformIcon = '💼';
        break;
      default:
        Swal.fire({
          icon: 'error',
          title: 'შეცდომა!',
          text: 'მხარდაუჭერელი სოციალური პლატფორმა',
          confirmButtonText: 'გასაგებია',
          confirmButtonColor: '#dc3545'
        });
        return;
    }

    Swal.fire({
      title: `${platformIcon} ${platformName}-ზე გაზიარება`,
      html: `
        <div style="text-align: center;">
          <p><strong>ღონისძიება:</strong> ${this.selectedParticipant.eventTitle}</p>
          <p style="font-style: italic; color: #6c757d;">"მე ვმონაწილეობ ${this.selectedParticipant.eventTitle}-ში!"</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `${platformIcon} გაზიარება`,
      cancelButtonText: 'გაუქმება',
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'swal-popup-social'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(socialUrl, '_blank', 'width=600,height=400');
        
        Swal.fire({
          icon: 'success',
          title: 'გაზიარება წარმატებული!',
          text: `${platformName} ახალ ფანჯარაში გაიხსნა`,
          timer: 3000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-popup-success'
          }
        });
      }
    });
  }

  resetRegistrationForm(): void {
    this.registrationData = {
      eventId: 0,
      userId: 0,
      ticketId: undefined
    };
  }

  clearSelection(): void {
    this.selectedParticipant = null;
    this.rating = 0;
    this.ratingComment = '';
    
    Swal.fire({
      icon: 'info',
      title: 'მონაცემები გასუფთავდა',
      text: 'არჩეული მონაწილე და რეიტინგი გასუფთავდა',
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: 'swal-popup-info'
      }
    });
  }

  clearError(): void {
    this.error = '';
  }
}