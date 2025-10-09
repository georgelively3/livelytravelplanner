import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface TripSuggestion {
  id?: string;
  title: string;
  destination: string;
  duration: number; // days
  estimatedCost: number;
  description: string;
  highlights: string[];
  bestTimeToVisit: string;
  travelStyle: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  activities: Activity[];
  transportation: Transportation[];
  accommodations: Accommodation[];
  confidence: number; // AI confidence score 0-1
}

export interface Activity {
  id?: string;
  name: string;
  description: string;
  duration: string;
  cost: number;
  category: string;
  location: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Full Day';
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  isRecommended: boolean;
}

export interface Transportation {
  type: string;
  description: string;
  estimatedCost: number;
  duration: string;
}

export interface Accommodation {
  type: string;
  description: string;
  priceRange: string;
  location: string;
  rating: number;
}

export interface TripSuggestionRequest {
  destination?: string;
  budget?: number;
  duration?: number; // days
  travelStyle?: string;
  interests?: string[];
  travelDates?: {
    startDate: string;
    endDate: string;
  };
  numberOfTravelers?: number;
  accessibility?: string[];
  userPersonaId?: number;
}

export interface AISuggestionsResponse {
  suggestions: TripSuggestion[];
  totalCount: number;
  generatedAt: string;
  metadata: {
    searchCriteria: TripSuggestionRequest;
    processingTime: number;
    aiModel: string;
  };
}

export interface TripPlanRequest {
  travelerProfile: {
    id: number;
    name: string;
    interests: string[];
    budget: string;
  };
  tripParameters: {
    destination: string;
    startDate: string;
    endDate: string;
    duration: number;
    budget: number;
    interests: string[];
  };
}

export interface DailyItinerary {
  day: string;
  date: string;
  activities: ItineraryActivity[];
}

export interface ItineraryActivity {
  name: string;
  description: string;
  type: string;
  location: string;
  startTime: string;
  endTime: string;
  estimatedCost: number;
  duration: string;
}

export interface TripPlanResponse {
  success: boolean;
  destination: string;
  duration: number;
  startDate: string;
  endDate: string;
  totalBudget: number;
  dailyItineraries: DailyItinerary[];
  generatedAt: string;
  aiModel: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'http://localhost:8080/api/ai';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get AI-powered trip suggestions based on user preferences
   */
  getTripSuggestions(request: TripSuggestionRequest): Observable<AISuggestionsResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<AISuggestionsResponse>(`${this.apiUrl}/suggestions`, request, { headers });
  }

  /**
   * Get destination recommendations based on user persona and preferences
   */
  getDestinationRecommendations(userPersonaId?: number): Observable<string[]> {
    const headers = this.authService.getAuthHeaders();
    let params = new HttpParams();
    if (userPersonaId) {
      params = params.set('userPersonaId', userPersonaId.toString());
    }
    return this.http.get<string[]>(`${this.apiUrl}/destinations`, { headers, params });
  }

  /**
   * Generate a detailed itinerary for a specific trip suggestion
   */
  generateItinerary(tripSuggestionId: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/itinerary`, { tripSuggestionId }, { headers });
  }

  /**
   * Get activity recommendations for a specific destination
   */
  getActivityRecommendations(destination: string, interests?: string[]): Observable<Activity[]> {
    const headers = this.authService.getAuthHeaders();
    let params = new HttpParams().set('destination', destination);
    if (interests && interests.length > 0) {
      params = params.set('interests', interests.join(','));
    }
    return this.http.get<Activity[]>(`${this.apiUrl}/activities`, { headers, params });
  }

  /**
   * Get personalized suggestions based on user's travel history and preferences
   */
  getPersonalizedSuggestions(): Observable<TripSuggestion[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<TripSuggestion[]>(`${this.apiUrl}/personalized`, { headers });
  }

  /**
   * Refine trip suggestions based on user feedback
   */
  refineSuggestions(
    originalRequest: TripSuggestionRequest, 
    feedback: { liked: string[], disliked: string[], preferences: any }
  ): Observable<AISuggestionsResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<AISuggestionsResponse>(`${this.apiUrl}/refine`, 
      { originalRequest, feedback }, { headers });
  }

  /**
   * Save a trip suggestion as an actual trip
   */
  saveAsTrip(suggestion: TripSuggestion): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/save-trip`, suggestion, { headers });
  }

  /**
   * Get trending destinations based on global travel data
   */
  getTrendingDestinations(): Observable<{ destination: string; popularity: number; reason: string }[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<{ destination: string; popularity: number; reason: string }[]>(
      `${this.apiUrl}/trending`, { headers });
  }

  /**
   * Get budget-friendly trip suggestions
   */
  getBudgetFriendlySuggestions(maxBudget: number): Observable<TripSuggestion[]> {
    const headers = this.authService.getAuthHeaders();
    const params = new HttpParams().set('maxBudget', maxBudget.toString());
    return this.http.get<TripSuggestion[]>(`${this.apiUrl}/budget-friendly`, { headers, params });
  }

  /**
   * Generate a complete trip plan with daily itineraries
   */
  generateTripPlan(request: TripPlanRequest): Observable<TripPlanResponse> {
    // Create basic headers for the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    // Only add auth headers if user is logged in
    if (this.authService.isLoggedIn()) {
      headers = this.authService.getAuthHeaders();
    }
    
    return this.http.post<TripPlanResponse>(`${this.apiUrl}/trip-plan`, request, { headers });
  }
}