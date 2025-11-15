import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { CreatePurchaseDTO, CreateTicketDTO, TicketDTO, TicketsService } from "../tickets.service";
import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { EventService } from "../event.service";
import { EventDTO, UserDTO } from "../events/events.component";
import Swal from "sweetalert2";
import { AuthService } from "../auth.service";

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,HttpClientModule,FormsModule],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']  
})
export class TicketsComponent implements OnInit {
  
  createForm: FormGroup;
  purchaseForm: FormGroup;
  
  // Events dropdown data
  events: EventDTO[] = [];
  isLoadingEvents = false;
  
  // Available tickets for selected event
  availableTickets: TicketDTO[] = [];
  isLoadingTickets = false;
  
  ticketIdToLoad: number = 0;
  loadedTicket: TicketDTO | null = null;
  
  qrCodeData: string = '';
  generatedQrCode: string = '';
  isQRGenerated: boolean = false;
  users: UserDTO[] = [];
  lastPurchaseResponse: any = null;

  constructor(
    private fb: FormBuilder, 
    private ticketService: TicketsService,
    private eventService: EventService,
    private authService: AuthService
  ) {
    this.createForm = this.fb.group({
      eventId: [null, Validators.required],
      type: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(1)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });

    
    this.purchaseForm = this.fb.group({
      eventId: [null, Validators.required],
      ticketType: [{value: '', disabled: true}, Validators.required], 
      userId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]],
      promoCode: ['']
    });
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadUsers();
    
    
    this.purchaseForm.get('eventId')?.valueChanges.subscribe(eventId => {
      const ticketTypeControl = this.purchaseForm.get('ticketType');
      
      if (eventId) {
        
        ticketTypeControl?.enable();
        ticketTypeControl?.setValue(''); 
        this.loadTicketsForEvent(eventId);
      } else {
     
        ticketTypeControl?.disable();
        ticketTypeControl?.setValue('');
        this.availableTickets = [];
      }
    });
    
  }

