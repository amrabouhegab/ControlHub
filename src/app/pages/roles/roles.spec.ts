import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RolesPageComponent } from './roles';
import { RolesStore } from './roles.store';
import { MatDialogModule } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';

describe('RolesPageComponent', () => {
  let component: RolesPageComponent;
  let fixture: ComponentFixture<RolesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesPageComponent, MatDialogModule],
      providers: [LiveAnnouncer]
    }).compileComponents();

    fixture = TestBed.createComponent(RolesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with seed data', () => {
    const store = TestBed.inject(RolesStore);
    expect(store.roles().length).toBeGreaterThan(0);
  });

  it('should have SEED_PERMISSIONS defined', () => {
    expect(Array.isArray(component.SEED_PERMISSIONS)).toBeTruthy();
    expect(component.SEED_PERMISSIONS.length).toBeGreaterThan(0);
  });
});