import {Observable, of, ReplaySubject} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {map, catchError} from 'rxjs/operators';

import {Meta, Site} from '../../../../constant/meta';
import {Constants} from './../../../../constant/constants';
import {UtilsService} from '../../../../service/utils.service';
import {ToastService} from '../../../../service/toast.service';

@Injectable({
  providedIn: 'root',
})
export class MetaService {
  sites: ReplaySubject<Site[]> = new ReplaySubject<Site[]>();

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
          Meta.SEARCH_BANG_METACRITIC.label,
          Meta.SEARCH_BANG_WIKI_EN.label,
        ].includes(site)) ||
      (userLang === 'en' &&
        itemLang === 'fr' &&
        [
          Meta.SEARCH_BANG_SENSCRITIQUE.label,
          Meta.SEARCH_BANG_WIKI_FR.label,
        ].includes(site))
        ? original_title
        : title;

    if (
      [Meta.SEARCH_BANG_WIKI_EN.label, Meta.SEARCH_BANG_WIKI_FR.label].includes(
        site
      )
    ) {
      return this.wikisearch(workingTitle, site);
    } else if (site === Meta.SEARCH_BANG_IMDB.label && imdbId) {
      return of(
        Constants.IMDB_URL +
          (isMovie || isSerie
            ? Constants.IMDB_MOVIE_SUFFIX
            : Constants.IMDB_PERSON_SUFFIX) +
          imdbId
      );
    } else if (site === Meta.SEARCH_BANG_SENSCRITIQUE.label) {
      return of(
        `${Meta.GOOGLE_SEARCH_URL}${workingTitle}+site%3Asenscritique.com`
      );
    } else if (site === Meta.SEARCH_BANG_GOOGLE.label) {
      return of(`${Meta.GOOGLE_SEARCH_URL}${workingTitle}`);
    } else {
      return of(
        `${Meta.METACRITIC_SEARCH_URL}/${UtilsService.encodeQueryUrl(
          workingTitle
        )}/?page=1&category=${isMovie ? '2' : isSerie ? '1' : '3'}`
      );
    }
  }

  wikisearch(term: string, site: string): Observable<string> {
    const params = new HttpParams()
      .set('action', 'opensearch')
      .set('search', term)
      .set('format', 'json');

    const url = `https://${
      site === Meta.SEARCH_BANG_WIKI_EN.label ? 'en' : 'fr'
    }.wikipedia.org/w/api.php?${params.toString()}`;

    return this.serviceUtils.jsonpObservable(url, 'callback').pipe(
      map(response => response[3][0]),
      catchError(err => this.serviceUtils.handlePromiseError(err, this.toast))
    );
  }
}
