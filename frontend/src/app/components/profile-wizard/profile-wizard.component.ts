import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface TravelerProfile {
  id: number;
  name: string;
  description: string;
  characteristics: string[];
}

@Component({
  selector: 'app-profile-wizard',
  templateUrl: './profile-wizard.component.html',
  styleUrls: ['./profile-wizard.component.css']
})
export class ProfileWizardComponent implements OnInit {
  currentStep = 1;
  totalSteps = 4;
  
  profileForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  
  travelerProfiles: TravelerProfile[] = [
    {
      id: 1,
      name: 'Adventure Seeker',
      description: 'Loves extreme sports, outdoor activities, and adrenaline-pumping experiences',
      characteristics: ['Outdoor Activities', 'Extreme Sports', 'Physical Challenges', 'Remote Destinations']
    },
    {
      id: 2,
      name: 'Cultural Explorer',
      description: 'Passionate about history, museums, local traditions, and cultural immersion',
      characteristics: ['Museums & Galleries', 'Historical Sites', 'Local Traditions', 'Cultural Events']
    },
    {
      id: 3,
      name: 'Relaxation Focused',
      description: 'Seeks peaceful, stress-free vacations with comfort and tranquility',
      characteristics: ['Spa & Wellness', 'Beach Resorts', 'Peaceful Settings', 'Luxury Comfort']
    },
    {
      id: 4,
      name: 'Budget Traveler',
      description: 'Maximizes experiences while minimizing costs through smart planning',
      characteristics: ['Cost-Effective Options', 'Local Experiences', 'Hostels & Budget Hotels', 'Street Food']
    },
    {
      id: 5,
      name: 'Luxury Traveler',
      description: 'Enjoys premium experiences, fine dining, and exclusive accommodations',
      characteristics: ['5-Star Hotels', 'Fine Dining', 'Private Experiences', 'Premium Services']
    },
    {
      id: 6,
      name: 'Family Oriented',
      description: 'Plans trips that cater to all family members with kid-friendly activities',
      characteristics: ['Kid-Friendly Activities', 'Family Hotels', 'Educational Experiences', 'Safe Destinations']
    }
  ];

  travelCompanions = [
    { value: 'solo', label: 'Solo Travel', description: 'I prefer traveling by myself' },
    { value: 'partner', label: 'With Partner/Spouse', description: 'I usually travel with my significant other' },
    { value: 'family', label: 'Family with Kids', description: 'I travel with my family and children' },
    { value: 'friends', label: 'Group of Friends', description: 'I enjoy traveling with friends' },
    { value: 'mixed', label: 'It Varies', description: 'My travel companions change depending on the trip' }
  ];

  budgetRanges = [
    { value: 'budget', label: 'Budget ($0-$100/day)', description: 'I prefer cost-effective travel options' },
    { value: 'moderate', label: 'Moderate ($100-$300/day)', description: 'I want a balance of comfort and value' },
    { value: 'luxury', label: 'Luxury ($300+/day)', description: 'I prefer premium experiences and accommodations' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.formBuilder.group({
      selectedProfile: ['', Validators.required],
      travelCompanion: ['', Validators.required],
      budgetRange: ['', Validators.required],
      interests: this.formBuilder.array([]),
      travelFrequency: ['', Validators.required],
      preferredDestinations: [''],
      additionalInfo: ['']
    });
  }

  ngOnInit(): void {
    // Redirect to login if not authenticated
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  selectProfile(profileId: number): void {
    this.profileForm.patchValue({ selectedProfile: profileId });
  }

  selectCompanion(companion: string): void {
    this.profileForm.patchValue({ travelCompanion: companion });
  }

  selectBudget(budget: string): void {
    this.profileForm.patchValue({ budgetRange: budget });
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return !!this.profileForm.get('selectedProfile')?.value;
      case 2:
        return !!this.profileForm.get('travelCompanion')?.value;
      case 3:
        return !!this.profileForm.get('budgetRange')?.value && 
               !!this.profileForm.get('travelFrequency')?.value;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const profileData = {
        baseProfileId: this.profileForm.value.selectedProfile,
        preferences: {
          travelCompanion: this.profileForm.value.travelCompanion,
          budgetRange: this.profileForm.value.budgetRange,
          travelFrequency: this.profileForm.value.travelFrequency,
          preferredDestinations: this.profileForm.value.preferredDestinations,
          additionalInfo: this.profileForm.value.additionalInfo
        }
      };

      // Call API to save user persona (you'll need to implement this in the service)
      console.log('Profile data to save:', profileData);
      
      // For now, simulate success and navigate to dashboard
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      }, 1000);
    }
  }

  getSelectedProfile(): TravelerProfile | undefined {
    const selectedId = this.profileForm.get('selectedProfile')?.value;
    return this.travelerProfiles.find(p => p.id === selectedId);
  }

  getSelectedCompanion() {
    const selectedValue = this.profileForm.get('travelCompanion')?.value;
    return this.travelCompanions.find(c => c.value === selectedValue);
  }

  getSelectedBudget() {
    const selectedValue = this.profileForm.get('budgetRange')?.value;
    return this.budgetRanges.find(b => b.value === selectedValue);
  }

  skipWizard(): void {
    this.router.navigate(['/dashboard']);
  }
}