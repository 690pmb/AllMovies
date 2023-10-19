import {Injectable} from '@angular/core';
import {Observable, of, iif} from 'rxjs';
import {map, catchError, mergeMap} from 'rxjs/operators';

import {MapSerie} from '../shared/mapSerie';
import {Utils} from '../shared/utils';
import {Url} from '../constant/url';
import {DiscoverCriteria} from '../model/discover-criteria';
import {Discover} from '../model/discover';
import {UrlBuilder} from '../shared/urlBuilder';
import {MapSeason} from '../shared/mapSeason';
import {Season} from '../model/season';
import {DetailConfig} from '../model/model';
import {Serie} from '../model/serie';
import {ToastService} from './toast.service';
import {UtilsService} from './utils.service';
import {OmdbService} from './omdb.service';

@Injectable({
  providedIn: 'root',
})
export class SerieService {
  constructor(
    private omdb: OmdbService,
    private serviceUtils: UtilsService,
    private toast: ToastService
  ) {}

  getPopularSeries(language: string, page = 1): Promise<Serie[]> {
    return this.serviceUtils
      .getPromise(
        `${Url.MOST_POPULAR_SERIE_URL}${Url.LANGUE}${language}${Url.PAGE_URL}${page}`
      )
      .then(response => MapSerie.mapForPopularSeries(response))
      .catch(err => this.serviceUtils.handlePromiseError(err, this.toast));
  }

  getSerie(id: number, config: DetailConfig, detail: boolean): Promise<Serie> {
    return this.getSerie$(id, config, detail).toPromise();
  }

  getSerie$(
    id: number,
    config: DetailConfig,
    detail: boolean
  ): Observable<Serie> {
    return this.serviceUtils
      .getObservable(
        UrlBuilder.detailUrlBuilder(
          false,
          id,
          config.video,
          config.credit,
          config.reco,
          config.release,
          config.keywords,
          config.similar,
          config.img,
          config.titles,
          config.external,
          config.lang
        )
      )
      .pipe(
        map(response => {
          const serie = MapSerie.mapForSerie(response);
          serie.lang_version = config.lang;
          return serie;
        }),
        mergeMap(serie =>
          iif(
            () =>
              detail &&
              config.lang !== 'en' &&
              (!serie.overview ||
                (!serie.videos && config.video) ||
                !serie.original_title),
            this.getSerie$(
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
              map(enSerie => {
                serie.overview = Utils.isBlank(serie.overview)
                  ? enSerie.overview
                  : serie.overview;
                serie.videos =
                  serie.videos && serie.videos.length > 0
                    ? serie.videos
                    : enSerie.videos;
                serie.original_title = Utils.isBlank(serie.original_title)
                  ? enSerie.overview
                  : serie.original_title;
                serie.score = enSerie.score;
                return serie;
              })
            ),
            this.omdb.getImdbScore(serie)
          )
        ),
        catchError(err => this.serviceUtils.handleObsError(err, this.toast))
      );
  }

  getSeason(
    id: number,
    seasonNumber: number,
    language: string,
    detail: boolean
  ): Observable<Season> {
    return this.serviceUtils
      .getObservable(
        UrlBuilder.seasonUrlBuilder(
          id,
          seasonNumber,
          language,
          detail,
          detail,
          detail
        )
      )
      .pipe(
        map(response => MapSeason.mapForSeasonDetail(response)),
        mergeMap(season =>
          iif(
            () =>
              detail &&
              (!season.overview || !season.videos) &&
              language !== 'en',
            this.getSeason(id, seasonNumber, 'en', true).pipe(
              map(enSeason => {
                season.overview = Utils.isBlank(season.overview)
                  ? enSeason.overview
                  : season.overview;
                season.videos =
                  season.videos && season.videos.length > 0
                    ? season.videos
                    : enSeason.videos;
                return season;
              })
            ),
            of(season)
          )
        ),
        catchError(err => this.serviceUtils.handleObsError(err, this.toast))
      );
  }

  search(term: string, language: string): Observable<Serie[]> {
    const url = `${Url.SERIE_SEARCH_URL}${Url.API_KEY}${
      Url.QUERY_URL
    }${UtilsService.encodeQueryUrl(term)}${Url.LANGUE}${language}`;
    return this.serviceUtils
      .getObservable(url, this.serviceUtils.getHeaders())
      .pipe(
        map(response => MapSerie.mapForSearchSeries(response)),
        catchError(err => this.serviceUtils.handlePromiseError(err, this.toast))
      );
  }

  getSeriesDiscover(
    criteria: DiscoverCriteria,
    genre: number[],
    keyword: number[],
    networks: number[],
    isWithoutGenre: boolean,
    isWithoutKeyword: boolean
  ): Promise<Discover> {
    return this.serviceUtils
      .getPromise(
        UrlBuilder.discoverUrlBuilder(
          false,
          criteria,
          undefined,
          genre,
          keyword,
          networks,
          isWithoutGenre,
          isWithoutKeyword
        )
      )
      .then((response: any) => {
        const discover = MapSerie.mapForDiscover(response);
        // discover.movies.forEach((movie) => this.omdb.getMovie(movie.imdb_id).then(score => movie.score = score));
        return discover;
      })
      .catch(err => this.serviceUtils.handlePromiseError(err, this.toast));
  }
}
