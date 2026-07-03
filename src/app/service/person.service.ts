import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map, mergeMap, catchError} from 'rxjs/operators';

import {Utils} from '../shared/utils';
import {MapPerson} from '../shared/mapPerson';
import {UtilsService} from './utils.service';
import {Url} from '../constant/url';
import {Person} from '../model/person';
import {ToastService} from './toast.service';
import {UrlBuilder} from '../shared/urlBuilder';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  constructor(
    private serviceUtils: UtilsService,
    private toast: ToastService
  ) {}

  getPerson(id: number, language: string, detail: boolean): Observable<Person> {
    return this.serviceUtils
      .getObservable(UrlBuilder.personUrlBuilder(id, language, true, true))
      .pipe(
        mergeMap((response: any) => {
          const person = MapPerson.mapForPerson(response);
          if (detail && !person.biography && language !== 'en') {
            return this.getPerson(id, 'en', false).pipe(
              map(enPerson => {
                person.biography = Utils.isBlank(person.biography)
                  ? enPerson.biography
                  : person.biography;
                return person;
              })
            );
          } else {
            return of(person);
          }
        }),
        catchError(err => this.serviceUtils.handleObsError(err, this.toast))
      );
  }

  getPopularPersons(language: string, page = 1): Observable<Person[]> {
    return this.serviceUtils
      .getObservable(
        `${Url.GET_POPULAR_PERSON}${Url.LANGUE}${language}${Url.PAGE_URL}${page}`
      )
      .pipe(
        map((response: any) =>
          response.results.map(res => MapPerson.mapForPerson(res))
        ),
        catchError(err => this.serviceUtils.handleObsError(err, this.toast))
      );
  }
}
