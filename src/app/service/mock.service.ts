import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpStatusCode} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MockService<T> {
  constructor() {}

  getAll(file: string): Observable<T[]> {
    return new Observable<T[]>(observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', './assets/' + file);
      xhr.send();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (
            xhr.status === HttpStatusCode.Ok ||
            xhr.status === HttpStatusCode.Created
          ) {
            observer.next(JSON.parse(xhr.response));
            observer.complete();
          } else {
            observer.error(JSON.parse(xhr.responseText));
          }
        }
      };
    });
  }
}
