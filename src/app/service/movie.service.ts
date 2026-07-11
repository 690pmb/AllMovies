import {Observable, forkJoin, iif} from 'rxjs';
import {Injectable} from '@angular/core';

import {DiscoverCriteria} from '../model/discover-criteria';
import {Discover} from '../model/discover';
import {MapMovie} from '../shared/mapMovie';
import {MockService} from './mock.service';
import {UtilsService} from './utils.service';
import {Movie} from '../model/movie';
import {DetailConfig, Flag} from '../model/model';
import {Url} from '../constant/url';
import {OmdbService} from './omdb.service';
import {UrlBuilder} from '../shared/urlBuilder';
import {Utils} from '../shared/utils';
import {map, mergeMap, catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  constructor(
    private serviceUtils: UtilsService,
    private omdb: OmdbService,
    private mockService: MockService<Flag>
  ) {}

  getPopularMovies(language: string, page = 1): Observable<Movie[]> {
    return this.serviceUtils
      .getObservable(
        `${Url.MOST_POPULAR_MOVIE_URL}${Url.LANGUE}${language}${Url.PAGE_URL}${page}`
      )
      .pipe(
        map(response => MapMovie.mapForPopularMovies(response)),
        catchError(err => this.serviceUtils.handleObsError(err))
      );
  }

  getMovies(ids: number[], language: string): Observable<Movie[]> {
    const obs = ids.map(id =>
      this.getMovie$(
        id,
        new DetailConfig(
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          false,
          language
        ),
        false
      )
    );
    return forkJoin(obs);
  }

  getMovie(
    id: number,
    config: DetailConfig,
    detail: boolean
  ): Observable<Movie> {
    return this.getMovie$(id, config, detail);
  }

  getMovie$(
    id: number,
    config: DetailConfig,
    detail: boolean
  ): Observable<Movie> {
    return this.serviceUtils
      .getObservable(
        UrlBuilder.detailUrlBuilder(
          true,
          id,
          config.video,
          config.credit,
          config.reco,
          config.release,
          config.keywords,
          config.similar,
          config.img,
          config.titles,
          false,
          config.lang
        )
      )
      .pipe(
        map(response => {
          const movie = MapMovie.mapForMovie(response, this.mockService);
          movie.lang_version = config.lang ?? movie.lang_version;
          return movie;
        }),
        mergeMap(movie =>
          iif(
            () =>
              detail &&
              config.lang !== 'en' &&
              (!movie.overview ||
                ((movie.videos === undefined || movie.videos.length === 0) &&
                  config.video) ||
                !movie.original_title),
            this.getMovie$(
              id,
              new DetailConfig(
                false,
                false,
                false,
                false,
                config.video,
                false,
                false,
                false,
                false,
                'en'
              ),
              false
            ).pipe(
              map(enMovie => {
                movie.overview = Utils.isBlank(movie.overview)
                  ? enMovie.overview
                  : movie.overview;
                movie.videos =
                  movie.videos && movie.videos.length > 0
                    ? movie.videos
                    : enMovie.videos;
                movie.original_title = Utils.isBlank(movie.original_title)
                  ? enMovie.original_title
                  : movie.original_title;
                movie.score = enMovie.score;
                return movie;
              })
            ),
            this.omdb.getImdbScore(movie)
          )
        ),
        catchError(err => this.serviceUtils.handleObsError(err))
      );
  }

  getMoviesByReleaseDates(
    debut: string,
    fin: string,
    language: string
  ): Observable<Movie[]> {
    const criteria = new DiscoverCriteria();
    criteria.language = language;
    criteria.region = 'fr';
    criteria.yearMin = debut;
    criteria.yearMax = fin;
    criteria.releaseType = [3, 2];
    criteria.runtimeMin = 60;
    const url = UrlBuilder.discoverUrlBuilder(
      true,
      criteria,
      undefined,
      undefined,
      undefined
    );
    return this.serviceUtils.getObservable(url).pipe(
      map(response => MapMovie.mapForMoviesByReleaseDates(response)),
      catchError(err => this.serviceUtils.handleObsError(err))
    );
  }

  getMoviesDiscover(
    criteria: DiscoverCriteria,
    people: number[],
    genre: number[],
    keyword: number[],
    isWithoutGenre: boolean,
    isWithoutKeyword: boolean
  ): Observable<Discover> {
    return this.serviceUtils
      .getObservable(
        UrlBuilder.discoverUrlBuilder(
          true,
          criteria,
          people,
          genre,
          keyword,
          undefined,
          isWithoutGenre,
          isWithoutKeyword
        )
      )
      .pipe(
        map((response: any) => {
          const discover = MapMovie.mapForDiscover(response);
          return discover;
        }),
        catchError(err => this.serviceUtils.handleObsError(err))
      );
  }

  getMoviesPlaying(criteria: DiscoverCriteria): Observable<string[]> {
    return this.serviceUtils
      .getObservable(UrlBuilder.playingUrlBuilder(criteria))
      .pipe(
        map((response: any) => [
          response.dates.minimum,
          response.dates.maximum,
        ]),
        catchError(err => this.serviceUtils.handleObsError(err))
      );
  }
}
