import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {map, catchError} from 'rxjs/operators';

import {DuckDuckGo} from './../../../../constant/duck-duck-go';
import {Constants} from './../../../../constant/constants';
import {UtilsService} from '../../../../service/utils.service';
import {ToastService} from '../../../../service/toast.service';

@Injectable({
  providedIn: 'root',
})
export class MetaService {
  constructor(
    private serviceUtils: UtilsService,
    private toast: ToastService
  ) {}

  getLinkScore(
    title: string,
    original_title: string,
    userLang: string,
    itemLang: string,
    site: any,
    imdbId: string,
    isMovie: boolean,
    isSerie: boolean
  ): Observable<string> {
    const workingTitle =
      (userLang === 'fr' &&
        ['gb', 'en'].includes(itemLang) &&
        [
          DuckDuckGo.SEARCH_BANG_METACRITIC.site,
          DuckDuckGo.SEARCH_BANG_WIKI_EN.site,
        ].includes(site)) ||
      (userLang === 'en' &&
        itemLang === 'fr' &&
        [
          DuckDuckGo.SEARCH_BANG_SENSCRITIQUE.site,
          DuckDuckGo.SEARCH_BANG_WIKI_FR.site,
        ].includes(site))
        ? original_title
        : title;

    if (
      site === DuckDuckGo.SEARCH_BANG_WIKI_EN.site ||
      site === DuckDuckGo.SEARCH_BANG_WIKI_FR.site
    ) {
      return this.wikisearch(workingTitle, site);
    } else if (site === DuckDuckGo.SEARCH_BANG_IMDB.site && imdbId) {
      return of(
        Constants.IMDB_URL +
          (isMovie || isSerie
            ? Constants.IMDB_MOVIE_SUFFIX
            : Constants.IMDB_PERSON_SUFFIX) +
          imdbId
      );
    } else {
      let url = DuckDuckGo.DUCKDUCKGO_URL + site + '+';
      url +=
        UtilsService.encodeQueryUrl(workingTitle) +
        '&format=json&no_redirect=1';
      return this.serviceUtils.getObservable(url).pipe(
        map((data: any) => {
          let result = <string>data.Redirect;
          if (site === DuckDuckGo.SEARCH_BANG_METACRITIC.site) {
            if (isMovie) {
              result = result.replace('/all/', '/movie/');
            } else if (isSerie) {
              result = result.replace('/all/', '/tv/');
            } else {
              result = result.replace('/all/', '/person/');
            }
          } else if (site === DuckDuckGo.SEARCH_BANG_SENSCRITIQUE.site) {
            result = `https://www.google.com/search?q=${workingTitle}+site%3Asenscritique.com`;
          }
          return result;
        }),
        catchError(err => this.serviceUtils.handlePromiseError(err, this.toast))
      );
    }
  }

  wikisearch(term: string, site: string): Observable<any> {
    const params = new HttpParams()
      .set('action', 'opensearch')
      .set('search', term)
      .set('format', 'json');

    const url = `https://${
      site === DuckDuckGo.SEARCH_BANG_WIKI_EN.site ? 'en' : 'fr'
    }.wikipedia.org/w/api.php?${params.toString()}`;

    return this.serviceUtils.jsonpObservable(url, 'callback').pipe(
      map(response => response[3][0]),
      catchError(err => this.serviceUtils.handlePromiseError(err, this.toast))
    );
  }
}
