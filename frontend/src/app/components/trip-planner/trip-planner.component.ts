import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export interface UserPersona {
  id?: number;
  baseProfile?: {
    id: number;
    name: string;
    description: string;
  };
  personalPreferences?: string;
  budgetDetails?: string;
  accessibilityNeeds?: string;
  groupDynamics?: string;
  constraints?: string;
}

export interface Trip {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
}

@Component({
  selector: 'app-trip-planner',
  templateUrl: './trip-planner.component.html',
  styleUrls: ['./trip-planner.component.css']
})
export class TripPlannerComponent implements OnInit {
  tripForm: FormGroup;
  userPersona: UserPersona | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.tripForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      destination: ['', [Validators.required, Validators.minLength(2)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', [Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadUserPersona();
    this.setMinimumDates();
  }

  private setMinimumDates(): void {
    const today = new Date().toISOString().split('T')[0];
    const startDateControl = this.tripForm.get('startDate');
    const endDateControl = this.tripForm.get('endDate');
    
    if (startDateControl) {
      startDateControl.setValue(today);
    }
    
    // Add date validation
    this.tripForm.get('startDate')?.valueChanges.subscribe(startDate => {
      if (startDate && endDateControl) {
        endDateControl.setValue('');
        // Set minimum end date to start date
      }
    });
  }

  private loadUserPersona(): void {
    // TODO: Implement persona loading from backend
    // For now, use mock data
    this.userPersona = {
      id: 1,
      baseProfile: {
        id: 1,
        name: 'Adventure Seeker',
        description: 'Loves outdoor activities, hiking, and exploring new places off the beaten path.'
      },
      personalPreferences: 'Outdoor activities, local cuisine, cultural experiences',
      budgetDetails: 'Mid-range budget, willing to splurge on unique experiences'
    };
  }

  onSubmit(): void {
    if (this.tripForm.valid) {
      const tripData: Trip = this.tripForm.value;
      
      console.log('Creating trip:', tripData);
      
      // TODO: Implement trip creation API call
      this.createTrip(tripData);
    } else {
      this.markFormGroupTouched();
    }
  }

  private createTrip(tripData: Trip): void {
    // TODO: Replace with actual API call
    console.log('Trip would be created:', tripData);
    
    // For now, simulate success and redirect
    alert('Trip created successfully! (This is a demo - actual API integration coming soon)');
    this.router.navigate(['/dashboard']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.tripForm.controls).forEach(key => {
      const control = this.tripForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  editProfile(): void {
    this.router.navigate(['/profile-wizard']);
  }
}
