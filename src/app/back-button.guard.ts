import {Injectable} from '@angular/core';
import {
  CanDeactivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class BackButtonGuard implements CanDeactivate<unknown> {
  constructor(private router: Router) {}

  canDeactivate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot
  ): boolean | UrlTree {
    if (
      !currentRoute?.queryParams.modal ||
      Object.keys(currentRoute?.queryParams).length > 1
    ) {
      return true;
    } else {
      return this.router.createUrlTree(
        currentState.url.split('?')[0].split('/'),
        {
          queryParams: null,
        }
      );
    }
  }
}
