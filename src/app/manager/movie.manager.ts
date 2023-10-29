import {Injectable} from '@angular/core';
import {AbstractService} from './abstract.manager';
import {DetailConfig} from '../model/model';
import {TranslateService} from '@ngx-translate/core';
import {Observable, combineLatest} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {MovieService} from '../service/movie.service';
import {Movie} from '../model/movie';

@Injectable({
  providedIn: 'root',
})
export class MovieManager extends AbstractService<
  Movie,
  {id: number; config: DetailConfig}
> {
  constructor(
    private readonly movieService: MovieService,
    translate: TranslateService
  ) {
    super(
      movieId => this.movieService.getMovie$(movieId.id, movieId.config, true),
      (prev, curr) =>
        prev.id === curr.id &&
        prev.config.lang === curr.config.lang &&
        prev.config.reco === curr.config.reco,
      translate
    );
  }

  find(id$: Observable<number>, config: DetailConfig): Observable<Movie> {
    return combineLatest([id$, this.lang$]).pipe(
      tap(([id, lang]) => {
        config.lang = lang;
        this.update({id, config});
      }),
      switchMap(() => this.listen())
    );
  }
}
