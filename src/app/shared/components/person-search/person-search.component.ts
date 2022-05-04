import {Component, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';

import {Person} from '../../../model/person';
import {ImageSize} from '../../../model/model';
import {PersonSearchService} from '../../../service/person-search.service';
import {AuthService} from '../../../service/auth.service';

@Component({
  selector: 'app-person-search',
  templateUrl: './person-search.component.html',
  styleUrls: ['./person-search.component.scss'],
})
export class PersonSearchComponent implements OnInit {
  persons!: Observable<Person[]>;
  adult!: boolean;
  subs: Subscription[] = [];
  imageSize = ImageSize;
  getPerson: (term: string) => Observable<Person[]>;

  constructor(
    private personSearchService: PersonSearchService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.auth.user$.subscribe(user => {
        if (user) {
          this.adult = user.adult;
        }
      })
    );
    this.getPerson = (term: string): Observable<Person[]> =>
      this.personSearchService.search(term, this.adult);
  }

  ngOnDestroy(): void {
    this.subs.forEach(subscription => subscription.unsubscribe());
  }
}
