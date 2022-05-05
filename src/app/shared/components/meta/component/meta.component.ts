import {TranslateService} from '@ngx-translate/core';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import {Utils} from './../../../utils';
import {MetaService} from './../service/meta.service';
import {DuckDuckGo, Search} from '../../../../constant/duck-duck-go';
import {Score} from '../../../../model/score';
import {Person} from '../../../../model/person';
import {Data} from '../../../../model/data';
import {switchMap, map} from 'rxjs/operators';
import {of, forkJoin} from 'rxjs';

type Datas = Data | Person;

type Result = {url: string; site: string; icon: any; key: string};

@Component({
  selector: 'app-meta',
  templateUrl: './meta.component.html',
  styleUrls: ['./meta.component.scss'],
})
export class MetaComponent implements OnChanges {
  @Input()
  entry: Datas;

  @Input()
  sites: Search[] = [];

  @Input()
  isMovie!: boolean;

  @Input()
  isSerie!: boolean;

  @Output()
  sensCritique = new EventEmitter<Score>();

  links: Search[] = [];

  results: Result[] = [];

  id = 0;

  constructor(
    private metaService: MetaService,
    private translate: TranslateService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.entry) {
      if (
        changes.entry &&
        (changes.entry.currentValue as Datas).id !== this.id
      ) {
        this.entry = changes.entry.currentValue;
        this.id = this.entry.id;
        let term: string;
        let original: string;
        let itemLang: string;
        if (this.isPerson(this.entry)) {
          term = this.entry.name;
        } else {
          term = this.entry.title;
          original = this.entry.original_title;
          if (this.entry.movie()) {
            itemLang = this.entry.spokenLangs[0].code.toLowerCase();
          } else if (this.entry.serie()) {
            itemLang = this.entry.originLang.toLowerCase();
          }
        }
        forkJoin(
          this.sites.map(site =>
            this.metaService
              .getLinkScore(
                term,
                original,
                this.translate.currentLang,
                itemLang,
                site.site,
                this.entry.imdb_id,
                this.isMovie,
                this.isSerie
              )
              .pipe(
                switchMap(result => {
                  if (!result && (this.isMovie || this.isSerie)) {
                    return this.metaService.getLinkScore(
                      original,
                      term,
                      this.translate.currentLang,
                      itemLang,
                      site.site,
                      undefined,
                      this.isMovie,
                      this.isSerie
                    );
                  } else {
                    return of(result);
                  }
                }),
                map(result => ({
                  url: result,
                  site: site.site,
                  icon: site.icon,
                  key: site.key,
                }))
              )
          )
        ).subscribe(results => this.handleResult(results));
      }
    }
  }

  handleResult(results: Result[]): void {
    this.links = results.map(result => {
      const link: Search = {
        site: result.url,
        icon: result.icon,
        key: result.site,
      };
      if (
        result.site === DuckDuckGo.SEARCH_BANG_SENSCRITIQUE.site &&
        (this.isMovie || this.isSerie)
      ) {
        this.scSearch(result.url);
      }
      return link;
    });
    this.links.sort((a, b) => Utils.compare(a.key, b.key, false));
  }

  scSearch(url: string): void {
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Error fetching url: ' + url);
        }
      })
      .then(data => {
        const score = this.scrapping(
          data.contents,
          /(\d{1,2}\.\d\/10)|(\d{1,2}\/10)/g
        );
        const vote = this.scrapping(
          data.contents,
          /<span>(\(\d+,\d{1,3}\))|(\(\d{1,3}\))<\/span>/g
        ).replace(/<\/?span>/g, '');
        if (score) {
          this.sensCritique.emit(
            new Score(
              [{Source: 'SensCritique', Value: score}],
              undefined,
              undefined,
              vote
            )
          );
        }
      });
  }

  scrapping(html: string, reg: RegExp): string {
    const selected = html.match(reg);
    let data = '';
    if (selected) {
      data = selected[0].replace(/(\r\n|\n|\r|\t|\n\t)/gm, '');
    }
    return data;
  }

  openAll(): void {
    this.links.slice(0, 4).forEach(link => window.open(link.site));
  }

  isPerson(data: Datas): data is Person {
    return !this.isMovie && !this.isSerie;
  }
}
