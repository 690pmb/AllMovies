import {TranslateService} from '@ngx-translate/core';
import {Observable, forkJoin} from 'rxjs';
import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

import {Data} from './../../../../model/data';
import {DetailConfig, ImageSize} from './../../../../model/model';
import {
  SerieService,
  MovieService,
  MovieSearchService,
} from './../../../../shared/shared.module';

@Component({
  selector: 'app-search-data',
  templateUrl: './search-data.component.html',
  styleUrls: ['./search-data.component.scss'],
})
export class SearchDataComponent<T extends Data> implements OnInit {
  @Input() adult!: boolean;
  @Output() selected = new EventEmitter<T[]>();
  @Output() movie = new EventEmitter<boolean>();
  getData: (term: string, lang: string) => Observable<Data[]>;
  imageSize = ImageSize;
  isMovie = true;

  constructor(
    private movieSearchService: MovieSearchService,
    private movieService: MovieService,
    private serieService: SerieService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getData = (term: string, lang: string): Observable<Data[]> =>
      this.isMovie
        ? this.movieSearchService.search(term, this.adult, lang)
        : this.serieService.search(term, lang);
  }

  add(item: T): void {
    const lang = this.translate.currentLang === 'fr' ? 'en' : 'fr';
    forkJoin([
      this.fetchData(item.id, lang, this.isMovie),
      this.fetchData(item.id, this.translate.currentLang, this.isMovie),
    ]).subscribe((data: T[]) => {
      this.movie.emit(this.isMovie);
      this.selected.emit(data);
    });
  }

  fetchData(id: number, lang: string, isMovie: boolean): Promise<T> {
    const config = new DetailConfig(
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      !isMovie,
      lang
    );
    let result: Promise<Data>;
    if (this.isMovie) {
      result = this.movieService.getMovie(id, config, false);
    } else {
      result = this.serieService.getSerie(id, config, false);
    }
    return result.then((d: T) => {
      d.lang_version = lang;
      return d;
    });
  }
}
