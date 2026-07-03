import {Injectable} from '@angular/core';
import {from, Observable, of} from 'rxjs';
import {map, catchError, mergeMap, toArray} from 'rxjs/operators';

import {Url} from '../constant/url';
import {Paginate, List, FullList} from '../model/model';
import {ToastService} from './toast.service';
import {UtilsService} from './utils.service';
import {MapList} from '../shared/mapList';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  private static readonly MAX_CONCURRENT = 4;

  constructor(
    private serviceUtils: UtilsService,
    private toast: ToastService
  ) {}

  getDataLists(dataId: number, language: string): Observable<List[]> {
    const url = `${Url.MOVIE_URl}/${dataId}/${Url.GET_MOVIE_LISTS}?${Url.API_KEY}${Url.LANGUE}${language}`;

    return this.serviceUtils
      .getObservable<Paginate<List>>(url, this.serviceUtils.getHeaders())
      .pipe(
        map(
          resp =>
            new Paginate(
              resp.page,
              MapList.mapLists(resp.results),
              resp.total_pages,
              resp.total_results
            )
        ),
        mergeMap(firstPage => {
          const result: List[] = [...firstPage.results];

          if (firstPage.total_pages <= 1) {
            return of(result);
          }

          const pages: number[] = [];
          for (let page = 2; page <= firstPage.total_pages; page++) {
            pages.push(page);
          }

          return from(pages).pipe(
            mergeMap(
              page => this.getPage(page, url),
              ListService.MAX_CONCURRENT
            ),
            toArray(),
            map(pagesArrays => result.concat(...pagesArrays))
          );
        }),
        map(lists => lists ?? []),
        catchError(err => {
          this.serviceUtils.handleError(err, this.toast);
          return of([] as List[]);
        })
      );
  }

  getPage(page: number, url: string): Observable<List[]> {
    return this.serviceUtils
      .getObservable<Paginate<List>>(
        `${url}${Url.PAGE_URL}${page}`,
        this.serviceUtils.getHeaders()
      )
      .pipe(
        map(resp => MapList.mapLists(resp.results)),
        catchError(() => of([] as List[]))
      );
  }

  getListDetail(
    id: number,
    language: string,
    sort: string,
    page = 1
  ): Observable<FullList> {
    return this.serviceUtils
      .getObservable(
        `${Url.GET_LISTS_DETAILS}${id}?${Url.API_KEY}${Url.LANGUE}${language}${Url.PAGE_URL}${page}${Url.SORT_BY_URL}${sort}`
      )
      .pipe(
        map((response: any) => MapList.mapFullList(response)),
        catchError(err => this.serviceUtils.handleObsError(err, this.toast))
      );
  }
}
