import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface TravelerProfile {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface UserPersona {
  id: number;
  baseProfileId: number;
  baseProfileName: string;
  baseProfileDescription: string;
  personalPreferences: string;
  constraints: string;
  budgetDetails: string;
  accessibilityNeeds: string;
  groupDynamics: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPersonaRequest {
  baseProfileId: number;
  personalPreferences?: string;
  constraints?: string;
  budgetDetails?: string;
  accessibilityNeeds?: string;
  groupDynamics?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get all traveler profiles (base profiles)
  getTravelerProfiles(): Observable<{profiles: TravelerProfile[]}> {
    return this.http.get<{profiles: TravelerProfile[]}>(`${this.apiUrl}/profiles`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Get user's personas
  getUserPersonas(): Observable<{personas: UserPersona[]}> {
    return this.http.get<{personas: UserPersona[]}>(`${this.apiUrl}/personas`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Create new persona
  createPersona(personaData: UserPersonaRequest): Observable<{message: string, persona: UserPersona}> {
    return this.http.post<{message: string, persona: UserPersona}>(`${this.apiUrl}/personas`, personaData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Get specific persona
  getPersona(id: number): Observable<{persona: UserPersona}> {
    return this.http.get<{persona: UserPersona}>(`${this.apiUrl}/personas/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Update persona
  updatePersona(id: number, personaData: Partial<UserPersonaRequest>): Observable<{message: string, persona: UserPersona}> {
    return this.http.put<{message: string, persona: UserPersona}>(`${this.apiUrl}/personas/${id}`, personaData, {
      headers: this.authService.getAuthHeaders()
    });
  }
}