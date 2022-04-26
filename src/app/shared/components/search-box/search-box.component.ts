import {FormControl} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {Observable, of} from 'rxjs';
import {debounceTime, switchMap, catchError} from 'rxjs/operators';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  TemplateRef,
  HostBinding,
} from '@angular/core';
import {faTimes, faSearch} from '@fortawesome/free-solid-svg-icons';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
})
export class SearchBoxComponent<T> implements OnInit {
  @ViewChild(MatAutocompleteTrigger)
  trigger!: MatAutocompleteTrigger;

  @Input()
  @HostBinding('class.minimized')
  minimized: boolean = true;

  @Input()
  template!: TemplateRef<unknown>;

  @Input()
  fetchOptions: (term: string, lang: string) => Observable<T[]>;

  @Input()
  placeholder: string;

  @Input()
  floatLabel = 'never';

  @Output() selected = new EventEmitter<T>();

  filteredDatas!: Observable<T[]>;
  dataCtrl = new FormControl();
  faRemove = faTimes;
  faSearch = faSearch;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.filteredDatas = this.dataCtrl.valueChanges.pipe(
      debounceTime(300),
      switchMap(term =>
        term ? this.fetchOptions(term, this.translate.currentLang) : of([])
      ),
      catchError(error => {
        console.error(error);
        return of([]);
      })
    );
  }

  reset(): void {
    this.dataCtrl.reset();
    this.trigger.closePanel();
  }

  reload(): void {
    this.dataCtrl.updateValueAndValidity({emitEvent: true});
    this.trigger.openPanel();
  }

  select(data: T): void {
    this.selected.emit(data);
  }
}
