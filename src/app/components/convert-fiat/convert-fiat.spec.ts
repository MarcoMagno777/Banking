import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertFiat } from './convert-fiat';

describe('ConvertFiat', () => {
  let component: ConvertFiat;
  let fixture: ComponentFixture<ConvertFiat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvertFiat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConvertFiat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
