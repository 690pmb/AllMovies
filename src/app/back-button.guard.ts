import {Injectable} from '@angular/core';
import {
  CanDeactivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class BackButtonGuard implements CanDeactivate<unknown> {
  constructor(private router: Router) {}

  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot
  ): boolean | UrlTree {
    if (!currentRoute?.queryParams.modal) {
      return true;
    } else {
      return this.router.createUrlTree(
        currentState.url.split('?')[0].split('/'),
        {
          queryParams: null,
          replaceUrl: true,
        }
      );
    }
  }
}
