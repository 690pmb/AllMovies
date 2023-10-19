import {Injectable} from '@angular/core';
import {AbstractService} from './abstract.manager';
import {Season, SeasonId} from '../model/season';
import {TranslateService} from '@ngx-translate/core';
import {SerieService} from '../service/serie.service';
import {Observable, combineLatest} from 'rxjs';
import {ParamMap} from '@angular/router';
import {switchMap, tap} from 'rxjs/operators';
import {SerieManager} from './serie.manager';

@Injectable({
  providedIn: 'root',
})
export class SeasonManager extends AbstractService<Season, SeasonId> {
  constructor(
    private readonly serieService: SerieService,
    translate: TranslateService,
    private readonly serieManager: SerieManager
  ) {
    super(
      seasonId =>
        this.serieService.getSeason(
          seasonId.serieId,
          seasonId.id,
          seasonId.lang,
          true
        ),
      (prev, curr) => prev.id === curr.id && prev.lang === curr.lang,
      translate
    );
  }

  find(paramMap: Observable<ParamMap>, key: string): Observable<Season> {
    return combineLatest([
      this.listenParam(paramMap, key),
      this.lang$,
      this.serieManager.listen(),
    ]).pipe(
      tap(([id, lang, serie]) =>
        this.update({id: id, serieId: serie.id, lang: lang})
      ),
      switchMap(() => this.listen())
    );
  }
}
