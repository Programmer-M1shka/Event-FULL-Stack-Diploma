import { Component } from '@angular/core';
import { LocationService } from '../location.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocationCreateDTO } from '../location.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './location.component.html',
  styleUrl: './location.component.css'
})
export class LocationComponent {
  locationForm: FormGroup;
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  isDropdownOpen = false;
  selectedCountry: any = null;

  // ქვეყნების სია დროშებით
  countries = [
    { code: 'GE', name: 'საქართველო', flag: '🇬🇪' },
    { code: 'US', name: 'შეერთებული შტატები', flag: '🇺🇸' },
    { code: 'GB', name: 'გაერთიანებული სამეფო', flag: '🇬🇧' },
    { code: 'DE', name: 'გერმანია', flag: '🇩🇪' },
    { code: 'FR', name: 'საფრანგეთი', flag: '🇫🇷' },
    { code: 'IT', name: 'იტალია', flag: '🇮🇹' },
    { code: 'ES', name: 'ესპანეთი', flag: '🇪🇸' },
    { code: 'TR', name: 'თურქეთი', flag: '🇹🇷' },
    { code: 'RU', name: 'რუსეთი', flag: '🇷🇺' },
    { code: 'UA', name: 'უკრაინა', flag: '🇺🇦' },
    { code: 'PL', name: 'პოლონეთი', flag: '🇵🇱' },
    { code: 'NL', name: 'ნიდერლანდები', flag: '🇳🇱' },
    { code: 'BE', name: 'ბელგია', flag: '🇧🇪' },
    { code: 'AT', name: 'ავსტრია', flag: '🇦🇹' },
    { code: 'CH', name: 'შვეიცარია', flag: '🇨🇭' },
    { code: 'SE', name: 'შვედეთი', flag: '🇸🇪' },
    { code: 'NO', name: 'ნორვეგია', flag: '🇳🇴' },
    { code: 'DK', name: 'დანია', flag: '🇩🇰' },
    { code: 'FI', name: 'ფინეთი', flag: '🇫🇮' },
    { code: 'GR', name: 'საბერძნეთი', flag: '🇬🇷' },
    { code: 'JP', name: 'იაპონია', flag: '🇯🇵' },
    { code: 'CN', name: 'ჩინეთი', flag: '🇨🇳' },
    { code: 'IN', name: 'ინდოეთი', flag: '🇮🇳' },
    { code: 'AU', name: 'ავსტრალია', flag: '🇦🇺' },
    { code: 'CA', name: 'კანადა', flag: '🇨🇦' },
    { code: 'BR', name: 'ბრაზილია', flag: '🇧🇷' },
    { code: 'MX', name: 'მექსიკა', flag: '🇲🇽' },
    { code: 'AR', name: 'არგენტინა', flag: '🇦🇷' },
    { code: 'ZA', name: 'სამხრეთ აფრიკა', flag: '🇿🇦' },
    { code: 'EG', name: 'ეგვიპტე', flag: '🇪🇬' }
  ];

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService
  ) {
    this.locationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      zipCode: [''] 
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectCountry(country: any) {
    this.selectedCountry = country;
    this.locationForm.patchValue({ country: country.name });
    this.isDropdownOpen = false;
  }

  onSubmit() {
    if (this.locationForm.valid) {
      this.isLoading = true;
      this.message = '';

      const location: LocationCreateDTO = this.locationForm.value;

      this.locationService.createLocation(location).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.message = `ლოკაცია წარმატებით შეიქმნა! (ID: ${response.id})`;
          this.messageType = 'success';
          this.locationForm.reset();
          this.selectedCountry = null;
          this.markFormGroupUntouched();
        },
        error: (error) => {
          this.isLoading = false;
          this.messageType = 'error';
                    
          if (error.status === 400) {
            this.message = error.error || 'მონაცემები არასწორია.';
          } else if (error.status === 500) {
            this.message = 'სერვერის შეცდომა. გთხოვთ სცადოთ ხელახლა.';
          } else {
            this.message = 'მოულოდნელი შეცდომა მოხდა.';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onReset() {
    this.locationForm.reset();
    this.message = '';
    this.selectedCountry = null;
    this.markFormGroupUntouched();
  }

  private markFormGroupTouched() {
    Object.keys(this.locationForm.controls).forEach(key => {
      const control = this.locationForm.get(key);
      control?.markAsTouched();
    });
  }

  private markFormGroupUntouched() {
    Object.keys(this.locationForm.controls).forEach(key => {
      const control = this.locationForm.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.locationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.locationForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        const fieldNames: { [key: string]: string } = {
          'name': 'სახელი',
          'address': 'მისამართი',
          'city': 'ქალაქი',
          'country': 'ქვეყანა'
        };
        return `${fieldNames[fieldName] || fieldName} სავალდებულოა`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} უნდა იყოს მინუმ ${field.errors['minlength'].requiredLength} სიმბოლო`;
      }
    }
    return '';
  }
}