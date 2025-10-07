import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['currentUser$']);
    authServiceSpy.currentUser$ = of({ 
      id: 1, 
      firstName: 'John', 
      lastName: 'Doe', 
      email: 'john@example.com' 
    });

    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('User Information Display', () => {
    it('should display current user firstName in welcome message', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Welcome back, John!');
    });

    it('should subscribe to currentUser$ on init', () => {
      expect(component.currentUser).toBeDefined();
      expect(component.currentUser?.firstName).toBe('John');
      expect(component.currentUser?.email).toBe('john@example.com');
    });

    it('should handle null currentUser gracefully', () => {
      mockAuthService.currentUser$ = of(null);
      component.ngOnInit();
      
      expect(component.currentUser).toBeNull();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Welcome back, !'); // Shows empty when no user
    });
  });

  describe('Trip Planning Navigation', () => {
    it('should navigate to plan-trip when startTripPlanning is called', () => {
      component.startTripPlanning();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/plan-trip']);
    });

    it('should call startTripPlanning when Get Started button is clicked', () => {
      spyOn(component, 'startTripPlanning');
      
      const getStartedButton = fixture.nativeElement.querySelector('.btn-primary');
      getStartedButton.click();
      
      expect(component.startTripPlanning).toHaveBeenCalled();
    });
  });

  describe('Dashboard Content', () => {
    it('should display all action cards', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Plan New Trip');
      expect(compiled.textContent).toContain('My Trips');
      expect(compiled.textContent).toContain('Update Profile');
    });

    it('should display quick actions section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Quick Actions');
      expect(compiled.textContent).toContain('Start planning your next adventure');
      expect(compiled.textContent).toContain('View and manage your planned trips');
      expect(compiled.textContent).toContain('Modify your travel preferences');
    });

    it('should display recent activity section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Recent Activity');
      expect(compiled.textContent).toContain('Profile Created');
      expect(compiled.textContent).toContain('Welcome to Travel Planner!');
    });
  });

  describe('Button Interactions', () => {
    it('should have correct button text and styles', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const buttonArray = Array.from(buttons) as HTMLButtonElement[];
      const getStartedButton = buttonArray.find(btn => 
        btn.textContent?.trim() === 'Get Started'
      );
      
      expect(getStartedButton).toBeTruthy();
      expect(getStartedButton?.classList.contains('btn-primary')).toBeTruthy();
    });

    it('should have outline buttons for secondary actions', () => {
      const outlineButtons = fixture.nativeElement.querySelectorAll('.btn-outline');
      const buttonArray = Array.from(outlineButtons) as HTMLButtonElement[];
      
      expect(outlineButtons.length).toBeGreaterThan(0);
      
      const buttonTexts = buttonArray.map(btn => btn.textContent?.trim());
      expect(buttonTexts).toContain('View Trips');
      expect(buttonTexts).toContain('Edit Profile');
    });
  });

  describe('Responsive Design Elements', () => {
    it('should have proper CSS classes for responsive layout', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.querySelector('.dashboard-container')).toBeTruthy();
      expect(compiled.querySelector('.actions-grid')).toBeTruthy();
      expect(compiled.querySelector('.action-card')).toBeTruthy();
    });

    it('should display emojis in action cards', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('✈️');
      expect(compiled.textContent).toContain('📋');
      expect(compiled.textContent).toContain('⚙️');
      expect(compiled.textContent).toContain('🎯');
    });
  });

  describe('Accessibility', () => {
    it('should have proper headings hierarchy', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.querySelector('h1')).toBeTruthy();
      expect(compiled.querySelector('h2')).toBeTruthy();
      expect(compiled.querySelector('h3')).toBeTruthy();
    });

    it('should have descriptive button text', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const buttonArray = Array.from(buttons) as HTMLButtonElement[];
      
      buttonArray.forEach((button: HTMLButtonElement) => {
        expect(button.textContent?.trim().length).toBeGreaterThan(0);
      });
    });
  });
});