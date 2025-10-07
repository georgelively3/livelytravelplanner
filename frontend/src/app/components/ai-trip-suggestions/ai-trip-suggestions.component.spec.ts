import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiTripSuggestionsComponent } from './ai-trip-suggestions.component';

describe('AiTripSuggestionsComponent', () => {
  let component: AiTripSuggestionsComponent;
  let fixture: ComponentFixture<AiTripSuggestionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AiTripSuggestionsComponent]
    });
    fixture = TestBed.createComponent(AiTripSuggestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