isAdmin(): boolean {
  return localStorage.getItem('guard') === 'ADMIN';
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



  loadEvents(): void {
    this.isLoadingEvents = true;
    
    this.eventService.getEvents().subscribe({
      next: (data: EventDTO[]) => {
        this.events = data;
        this.isLoadingEvents = false;
        console.log('დატვირთული ივენთები:', this.events);
      },
      error: (error) => {
        console.error('ივენთების დატვირთვის შეცდომა:', error);
        this.isLoadingEvents = false;
        Swal.fire({
          icon: 'error',
          title: 'შეცდომა!',
          text: 'ივენთების დატვირთვა ვერ მოხერხდა',
          confirmButtonText: 'კარგი'
        });
      }
    });
  }

  // ახალი მეთოდი - კონკრეტული ივენთის ბილეთების ჩატვირთვა
  loadTicketsForEvent(eventId: number): void {
    this.isLoadingTickets = true;
    this.availableTickets = [];
    
    this.ticketService.getTicketsByEvent(eventId).subscribe({
      next: (tickets: TicketDTO[]) => {
        this.availableTickets = tickets.filter(t => t.quantity > 0); 
        this.isLoadingTickets = false;
        console.log('ხელმისაწვდომი ბილეთები:', this.availableTickets);
      },
      error: (error) => {
        console.error('ბილეთების დატვირთვის შეცდომა:', error);
        this.availableTickets = [];
        this.isLoadingTickets = false;
        
       
        Swal.fire({
          icon: 'warning',
          title: 'ყურადღება!',
          text: 'ამ ივენთისთვის ბილეთების ჩატვირთვა ვერ მოხერხდა',
          confirmButtonText: 'კარგი'
        });
      }
    });
  }

  
  getEventTitle(eventId: number): string {
    const event = this.events.find(e => e.id === eventId);
    return event ? event.title : `Event #${eventId}`;
  }

  
  private validatePurchaseForm(): string | null {
    const form = this.purchaseForm;
    
    if (!form.get('eventId')?.value) {
      return 'გთხოვთ აირჩიოთ ივენთი';
    }
    

    const ticketTypeValue = form.get('ticketType')?.value;
    if (!ticketTypeValue) {
      return 'გთხოვთ აირჩიოთ ბილეთის ტიპი';
    }
    
    if (!form.get('userId')?.value) {
      return 'გთხოვთ შეიყვანოთ მომხმარებლის ID';
    }
    
    const quantity = form.get('quantity')?.value;
    if (!quantity || quantity < 1) {
      return 'რაოდენობა უნდა იყოს მინიმუმ 1';
    }
    
    return null;
  }

  private validateCreateForm(): string | null {
    const form = this.createForm;
    
    if (!form.get('eventId')?.value) {
      return 'გთხოვთ აირჩიოთ ივენთი';
    }
    
    if (!form.get('type')?.value || form.get('type')?.value.trim() === '') {
      return 'გთხოვთ შეიყვანოთ ბილეთის ტიპი';
    }
    
    const price = form.get('price')?.value;
    if (!price || price <= 0) {
      return 'გთხოვთ შეიყვანოთ სწორი ფასი (0-ზე მეტი)';
    }
    
    const quantity = form.get('quantity')?.value;
    if (!quantity || quantity < 1) {
      return 'რაოდენობა უნდა იყოს მინიმუმ 1';
    }
    
    return null;
  }

  onCreateTicket() {
    const validationError = this.validateCreateForm();
    
    if (validationError) {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ ყურადღება!',
        text: validationError,
        confirmButtonText: 'კარგი',
        background: '#fff8e1',
        iconColor: '#ff9800',
        confirmButtonColor: '#ff9800',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
      return;
    }

    if (this.createForm.valid) {
      const ticketData = this.createForm.value as CreateTicketDTO;
      console.log('🚀 გაგზავნილი ბილეთის მონაცემები:', ticketData);

      this.ticketService.createTicket(ticketData).subscribe({
        next: (res) => {
          const selectedEvent = this.getEventTitle(ticketData.eventId);
          
          Swal.fire({
            icon: 'success',
            title: 'თქვენ წარმატებით შექმენით ბილეთი!',
            html: `
              <strong>ბილეთის ID:</strong> ${res.id || res.ticketId}<br>
              <strong>ივენთი:</strong> ${selectedEvent}<br>
            `,
            timer: 4000,
            timerProgressBar: true,
            showConfirmButton: true,   
            confirmButtonText: 'გახურვა',
            background: '#f0f9ff',
            iconColor: '#28a745',
            toast: false, 
            position: 'center'
          });

          console.log(res);
          this.createForm.reset();
          
          // QR კოდის გენერაცია
          if (res && (res.id || res.ticketId)) {
            this.generateQRForTicket(res.id || res.ticketId, res);
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: '❌ შეცდომა!',
            text: 'ბილეთის შექმნის შეცდომა',
            confirmButtonText: 'კარგი',
            footer: 'გთხოვთ სცადოთ თავიდან'
          });
          console.error('❌ Backend Error:', err);
        }
      });
    }
  }

  onPurchaseTicket() {
    const validationError = this.validatePurchaseForm();
    
    if (validationError) {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ ყურადღება!',
        text: validationError,
        confirmButtonText: 'კარგი',
        background: '#fff8e1',
        iconColor: '#ff9800',
        confirmButtonColor: '#ff9800',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
      return;
    }

  
    const rawFormValue = this.purchaseForm.getRawValue();
    const data: CreatePurchaseDTO = {
      eventId: rawFormValue.eventId,
      ticketType: rawFormValue.ticketType,
      userId: rawFormValue.userId,
      quantity: rawFormValue.quantity,
      promoCode: rawFormValue.promoCode || undefined
    };

    this.ticketService.purchaseTicket(data).subscribe({
      next: (res) => {
        this.lastPurchaseResponse = res;
        Swal.fire({
          icon: 'success',
          title: '🎟 ბილეთი წარმატებით შეძენილია!',
          html: `
            <p><strong>ივენთი:</strong> ${res.eventTitle}</p>
            <p><strong>ტიპი:</strong> ${res.ticketType}</p>
            <p><strong>ფასდაკლება:</strong> ${res.discountPercentage}%</p>
            <p><strong>სულ გადასახდელი:</strong> ${res.totalAmount}₾</p>
          `,
          confirmButtonText: 'OK',
          background: '#f0fdf4',
          iconColor: '#22c55e',
          confirmButtonColor: '#22c55e',
        });
        
        this.purchaseForm.reset();
       
        this.purchaseForm.get('ticketType')?.disable();
        
        if (res && res.purchaseId) {
          this.generateQRForPurchase(res);
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: '❌ შეცდომა!',
          text: 'ბილეთის შეძენის შეცდომა',
          confirmButtonText: 'გაგრძელება',
          background: '#fff',
          color: '#333',
          iconColor: '#dc3545',
          confirmButtonColor: '#dc3545',
          showClass: {
            popup: 'animate__animated animate__shakeX'
          }
        });
        console.error(err);
      }
    });
  }

  onLoadTicket() {
    if (this.ticketIdToLoad <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ყურადღება!',
        text: 'გთხოვთ შეიყვანოთ ბილეთის სწორი ID (0-ზე მეტი)',
        confirmButtonText: 'გასაგებია',
        background: '#fff3cd',
        iconColor: '#ffc107',
        confirmButtonColor: '#ffc107',
      });
      return;
    }

    this.ticketService.getTicket(this.ticketIdToLoad).subscribe({
      next: (res) => {
        this.loadedTicket = res;
        this.generateQRForTicket(res.id, res);
      },
      error: (err) => {
        Swal.fire({
          icon: 'info',
          title: 'ინფორმაცია',
          text: 'ბილეთი ვერ მოიძებნა.',
          timer: 3500,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          background: '#e7f3fe',
          iconColor: '#2196f3',
        });

        console.error(err);
        this.loadedTicket = null;
        this.clearQRCode();
      }
    });
  }

  generateQRForTicket(ticketId: number, ticketData: any) {
    const qrData = {
      ticketId: ticketId,
      eventId: ticketData.eventId,
      type: ticketData.type,
      price: ticketData.price,
      timestamp: new Date().toISOString(),
      validationCode: this.generateValidationCode(ticketId)
    };
    
    this.qrCodeData = JSON.stringify(qrData);
    this.generateQRCode(this.qrCodeData);
  }

  generateQRForPurchase(purchaseData: any) {
    const qrData = {
      purchaseId: purchaseData.purchaseId,
      eventTitle: purchaseData.eventTitle,
      ticketType: purchaseData.ticketType,
      quantity: purchaseData.quantity,
      totalAmount: purchaseData.totalAmount,
      discountPercentage: purchaseData.discountPercentage,
      purchaseDate: new Date().toISOString(),
      validationCode: this.generateValidationCode(purchaseData.purchaseId)
    };
    
    this.qrCodeData = JSON.stringify(qrData);
    this.generateQRCode(this.qrCodeData);
  }

  generateCustomQR() {
    if (!this.qrCodeData || this.qrCodeData.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ ყურადღება!',
        text: 'გთხოვთ შეიყვანოთ QR კოდისთვის ტექსტი',
        confirmButtonText: 'კარგი',
        background: '#ffe6e6',
        iconColor: '#d33',
        confirmButtonColor: '#d33',
        showClass: {
          popup: 'animate__animated animate__bounceIn'
        }
      });
      return;
    }
    
    this.generateQRCode(this.qrCodeData);
  }

  private generateQRCode(data: string) {
    const encodedData = encodeURIComponent(data);
    const size = 200;
    
    this.generatedQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&format=png&ecc=M`;
    this.isQRGenerated = true;
  }

  private generateValidationCode(id: number): string {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    return `VAL-${id}-${timestamp}-${randomNum}`;
  }

  clearQRCode() {
    this.generatedQrCode = '';
    this.qrCodeData = '';
    this.isQRGenerated = false;
  }

  downloadQRCode() {
    if (!this.generatedQrCode) {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ ყურადღება!',
        text: 'QR კოდი არ არის გენერირებული',
        confirmButtonText: 'კარგი',
        background: '#fff3cd',
        iconColor: '#ffc107',
        confirmButtonColor: '#ffc107'
      });
      return;
    }
    
    const link = document.createElement('a');
    link.href = this.generatedQrCode;
    link.download = `ticket-qr-${Date.now()}.png`;
    link.click();
  }

  onQRImageError(event: any) {
    console.warn('QR სურათი ვერ ჩაიტვირთა');
    event.target.style.display = 'none';
    this.generatedQrCode = '';
    
    Swal.fire({
      icon: 'error',
      title: 'QR კოდის ჩატვირთვის შეცდომა',
      text: 'გთხოვთ სცადოთ თავიდან',
      confirmButtonText: 'კარგი'
    });
  }
}