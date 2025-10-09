import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AiService, TripPlanRequest, TripPlanResponse, DailyItinerary } from '../../services/ai.service';

@Component({
  selector: 'app-ai-trip-planner',
  templateUrl: './ai-trip-planner.component.html',
  styleUrls: ['./ai-trip-planner.component.css']
})
export class AiTripPlannerComponent implements OnInit {
  tripPlanForm: FormGroup;
  tripPlan: TripPlanResponse | null = null;
  loading = false;
  error: string | null = null;

  // Popular travel interests for selection
  travelInterests = [
    'outdoor', 'hiking', 'local cuisine', 'culture', 'history', 'art',
    'museums', 'architecture', 'music', 'shopping', 'relaxation', 'sports',
    'beach', 'mountains', 'cities', 'countryside', 'wildlife', 'photography',
    'adventure', 'food', 'nature', 'technology'
  ];

  budgetOptions = [
    { value: 'budget', label: 'Budget ($500-1000)' },
    { value: 'moderate', label: 'Moderate ($1000-2500)' },
    { value: 'luxury', label: 'Luxury ($2500+)' }
  ];

  constructor(
    private fb: FormBuilder,
    private aiService: AiService
  ) {
    this.tripPlanForm = this.fb.group({
      destination: ['', [Validators.required, Validators.minLength(2)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      budget: [1500, [Validators.required, Validators.min(100)]],
      budgetCategory: ['moderate', Validators.required],
      interests: [[], Validators.required],
      travelerName: ['Adventure Seeker', Validators.required]
    });
  }

  ngOnInit(): void {
    // Set default dates
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);
    
    this.tripPlanForm.patchValue({
      startDate: nextWeek.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }

  onInterestChange(interest: string, event: any): void {
    const interests = this.tripPlanForm.get('interests')?.value || [];
    if (event.target.checked) {
      if (!interests.includes(interest)) {
        interests.push(interest);
      }
    } else {
      const index = interests.indexOf(interest);
      if (index > -1) {
        interests.splice(index, 1);
      }
    }
    this.tripPlanForm.patchValue({ interests });
  }

  isInterestSelected(interest: string): boolean {
    const interests = this.tripPlanForm.get('interests')?.value || [];
    return interests.includes(interest);
  }

  calculateDuration(): number {
    const startDate = new Date(this.tripPlanForm.get('startDate')?.value);
    const endDate = new Date(this.tripPlanForm.get('endDate')?.value);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  onGenerateTripPlan(): void {
    if (this.tripPlanForm.valid) {
      this.loading = true;
      this.error = null;
      this.tripPlan = null;

      const formValue = this.tripPlanForm.value;
      const duration = this.calculateDuration();

      const request: TripPlanRequest = {
        travelerProfile: {
          id: 1,
          name: formValue.travelerName,
          interests: formValue.interests,
          budget: formValue.budgetCategory
        },
        tripParameters: {
          destination: formValue.destination,
          startDate: formValue.startDate,
          endDate: formValue.endDate,
          duration: duration,
          budget: formValue.budget,
          interests: formValue.interests
        }
      };

      console.log('Sending trip plan request:', JSON.stringify(request, null, 2));

      this.aiService.generateTripPlan(request).subscribe({
        next: (response) => {
          this.tripPlan = response;
          this.loading = false;
          console.log('Trip plan generated:', response);
        },
        error: (error) => {
          this.error = 'Failed to generate trip plan. Please try again.';
          this.loading = false;
          console.error('Error generating trip plan:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error details:', error.error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.tripPlanForm.controls).forEach(key => {
      const control = this.tripPlanForm.get(key);
      control?.markAsTouched();
    });
  }

  getTotalDailyCost(itinerary: DailyItinerary): number {
    return itinerary.activities.reduce((total, activity) => total + activity.estimatedCost, 0);
  }

  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'restaurant': '🍽️',
      'attraction': '🏛️',
      'outdoor': '🌲',
      'cultural': '🎨',
      'museum': '🏛️',
      'shopping': '🛍️',
      'transport': '🚌'
    };
    return iconMap[type] || '📍';
  }

  onReset(): void {
    this.tripPlanForm.reset();
    this.tripPlan = null;
    this.error = null;
    this.ngOnInit(); // Reset to default values
  }
}
