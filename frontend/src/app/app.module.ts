import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileWizardComponent } from './components/profile-wizard/profile-wizard.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthService } from './services/auth.service';
import { PersonaService } from './services/persona.service';
import { AiService } from './services/ai.service';
import { TripPlannerComponent } from './components/trip-planner/trip-planner.component';
import { AiTripSuggestionsComponent } from './components/ai-trip-suggestions/ai-trip-suggestions.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    ProfileWizardComponent,
    DashboardComponent,
    TripPlannerComponent,
    AiTripSuggestionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthService,
    PersonaService,
    AiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }