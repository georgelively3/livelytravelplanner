import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AiService, TripSuggestion, TripSuggestionRequest, Activity } from '../../services/ai.service';
import { PersonaService } from '../../services/persona.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ai-trip-suggestions',
  templateUrl: './ai-trip-suggestions.component.html',
  styleUrls: ['./ai-trip-suggestions.component.css']
})
export class AiTripSuggestionsComponent implements OnInit {
  suggestionForm: FormGroup;
  suggestions: TripSuggestion[] = [];
  trendingDestinations: { destination: string; popularity: number; reason: string }[] = [];
  personalizedSuggestions: TripSuggestion[] = [];
  destinationRecommendations: string[] = [];
  
  loading = false;
  generatingSuggestions = false;
  error: string | null = null;
  
  selectedSuggestion: TripSuggestion | null = null;
  showDetails = false;
  
  userPersonas: any[] = [];
  
  // Popular travel interests for selection
  travelInterests = [
    'Adventure', 'Culture', 'Food & Drink', 'History', 'Nature', 'Photography',
    'Art & Museums', 'Nightlife', 'Beaches', 'Mountains', 'Cities', 'Wildlife',
    'Festivals', 'Architecture', 'Shopping', 'Relaxation', 'Sports', 'Local Life'
  ];

  constructor(
    private fb: FormBuilder,
    private aiService: AiService,
    private personaService: PersonaService,
    private authService: AuthService,
    private router: Router
  ) {
    this.suggestionForm = this.fb.group({
      destination: [''],
      budget: [1000, [Validators.min(100)]],
      duration: [7, [Validators.min(1), Validators.max(30)]],
      numberOfTravelers: [1, [Validators.min(1), Validators.max(20)]],
      travelStyle: [''],
      interests: [[]],
      startDate: [''],
      endDate: [''],
      userPersonaId: ['']
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Load multiple data sources in parallel
      const [personas, trending, personalized, destinations] = await Promise.all([
        this.loadUserPersonas(),
        this.loadTrendingDestinations(),
        this.loadPersonalizedSuggestions(),
        this.loadDestinationRecommendations()
      ]);

    } catch (error) {
      console.error('Error loading initial data:', error);
      this.error = 'Failed to load initial data. Please refresh the page.';
    } finally {
      this.loading = false;
    }
  }

  private loadUserPersonas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.personaService.getUserPersonas().subscribe({
        next: (response) => {
          this.userPersonas = response.personas || [];
          resolve();
        },
        error: (error) => {
          console.error('Error loading personas:', error);
          resolve(); // Don't fail the entire load process
        }
      });
    });
  }

  private loadTrendingDestinations(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.aiService.getTrendingDestinations().subscribe({
        next: (destinations) => {
          this.trendingDestinations = destinations;
          resolve();
        },
        error: (error) => {
          console.error('Error loading trending destinations:', error);
          resolve(); // Don't fail the entire load process
        }
      });
    });
  }

  private loadPersonalizedSuggestions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.aiService.getPersonalizedSuggestions().subscribe({
        next: (suggestions) => {
          this.personalizedSuggestions = suggestions;
          resolve();
        },
        error: (error) => {
          console.error('Error loading personalized suggestions:', error);
          resolve(); // Don't fail the entire load process
        }
      });
    });
  }

  private loadDestinationRecommendations(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.aiService.getDestinationRecommendations().subscribe({
        next: (destinations) => {
          this.destinationRecommendations = destinations;
          resolve();
        },
        error: (error) => {
          console.error('Error loading destination recommendations:', error);
          resolve(); // Don't fail the entire load process
        }
      });
    });
  }

  onGenerateSuggestions(): void {
    if (this.suggestionForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.generatingSuggestions = true;
    this.error = null;

    const formValue = this.suggestionForm.value;
    const request: TripSuggestionRequest = {
      destination: formValue.destination,
      budget: formValue.budget,
      duration: formValue.duration,
      numberOfTravelers: formValue.numberOfTravelers,
      travelStyle: formValue.travelStyle,
      interests: formValue.interests,
      userPersonaId: formValue.userPersonaId || undefined
    };

    // Add travel dates if provided
    if (formValue.startDate && formValue.endDate) {
      request.travelDates = {
        startDate: formValue.startDate,
        endDate: formValue.endDate
      };
    }

    this.aiService.getTripSuggestions(request).subscribe({
      next: (response) => {
        this.suggestions = response.suggestions;
        console.log('AI suggestions generated:', response);
      },
      error: (error) => {
        console.error('Error generating suggestions:', error);
        this.error = 'Failed to generate trip suggestions. Please try again.';
      },
      complete: () => {
        this.generatingSuggestions = false;
      }
    });
  }

  onSelectSuggestion(suggestion: TripSuggestion): void {
    this.selectedSuggestion = suggestion;
    this.showDetails = true;
  }

  onSaveAsTrip(suggestion: TripSuggestion): void {
    this.aiService.saveAsTrip(suggestion).subscribe({
      next: (response) => {
        console.log('Trip saved successfully:', response);
        // Navigate to the trip details or dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error saving trip:', error);
        this.error = 'Failed to save trip. Please try again.';
      }
    });
  }

  onSelectDestination(destination: string): void {
    this.suggestionForm.patchValue({ destination });
  }

  onToggleInterest(interest: string): void {
    const currentInterests = this.suggestionForm.get('interests')?.value || [];
    let updatedInterests;
    
    if (currentInterests.includes(interest)) {
      updatedInterests = currentInterests.filter((i: string) => i !== interest);
    } else {
      updatedInterests = [...currentInterests, interest];
    }
    
    this.suggestionForm.patchValue({ interests: updatedInterests });
  }

  isInterestSelected(interest: string): boolean {
    const interests = this.suggestionForm.get('interests')?.value || [];
    return interests.includes(interest);
  }

  onCloseDetails(): void {
    this.showDetails = false;
    this.selectedSuggestion = null;
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  }

  getConfidenceLabel(confidence: number): string {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.suggestionForm.controls).forEach(key => {
      const control = this.suggestionForm.get(key);
      control?.markAsTouched();
    });
  }
}
