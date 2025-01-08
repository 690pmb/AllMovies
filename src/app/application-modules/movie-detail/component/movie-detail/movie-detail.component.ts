import {TranslateService} from '@ngx-translate/core';
import {Component, Input, Output, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router, Params} from '@angular/router';
import {
  filter,
  tap,
  map,
  switchMap,
  distinctUntilChanged,
} from 'rxjs/operators';
import {combineLatest, merge, ReplaySubject} from 'rxjs';
import {
  faImage,
  faChevronCircleRight,
  faPlus,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';

import {Tag} from './../../../../model/tag';
import {Meta} from '../../../../constant/meta';
import {Movie} from '../../../../model/movie';
import {DetailConfig, Id} from '../../../../model/model';
import {TitleService} from '../../../../service/title.service';
import {TabsService} from '../../../../service/tabs.service';
import {MyTagsService} from '../../../../service/my-tags.service';
import {MyDatasService} from '../../../../service/my-datas.service';
import {MenuService} from '../../../../service/menu.service';
import {MovieManager} from '../../../../manager/movie.manager';

@Component({
  selector: 'app-movie-detail',
  styleUrls: ['./movie-detail.component.scss'],
  templateUrl: './movie-detail.component.html',
})
export class MovieDetailComponent {
  private readonly id$ = new ReplaySubject<number>(1);
  private readonly config$ = new ReplaySubject<DetailConfig>(1);

  @Input()
  set id(value: number) {
    this.isDetail = false;
    this.config$.next(
      new DetailConfig(
        true,
        true,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        undefined
      )
    );
    this.loaded.emit(false);
    this.id$.next(value);
  }

  ids$ = merge(
    this.movieManager.listenParam(this.route.paramMap, 'id').pipe(
      filter(id => id !== 0),
      tap(() => {
        this.isDetail = true;
        this.config$.next(
          new DetailConfig(
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            undefined
          )
        );
      })
    ),
    this.id$
  );

  movie$ = this.config$.pipe(
    distinctUntilChanged(
      (prev, curr) =>
        prev.similar === curr.similar && prev.keywords === curr.keywords
    ),
    switchMap(config =>
      this.movieManager.find(this.ids$, config).pipe(
        tap(movie => {
          this.loaded.emit(true);
          if (this.isDetail) {
            this.title.setTitle(movie.title);
            this.menuService.scrollTo$.next(0);
          }
        })
      )
    )
  );

  loading$ = combineLatest([this.ids$, this.movie$]).pipe(
    map(([i, m]) => !m || i !== m.id)
  );

  tags$ = combineLatest([
    this.myTagsService.myTags$,
    this.myDatasService.myMovies$,
    this.movie$,
  ]).pipe(
    filter(
      ([tags, movies, movie]) =>
        tags !== undefined &&
        tags.length > 0 &&
        movies !== undefined &&
        movie !== undefined
    ),
    map(([tags, movies, movie]) => {
      this.showTags = false;
      if (movies.map(m => m.id).includes(movie.id)) {
        this.showTags = true;
        return tags.filter(t =>
          t.datas
            .filter(d => d.movie)
            .map(d => d.id)
            .includes(movie.id)
        );
      } else {
        return [];
      }
    })
  );

  @Output() loaded = new EventEmitter<boolean>();
  movie!: Movie;
  tags: Tag[] = [];
  showTags = false;
  isImagesVisible = false;
  isDetail: boolean;
  showTitles = false;
  sc: string;
  Url = Meta;

  faChevronCircleRight = faChevronCircleRight;
  faImage = faImage;
  faPlus = faPlus;
  faMinus = faMinus;

  constructor(
    private movieManager: MovieManager,
    private route: ActivatedRoute,
    protected translate: TranslateService,
    private title: TitleService,
    private router: Router,
    public tabsService: TabsService,
    private menuService: MenuService,
    private myTagsService: MyTagsService,
    private myDatasService: MyDatasService<Movie>
  ) {}

  toDiscover<T extends Id>(item: T, key: string): void {
    const params: Params = {};
    params[key] = JSON.stringify([item.id]);
    this.router.navigate(['discover'], {
      queryParams: params,
    });
  }
}
