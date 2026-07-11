import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, mergeMap, tap, catchError} from 'rxjs/operators';

import {DropboxService} from './dropbox.service';
import {AuthService} from './auth.service';
import {Level} from '../model/model';
import {Tag} from '../model/tag';
import {CapitalizeWordPipe} from '../shared/pipes/capitalizeWord.pipe';
import {Dropbox} from '../constant/dropbox';
import {UtilsService} from './utils.service';
import {ToastService} from './toast.service';
import {Utils} from '../shared/utils';

@Injectable({
  providedIn: 'root',
})
export class MyTagsService {
  myTags$: BehaviorSubject<Tag[]> = new BehaviorSubject<Tag[]>([]);

  constructor(
    private dropboxService: DropboxService<Tag>,
    private auth: AuthService,
    private serviceUtils: UtilsService,
    private toast: ToastService,
    private capitalize: CapitalizeWordPipe
  ) {}

  static tagsToBlob(tags: Tag[]): Blob {
    const theJSON = '[' + tags.map(tag => Tag.toJson(tag)).join(',') + ']';
    return new Blob([theJSON], {type: 'text/json'});
  }

  getFileName(): Observable<string> {
    return of(
      `${Dropbox.DROPBOX_TAG_FILE}${this.auth.user$.getValue().id}${
        Dropbox.DROPBOX_FILE_SUFFIX
      }`
    );
  }

  getAll(): void {
    this.getFileName()
      .pipe(
        mergeMap((fileName: string) =>
          this.dropboxService.downloadFile(fileName)
        ),
        tap((tags: Tag[]) => {
          console.log('tags:', tags);
          this.myTags$.next(tags);
        }),
        catchError(this.serviceUtils.handleObsError)
      )
      .subscribe();
  }

  add(toAdd: Tag): Observable<Tag | undefined> {
    let tempTagList: Tag[] = [];
    let fileName: string;
    return this.getFileName().pipe(
      mergeMap((file: string) => {
        fileName = file;
        return this.dropboxService.downloadRaw(fileName);
      }),
      mergeMap((tagsFromFile: string) => {
        let tagList: Tag[] = [];
        if (tagsFromFile && tagsFromFile.trim().length > 0) {
          tagList = <Tag[]>JSON.parse(tagsFromFile);
        }
        tagList.sort(Utils.compareObject);
        toAdd.id = tagList.length > 0 ? tagList[tagList.length - 1].id + 1 : 1;
        toAdd.label = this.capitalize.transform(toAdd.label);
        tagList.push(toAdd);
        return of(tagList);
      }),
      mergeMap((list: Tag[]) => {
        if (list && list.length !== 0) {
          tempTagList = list;
          return this.dropboxService.overwriteFile(
            MyTagsService.tagsToBlob(list),
            fileName
          );
        } else {
          return of(undefined);
        }
      }),
      map((res: any) => {
        console.log(res);
        if (res) {
          console.log('myTags', tempTagList);
          this.myTags$.next(tempTagList);
          this.toast.open(Level.success, 'toast.tags_added');
        }
        return toAdd;
      }),
      catchError(err => {
        this.serviceUtils.handleError(err);
        return of(undefined);
      })
    );
  }

  remove(idToRemove: number[]): void {
    let tempTagList: Tag[] = [];
    let fileName: string;
    this.getFileName()
      .pipe(
        mergeMap((file: string) => {
          fileName = file;
          return this.dropboxService.downloadFile(fileName);
        }),
        mergeMap((tagList: Tag[]) => {
          if (idToRemove.length > 0) {
            idToRemove.forEach(
              (id: number) =>
                (tagList = tagList.filter((tag: Tag) => tag.id !== id))
            );
            tempTagList = tagList;
            return this.dropboxService.overwriteFile(
              MyTagsService.tagsToBlob(tagList),
              fileName
            );
          } else {
            return of(undefined);
          }
        }),
        tap((res: any) => {
          console.log(res);
          if (res) {
            this.myTags$.next(tempTagList);
            this.toast.open(Level.success, 'toast.tags_removed', {
              size: idToRemove.length,
            });
          }
        }),
        catchError(this.serviceUtils.handleObsError)
      )
      .subscribe();
  }

  updateTag(tag: Tag): Observable<boolean> {
    let tempTagList: Tag[] = [];
    let fileName: string;
    return this.getFileName().pipe(
      mergeMap((file: string) => {
        fileName = file;
        return this.dropboxService.downloadRaw(fileName);
      }),
      mergeMap((tagsFromFile: string) => {
        let tagList: Tag[] = [];
        if (tagsFromFile && tagsFromFile.trim().length > 0) {
          tagList = <Tag[]>JSON.parse(tagsFromFile);
        }
        let toUpdate = tagList.find(t => t.id === tag.id);
        toUpdate = Tag.clone(tag);
        toUpdate.datas.sort(Utils.compareObject);
        tagList.splice(tagList.map(t => t.id).indexOf(tag.id), 1, tag);
        tempTagList = tagList;
        return this.dropboxService.overwriteFile(
          MyTagsService.tagsToBlob(tagList),
          fileName
        );
      }),
      map((res: any) => {
        console.log(res);
        this.myTags$.next(tempTagList);
        this.toast.open(Level.success, 'toast.tags_updated');
        return true;
      }),
      catchError(err => {
        this.serviceUtils.handleError(err);
        return of(false);
      })
    );
  }

  replaceTags(tagsToReplace: Tag[]): Observable<boolean> {
    let tempTagList: Tag[] = [];
    let fileName: string;
    return this.getFileName().pipe(
      mergeMap((file: string) => {
        fileName = file;
        return this.dropboxService.downloadFile(fileName);
      }),
      mergeMap((tagList: Tag[]) => {
        tagList = tagList.filter(
          (m: Tag) => !tagsToReplace.map((tag: Tag) => tag.id).includes(m.id)
        );
        tagList.push(...tagsToReplace);
        tagList.sort(Utils.compareObject);
        tempTagList = tagList;
        return this.dropboxService.overwriteFile(
          MyTagsService.tagsToBlob(tagList),
          fileName
        );
      }),
      map((res: any) => {
        console.log(res);
        this.myTags$.next(tempTagList);
        this.toast.open(Level.success, 'toast.tags_updated', {
          size: tagsToReplace.length,
        });
        return true;
      }),
      catchError(err => {
        this.serviceUtils.handleError(err);
        return of(false);
      })
    );
  }
}
