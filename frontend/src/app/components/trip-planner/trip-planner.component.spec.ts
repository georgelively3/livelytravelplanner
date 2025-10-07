import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { TripPlannerComponent } from './trip-planner.component';
import { AuthService } from '../../services/auth.service';
import { PersonaService } from '../../services/persona.service';
import { TripService } from '../../services/trip.service';

describe('TripPlannerComponent', () => {
  let component: TripPlannerComponent;
  let fixture: ComponentFixture<TripPlannerComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPersonaService: jasmine.SpyObj<PersonaService>;
  let mockTripService: jasmine.SpyObj<TripService>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['currentUser$']);
    const personaServiceSpy = jasmine.createSpyObj('PersonaService', ['getUserPersonas', 'getTravelerProfiles']);
    const tripServiceSpy = jasmine.createSpyObj('TripService', ['createTrip']);
    
    authServiceSpy.currentUser$ = of({ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' });
    
    // Mock persona service responses
    personaServiceSpy.getUserPersonas.and.returnValue(of({
      personas: [{
        id: 1,
        baseProfileId: 2,
        baseProfileName: 'Cultural Explorer',
        baseProfileDescription: 'Loves museums, art galleries, and historical sites.',
        personalPreferences: 'Art, history, local culture',
        constraints: '',
        budgetDetails: 'Mid-range',
        accessibilityNeeds: '',
        groupDynamics: '',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }]
    }));
    
    personaServiceSpy.getTravelerProfiles.and.returnValue(of({
      profiles: [{
        id: 2,
        name: 'Cultural Explorer',
        description: 'Loves museums, art galleries, and historical sites.',
        createdAt: '2025-01-01'
      }]
    }));

    // Mock trip service response
    tripServiceSpy.createTrip.and.returnValue(of({
      id: 1,
      name: 'Summer Vacation',
      destination: 'Paris, France',
      startDate: '2025-07-01',
      endDate: '2025-07-10',
      description: 'A wonderful trip to explore the City of Light',
      createdAt: '2025-01-01'
    }));

    TestBed.configureTestingModule({
      declarations: [TripPlannerComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PersonaService, useValue: personaServiceSpy },
        { provide: TripService, useValue: tripServiceSpy }
      ]
    });
    
    fixture = TestBed.createComponent(TripPlannerComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockPersonaService = TestBed.inject(PersonaService) as jasmine.SpyObj<PersonaService>;
    mockTripService = TestBed.inject(TripService) as jasmine.SpyObj<TripService>;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should initialize form with proper validators', () => {
      expect(component.tripForm).toBeDefined();
      expect(component.tripForm.get('name')?.valid).toBeFalsy();
      expect(component.tripForm.get('destination')?.valid).toBeFalsy();
      expect(component.tripForm.get('startDate')?.valid).toBeTruthy(); // This gets set to today in ngOnInit
      expect(component.tripForm.get('endDate')?.valid).toBeFalsy();
      expect(component.tripForm.valid).toBeFalsy(); // Overall form should still be invalid
    });

    it('should validate trip name minimum length', () => {
      const nameControl = component.tripForm.get('name');
      nameControl?.setValue('ab');
      expect(nameControl?.hasError('minlength')).toBeTruthy();
      
      nameControl?.setValue('abc');
      expect(nameControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate destination minimum length', () => {
      const destinationControl = component.tripForm.get('destination');
      destinationControl?.setValue('a');
      expect(destinationControl?.hasError('minlength')).toBeTruthy();
      
      destinationControl?.setValue('ab');
      expect(destinationControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate description minimum length when provided', () => {
      const descriptionControl = component.tripForm.get('description');
      descriptionControl?.setValue('short');
      expect(descriptionControl?.hasError('minlength')).toBeTruthy();
      
      descriptionControl?.setValue('This is a longer description that meets the minimum requirements');
      expect(descriptionControl?.hasError('minlength')).toBeFalsy();
    });

    it('should allow empty description', () => {
      const descriptionControl = component.tripForm.get('description');
      descriptionControl?.setValue('');
      expect(descriptionControl?.valid).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      // Set up valid form data
      component.tripForm.patchValue({
        name: 'Summer Vacation',
        destination: 'Paris, France',
        startDate: '2025-07-01',
        endDate: '2025-07-10',
        description: 'A wonderful trip to explore the City of Light'
      });
    });

    it('should call createTrip when form is valid', () => {
      spyOn(component, 'createTrip' as any);
      
      component.onSubmit();
      
      expect(component['createTrip']).toHaveBeenCalledWith({
        name: 'Summer Vacation',
        destination: 'Paris, France',
        startDate: '2025-07-01',
        endDate: '2025-07-10',
        description: 'A wonderful trip to explore the City of Light'
      });
    });
  });

  describe('Trip Creation', () => {
    it('should create trip successfully and navigate to dashboard', fakeAsync(() => {
      const tripData = {
        name: 'Summer Vacation',
        destination: 'Paris, France',
        startDate: '2025-07-01',
        endDate: '2025-07-10',
        description: 'A wonderful trip to explore the City of Light'
      };
      
      component['createTrip'](tripData);
      tick(); // Process the observable
      
      expect(mockTripService.createTrip).toHaveBeenCalledWith(tripData);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('should handle trip creation errors gracefully', fakeAsync(() => {
      // Mock error response
      mockTripService.createTrip.and.returnValue(throwError(() => new Error('Server error')));
      
      const tripData = {
        name: 'Summer Vacation',
        destination: 'Paris, France',
        startDate: '2025-07-01',
        endDate: '2025-07-10',
        description: 'A wonderful trip to explore the City of Light'
      };
      
      spyOn(console, 'error');
      spyOn(window, 'alert');
      
      component['createTrip'](tripData);
      tick(); // Process the observable
      
      expect(mockTripService.createTrip).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error creating trip:', jasmine.any(Error));
      expect(window.alert).toHaveBeenCalledWith('Server error');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should mark form as touched when invalid', () => {
      component.tripForm.patchValue({
        name: '',
        destination: '',
        startDate: '',
        endDate: ''
      });
      
      spyOn(component, 'markFormGroupTouched' as any);
      
      component.onSubmit();
      
      expect(component['markFormGroupTouched']).toHaveBeenCalled();
    });

    it('should navigate to dashboard after successful trip creation', fakeAsync(() => {
      spyOn(window, 'alert');
      
      // Set up valid form data
      component.tripForm.patchValue({
        name: 'Summer Vacation',
        destination: 'Paris, France',
        startDate: '2025-07-01',
        endDate: '2025-07-10',
        description: 'A wonderful trip to explore the City of Light'
      });
      
      component.onSubmit();
      tick(); // Process the observable
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));
  });

  describe('Navigation', () => {
    it('should navigate back to dashboard when goBack is called', () => {
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate to profile wizard when editProfile is called', () => {
      component.editProfile();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile-wizard']);
    });
  });

  describe('User Persona Loading', () => {
    it('should load user persona on init', () => {
      component.ngOnInit();
      
      expect(mockPersonaService.getUserPersonas).toHaveBeenCalled();
      expect(mockPersonaService.getTravelerProfiles).toHaveBeenCalled();
      expect(component.userPersona).toBeDefined();
      expect(component.baseProfile?.name).toBe('Cultural Explorer');
      expect(component.baseProfile?.description).toContain('museums, art galleries');
    });

    it('should display persona information in template', () => {
      component.userPersona = {
        id: 1,
        baseProfileId: 2,
        baseProfileName: 'Cultural Explorer',
        baseProfileDescription: 'Loves museums, art galleries, and historical sites.',
        personalPreferences: '',
        constraints: '',
        budgetDetails: '',
        accessibilityNeeds: '',
        groupDynamics: '',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };
      
      component.baseProfile = {
        id: 2,
        name: 'Cultural Explorer',
        description: 'Loves museums, art galleries, and historical sites.',
        createdAt: '2025-01-01'
      };
      
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Cultural Explorer');
      expect(compiled.textContent).toContain('museums, art galleries');
    });

    it('should handle case when no personas exist', () => {
      mockPersonaService.getUserPersonas.and.returnValue(of({ personas: [] }));
      
      component.ngOnInit();
      
      expect(component.userPersona).toBeNull();
      expect(component.baseProfile).toBeNull();
    });

    it('should handle errors when loading personas', () => {
      mockPersonaService.getUserPersonas.and.returnValue(of({ personas: [] }));
      spyOn(console, 'error');
      
      component.ngOnInit();
      
      expect(component.userPersona).toBeNull();
      expect(component.baseProfile).toBeNull();
    });
  });

  describe('Date Handling', () => {
    it('should set minimum start date to today', () => {
      const today = new Date().toISOString().split('T')[0];
      const startDateValue = component.tripForm.get('startDate')?.value;
      
      expect(startDateValue).toBe(today);
    });

    it('should clear end date when start date changes', () => {
      component.tripForm.get('endDate')?.setValue('2025-07-10');
      component.tripForm.get('startDate')?.setValue('2025-07-05');
      
      // Trigger the valueChanges subscription
      component.tripForm.get('startDate')?.updateValueAndValidity();
      
      expect(component.tripForm.get('endDate')?.value).toBe('');
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper labels for all form controls', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.querySelector('label[for="tripName"]')).toBeTruthy();
      expect(compiled.querySelector('label[for="destination"]')).toBeTruthy();
      expect(compiled.querySelector('label[for="startDate"]')).toBeTruthy();
      expect(compiled.querySelector('label[for="endDate"]')).toBeTruthy();
      expect(compiled.querySelector('label[for="description"]')).toBeTruthy();
    });

    it('should have helpful text for form inputs', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Give your trip a memorable name');
      expect(compiled.textContent).toContain('Where would you like to go?');
      expect(compiled.textContent).toContain('Help us understand what makes this trip special');
    });
  });

  describe('Button States', () => {
    it('should disable submit button when form is invalid', () => {
      component.tripForm.patchValue({
        name: '',
        destination: '',
        startDate: '',
        endDate: ''
      });
      
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBeTruthy();
    });

    it('should enable submit button when form is valid', () => {
      component.tripForm.patchValue({
        name: 'Test Trip',
        destination: 'Test Destination',
        startDate: '2025-07-01',
        endDate: '2025-07-10'
      });
      
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBeFalsy();
    });
  });
});
