import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerImgDniComponent } from './trainer-img-dni.component';

describe('TrainerImgDniComponent', () => {
  let component: TrainerImgDniComponent;
  let fixture: ComponentFixture<TrainerImgDniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainerImgDniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainerImgDniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
