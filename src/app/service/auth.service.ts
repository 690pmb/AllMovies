import {BehaviorSubject, Observable, of, OperatorFunction} from 'rxjs';
import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import jwt_decode from 'jwt-decode';
import * as KJUR from 'jsrsasign';
import {TranslateService} from '@ngx-translate/core';
import {map, catchError, tap, take, switchMap, concatMap} from 'rxjs/operators';

import {DropboxService} from './dropbox.service';
import {ToastService} from './toast.service';
import {Level} from '../model/model';
import {UtilsService} from './utils.service';
import {Utils} from '../shared/utils';
import {Dropbox} from '../constant/dropbox';
import {User} from '../model/user';
import {Constants} from '../constant/constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly userSubject = new BehaviorSubject<User | undefined>(
    this.decodeToken(localStorage.getItem('token'))
  );

  readonly user$ = this.userSubject.asObservable();
  private createFileOperator = (
    fileName: string
  ): OperatorFunction<User, User> =>
    concatMap((user: User) =>
      this.dropbox
        .createFile('[]', `${fileName}${user.id}${Dropbox.DROPBOX_FILE_SUFFIX}`)
        .pipe(map(() => user))
    );

  constructor(
    private dropbox: DropboxService<User>,
    private router: Router,
    private serviceUtils: UtilsService,
    private toast: ToastService,
    private translate: TranslateService
  ) {}

  private setUser(user: User): void {
    localStorage.setItem('token', this.createToken(user));
    this.userSubject.next(user);
  }

  private usersToBlob(users: User[]): Blob {
    return new Blob([JSON.stringify(users)], {type: 'text/json'});
  }

  private decodeToken(token: string): User | undefined {
    if (token && token.trim() !== '') {
      return jwt_decode(token);
    } else {
      return undefined;
    }
  }

  private createToken(user: User): string {
    const oHeader = {alg: 'HS256', typ: 'JWT'};
    const sHeader = JSON.stringify(oHeader);
    return KJUR.jws.JWS.sign('HS256', sHeader, JSON.stringify(user), 'secret');
  }

  isAuthenticated(): Observable<boolean> {
    console.log('isAuthenticated');
    return this.user$.pipe(
      map(user => {
        if (!user || !user.id) {
          return false;
        }
        return true;
      }),
      take(1)
    );
  }

  login(name: string, password: string): Observable<boolean> {
    return this.loadUsers().pipe(
      map((users: User[]) =>
        users.find(
          (user: User) => user.name === name && user.password === password
        )
      ),
      tap(user => {
        if (user) {
          this.setUser(user);
        } else {
          this.logout();
        }
      }),
      map(u => !!u),
      catchError(this.serviceUtils.handleObsError)
    );
  }

  checkAnswer(name: string, answer: string): Observable<boolean> {
    return this.getUserByName(name).pipe(
      map((user: User) => user && user.name === name && user.answer === answer),
      catchError(this.serviceUtils.handleObsError)
    );
  }

  getUserByName(name: string): Observable<User> {
    return this.loadUsers().pipe(
      map((users: User[]) => users.find((user: User) => user.name === name)),
      catchError(this.serviceUtils.handleObsError)
    );
  }

  isUserExist(name: string): Observable<boolean> {
    return this.loadUsers().pipe(
      map(users => users.find(user => user.name === name) !== undefined),
      catchError(this.serviceUtils.handleObsError)
    );
  }

  register(user: User): void {
    this.loadUsers()
      .pipe(
        concatMap((users: User[]) => {
          const idMax =
            users.length > 0 ? Math.max(...users.map(item => item.id)) : 0;
          const addedUser = {
            ...user,
            id: idMax + 1,
          };
          users.push(addedUser);
          users.sort(Utils.compareObject);
          return this.dropbox
            .overwriteFile(this.usersToBlob(users), Dropbox.DROPBOX_USER_FILE)
            .pipe(map(() => addedUser));
        }),
        this.createFileOperator(Dropbox.DROPBOX_TAG_FILE),
        this.createFileOperator(Dropbox.DROPBOX_MOVIE_FILE),
        this.createFileOperator(Dropbox.DROPBOX_SERIE_FILE)
      )
      .subscribe({
        next: user => {
          this.setUser(user);
          this.router.navigate(['/']);
          this.toast.open(
            Level.success,
            this.translate.instant('toast.user_added')
          );
        },
        error: err => this.serviceUtils.handleError(err),
      });
  }

  updateUser(user: User): Observable<User> {
    return this.loadUsers().pipe(
      concatMap((users: User[]) => {
        const filteredUsers = users.filter(item => item.name !== user.name);
        filteredUsers.push(user);
        filteredUsers.sort(Utils.compareObject);
        return this.dropbox.overwriteFile(
          this.usersToBlob(filteredUsers),
          Dropbox.DROPBOX_USER_FILE
        );
      }),
      map(() => {
        this.setUser(user);
        this.toast.open(
          Level.success,
          this.translate.instant('toast.user_changed')
        );
        return user;
      }),
      catchError(this.serviceUtils.handleObsError)
    );
  }

  getCurrentUser(): Observable<User> {
    return this.user$.pipe(
      switchMap(user => {
        if (user?.id !== undefined) {
          return this.loadUsers().pipe(
            map(users => users.find(u => u.id === user.id)),
            map((found: User) => {
              if (
                found &&
                user.name === found.name &&
                user.password === found.password &&
                user.answer === found.answer &&
                user.id === found.id
              ) {
                return user;
              } else {
                return undefined;
              }
            })
          );
        } else {
          return of(undefined);
        }
      }),
      catchError(this.serviceUtils.handleObsError)
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.userSubject.next(undefined);
  }

  redirectToLogin(feature: boolean): void {
    localStorage.removeItem('token');
    const queryParams = {};
    queryParams[Constants.LOGIN_CANCEL] = true;
    queryParams[Constants.LOGIN_FEATURE] = feature;
    this.router.navigate(['/login/connect'], {
      queryParams,
    });
  }

  private loadUsers(): Observable<User[]> {
    return this.dropbox
      .downloadFile(Dropbox.DROPBOX_USER_FILE)
      .pipe(catchError(this.serviceUtils.handleObsError));
  }
}
