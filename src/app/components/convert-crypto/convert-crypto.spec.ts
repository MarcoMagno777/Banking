import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertCrypto } from './convert-crypto';

describe('ConvertCrypto', () => {
  let component: ConvertCrypto;
  let fixture: ComponentFixture<ConvertCrypto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvertCrypto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConvertCrypto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
