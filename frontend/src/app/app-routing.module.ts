import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileWizardComponent } from './components/profile-wizard/profile-wizard.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TripPlannerComponent } from './components/trip-planner/trip-planner.component';
import { AiTripSuggestionsComponent } from './components/ai-trip-suggestions/ai-trip-suggestions.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile-wizard', component: ProfileWizardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'plan-trip', component: TripPlannerComponent },
  { path: 'ai-suggestions', component: AiTripSuggestionsComponent },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }