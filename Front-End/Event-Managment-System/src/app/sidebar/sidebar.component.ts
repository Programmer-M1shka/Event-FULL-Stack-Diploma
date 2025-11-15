import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Routes } from '@angular/router';



@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
   isMenuOpen = signal(false);
  isUserMenuOpen = signal(false);
  currentUser = signal<any>({});

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
   
    this.loadUserInfo();
  }
goToRegister() {
    this.router.navigate(['/registration']);
  }
  goToEvent(){
      this.router.navigate(['/events']);
  }
  goToTicket(){
    this.router.navigate(['/tickets']);
  }
goToMain1(){
  this.router.navigate(['/main'])
}
goToparty(){
  this.router.navigate(['./participants'])
}
goToAnalitics(){
  this.router.navigate(['./analitics'])
}
goTolocation(){
  this.router.navigate(['./location'])
}

goToadminpanel(){
    this.router.navigate(['./adminpanel'])
}
 
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }


public userrole:any;



  private loadUserInfo() {
    if (this.isAuthenticated()) {
      const token = this.authService.getToken();
      if (token) {
        try {
         
          const payload = this.decodeJWTPayload(token);
          console.log(payload)
          this.userrole = payload.Role
          localStorage.setItem('guard', payload.Role)
          this.currentUser.set({
            id: payload.sub || payload.id,
            email: payload.email || payload.Email,
            fullName: payload.fullName || payload.FullName || 
                     payload.firstName || payload.FirstName || this.userrole
          });
        } catch (error) {
          
          this.authService.logout();
        }
      }
    }

  }



  
  private decodeJWTPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  
  toggleMobileMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
    this.isUserMenuOpen.set(false); 
  }

 
  closeMobileMenu() {
    this.isMenuOpen.set(false);
  }

 
  toggleUserMenu() {
    this.isUserMenuOpen.set(!this.isUserMenuOpen());
    this.isMenuOpen.set(false); 
  }

  
  onProfile() {
    this.isUserMenuOpen.set(false);
    this.router.navigate(['/profile']);
  }

  
  onSettings() {
    this.isUserMenuOpen.set(false);
    this.router.navigate(['/settings']);
  }


  
  onLogout() {
    this.isUserMenuOpen.set(false);
    this.authService.logout();
    this.currentUser.set({});
    this.router.navigate(['/registration']);
    
  
    console.log('წარმატებით გახვედით სისტემიდან');
  }

 
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    
   
    if (!target.closest('.navbar')) {
      this.isMenuOpen.set(false);
      this.isUserMenuOpen.set(false);
    }
  }

 
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const target = event.target as Window;
    

    if (target.innerWidth >= 768) {
      this.isMenuOpen.set(false);
    }
  }

  
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    this.isMenuOpen.set(false);
    this.isUserMenuOpen.set(false);
  }
}