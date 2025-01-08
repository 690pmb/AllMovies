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
import {Meta, Search, Site} from '../../../../constant/meta';
import {Score} from '../../../../model/score';
import {Person} from '../../../../model/person';
import {Data} from '../../../../model/data';
import {switchMap, map} from 'rxjs/operators';
import {of, forkJoin} from 'rxjs';
import {ToastService} from '../../../../service/toast.service';
import {Level} from '../../../../model/model';

type Datas = Data | Person;

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

  links: Site[] = [];

  id = 0;

  constructor(
    private metaService: MetaService,
    private translate: TranslateService,
    private toast: ToastService
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
            itemLang =
              this.entry?.spokenLangs.length > 0
                ? this.entry?.spokenLangs[0].code?.toLowerCase()
                : this.entry.language;
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
                site.label,
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
                      site.label,
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
                  label: site.label,
                  icon: site.icon,
                }))
              )
          )
        ).subscribe(results => this.handleResult(results));
      }
    }
  }

  handleResult(results: Site[]): void {
    this.links = results;
    this.scSearch(
      this.links.find(
        l =>
          l.label === Meta.SEARCH_BANG_SENSCRITIQUE.label &&
          (this.isMovie || this.isSerie)
      )?.url
    ).then(() => {
      this.links.sort((a, b) => Utils.compare(a.label, b.label, false));
      this.metaService.sites.next([...this.links]);
    });
  }

  scSearch(url?: string): Promise<boolean> {
    if (!url) {
      return new Promise<boolean>(resolve => resolve(true));
    }
    return fetch(
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    )
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
        } else if (this.scrapping(data.contents, /captcha/g)) {
          this.toast.open(Level.warning, 'meta.captcha');
        }
        return true;
      });
  }

  scrapping(html: string, reg: RegExp): string {
    return html.match(reg)?.[0].replace(/(\r\n|\n|\r|\t|\n\t)/gm, '') ?? '';
  }

  openAll(): void {
    this.links.slice(0, 4).forEach(link => window.open(link.url));
  }

  isPerson(data: Datas): data is Person {
    return !this.isMovie && !this.isSerie;
  }
}
