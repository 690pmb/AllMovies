import { GenreService } from './../../../service/genre.service';
import { PersonSearchService } from './../../../service/person-search.service';
import { AuthService } from './../../../service/auth.service';
import { DiscoverCriteria } from './../../../model/discover-criteria';
import { ConvertToHHmmPipe } from './../../../shared/custom.pipe';
import { PageEvent } from '@angular/material/paginator';
import { Discover } from './../../../model/discover';
import { TranslateService } from '@ngx-translate/core';
import { MovieService } from './../../../service/movie.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NouiFormatter } from 'ng2-nouislider';
import { DropDownChoice, Keyword } from '../../../model/model';
import { Person } from '../../../model/person';
import { KeywordSearchService } from '../../../service/keyword-search.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit {
  @ViewChild('sortDir') sortDir: any;
  discover: Discover;
  sortChoices: DropDownChoice[];
  sortChosen: DropDownChoice;
  page: PageEvent;
  nbChecked = 0;
  max = 300;
  adult: boolean;
  runtimeRange: any[] = [0, this.max];
  formatter: NouiFormatter;
  minYear = 1890;
  maxYear = new Date().getFullYear();
  yearRange: any[] = [this.minYear, this.maxYear];
  minVote = 0;
  maxVote = 10;
  voteRange: any[] = [this.minVote, this.maxVote];
  pseudo: string;
  voteCountMin = 10;
  people: Person[] = [];
  keyword: Keyword[] = [];
  allGenres: DropDownChoice[];
  selectedGenres: DropDownChoice[];
  clean = false;

  constructor(
    private movieService: MovieService,
    private translate: TranslateService,
    private router: Router,
    public personService: PersonSearchService,
    public keywordService: KeywordSearchService,
    private genreService: GenreService,
    private elemRef: ElementRef,
    public timePipe: ConvertToHHmmPipe) { }

  ngOnInit() {
    this.pseudo = AuthService.decodeToken().name;
    this.adult = this.pseudo === 'Test';
    this.sortDir.value = 'desc';
    this.sortChoices = [new DropDownChoice('discover.sort_field.popularity', 'popularity'),
    new DropDownChoice('discover.sort_field.release_date', 'release_date'), new DropDownChoice('discover.sort_field.revenue', 'revenue'),
    new DropDownChoice('discover.sort_field.original_title', 'original_title'), new DropDownChoice('discover.sort_field.vote_average', 'vote_average')
      , new DropDownChoice('discover.sort_field.vote_count', 'vote_count')];
    this.sortChosen = this.sortChoices[0];
    const that = this;
    this.formatter = {
      to(minutes: any): any {
        return that.convertTimeNumberToString(minutes);
      },
      from(time: any): any {
        const res = that.convertTimeStringToNumber(time);
        if (isNaN(res)) {
          return time;
        }
        return res;
      }
    };
    this.translate.onLangChange.subscribe(() => {
      this.getAllGenres(this.selectedGenres.map(g => g.value));
      this.search(false);
    });
    const criteria = <DiscoverCriteria>JSON.parse(sessionStorage.getItem('criteria'));
    if (criteria) {
      this.initFromCriteria(criteria);
      this.search(false);
    }
    this.getAllGenres(criteria ? criteria.genresId : []);
  }

  getAllGenres(genresId: number[]) {
    this.genreService.getAllGenre(this.translate.currentLang).subscribe(genres => {
      this.allGenres = genres.map(genre => new DropDownChoice(genre.name, genre.id));
      this.selectedGenres = genresId ? this.allGenres.filter(genre => genresId.includes(genre.value)) : [];
    });
  }

  convertTimeStringToNumber(time: string): number {
    if (time) {
      let h = parseInt(time.substr(0, time.indexOf('h')).trim(), 10);
      if (isNaN(h)) {
        h = 0;
      }
      const m = parseInt(time.substring(time.lastIndexOf('h') + 1, time.lastIndexOf('min')).trim(), 10);
      return h * 60 + m;
    } else {
      return 0;
    }
  }

  convertTimeNumberToString(minutes: number): string {
    if (minutes) {
      minutes = Math.round(minutes);
      let result = '';
      result += Math.floor(minutes / 60);
      result += ' h ';
      result += minutes % 60;
      result += ' min ';
      return result;
    } else {
      return '0 min';
    }
  }

  initFromCriteria(criteria: DiscoverCriteria) {
    this.sortDir.value = criteria.sortDir;
    this.sortChosen = this.sortChoices.find(sort => sort.value === criteria.sortField);
    this.page = new PageEvent();
    this.page.pageIndex = criteria.page ? criteria.page - 1 : 0;
    this.yearRange = [criteria.yearMin ? criteria.yearMin : this.minYear, criteria.yearMax ? criteria.yearMax : this.maxYear];
    this.voteRange = [criteria.voteAvergeMin ? criteria.voteAvergeMin : this.minVote, criteria.voteAvergeMax ? criteria.voteAvergeMax : this.maxVote];
    this.runtimeRange = [criteria.runtimeMin ? criteria.runtimeMin : 0, criteria.runtimeMax ? criteria.runtimeMax : this.max];
    this.voteCountMin = criteria.voteCountMin;
    this.people = <Person[]>JSON.parse(sessionStorage.getItem('people'));
    if (!this.people) {
      this.people = [];
    }
    this.keyword = <Keyword[]>JSON.parse(sessionStorage.getItem('keyword'));
    if (!this.keyword) {
      this.keyword = [];
    }
    this.selectedGenres = <DropDownChoice[]>JSON.parse(sessionStorage.getItem('genre'));
  }

  clear() {
    sessionStorage.removeItem('criteria');
    sessionStorage.removeItem('people');
    sessionStorage.removeItem('keyword');
    sessionStorage.removeItem('genre');
    this.initFromCriteria(new DiscoverCriteria(this.translate.currentLang, this.sortChoices[0].value, 'desc', 0,
      undefined, undefined, undefined, undefined, undefined, 10));
    this.search(true);
    this.clean = true;
  }

  buildCriteria(): DiscoverCriteria {
    let runtimeMin;
    if (this.runtimeRange[0] !== 0) {
      runtimeMin = this.runtimeRange[0];
    }
    let runtimeMax;
    if (this.runtimeRange[1] !== this.max) {
      runtimeMax = this.runtimeRange[1];
    }
    if (runtimeMax === this.max) {
      runtimeMax = undefined;
    }
    let yearMin;
    if (this.yearRange[0] && this.yearRange[0] !== this.minYear) {
      yearMin = this.yearRange[0];
    }
    let yearMax;
    if (this.yearRange[1] && this.yearRange[1] !== this.maxYear) {
      yearMax = this.yearRange[1];
    }
    let voteMin;
    if (this.voteRange[0] && this.voteRange[0] !== this.minVote) {
      voteMin = this.voteRange[0];
    }
    let voteMax;
    if (this.voteRange[1] && this.voteRange[1] !== this.maxVote) {
      voteMax = this.voteRange[1];
    }
    let person;
    if (this.people.length > 0) {
      person = this.people.map(p => p.id);
    }
    let kw;
    if (this.keyword.length > 0) {
      kw = this.keyword.map(p => p.id);
    }
    let genres;
    console.log('this.selectedGenres', this.selectedGenres);
    if (this.selectedGenres && this.selectedGenres.length > 0) {
      genres = this.selectedGenres.map(g => g.value);
    }
    // (language, sortField, sortDir, page, yearMin, yearMax, adult, voteAvergeMin, voteAvergeMax,
    //   voteCountMin, certification, runtimeMin, runtimeMax, releaseType, personsIds, genresId, genresWithout, keywordsIds, keywordsWithout))
    const criteria = new DiscoverCriteria(this.translate.currentLang, this.sortChosen.value,
      this.sortDir.value, this.page.pageIndex + 1, yearMin, yearMax, this.adult, voteMin, voteMax,
      this.voteCountMin, undefined, runtimeMin, runtimeMax, undefined, person, genres, undefined, kw);
    sessionStorage.setItem('criteria', JSON.stringify(criteria));
    sessionStorage.setItem('people', JSON.stringify(this.people));
    sessionStorage.setItem('keyword', JSON.stringify(this.keyword));
    sessionStorage.setItem('genre', JSON.stringify(this.selectedGenres));
    return criteria;
  }

  search(initPagination: boolean) {
    console.log('this.sortChosen', this.sortChosen);
    console.log('this.sortDir.value', this.sortDir.value);
    if (initPagination || !this.page) {
      this.page = new PageEvent();
      this.nbChecked = 0;
    }
    this.movieService.getMoviesDiscover(this.buildCriteria()).then(result => {
      this.discover = result;
      this.elemRef.nativeElement.querySelector('#searchBtn').scrollIntoView();
    });
  }

  gotoDetail(id: number, event): void {
    const key = event.which;
    if (key === 1 && event.type !== 'mousedown') {
      this.router.navigate(['movie', id]);
    } else if (key === 2) {
      window.open('/movie/' + id);
    }
  }

  updateSize() {
    this.nbChecked = this.discover.movies.filter(movie => movie.checked).length;
  }

  initSelection() {
    this.discover.movies.forEach((movie) => movie.checked = false);
  }

}
