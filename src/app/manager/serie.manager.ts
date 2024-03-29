import {Injectable} from '@angular/core';
import {AbstractService} from './abstract.manager';
import {Serie, SerieId} from '../model/serie';
import {SerieService} from '../service/serie.service';
import {DetailConfig} from '../model/model';
import {TranslateService} from '@ngx-translate/core';
import {Observable, combineLatest} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SerieManager extends AbstractService<Serie, SerieId> {
  constructor(
    private readonly serieService: SerieService,
    translate: TranslateService
  ) {
    super(
      serieId =>
        this.serieService.getSerie$(
          serieId.id,
          new DetailConfig(
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            serieId.lang
          ),
          true
        ),
      (prev, curr) => prev.id === curr.id && prev.lang === curr.lang,
      translate
    );
  }

  find(id$: Observable<number>): Observable<Serie> {
    return combineLatest([id$, this.lang$]).pipe(
      tap(([id, lang]) => this.update({id, lang})),
      switchMap(() => this.listen())
    );
  }
}
