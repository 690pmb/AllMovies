import {BreakpointObserver} from '@angular/cdk/layout';
import {TranslateService, LangChangeEvent} from '@ngx-translate/core';
import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';

import {Movie} from '../../../../model/movie';
import {
  TitleService,
  PersonService,
  MovieService,
  SerieService,
} from '../../../../shared/shared.module';
import {Serie} from './../../../../model/serie';
import {Person} from '../../../../model/person';
import {ImageSize} from '../../../../model/model';
import {Url} from '../../../../constant/url';
import {Subscription} from 'rxjs';
import SwiperCore, {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Virtual,
  SwiperOptions,
  Zoom,
  Autoplay,
  Thumbs,
  Controller,
} from 'swiper';

// SwiperCore.use([Navigation, Keyboard, Mousewheel, A11y]);
SwiperCore.use([
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Virtual,
  Zoom,
  Autoplay,
  Thumbs,
  Controller,
]);

@Component({
  selector: 'app-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  imageSize = ImageSize;
  movies: Movie[] = [];
  series: Serie[] = [];
  persons: Person[] = [];
  /* swiperConfig: SwiperConfigInterface = {
    a11y: {enabled: true},
    keyboard: true,
    mousewheel: true,
    slidesPerView: 5,
    scrollbar: false,
    navigation: true,
    pagination: false,
    centeredSlides: false,
    zoom: false,
    touchEventsTarget: 'wrapper',
  };*/
  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 40,
    navigation: true,
    resizeObserver: true,
    direction: 'horizontal',
    a11y: {enabled: true},
    keyboard: true,
    mousewheel: true,
  };
  subs: Subscription[] = [];
  Url = Url;
  pageMovies = 1;
  pageSeries = 1;
  pagePersons = 1;

  constructor(
    private movieService: MovieService,
    private serieService: SerieService,
    private personService: PersonService,
    private translate: TranslateService,
    private title: TitleService,
    private breakpointObserver: BreakpointObserver,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.title.setTitle('');
    this.getTopMovies(this.translate.currentLang);
    this.getTopSeries(this.translate.currentLang);
    this.getToPersons(this.translate.currentLang);
    this.subs.push(
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.pageMovies = 1;
        this.pageSeries = 1;
        this.pagePersons = 1;
        this.getTopMovies(event.lang);
        this.getTopSeries(event.lang);
        this.getToPersons(event.lang);
      })
    );
    /*
    this.breakpointObserver
      .observe([Constants.MEDIA_MAX_700])
      .subscribe(result => {
        this.swiperConfig.direction = result.breakpoints[
          Constants.MEDIA_MAX_700
        ]
          ? 'vertical'
          : 'horizontal';
      });
      */
  }

  getTopMovies(language: string): void {
    this.movieService.getPopularMovies(language).then(movies =>
      this.ngZone.run(() => {
        this.movies = movies;
      })
    );
  }

  getTopSeries(language: string): void {
    this.serieService
      .getPopularSeries(language)
      .then(series => (this.series = series));
  }

  getToPersons(language: string): void {
    this.personService
      .getPopularPersons(language)
      .then(persons => (this.persons = persons));
  }

  nextMovies(): void {
    this.pageMovies += 1;
    this.ngZone.run(() => {
      this.movieService
        .getPopularMovies(this.translate.currentLang, this.pageMovies)
        .then(movies =>
          this.ngZone.run(() => {
            this.movies = this.movies.concat(movies);
          })
        );
    });
  }

  nextSeries(): void {
    this.pageSeries += 1;
    this.serieService
      .getPopularSeries(this.translate.currentLang, this.pageSeries)
      .then(series => (this.series = this.series.concat(series)));
  }

  nextPersons(): void {
    this.pagePersons += 1;
    this.personService
      .getPopularPersons(this.translate.currentLang, this.pagePersons)
      .then(persons => (this.persons = this.persons.concat(persons)));
  }

  ngOnDestroy(): void {
    this.subs.forEach(subscription => subscription.unsubscribe());
  }
}
