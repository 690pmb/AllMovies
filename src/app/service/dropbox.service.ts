import {Injectable} from '@angular/core';
import * as Dropbox from 'dropbox';

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
  ): Promise<Dropbox.files.FileMetadata> {
    const pathFile = DropboxService.getPath(fileName);
    return DropboxService.getDbx()
      .filesDeleteV2({path: pathFile})
      .then(() =>
        DropboxService.getDbx().filesUpload({
          path: pathFile,
          contents: fichier,
        })
      )
      .catch(err => this.serviceUtils.handlePromiseError(err, this.toast));
  }

  uploadNewFile(
    fichier: any,
    fileName: string
  ): Promise<Dropbox.files.FileMetadata> {
    const pathFile = DropboxService.getPath(fileName);
    return DropboxService.getDbx()
      .filesUpload({path: pathFile, contents: fichier})
      .then(() => new Promise<void>(resolve => resolve()))
      .catch(err => this.serviceUtils.handlePromiseError(err, this.toast));
  }

  downloadFile(filename: string): Promise<T[]> {
    console.log('downloadFile', filename);
    return this.downloadRaw(filename).then(
      content => <T[]>Utils.parseJson(content, [])
    );
  }

  downloadRaw(fileName: string): Promise<any> {
    return DropboxService.getDbx()
      .filesDownload({path: DropboxService.getPath(fileName)})
      .then((response: any) => {
        const fileReader = new FileReader();
        return new Promise((resolve, reject) => {
          fileReader.onerror = () => {
            fileReader.abort();
            reject(new DOMException('Problem parsing input file.'));
          };
          fileReader.onload = () => resolve(fileReader.result.toString());
          fileReader.readAsText(response.fileBlob);
        });
      })
      .catch(err => this.serviceUtils.handleError(err, this.toast));
  }
}
