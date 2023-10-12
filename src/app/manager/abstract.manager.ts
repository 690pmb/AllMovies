import {ParamMap} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {
  shareReplay,
  distinctUntilChanged,
  switchMap,
  filter,
  map,
  startWith,
} from 'rxjs/operators';

export abstract class AbstractService<T, ID> {
  private readonly id$ = new BehaviorSubject<ID>(undefined);
  private readonly item$ = this.id$.pipe(
    filter(id => !!id),
    distinctUntilChanged((prev, curr) => this.equals(prev, curr)),
    switchMap(id => this.findById(id)),
    shareReplay(1)
  );

  protected readonly lang$ = this.translate.onLangChange.asObservable().pipe(
    map(e => e.lang),
    startWith(this.translate.currentLang),
    distinctUntilChanged(),
    shareReplay(1)
  );

  constructor(
    private readonly findById: (id: ID) => Observable<T>,
    private readonly equals: (prev: ID, curr: ID) => boolean,
    private readonly translate: TranslateService
  ) {}

  listen(): Observable<T> {
    return this.item$;
  }

  public listenParam(
    paramMap: Observable<ParamMap>,
    key: string
  ): Observable<number> {
    return paramMap.pipe(
      map((params: ParamMap) => +params.get(key)),
      filter(id => id !== undefined)
    );
  }

  protected update(id: ID): void {
    this.id$.next(id);
  }

  public abstract find(
    paramMap: Observable<ParamMap>,
    key: string,
    ...args: (number | string)[]
  ): Observable<T>;
}
