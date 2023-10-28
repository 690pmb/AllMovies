import {Component, OnInit, OnDestroy} from '@angular/core';
import {Observable, Subscription} from 'rxjs';

import {Movie} from '../../../model/movie';
import {ImageSize} from '../../../model/model';
import {MovieSearchService} from '../../../service/movie-search.service';
import {AuthService} from '../../../service/auth.service';

@Component({
  selector: 'app-movie-search',
  templateUrl: './movie-search.component.html',
  styleUrls: ['./movie-search.component.scss'],
  providers: [MovieSearchService],
})
export class MovieSearchComponent implements OnInit, OnDestroy {
  movies!: Observable<Movie[]>;
  adult = false;
  subs: Subscription[] = [];
  imageSize = ImageSize;
  getMovie: (term: string, lang: string) => Observable<Movie[]>;

  constructor(
    private movieSearchService: MovieSearchService,
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
    this.getMovie = (term: string, lang: string): Observable<Movie[]> =>
      this.movieSearchService.search(term, this.adult, lang);
  }

  ngOnDestroy(): void {
    this.subs.forEach(subscription => subscription.unsubscribe());
  }
}
