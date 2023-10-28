import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import * as crypto from 'crypto-js';
import {TranslateService} from '@ngx-translate/core';
import {map} from 'rxjs/operators';

import {AuthService} from '../../../service/auth.service';
import {TitleService} from '../../../service/title.service';
import {Constants} from '../../../constant/constants';
import {TabsService} from '../../../service/tabs.service';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
})
export class ConnectComponent implements OnInit {
  name: string;
  password: string;
  message: string;
  cancel$ = this.active.queryParams.pipe(map(q => q[Constants.LOGIN_CANCEL]));
  feature$ = this.active.queryParams.pipe(
    map(q => q[Constants.LOGIN_FEATURE] === 'true')
  );

  constructor(
    private auth: AuthService,
    private router: Router,
    private translate: TranslateService,
    private title: TitleService,
    private active: ActivatedRoute,
    private tabs: TabsService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('title.login');
  }

  login(): void {
    if (this.name && this.password) {
      this.auth
        .login(this.name, crypto.SHA512(this.password).toString())
        .subscribe(isAuth => {
          if (isAuth) {
            this.message = this.translate.instant('login.connect.connected');
            const active = this.tabs.activeLink.url;
            this.router.navigateByUrl(
              ['/login', '/login/connect'].includes(active) ? '/' : active
            );
          } else {
            this.message = this.translate.instant('login.connect.wrong');
          }
        });
    }
  }

  cancel(): void {
    this.router.navigateByUrl(this.tabs.activeLink.url);
  }
}
