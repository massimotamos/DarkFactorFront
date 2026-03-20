import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WizardStateService, WizardValues } from './wizard-state.service';
import { ProfileService } from './profile.service';

const STEPS = ['Risk & Experience', 'Income & Net Worth', 'Horizon', 'Regions', 'Target ROI'];

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="wizard-container">
      <div class="progress">
        <span *ngFor="let step of steps; let i = index"
              [class.active]="i === currentStep"
              [class.done]="i < currentStep">
          {{ i + 1 }}. {{ step }}
        </span>
      </div>

      <form [formGroup]="stepForms[currentStep]" (ngSubmit)="onNext()">

        <!-- Step 0: Risk & Experience -->
        <ng-container *ngIf="currentStep === 0">
          <h3>Risk Tolerance & Experience</h3>
          <div class="field">
            <label>Risk Tolerance</label>
            <select formControlName="riskTolerance">
              <option value="">Select…</option>
              <option value="CONSERVATIVE">Conservative</option>
              <option value="MODERATE">Moderate</option>
              <option value="AGGRESSIVE">Aggressive</option>
            </select>
            <span class="error" *ngIf="stepForms[0].get('riskTolerance')?.invalid && stepForms[0].get('riskTolerance')?.touched">Required.</span>
          </div>
          <div class="field">
            <label>Investment Experience</label>
            <select formControlName="experience">
              <option value="">Select…</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            <span class="error" *ngIf="stepForms[0].get('experience')?.invalid && stepForms[0].get('experience')?.touched">Required.</span>
          </div>
        </ng-container>

        <!-- Step 1: Income & Net Worth -->
        <ng-container *ngIf="currentStep === 1">
          <h3>Income & Net Worth</h3>
          <div class="field">
            <label>Income Bracket</label>
            <select formControlName="incomeBracket">
              <option value="">Select…</option>
              <option value="UNDER_30K">Under $30K</option>
              <option value="BETWEEN_30K_60K">$30K – $60K</option>
              <option value="BETWEEN_60K_100K">$60K – $100K</option>
              <option value="BETWEEN_100K_200K">$100K – $200K</option>
              <option value="OVER_200K">Over $200K</option>
            </select>
            <span class="error" *ngIf="stepForms[1].get('incomeBracket')?.invalid && stepForms[1].get('incomeBracket')?.touched">Required.</span>
          </div>
          <div class="field">
            <label>Net Worth Band</label>
            <select formControlName="netWorthBand">
              <option value="">Select…</option>
              <option value="UNDER_50K">Under $50K</option>
              <option value="BETWEEN_50K_250K">$50K – $250K</option>
              <option value="BETWEEN_250K_1M">$250K – $1M</option>
              <option value="BETWEEN_1M_5M">$1M – $5M</option>
              <option value="OVER_5M">Over $5M</option>
            </select>
            <span class="error" *ngIf="stepForms[1].get('netWorthBand')?.invalid && stepForms[1].get('netWorthBand')?.touched">Required.</span>
          </div>
        </ng-container>

        <!-- Step 2: Horizon -->
        <ng-container *ngIf="currentStep === 2">
          <h3>Investment Horizon</h3>
          <div class="field">
            <label>Horizon (months, 1–360)</label>
            <input type="number" formControlName="horizonMonths" min="1" max="360" />
            <span class="error" *ngIf="stepForms[2].get('horizonMonths')?.invalid && stepForms[2].get('horizonMonths')?.touched">
              Must be between 1 and 360.
            </span>
          </div>
        </ng-container>

        <!-- Step 3: Regions -->
        <ng-container *ngIf="currentStep === 3">
          <h3>Preferred Regions</h3>
          <div class="field">
            <label>Select at least one region</label>
            <div *ngFor="let region of availableRegions">
              <label>
                <input type="checkbox" [value]="region"
                       (change)="onRegionChange($event)"
                       [checked]="selectedRegions.includes(region)" />
                {{ region }}
              </label>
            </div>
            <span class="error" *ngIf="regionsError">At least one region is required.</span>
          </div>
        </ng-container>

        <!-- Step 4: Target ROI -->
        <ng-container *ngIf="currentStep === 4">
          <h3>Target Return on Investment</h3>
          <div class="field">
            <label>Target ROI % (0.1–50.0)</label>
            <input type="number" formControlName="targetRoiPercent" min="0.1" max="50" step="0.1" />
            <span class="error" *ngIf="stepForms[4].get('targetRoiPercent')?.invalid && stepForms[4].get('targetRoiPercent')?.touched">
              Must be between 0.1 and 50.
            </span>
          </div>
        </ng-container>

        <span class="error" *ngIf="submitError">{{ submitError }}</span>

        <div class="actions">
          <button type="button" *ngIf="currentStep > 0" (click)="onBack()">Back</button>
          <button type="submit" [disabled]="loading">
            {{ currentStep < steps.length - 1 ? 'Next' : (loading ? 'Saving…' : 'Finish') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .wizard-container { max-width: 600px; margin: 40px auto; padding: 2rem; }
    .progress { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .progress span { padding: 0.25rem 0.5rem; border-radius: 4px; background: #eee; }
    .progress span.active { background: #1976d2; color: white; }
    .progress span.done { background: #388e3c; color: white; }
    .field { display: flex; flex-direction: column; margin-bottom: 1rem; }
    .error { color: #d32f2f; font-size: 0.85rem; margin-top: 0.25rem; }
    .actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
    button { padding: 0.75rem 1.5rem; }
  `]
})
export class WizardComponent implements OnInit {

  steps = STEPS;
  availableRegions = ['NORTH_AMERICA', 'EUROPE', 'ASIA_PACIFIC'];
  selectedRegions: string[] = [];
  regionsError = false;
  submitError = '';
  loading = false;
  private profileId: number | null = null;

  stepForms: FormGroup[] = [
    this.fb.group({
      riskTolerance: ['', Validators.required],
      experience: ['', Validators.required]
    }),
    this.fb.group({
      incomeBracket: ['', Validators.required],
      netWorthBand: ['', Validators.required]
    }),
    this.fb.group({
      horizonMonths: [12, [Validators.required, Validators.min(1), Validators.max(360)]]
    }),
    this.fb.group({}), // regions handled separately
    this.fb.group({
      targetRoiPercent: [8.0, [Validators.required, Validators.min(0.1), Validators.max(50)]]
    })
  ];

  get currentStep() { return this.wizardState.currentStep; }

  constructor(
    private fb: FormBuilder,
    private wizardState: WizardStateService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Pre-populate from existing profile
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.wizardState.prePopulate(profile);
        this.stepForms[0].patchValue({ riskTolerance: profile.riskTolerance, experience: profile.experience });
        this.stepForms[1].patchValue({ incomeBracket: profile.incomeBracket, netWorthBand: profile.netWorthBand });
        this.stepForms[2].patchValue({ horizonMonths: profile.horizonMonths });
        this.selectedRegions = profile.regions ?? [];
        this.stepForms[4].patchValue({ targetRoiPercent: profile.targetRoiPercent });
        this.profileId = (profile as any).id ?? null;
      },
      error: () => {} // No existing profile — start fresh
    });
  }

  onRegionChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedRegions = [...this.selectedRegions, checkbox.value];
    } else {
      this.selectedRegions = this.selectedRegions.filter(r => r !== checkbox.value);
    }
    this.regionsError = false;
  }

  onNext(): void {
    if (this.currentStep === 3) {
      if (this.selectedRegions.length === 0) {
        this.regionsError = true;
        return;
      }
      this.wizardState.goForward({ regions: this.selectedRegions });
      return;
    }

    const form = this.stepForms[this.currentStep];
    form.markAllAsTouched();
    if (form.invalid) return;

    const values = form.value as Partial<WizardValues>;
    this.wizardState.goForward(values);

    if (this.currentStep === this.steps.length - 1) {
      this.submit();
    }
  }

  onBack(): void {
    this.wizardState.goBack();
  }

  private submit(): void {
    this.loading = true;
    this.submitError = '';
    const v = this.wizardState.values;
    const request = {
      riskTolerance: v.riskTolerance!,
      experience: v.experience!,
      incomeBracket: v.incomeBracket!,
      netWorthBand: v.netWorthBand!,
      horizonMonths: v.horizonMonths!,
      regions: v.regions!,
      targetRoiPercent: v.targetRoiPercent!
    };

    const save$ = this.profileId
      ? this.profileService.updateProfile(request)
      : this.profileService.createProfile(request);

    save$.subscribe({
      next: () => {
        this.wizardState.reset();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.submitError = err.error?.message ?? 'Failed to save profile.';
      }
    });
  }
}
