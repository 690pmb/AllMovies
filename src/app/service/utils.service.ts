import {Observable, throwError} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpHeaders, HttpClient, HttpErrorResponse} from '@angular/common/http';

import {ToastService} from './toast.service';
import {Level} from '../model/model';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor(private http: HttpClient, private toast: ToastService) {}

  static getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (
        error.error &&
        typeof error.error === 'object' &&
        'errors' in error.error &&
        Array.isArray(error.error.errors)
      ) {
        return `Status ${error.status}: ${error.error.errors.join(', ')}`;
      }
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (error.message) {
        return error.message;
      }
      return `Status ${error.status}`;
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (this.hasResponseError(error)) {
      return error.response.error;
    }
    return 'Unknown error';
  }

  private static hasResponseError(
    error: unknown
  ): error is {response: {error: string}} {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as {response: unknown}).response === 'object' &&
      (error as {response: {error?: unknown}}).response !== null &&
      'error' in (error as {response: object}).response &&
      typeof (error as {response: {error: unknown}}).response.error === 'string'
    );
  }

  static encodeQueryUrl(query: string): string {
    return encodeURIComponent(query).replace(
      /[!'()*]/g,
      c => '%' + c.charCodeAt(0).toString(16)
    );
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({'Content-Type': 'application/json'});
  }

  handleError(error: unknown): void {
    console.error('handleError', error);
    this.toast.open(Level.error, UtilsService.getErrorMessage(error));
  }

  handleObsError(error: unknown): Observable<never> {
    console.error('handleObsError', error);
    this.toast.open(Level.error, UtilsService.getErrorMessage(error));
    return throwError(() => error);
  }

  getObservable<T>(url: string, headers?: HttpHeaders): Observable<T> {
    console.log('URL', url);
    return headers ? this.http.get<T>(url, {headers}) : this.http.get<T>(url);
  }

  jsonpObservable<T>(url: string, callback: string): Observable<T> {
    return this.http.jsonp<T>(url, callback);
  }
}
