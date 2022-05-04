import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

import {User} from './../../../model/user';
import {AuthService} from '../../../service/auth.service';
import {TitleService} from '../../../service/title.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user!: User;
  subs: Subscription[] = [];

  constructor(private auth: AuthService, private title: TitleService) {}

  ngOnInit(): void {
    this.subs.push(
      this.auth.user$.subscribe(user => {
        if (user) {
          this.user = user;
        }
      })
    );
    this.title.setTitle('title.profile');
  }

  updateUser(): void {
    this.auth.updateUser(this.user);
  }

  ngOnDestroy(): void {
    this.subs.forEach(subscription => subscription.unsubscribe());
  }
}
