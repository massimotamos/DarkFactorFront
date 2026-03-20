import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { PortfolioService } from './portfolio.service';
import { MarketDataService } from './market-data.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let portfolioServiceSpy: jasmine.SpyObj<PortfolioService>;
  let marketDataServiceSpy: jasmine.SpyObj<MarketDataService>;
  let priceSubject: Subject<any>;

  const mockRecommendation = {
    id: 'rec-1',
    userId: 'user-1',
    generatedAt: new Date().toISOString(),
    expectedReturnPercent: 8.5,
    volatilityPercent: 15.0,
    allocations: [
      { instrumentId: 'AAPL', weightPercent: 30, priceAtGeneration: 150 },
      { instrumentId: 'MSFT', weightPercent: 30, priceAtGeneration: 300 },
      { instrumentId: 'BOND1', weightPercent: 40, priceAtGeneration: 100 }
    ]
  };

  beforeEach(async () => {
    priceSubject = new Subject();
    portfolioServiceSpy = jasmine.createSpyObj('PortfolioService', ['getHistory', 'generateRecommendation']);
    marketDataServiceSpy = jasmine.createSpyObj('MarketDataService', ['subscribeToPrice'], {
      usingFallback: false
    });

    portfolioServiceSpy.getHistory.and.returnValue(of([mockRecommendation]));
    marketDataServiceSpy.subscribeToPrice.and.returnValue(priceSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule],
      providers: [
        { provide: PortfolioService, useValue: portfolioServiceSpy },
        { provide: MarketDataService, useValue: marketDataServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load most recent recommendation on init', () => {
    expect(component.recommendation).toEqual(mockRecommendation);
  });

  it('should show staleness banner when isStale is true', () => {
    component.isStale = true;
    fixture.detectChanges();
    const banner = fixture.nativeElement.querySelector('.banner.warn');
    expect(banner).toBeTruthy();
  });

  it('should not show staleness banner when isStale is false', () => {
    component.isStale = false;
    fixture.detectChanges();
    // Only the fallback banner might show, not the staleness one
    const banners: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.banner.warn');
    const stalenessTexts = Array.from(banners).filter((b: Element) =>
      b.textContent?.includes('stale'));
    expect(stalenessTexts.length).toBe(0);
  });

  it('should update live price on WebSocket message', () => {
    const priceUpdate = { ticker: 'AAPL', price: 155.5, currency: 'USD', timestamp: new Date().toISOString(), stale: false };
    priceSubject.next(priceUpdate);
    fixture.detectChanges();

    const livePrice = component.getLivePrice('AAPL');
    expect(livePrice?.price).toBe(155.5);
    expect(livePrice?.stale).toBeFalse();
  });

  it('should mark isStale when a live price is stale', fakeAsync(() => {
    const staleUpdate = { ticker: 'AAPL', price: 150, currency: 'USD', timestamp: new Date().toISOString(), stale: true };
    priceSubject.next(staleUpdate);
    fixture.detectChanges();

    // Trigger staleness check
    tick(10_000);
    expect(component.isStale).toBeTrue();
  }));

  it('should show fallback banner when usingFallback is true', () => {
    Object.defineProperty(marketDataServiceSpy, 'usingFallback', { get: () => true });
    fixture.detectChanges();
    const banners: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.banner.warn');
    const fallbackBanner = Array.from(banners).find((b: Element) =>
      b.textContent?.includes('Live updates paused'));
    expect(fallbackBanner).toBeTruthy();
  });
});
