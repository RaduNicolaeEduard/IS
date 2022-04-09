import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewintencomponentComponent } from './newintencomponent.component';

describe('NewintencomponentComponent', () => {
  let component: NewintencomponentComponent;
  let fixture: ComponentFixture<NewintencomponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewintencomponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewintencomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
