import { TestBed } from '@angular/core/testing';
import { WizardStateService, WizardValues } from './wizard-state.service';
import * as fc from 'fast-check';

/**
 * Property 26: Wizard pre-populates from existing profile.
 * Validates: Requirements 8.7
 *
 * When prePopulate() is called with a profile, all values are
 * immediately accessible via the service's values getter.
 */
describe('WizardStateService - pre-population', () => {
  let service: WizardStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WizardStateService);
  });

  it('Property 26: prePopulate sets all profile values', () => {
    const profileArb = fc.record<WizardValues>({
      riskTolerance: fc.constantFrom('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'),
      experience: fc.constantFrom('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
      incomeBracket: fc.constantFrom('BRACKET_UNDER_50K', 'BRACKET_50K_100K', 'BRACKET_100K_250K', 'BRACKET_OVER_250K'),
      netWorthBand: fc.constantFrom('BAND_UNDER_100K', 'BAND_100K_500K', 'BAND_500K_1M', 'BAND_OVER_1M'),
      horizonMonths: fc.integer({ min: 1, max: 360 }),
      regions: fc.array(fc.constantFrom('NORTH_AMERICA', 'EUROPE', 'ASIA_PACIFIC'), { minLength: 1, maxLength: 3 }),
      targetRoiPercent: fc.float({ min: 0.1, max: 50.0 })
    });

    fc.assert(
      fc.property(profileArb, (profile) => {
        service.reset();
        service.prePopulate(profile);

        const values = service.values;
        expect(values.riskTolerance).toBe(profile.riskTolerance);
        expect(values.experience).toBe(profile.experience);
        expect(values.incomeBracket).toBe(profile.incomeBracket);
        expect(values.netWorthBand).toBe(profile.netWorthBand);
        expect(values.horizonMonths).toBe(profile.horizonMonths);
        expect(values.regions).toEqual(profile.regions);
        expect(values.targetRoiPercent).toBe(profile.targetRoiPercent);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 26: prePopulate does not affect current step', () => {
    fc.assert(
      fc.property(
        fc.record<WizardValues>({
          riskTolerance: fc.constantFrom('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'),
          experience: fc.constantFrom('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
          incomeBracket: fc.constantFrom('BRACKET_UNDER_50K'),
          netWorthBand: fc.constantFrom('BAND_UNDER_100K'),
          horizonMonths: fc.integer({ min: 1, max: 360 }),
          regions: fc.array(fc.constantFrom('NORTH_AMERICA'), { minLength: 1, maxLength: 1 }),
          targetRoiPercent: fc.float({ min: 0.1, max: 50.0 })
        }),
        (profile) => {
          service.reset();
          const stepBefore = service.currentStep;
          service.prePopulate(profile);
          expect(service.currentStep).toBe(stepBefore);
        }
      ),
      { numRuns: 50 }
    );
  });
});
