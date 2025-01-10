import {HttpStatusCode} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MockService<T> {
  constructor() {}

  getAll(file: string): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', './assets/' + file);
      xhr.send();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (
            xhr.status === HttpStatusCode.Ok ||
            xhr.status === HttpStatusCode.Created
          ) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(JSON.parse(xhr.responseText));
          }
        }
      };
    });
  }
}
