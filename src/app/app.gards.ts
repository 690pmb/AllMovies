import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {AuthService} from './service/auth.service';

@Injectable({providedIn: 'root'})
export class AuthGard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('canActivate', state.url);
    try {
      return this.auth.isAuthenticated().pipe(
        map(isAuth => {
          console.log('isAuth', isAuth);
          if (!isAuth) {
            console.log('not isAuthenticated');
            this.auth.redirectToLogin(true);
            return false;
          }
          console.log('logged');
          return true;
        })
      );
    } catch (err) {
      console.log(err);
      return of(false);
    }
  }
}
