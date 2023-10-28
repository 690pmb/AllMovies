import {filter} from 'rxjs/operators';
import {Router, NavigationStart} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {Data} from './model/data';
import {TabsService} from './service/tabs.service';
import {AuthService} from './service/auth.service';
import {MyDatasService} from './service/my-datas.service';
import {MyTagsService} from './service/my-tags.service';
import {MenuService} from './service/menu.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private tabsService: TabsService,
    private auth: AuthService,
    private myDatasService: MyDatasService<Data>,
    private myTagsService: MyTagsService,
    private translate: TranslateService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        this.tabsService.onNavigation(event);
      });
    this.menuService.event$.subscribe(() => window.scrollTo(0, 0));
    this.auth.getCurrentUser();
    this.auth.user$.subscribe(user => {
      if (user) {
        this.myDatasService
          .getAll(true)
          .then(d => this.myDatasService.removeDuplicate(d, true));
        this.myDatasService
          .getAll(false)
          .then(d => this.myDatasService.removeDuplicate(d, false));
        this.myTagsService.getAll();
        this.translate.use(user.lang.code);
      } else {
        this.myDatasService.next([], true);
        this.myDatasService.next([], false);
        this.myTagsService.myTags$.next([]);
      }
    });
  }
}
