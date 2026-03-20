import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { ToastService } from '../shared/toast.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let jwtServiceSpy: jasmine.SpyObj<JwtService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    jwtServiceSpy = jasmine.createSpyObj('JwtService', ['getAccessToken', 'getRefreshToken', 'storeTokens', 'clearTokens', 'isExpired']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['refresh']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: JwtService, useValue: jwtServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should attach Bearer token to requests', () => {
    jwtServiceSpy.getAccessToken.and.returnValue('test-token');

    http.get('/api/profile').subscribe();

    const req = httpMock.expectOne('/api/profile');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({});
  });

  it('should not attach token to auth endpoints', () => {
    jwtServiceSpy.getAccessToken.and.returnValue('test-token');

    http.post('/api/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should redirect to login on 401 when no refresh token', () => {
    jwtServiceSpy.getAccessToken.and.returnValue('expired-token');
    jwtServiceSpy.getRefreshToken.and.returnValue(null);

    http.get('/api/profile').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/profile');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should show toast on 5xx errors', () => {
    jwtServiceSpy.getAccessToken.and.returnValue('token');
    jwtServiceSpy.getRefreshToken.and.returnValue(null);

    http.get('/api/portfolio/recommend').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/portfolio/recommend');
    req.flush({ correlationId: 'abc-123' }, { status: 500, statusText: 'Internal Server Error' });

    expect(toastServiceSpy.show).toHaveBeenCalledWith(
      jasmine.stringContaining('abc-123'), 'error'
    );
  });
});
