import {Injectable} from '@angular/core';
import * as Dropbox from 'dropbox';
import {Observable, from} from 'rxjs';
import {map, mergeMap, catchError} from 'rxjs/operators';

import {ToastService} from './toast.service';
import {UtilsService} from './utils.service';
import {Dropbox as DropboxConstante} from '../constant/dropbox';
import {Utils} from '../shared/utils';

@Injectable({
  providedIn: 'root',
})
export class DropboxService<T> {
  constructor(
    private toast: ToastService,
    private serviceUtils: UtilsService
  ) {}

  static getDbx(): Dropbox.Dropbox {
    return new Dropbox.Dropbox({accessToken: DropboxConstante.DROPBOX_TOKEN});
  }

  static getPath(fileName: string): string {
    return DropboxConstante.DROPBOX_FOLDER + fileName;
  }

  uploadFile(
    fichier: Blob,
    fileName: string
  ): Observable<Dropbox.files.FileMetadata> {
    const pathFile = DropboxService.getPath(fileName);
    return from(DropboxService.getDbx().filesDeleteV2({path: pathFile})).pipe(
      mergeMap(() =>
        from(
          DropboxService.getDbx().filesUpload({
            path: pathFile,
            contents: fichier,
          })
        )
      ),
      catchError(err => this.serviceUtils.handleObsError(err, this.toast))
    );
  }

  uploadNewFile(fichier: any, fileName: string): Observable<void> {
    const pathFile = DropboxService.getPath(fileName);
    return from(
      DropboxService.getDbx().filesUpload({path: pathFile, contents: fichier})
    ).pipe(
      map(() => {}),
      catchError(err => this.serviceUtils.handleObsError(err, this.toast))
    );
  }

  downloadFile(filename: string): Observable<T[]> {
    console.log('downloadFile', filename);
    return this.downloadRaw(filename).pipe(
      map(content => <T[]>Utils.parseJson(content, []))
    );
  }

  downloadRaw(fileName: string): Observable<any> {
    return from(
      DropboxService.getDbx().filesDownload({
        path: DropboxService.getPath(fileName),
      })
    ).pipe(
      mergeMap(
        (response: any) =>
          new Observable<string>(observer => {
            const fileReader = new FileReader();
            fileReader.onerror = () => {
              fileReader.abort();
              observer.error(new DOMException('Problem parsing input file.'));
            };
            fileReader.onload = () => {
              observer.next(fileReader.result.toString());
              observer.complete();
            };
            fileReader.readAsText(response.fileBlob);
          })
      ),
      catchError(err => this.serviceUtils.handleObsError(err, this.toast))
    );
  }
}
