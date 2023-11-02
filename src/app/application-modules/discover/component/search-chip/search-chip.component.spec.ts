import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {HttpClientModule} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserModule} from '@angular/platform-browser/';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {SharedModule} from '../../../../shared/shared.module';
import { SearchChipComponent } from './search-chip.component';

describe('SearchChipComponent', () => {
  let component: SearchChipComponent<any>;
  let fixture: ComponentFixture<SearchChipComponent<any>>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchChipComponent],
      providers: [TranslateService],
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        HttpClientModule,
        FontAwesomeModule,
        MatChipsModule,
        RouterTestingModule,
        SharedModule.forRoot(),
        MatSnackBarModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchChipComponent);
    component = fixture.componentInstance;
  });

  it('init', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    console.log('SearchChipComponent');
  });
});
