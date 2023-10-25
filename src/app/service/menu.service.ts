import {BehaviorSubject} from 'rxjs';
import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter, map, shareReplay} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  visible$ = new BehaviorSubject<boolean>(true);
  scrollTo$ = new BehaviorSubject<number>(0);
  event$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    shareReplay(1)
  );

  url$ = this.event$.pipe(map(e => e.url));
  isNotLoginPage$ = this.url$.pipe(map(url => !url.includes('login/connect')));

  constructor(private router: Router) {}
}
