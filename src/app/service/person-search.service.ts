import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, catchError} from 'rxjs/operators';

import {MapPerson} from '../shared/mapPerson';
import {Person} from '../model/person';
import {Url} from '../constant/url';
import {UtilsService} from './utils.service';
import {SearchService} from './search.service';

@Injectable({
  providedIn: 'root',
})
export class PersonSearchService implements SearchService<Person> {
  constructor(private serviceUtils: UtilsService) {}

  search(term: string, adult: boolean): Observable<Person[]> {
    let url = Url.PERSON_SEARCH_URL + Url.API_KEY;
    if (adult) {
      url += Url.ADULT_URL;
    }
    url += `${Url.QUERY_URL}${UtilsService.encodeQueryUrl(term)}`;
    return this.serviceUtils
      .getObservable(url, this.serviceUtils.getHeaders())
      .pipe(
        map(response => MapPerson.mapForSearchPersons(response)),
        catchError(this.serviceUtils.handleObsError)
      );
  }

  byId(id: number): Observable<Person> {
    return this.serviceUtils
      .getObservable(
        `${Url.PERSON_URL}/${id}?${Url.API_KEY}`,
        this.serviceUtils.getHeaders()
      )
      .pipe(
        map((response: any) => MapPerson.mapForPerson(response)),
        catchError(this.serviceUtils.handleObsError)
      );
  }
}
