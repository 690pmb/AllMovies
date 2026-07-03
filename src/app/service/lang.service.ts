import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {map, catchError} from 'rxjs/operators';

import {SearchService} from './search.service';
import {ToastService} from './toast.service';
import {UtilsService} from './utils.service';
import {LangDb} from '../model/model';
import {Url} from '../constant/url';
import {Utils} from '../shared/utils';

type Lang = {iso_639_1: string; english_name: string};

@Injectable({
  providedIn: 'root',
})
export class LangService implements SearchService<LangDb> {
  langs: LangDb[] = [];

  constructor(
    private serviceUtils: UtilsService,
    private toast: ToastService
  ) {}

  getAll(): Observable<LangDb[]> {
    if (this.langs && this.langs.length > 0) {
      return of(this.langs);
    }
    const url = `${Url.GET_ALL_LANGS_URL}${Url.API_KEY}`;
    return this.serviceUtils
      .getObservable(url, this.serviceUtils.getHeaders())
      .pipe(
        map((response: any) => {
          this.langs = this.mapLang(response);
          return this.langs;
        }),
        catchError(err => this.serviceUtils.handleObsError(err, this.toast))
      );
  }

  mapLang(response: Lang[]): LangDb[] {
    const result = response.map(element => {
      const lang = new LangDb();
      lang.id = element.iso_639_1;
      lang.name = element.english_name;
      return lang;
    });
    return result.sort((a, b) => Utils.compare(a.name, b.name, true));
  }

  search(term: string): Observable<LangDb[]> {
    return this.getAll().pipe(
      map(langs =>
        langs
          .filter(l => l.name.toLowerCase().startsWith(term.toLowerCase()))
          .slice(0, 10)
      )
    );
  }

  byId(id: string): Observable<LangDb> {
    return this.getAll().pipe(map(langs => langs.find(l => l.id === id)));
  }
}
