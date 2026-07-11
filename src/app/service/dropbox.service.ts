import {Injectable} from '@angular/core';
import * as Dropbox from 'dropbox';
import {Observable, from} from 'rxjs';
import {map, catchError, switchMap} from 'rxjs/operators';

import {UtilsService} from './utils.service';
import {Dropbox as DropboxConstante} from '../constant/dropbox';
import {Utils} from '../shared/utils';

@Injectable({
  providedIn: 'root',
})
export class DropboxService<T> {
  constructor(private serviceUtils: UtilsService) {}

  private readonly dbx = new Dropbox.Dropbox({
    accessToken: DropboxConstante.DROPBOX_TOKEN,
  });

  private getPath(fileName: string): string {
    return DropboxConstante.DROPBOX_FOLDER + fileName;
  }

  overwriteFile(
    fichier: Blob,
    fileName: string
  ): Observable<Dropbox.files.FileMetadata> {
    return from(
      this.dbx.filesUpload({
        path: this.getPath(fileName),
        contents: fichier,
        mode: {
          '.tag': 'overwrite',
        },
      })
    ).pipe(
      map(r => r.result),
      catchError(this.serviceUtils.handleObsError)
    );
  }

  createFile(fichier: Object, fileName: string): Observable<void> {
    return from(
      this.dbx.filesUpload({path: this.getPath(fileName), contents: fichier})
    ).pipe(
      map(() => {}),
      catchError(this.serviceUtils.handleObsError)
    );
  }

  downloadFile(fileName: string): Observable<T[]> {
    return this.downloadRaw(fileName).pipe(
      map(content => <T[]>Utils.parseJson(content, []))
    );
  }

  downloadRaw(fileName: string): Observable<string> {
    return from(
      this.dbx.filesDownload({
        path: this.getPath(fileName),
      })
    ).pipe(
      // Dropxbox doesn't provide a correct typing on this
      switchMap((response: any) => (<File>response.result.fileBlob).text()),
      catchError(this.serviceUtils.handleObsError)
    );
  }
}
