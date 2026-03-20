import { TestBed } from '@angular/core/testing';
import { WizardStateService, WizardValues } from './wizard-state.service';
import * as fc from 'fast-check';

describe('WizardStateService', () => {
  let service: WizardStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WizardStateService);
  });

  /**
   * Property 25: Wizard back navigation retains values.
   * Validates: Requirements 8.4
   *
   * For any sequence of goForward calls with values, calling goBack
   * does not lose the previously saved values.
   */
  it('Property 25: back navigation retains previously entered values', () => {
    fc.assert(
      fc.property(
        fc.record({
          riskTolerance: fc.constantFrom('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'),
          experience: fc.constantFrom('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
          horizonMonths: fc.integer({ min: 1, max: 360 }),
          targetRoiPercent: fc.float({ min: 0.1, max: 50.0 })
        }),
        (values) => {
          service.reset();

          // Step 0: save risk + experience
          service.goForward({ riskTolerance: values.riskTolerance, experience: values.experience });
          // Step 1: save horizon
          service.goForward({ horizonMonths: values.horizonMonths });
          // Step 2: save ROI
          service.goForward({ targetRoiPercent: values.targetRoiPercent });

          // Go back twice
          service.goBack();
          service.goBack();

          // Values should still be retained
          const retained = service.values;
          expect(retained.riskTolerance).toBe(values.riskTolerance);
          expect(retained.experience).toBe(values.experience);
          expect(retained.horizonMonths).toBe(values.horizonMonths);
          expect(retained.targetRoiPercent).toBe(values.targetRoiPercent);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 25 (corollary): goBack does not decrement below step 0.
   */
  it('Property 25: goBack does not go below step 0', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10 }), (backCount) => {
        service.reset();
        for (let i = 0; i < backCount; i++) {
          service.goBack();
        }
        expect(service.currentStep).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 25 (corollary): goForward does not exceed totalSteps - 1.
   */
  it('Property 25: goForward does not exceed totalSteps - 1', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 20 }), (forwardCount) => {
        service.reset();
        for (let i = 0; i < forwardCount; i++) {
          service.goForward();
        }
        expect(service.currentStep).toBeLessThan(service.totalSteps);
      }),
      { numRuns: 50 }
    );
  });
});
