import { MapPerson } from './../shared/mapPerson';
import { Person } from './../model/person';
import { Url } from './../constant/url';
import { ServiceUtils } from './serviceUtils';
import { ToastService } from './toast.service';
import { SearchServiceService } from './searchService.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PersonSearchService implements SearchServiceService {

  constructor(private serviceUtils: ServiceUtils, private toast: ToastService) { }

  search(term: string, adult: boolean): Observable<Person[]> {
    let url = Url.PERSON_SEARCH_URL + Url.API_KEY;
    if (adult) {
      url += Url.ADULT_URL;
    }
    term = ServiceUtils.encodeQueryUrl(term);
    url += `${Url.QUERY_URL}${term}`;
    return this.serviceUtils
      .getObservable(url, this.serviceUtils.getHeaders())
      .map(response => MapPerson.mapForSearchPersons(response))
      .catch((err) => this.serviceUtils.handlePromiseError(err, this.toast));
  }
}