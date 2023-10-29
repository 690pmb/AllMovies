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
import {ToastService} from './toast.service';
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
    private toast: ToastService,
    private mockService: MockService<Flag>
  ) {}

  getPopularMovies(language: string, page = 1): Promise<Movie[]> {
    return this.serviceUtils
      .getPromise(
        `${Url.MOST_POPULAR_MOVIE_URL}${Url.LANGUE}${language}${Url.PAGE_URL}${page}`
      )
      .then(response => MapMovie.mapForPopularMovies(response))
      .catch(err => this.serviceUtils.handlePromiseError(err, this.toast));
  }

  getMovies(ids: number[], language: string): Promise<Movie[]> {
    const obs = ids.map(id =>
      this.getMovie(
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
    return forkJoin(obs).toPromise();
  }

  getMovie(id: number, config: DetailConfig, detail: boolean): Promise<Movie> {
    return this.getMovie$(id, config, detail).toPromise();
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
            this.omdb.getImdbScore(movie).toPromise()
          )
        ),
        catchError(err => this.serviceUtils.handleObsError(err, this.toast))
      );
  }

  getMoviesByReleaseDates(
    debut: string,
    fin: string,
    language: string
  ): Promise<Movie[]> {
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
    return this.serviceUtils
      .getPromise(url)
      .then(response => MapMovie.mapForMoviesByReleaseDates(response))
      .catch(err => this.serviceUtils.handlePromiseError(err, this.toast));
  }

  getMoviesDiscover(
    criteria: DiscoverCriteria,
    people: number[],
    genre: number[],
    keyword: number[],
    isWithoutGenre: boolean,
    isWithoutKeyword: boolean
  ): Promise<Discover> {
    return this.serviceUtils
      .getPromise(
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
      .then((response: any) => {
        const discover = MapMovie.mapForDiscover(response);
        // discover.movies.forEach((movie) => this.omdb.getMovie(movie.imdb_id).then(score => movie.score = score));
        return discover;
      })
      .catch(err => this.serviceUtils.handlePromiseError(err, this.toast));
  }

  getMoviesPlaying(criteria: DiscoverCriteria): Promise<string[]> {
    return this.serviceUtils
      .getPromise(UrlBuilder.playingUrlBuilder(criteria))
      .then((response: any) => [response.dates.minimum, response.dates.maximum])
      .catch(err => this.serviceUtils.handlePromiseError(err, this.toast));
  }
}
