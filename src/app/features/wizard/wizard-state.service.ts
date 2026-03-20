import { Injectable, signal } from '@angular/core';

export interface WizardValues {
  riskTolerance?: string;
  experience?: string;
  incomeBracket?: string;
  netWorthBand?: string;
  horizonMonths?: number;
  regions?: string[];
  targetRoiPercent?: number;
}

@Injectable({ providedIn: 'root' })
export class WizardStateService {

  readonly totalSteps = 5;
  private _currentStep = signal(0);
  private _values = signal<WizardValues>({});

  get currentStep() { return this._currentStep(); }
  get values() { return this._values(); }

  saveStepValues(partial: Partial<WizardValues>): void {
    this._values.update(v => ({ ...v, ...partial }));
  }

  goForward(partial?: Partial<WizardValues>): void {
    if (partial) this.saveStepValues(partial);
    if (this._currentStep() < this.totalSteps - 1) {
      this._currentStep.update(s => s + 1);
    }
  }

  goBack(): void {
    if (this._currentStep() > 0) {
      this._currentStep.update(s => s - 1);
    }
  }

  reset(): void {
    this._currentStep.set(0);
    this._values.set({});
  }

  prePopulate(values: WizardValues): void {
    this._values.set({ ...values });
  }
}
