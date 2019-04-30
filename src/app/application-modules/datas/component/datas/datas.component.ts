import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { forkJoin, BehaviorSubject } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import {
  faTrash, faHashtag, faImage, faFilm, faFlag, faCalendar, faStar, faGlobeAmericas, faList, faChevronCircleRight, faAngleDown
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faClock, faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import * as moment from 'moment-mini-ts';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { Constants } from '../../../../constant/constants';
import { Utils } from '../../../../shared/utils';
import { SerieService, TitleService, MovieService, MyDatasService, MyTagsService, ToastService } from '../../../../shared/shared.module';
import { Serie } from './../../../../model/serie';
import { Movie } from './../../../../model/movie';
import { Tag, TagData } from '../../../../model/tag';
import { Data } from '../../../../model/data';
import { Genre, DetailConfig, Level } from '../../../../model/model';

library.add(faClock);
library.add(faTimesCircle);

@Component({
  selector: 'app-my-datas',
  templateUrl: './datas.component.html',
  styleUrls: ['./datas.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class DatasComponent<T extends Data> implements OnInit, OnDestroy {
  init_columns: string[];
  medium_columns: string[];
  mobile_columns: string[];
  displayedColumns: string[];
  isMovie: boolean;
  allDatas: T[];
  tags: Tag[];
  filteredTags: Tag[];
  length: number;
  displayedData: T[];
  filter: string;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions = [10, 25, 50, 100];
  page: PageEvent;
  sort: Sort;
  nbChecked = 0;
  genres: Genre[];
  filteredGenres: number[];
  expandedElement: T;
  expandedColumn = 'tags';
  displayedTags: BehaviorSubject<Tag[]> = new BehaviorSubject<Tag[]>([]);
  selectedTag: Tag;
  scrollTo: HTMLElement;
  subs = [];

  faTrash = faTrash;
  faHashtag = faHashtag;
  faImage = faImage;
  faFilm = faFilm;
  faFlag = faFlag;
  faCalendar = faCalendar;
  faStar = faStar;
  faGlobe = faGlobeAmericas;
  faList = faList;
  faAngleDown = faAngleDown;
  faChevronCircleRight = faChevronCircleRight;

  constructor(
    private movieService: MovieService,
    private serieService: SerieService,
    private breakpointObserver: BreakpointObserver,
    private myDatasService: MyDatasService<T>,
    private myTagsService: MyTagsService,
    public translate: TranslateService,
    private toast: ToastService,
    private elemRef: ElementRef,
    private title: TitleService,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.breakpointObserver.observe([
      Constants.MEDIA_MAX_700,
      Constants.MEDIA_MAX_1000
    ]).subscribe(result => {
      if (result.breakpoints[Constants.MEDIA_MAX_1000] && result.breakpoints[Constants.MEDIA_MAX_700]) {
        this.displayedColumns = this.mobile_columns;
      } else if (result.breakpoints[Constants.MEDIA_MAX_1000] && !result.breakpoints[Constants.MEDIA_MAX_700]) {
        this.displayedColumns = this.medium_columns;
      } else {
        this.displayedColumns = this.init_columns;
      }
    });
    if (this.page) {
      this.page.pageIndex = 0;
      this.page.pageSize = this.page ? this.page.pageSize : this.pageSize;
    }
    this.subs.push(this.activeRoute.data.subscribe(data => {
      console.log('data', data);
      this.isMovie = data.isMovie;
      this.title.setTitle('title.' + (this.isMovie ? 'movies' : 'series'));
      this.sort = { active: this.isMovie ? 'date' : 'firstAired', direction: 'desc' };
      this.initColumns();
      this.getDatas(this.translate.currentLang, data.dataList);
      this.subs.push(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.getDatas(event.lang, data.dataList);
      }));
    }));
    this.getTags();
  }

  initColumns(): void {
    const init_columns_series = ['id', 'thumbnail', 'name', 'seasonCount', 'firstAired', 'vote', 'inProduction', 'originLang', 'genres', 'runtimes',
      'added', 'select', 'details', 'tag-icon'];
    const init_columns_movies = ['id', 'thumbnail', 'name', 'original_title', 'date', 'vote', 'meta', 'language', 'genres', 'time', 'added',
      'select', 'details', 'tag-icon'];
    this.init_columns = this.isMovie ? init_columns_movies : init_columns_series;

    const medium_columns_series = ['thumbnail', 'name', 'firstAired', 'vote', 'inProduction', 'originLang', 'genres', 'runtimes', 'added',
      'select', 'details', 'tag-icon'];
    const medium_columns_movies = ['thumbnail', 'name', 'date', 'vote', 'meta', 'language', 'genres', 'time', 'added', 'select', 'details',
      'tag-icon'];
    this.medium_columns = this.isMovie ? medium_columns_movies : medium_columns_series;

    const mobile_columns_series = ['thumbnail', 'name', 'firstAired', 'inProduction', 'originLang', 'runtimes', 'genres', 'select', 'details',
      'tag-icon'];
    const mobile_columns_movies = ['thumbnail', 'name', 'date', 'meta', 'language', 'time', 'genres', 'select', 'details', 'tag-icon'];
    this.mobile_columns = this.isMovie ? mobile_columns_movies : mobile_columns_series;
    this.displayedColumns = this.init_columns;
  }

  getDatas(lang: string, datas: T[]): void {
    this.allDatas = datas;
    this.length = this.allDatas.length;
    this.paginate(this.refreshData());
    this.getAllGenres(lang);
    this.checkAndFixData(datas, lang);
  }

  getTags(): void {
    this.subs.push(this.myTagsService.myTags$.subscribe((tags) => this.tags = tags));
  }

  getAllGenres(lang: string): void {
    const all: Genre[] = [];
    this.allDatas.forEach((data: T) => {
      all.push(...data.translation.get(lang).category);
    });
    this.genres = [];
    all.forEach((genre: Genre) => {
      if (!this.genres.map(g => g.id).includes(genre.id)) {
        this.genres.push(genre);
      }
    });
    this.genres.sort((a, b) => Utils.compare(a.name.toLowerCase(), b.name.toLowerCase(), true));
  }

  refreshData(): T[] {
    let list = this.filterGenres();
    list = this.filterTags(list);
    const byFields = Utils.filterByFields(list,
      this.displayedColumns.filter(col => !['added', 'select', 'details', 'genres', 'meta', 'thumbnail', 'tag-icon', 'name'].includes(col)),
      this.filter);
    let byTitle = [];
    if (this.filter) {
      byTitle = list.filter(m => m.translation.get(this.translate.currentLang).name.toLowerCase().includes(this.filter.toLowerCase()));
    }
    list = Utils.sortData(Utils.unique(byFields.concat(byTitle)), this.sort, this.translate.currentLang);
    this.length = list.length;
    return list;
  }

  onSearch(): void {
    this.initPagination(this.refreshData());
    this.onTop();
  }

  onSort(): void {
    this.initPagination(this.refreshData());
    this.onTop();
  }

  onPaginateChange(): void {
    this.paginate(this.refreshData());
    this.onTop();
  }

  paginate(data: T[]): void {
    this.displayedData = this.page ?
      data.slice(this.page.pageIndex * this.page.pageSize, (this.page.pageIndex + 1) * this.page.pageSize) : data.slice(0, this.pageSize);
  }

  initPagination(list: T[]): void {
    if (this.page) {
      this.page.pageIndex = 0;
      this.page.pageSize = this.page ? this.page.pageSize : this.pageSize;
    }
    this.paginate(list);
  }

  filterGenres(): T[] {
    let list = [];
    if (this.filteredGenres && this.filteredGenres.length > 0) {
      list = this.allDatas.filter((data: T) =>
        this.filteredGenres.every((genreId: number) =>
          data.translation.get(this.translate.currentLang).category.map(genre => genre.id).includes(genreId)));
    } else {
      list = this.allDatas;
    }
    return list;
  }

  onFilterGenres(genres: number[]): void {
    this.filteredGenres = genres;
    this.initPagination(this.refreshData());
  }

  filterTags(list: T[]): T[] {
    if (this.filteredTags && this.filteredTags.length > 0) {
      const ids = Utils.unique(Utils.flatMap<Tag, TagData>(this.filteredTags, 'datas').filter(d => d.movie === this.isMovie).map(data => data.id));
      return list.filter((m: T) => ids.includes(m.id));
    } else {
      return list;
    }
  }

  onFilterTags(tags: Tag[]): void {
    this.filteredTags = tags;
    this.initPagination(this.refreshData());
  }

  updateSize(): void {
    this.nbChecked = this.allDatas.filter(data => data.checked).length;
  }

  /**
   * Requests datas to DataDb if some properties (genres, time, score) are missing or if the last updated is from more than two months ago.
   * @param  {T[]} datas datas to check
   * @param  {string} lang the lang to request the data to
   */
  checkAndFixData(datas: T[], lang: string): void {
    let incomplete: number[] = [];
    const twoMonthsAgo = moment().add(-2, 'months');
    try {
      for (const data of datas) {
        const tr = data.translation.get(lang);
        let isNoTime = false;
        if (data instanceof Movie) {
          isNoTime = (<Movie>data).time === undefined;
        } else if (data instanceof Serie) {
          isNoTime = (<Serie>data).runtimes === undefined;
        }
        if (isNoTime || tr.category === undefined || data.score === undefined ||
          data.updated === undefined || moment(data.updated).isBefore(twoMonthsAgo)) {
          incomplete.push(data.id);
        }
      }
    } catch (err) {
      console.error(err);
    }
    incomplete = incomplete.slice(0, 15);
    const obs = [];
    const otherLang = lang === 'fr' ? 'en' : 'fr';
    const conf1 = new DetailConfig(false, false, false, false, false, false, false, false, !this.isMovie, lang);
    const conf2 = new DetailConfig(false, false, false, false, false, false, false, false, !this.isMovie, otherLang);
    incomplete.forEach((id: number) => {
      if (this.isMovie) {
        obs.push(this.movieService.getMovie(id, conf1, false));
        obs.push(this.movieService.getMovie(id, conf2, false));
      } else {
        obs.push(this.serieService.getSerie(id, conf1, false));
        obs.push(this.serieService.getSerie(id, conf2, false));
      }
    });
    try {
      forkJoin(obs).subscribe(
        (data: T[]) => {
          data.forEach(m => {
            m.updated = new Date();
            if (m.score === undefined) {
              m.score = {};
            }
          });
          this.myDatasService.update(data, this.isMovie).then((updated) => {
            updated.forEach(up => {
              const index = this.allDatas.map(a => a.id).indexOf(up.id);
              up.added = this.allDatas[index].added;
              this.allDatas[index] = up;
            });
            this.initPagination(this.refreshData());
          });
        },
        err => console.error(err)
      );
    } catch (err) {
      console.error(err);
    }
  }

  remove(): void {
    const datasToRemove = this.allDatas.filter(data => data.checked).map(m => m.id);
    const tagsToReplace = this.tags.filter(t => t.datas.filter(d => d.movie === this.isMovie).map(m => m.id).some(id => datasToRemove.includes(id)));
    tagsToReplace.forEach(t => t.datas = t.datas.filter(data => !datasToRemove.includes(data.id) || data.movie !== this.isMovie));
    this.myDatasService.remove(datasToRemove, this.isMovie)
      .then(() => {
        this.allDatas = this.allDatas.filter(data => !data.checked);
        this.initPagination(this.refreshData());
        this.myTagsService.replaceTags(tagsToReplace);
      });
    this.nbChecked = 0;
    this.onTop();
  }

  expand(element: T): void {
    this.expandedElement = this.expandedElement === element ? undefined : element;
    if (this.expandedElement) {
      this.displayedTags.next(this.tags.filter(t => t.datas.filter(d => d.movie === this.isMovie).map(m => m.id).includes(this.expandedElement.id)));
    }
  }

  addTag(): void {
    let selectedDatasIds = this.allDatas.filter(data => data.checked).map(data => data.id);
    selectedDatasIds = selectedDatasIds.filter(id => !this.selectedTag.datas.filter(d => d.movie === this.isMovie).map(m => m.id).includes(id));
    if (selectedDatasIds.length > 0) {
      this.selectedTag.datas.push(...selectedDatasIds.map(id =>
        TagData.fromData(this.allDatas.find(m => m.id === id), this.isMovie)
      ));
      this.myTagsService.updateTag(this.selectedTag).then(() => {
        this.nbChecked = 0;
        this.selectedTag = undefined;
        this.allDatas.forEach(m => m.checked = false);
      });
    } else {
      this.toast.open(Level.warning, 'toast.already_added');
      this.nbChecked = 0;
      this.selectedTag = undefined;
      this.allDatas.forEach(m => m.checked = false);
    }
  }

  onTop(): void {
    this.elemRef.nativeElement.querySelector('.filters').scrollIntoView();
  }

  ngOnDestroy(): void {
    this.subs.forEach((subscription) => subscription.unsubscribe());
  }
}
