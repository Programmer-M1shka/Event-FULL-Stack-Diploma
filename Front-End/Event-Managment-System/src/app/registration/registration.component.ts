import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes } from '@angular/router';
import Swal from 'sweetalert2';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router'; 
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {
  isLogin = signal(true);
  showPassword = signal(false);
  showNewPassword = signal(false);
  isLoading = signal(false);
  showVerification = signal(false); 
  showForgotPassword = signal(false);
  showResetPassword = signal(false);
  userEmail = signal(''); 
  resetEmail = signal('');
  
  authForm: FormGroup;
  verificationForm: FormGroup;
  forgotPasswordForm: FormGroup;
  resetPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router,
  ) {
    this.authForm = this.createForm();
    this.verificationForm = this.createVerificationForm(); 
    this.forgotPasswordForm = this.createForgotPasswordForm();
    this.resetPasswordForm = this.createResetPasswordForm();
    this.updateFormValidators();
  }

  private createForm(): FormGroup {
    return this.fb.group(
      {
        fullName: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: [''],
        rememberMe: [false],
      },
      { validators: this.passwordMatchValidator.bind(this) }
    );
  }

  private createVerificationForm(): FormGroup {
    return this.fb.group({
      verificationCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
    });
  }

  private createForgotPasswordForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  private createResetPasswordForm(): FormGroup {
    return this.fb.group(
      {
        resetCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmNewPassword: ['', [Validators.required]]
      },
      { validators: this.resetPasswordMatchValidator.bind(this) }
    );
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (this.isLogin()) {
      return null;
    }
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
  }

  private resetPasswordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmNewPassword = control.get('confirmNewPassword');

    if (!newPassword || !confirmNewPassword) {
      return null;
    }

    return newPassword.value !== confirmNewPassword.value ? { passwordMismatch: true } : null;
  }

  setLoginMode(isLogin: boolean) {
    this.isLogin.set(isLogin);
    this.showVerification.set(false); 
    this.showForgotPassword.set(false);
    this.showResetPassword.set(false);
    this.authForm.reset({
      rememberMe: false,
    });
    this.verificationForm.reset(); 
    this.forgotPasswordForm.reset();
    this.resetPasswordForm.reset();
    this.updateFormValidators();
  }

  private updateFormValidators() {
    if (this.isLogin()) {
      this.authForm.get('fullName')?.clearValidators();
      this.authForm.get('confirmPassword')?.clearValidators();
      
      this.authForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.authForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      this.authForm.get('fullName')?.setValidators([Validators.required]);
      this.authForm.get('confirmPassword')?.setValidators([Validators.required]);
      this.authForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.authForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }

    Object.keys(this.authForm.controls).forEach(key => {
      this.authForm.get(key)?.updateValueAndValidity();
    });
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  toggleNewPassword() {
    this.showNewPassword.set(!this.showNewPassword());
  }

  getFieldError(fieldName: string): boolean {
    const field = this.authForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getVerificationFieldError(fieldName: string): boolean {
    const field = this.verificationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getForgotPasswordFieldError(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getResetPasswordFieldError(fieldName: string): boolean {
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Getter methods for template
  showPasswordValue(): boolean {
    return this.showPassword();
  }

  showNewPasswordValue(): boolean {
    return this.showNewPassword();
  }

  isLoginMode(): boolean {
    return this.isLogin();
  }

  isLoadingValue(): boolean {
    return this.isLoading();
  }

  showVerificationValue(): boolean {
    return this.showVerification();
  }

  showForgotPasswordValue(): boolean {
    return this.showForgotPassword();
  }

  showResetPasswordValue(): boolean {
    return this.showResetPassword();
  }

  
  openForgotPassword() {
    this.showForgotPassword.set(true);
    this.forgotPasswordForm.reset();
  }

  goBackToLogin() {
    this.showForgotPassword.set(false);
    this.showResetPassword.set(false);
    this.forgotPasswordForm.reset();
    this.resetPasswordForm.reset();
  }

  goBackToRegistration() {
    this.showVerification.set(false);
    this.verificationForm.reset();
  }

  onSubmit() {
    if (this.authForm.invalid) {
      Object.keys(this.authForm.controls).forEach(key => {
        this.authForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    const formData = this.authForm.value;

    if (this.isLogin()) {
      // LOGIN
      const loginData = {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe || false,
      };

      console.log('გაგზავნილი Login მონაცემები:', loginData);

      this.authService.login(loginData).subscribe({
        next: (res:any) => {
          console.log('შესვლა წარმატებით:', res.token.token);
          
          if (res.token) {
            localStorage.setItem('token', res.token.token);

            console.log('ტოკენი შენახულია:', res);
            
          Swal.fire({
  icon: 'success',
  title: 'შესვლა წარმატებით! 🎉',
  timer: 2000,
  timerProgressBar: true,
  showConfirmButton: false,
  background: '#ffffff',
  iconColor: '#10b981',
  toast: true,
  position: 'top-end',
  width: 320,
  padding: '12px 16px',
  showClass: {
    popup: 'animate__animated animate__fadeInRight'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutRight'
  },
  customClass: {
    popup: 'modern-success-toast',
    title: 'toast-title',
    timerProgressBar: 'toast-progress'
  }
});
            
            this.isLoading.set(false);
            this.authForm.reset({ rememberMe: formData.rememberMe });
            this.router.navigate(['/main']);
          } else {
            this.isLoading.set(false);
            Swal.fire({
              icon: 'error',
              title: 'შეცდომა',
              text: 'სერვერის პასუხი არასწორია',
            });
          }
        },
        error: (err) => {
          console.error('შესვლის შეცდომა:', err);
          this.isLoading.set(false);
          
          let errorMessage = 'შეცდომა შესვლისას';
          
          if (err.status === 401) {
            errorMessage = 'არასწორი ელფოსტა ან პაროლი';
          } else if (err.status === 404) {
            errorMessage = 'მომხმარებელი ვერ მოიძებნა';
          } else if (err.status === 400) {
            errorMessage = 'მონაცემები არასწორად არის შეყვანილი';
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          }
          
          Swal.fire({
            icon: 'error',
            title: 'შეცდომა',
            text: errorMessage,
          });
        },
      });
    } else {
      // REGISTRATION
      const fullName = formData.fullName || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const registerData = {
        username: formData.email,
        email: formData.email,
        password: formData.password,
        firstName: firstName,  
        lastName: lastName,    
        role: 'User',
      };

      console.log('გაგზავნილი Registration მონაცემები:', registerData);

      this.authService.register(registerData).subscribe({
        next: (res) => {
          console.log('რეგისტრაცია წარმატებით:', res);
          this.isLoading.set(false);
          
          this.userEmail.set(formData.email);
          this.showVerification.set(true);
          this.authForm.reset();
          
          Swal.fire({
            icon: 'success',
            title: 'რეგისტრაცია წარმატებით!',
            text: 'ვერიფიკაციის კოდი გაიგზავნა თქვენს ელფოსტაზე',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          console.error('რეგისტრაციის შეცდომა:', err);
          console.error('Error details:', err.error);
          this.isLoading.set(false);
          
          let errorMessage = 'რეგისტრაციის შეცდომა';
          
          if (err.status === 409) {
            errorMessage = 'ეს ელფოსტა უკვე დარეგისტრირებულია';
          } else if (err.status === 400) {
            errorMessage = 'მონაცემები არასწორად არის შეყვანილი';
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          }
          
          Swal.fire({
            icon: 'error',
            title: 'რეგისტრაციის შეცდომა',
            text: errorMessage,
          });
        },
      });
    }
  }

  onVerifyEmail() {
    if (this.verificationForm.invalid) {
      Object.keys(this.verificationForm.controls).forEach(key => {
        this.verificationForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    const verificationData = {
      email: this.userEmail(),
      code: this.verificationForm.value.verificationCode
    };

    console.log('ვერიფიკაციის მონაცემები:', verificationData);

    this.authService.verifyEmail(verificationData).subscribe({
      next: (res) => {
        console.log('ვერიფიკაცია წარმატებით:', res);
        this.isLoading.set(false);
        this.showVerification.set(false);
        this.verificationForm.reset();
        
        Swal.fire({
          icon: 'success',
          title: 'ვერიფიკაცია წარმატებით!',
          text: 'ახლა შეგიძლიათ შეხვიდეთ სისტემაში',
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          this.setLoginMode(true);
        });
      },
      error: (err) => {
        console.error('ვერიფიკაციის შეცდომა:', err);
        this.isLoading.set(false);
        
        let errorMessage = 'ვერიფიკაციის შეცდომა';
        
        if (err.status === 400) {
          errorMessage = 'არასწორი ვერიფიკაციის კოდი';
        } else if (err.status === 404) {
          errorMessage = 'მომხმარებელი ვერ მოიძებნა';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'შეცდომა',
          text: errorMessage,
        });
      },
    });
  }

  onForgotPassword() {
    if (this.forgotPasswordForm.invalid) {
      Object.keys(this.forgotPasswordForm.controls).forEach(key => {
        this.forgotPasswordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    const email = this.forgotPasswordForm.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        console.log('პაროლის აღდგენის კოდი გაიგზავნა:', res);
        this.isLoading.set(false);
        this.resetEmail.set(email);
        this.showForgotPassword.set(false);
        this.showResetPassword.set(true);
        this.forgotPasswordForm.reset();
        
        Swal.fire({
          icon: 'success',
          title: 'კოდი გაიგზავნა!',
          text: 'პაროლის აღდგენის კოდი გაიგზავნა თქვენს ელფოსტაზე',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        console.error('პაროლის აღდგენის შეცდომა:', err);
        this.isLoading.set(false);
        
        let errorMessage = 'პაროლის აღდგენის შეცდომა';
        
        if (err.status === 404) {
          errorMessage = 'ამ ელფოსტით მომხმარებელი ვერ მოიძებნა';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'შეცდომა',
          text: errorMessage,
        });
      },
    });
  }

  onResetPassword() {
    if (this.resetPasswordForm.invalid) {
      Object.keys(this.resetPasswordForm.controls).forEach(key => {
        this.resetPasswordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    const formData = this.resetPasswordForm.value;
    const resetData = {
      email: this.resetEmail(),
      code: formData.resetCode,
      newPassword: formData.newPassword
    };

    this.authService.resetPassword(resetData.email, resetData.code, resetData.newPassword).subscribe({
      next: (res) => {
        console.log('პაროლი შეიცვალა წარმატებით:', res);
        this.isLoading.set(false);
        this.showResetPassword.set(false);
        this.resetPasswordForm.reset();
        
        Swal.fire({
          icon: 'success',
          title: 'პაროლი შეიცვალა!',
          text: 'ახლა შეგიძლიათ შეხვიდეთ ახალი პაროლით',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          this.setLoginMode(true);
        });
      },
      error: (err) => {
        console.error('პაროლის შეცვლის შეცდომა:', err);
        this.isLoading.set(false);
        
        let errorMessage = 'პაროლის შეცვლის შეცდომა';
        
        if (err.status === 400) {
          errorMessage = 'არასწორი აღდგენის კოდი';
        } else if (err.status === 404) {
          errorMessage = 'მომხმარებელი ვერ მოიძებნა';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'შეცდომა',
          text: errorMessage,
        });
      },
    });
  }

  resendVerificationCode() {
    const email = this.userEmail();
    if (!email) return;

    this.isLoading.set(true);

    this.authService.resendVerificationCode(email).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'კოდი გაიგზავნა!',
          text: 'შეამოწმეთ ელფოსტა ახალი ვერიფიკაციის კოდისთვის',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        console.log('კოდი გაიგზავნა ხელახლა:', res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('ვერ მოხერხდა ხელახალი გაგზავნა:', err);
        this.isLoading.set(false);
        
        Swal.fire({
          icon: 'error',
          title: 'შეცდომა',
          text: 'კოდის ხელახალი გაგზავნა ვერ მოხერხდა',
        });
      },
    });
  }

  resendResetCode() {
    const email = this.resetEmail();
    if (!email) return;

    this.isLoading.set(true);

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'კოდი გაიგზავნა!',
          text: 'შეამოწმეთ ელფოსტა ახალი აღდგენის კოდისთვის',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        console.log('აღდგენის კოდი გაიგზავნა ხელახლა:', res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('ვერ მოხერხდა ხელახალი გაგზავნა:', err);
        this.isLoading.set(false);
        
        Swal.fire({
          icon: 'error',
          title: 'შეცდომა',
          text: 'კოდის ხელახალი გაგზავნა ვერ მოხერხდა',
        });
      },
    });
  }

  checkTokenStatus() {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('ტოკენი localStorage-ში:', token);
      console.log('მომხმარებელი ავტორიზებულია:', this.authService.isAuthenticated());
    } else {
      console.log('ტოკენი არ არის შენახული');
    }
  }
}