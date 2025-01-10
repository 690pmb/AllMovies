import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpHeaders, HttpClient} from '@angular/common/http';

import {ToastService} from './toast.service';
import {Level} from '../model/model';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor(private http: HttpClient) {}

  static getErrorMessage(error: any): string {
    let message;
    if (error.response) {
      message = error.response.error;
    } else if (error.error && error.error.errors) {
      message = 'Status ' + error.status + ': ' + error.error.errors.join(', ');
    } else if (error.error) {
      message = error.error;
    } else if (error.message) {
      message = error.message;
    } else {
      message = 'Unknown Error';
    }
    return message;
  }

  static encodeQueryUrl(query: string): string {
    return encodeURIComponent(query).replace(
      /[!'()*]/g,
      c => '%' + c.charCodeAt(0).toString(16)
    );
  }

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    // headers.append('Accept', 'application/json');
    return headers;
  }

  handleSuccess(): void {}

  handleError(error: any, toast: ToastService): void {
    console.log('handleError');
    console.error('error', error);
    toast.open(Level.error, UtilsService.getErrorMessage(error));
  }

  handlePromiseError(error: any, toast: ToastService): Promise<any> {
    return this.handleObsError(error, toast).toPromise();
  }

  handleObsError(error: any, toast: ToastService): Observable<any> {
    console.log('handlePromiseError');
    console.error('error', error);
    toast.open(Level.error, UtilsService.getErrorMessage(error));
    return of('');
  }

  getPromise<T>(url: string, headers?: HttpHeaders): Promise<T> {
    return this.getObservable<T>(url, headers).toPromise();
  }

  getObservable<T>(url: string, headers?: HttpHeaders): Observable<T> {
    console.log('URL', url);
    return headers ? this.http.get<T>(url, {headers}) : this.http.get<T>(url);
  }

  jsonpObservable<T>(url: string, callback: any): Observable<T> {
    return this.http.jsonp<T>(url, callback);
  }
}
