import {
  faChevronCircleLeft,
  faImage,
  faArrowCircleLeft,
  faArrowCircleRight,
} from '@fortawesome/free-solid-svg-icons';
import {ActivatedRoute, Router} from '@angular/router';
import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {tap, map} from 'rxjs/operators';

import {TitleService} from '../../../service/title.service';
import {Utils} from '../../../shared/utils';
import {SerieManager} from '../../../manager/serie.manager';
import {SeasonManager} from '../../../manager/season.manager';

@Component({
  selector: 'app-season-detail',
  templateUrl: './season-detail.component.html',
  styleUrls: ['./season-detail.component.scss'],
})
export class SeasonDetailComponent {
  isImagesVisible = false;

  faChevronCircleLeft = faChevronCircleLeft;
  faImage = faImage;
  faArrowCircleLeft = faArrowCircleLeft;
  faArrowCircleRight = faArrowCircleRight;

  serie$ = this.serieManager
    .find(this.serieManager.listenParam(this.route.paramMap, 'id'))
    .pipe(tap(s => this.title.setTitle(s.title)));

  season$ = this.seasonManager
    .find(this.serieManager.listenParam(this.route.paramMap, 'season'))
    .pipe(
      map(season => {
        season.images.push(...season.episodes.map(e => e.poster));
        season.images = season.images.filter(i => Utils.isNotBlank(i));
        return season;
      })
    );

  constructor(
    private serieManager: SerieManager,
    private seasonManager: SeasonManager,
    protected translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private title: TitleService
  ) {}

  navigate(serieId: number, seasonNumber?: number): void {
    this.router.navigate([
      `serie/${serieId}${seasonNumber ? `/${seasonNumber}` : ''}`,
    ]);
  }
}
