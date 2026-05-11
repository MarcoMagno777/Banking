import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { BankingService } from './banking-service';

describe('BankingService', () => {
  let service: BankingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(BankingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
