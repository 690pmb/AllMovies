import {filter} from 'rxjs/operators';
import {Router, NavigationStart} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {Data} from './model/data';
import {TabsService} from './service/tabs.service';
import {AuthService} from './service/auth.service';
import {MyDatasService} from './service/my-datas.service';
import {MyTagsService} from './service/my-tags.service';

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
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.translate.use(this.translate.getBrowserLang());
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        this.tabsService.onNavigation(event);
      });
    this.auth.getCurrentUser(false);
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
      }
    });
  }
}
