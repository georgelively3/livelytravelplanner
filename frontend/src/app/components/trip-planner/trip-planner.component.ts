import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PersonaService, UserPersona, TravelerProfile } from '../../services/persona.service';
import { TripService, Trip } from '../../services/trip.service';

@Component({
  selector: 'app-trip-planner',
  templateUrl: './trip-planner.component.html',
  styleUrls: ['./trip-planner.component.css']
})
export class TripPlannerComponent implements OnInit {
  tripForm: FormGroup;
  userPersona: UserPersona | null = null;
  baseProfile: TravelerProfile | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private personaService: PersonaService,
    private tripService: TripService
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
    this.personaService.getUserPersonas().subscribe({
      next: (response) => {
        if (response.personas && response.personas.length > 0) {
          this.userPersona = response.personas[0]; // Get the first (most recent) persona
          // Load the base profile details
          this.loadBaseProfile(this.userPersona.baseProfileId);
        } else {
          console.log('No user personas found');
          this.userPersona = null;
          this.baseProfile = null;
        }
      },
      error: (error) => {
        console.error('Error loading user persona:', error);
        this.userPersona = null;
        this.baseProfile = null;
      }
    });
  }

  private loadBaseProfile(baseProfileId: number): void {
    this.personaService.getTravelerProfiles().subscribe({
      next: (response) => {
        const profile = response.profiles.find(p => p.id === baseProfileId);
        this.baseProfile = profile || null;
      },
      error: (error) => {
        console.error('Error loading base profile:', error);
        this.baseProfile = null;
      }
    });
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
    this.tripService.createTrip(tripData).subscribe({
      next: (createdTrip) => {
        console.log('Trip created successfully:', createdTrip);
        alert(`Trip "${createdTrip.name}" created successfully!`);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error creating trip:', error);
        
        let errorMessage = 'Failed to create trip. Please try again.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(errorMessage);
      }
    });
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
