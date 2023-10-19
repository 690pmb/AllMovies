import {filter, map, tap} from 'rxjs/operators';
import {combineLatest} from 'rxjs';
import {Component} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {
  faImage,
  faChevronCircleRight,
  faPlus,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';
import {TranslateService} from '@ngx-translate/core';

import {DuckDuckGo} from './../../../constant/duck-duck-go';
import {Serie} from '../../../model/serie';
import {TitleService} from '../../../service/title.service';
import {TabsService} from '../../../service/tabs.service';
import {MyTagsService} from '../../../service/my-tags.service';
import {MyDatasService} from '../../../service/my-datas.service';
import {MenuService} from '../../../service/menu.service';
import {ImageSize, Id} from '../../../model/model';
import {SerieManager} from '../../../manager/serie.manager';

@Component({
  selector: 'app-serie-detail',
  styleUrls: ['./serie-detail.component.scss'],
  templateUrl: './serie-detail.component.html',
})
export class SerieDetailComponent {
  showTags = false;
  isImagesVisible = false;
  showTitles = false;
  Url = DuckDuckGo;
  imageSize = ImageSize;
  protected sc!: string;

  serie$ = this.serieManager.find(this.route.paramMap, 'id').pipe(
    tap(serie => {
      this.title.setTitle(serie.title);
      this.menuService.scrollTo$.next(0);
    })
  );

  loading$ = combineLatest([
    this.serieManager.listenParam(this.route.paramMap, 'id'),
    this.serie$,
  ]).pipe(map(([p, s]) => !s || p !== s.id));

  tags$ = combineLatest([
    this.myTagsService.myTags$,
    this.myDatasService.mySeries$,
    this.serie$,
  ]).pipe(
    filter(
      ([tags, series, serie]) =>
        tags !== undefined &&
        tags.length > 0 &&
        series !== undefined &&
        serie !== undefined
    ),
    map(([tags, series, serie]) => {
      this.showTags = false;
      if (series.map(m => m.id).includes(serie.id)) {
        this.showTags = true;
        return tags.filter(t =>
          t.datas
            .filter(d => !d.movie)
            .map(d => d.id)
            .includes(serie.id)
        );
      } else {
        return [];
      }
    })
  );

  faChevronCircleRight = faChevronCircleRight;
  faImage = faImage;
  faPlus = faPlus;
  faMinus = faMinus;

  constructor(
    private serieManager: SerieManager,
    private route: ActivatedRoute,
    protected translate: TranslateService,
    private title: TitleService,
    private router: Router,
    public tabsService: TabsService,
    private menuService: MenuService,
    private myTagsService: MyTagsService,
    private myDatasService: MyDatasService<Serie>
  ) {}

  toDiscover<T extends Id>(item: T, key: string): void {
    const params: Params = {};
    params[key] = JSON.stringify([item.id]);
    params['isMovie'] = false;
    this.router.navigate(['discover'], {
      queryParams: params,
    });
  }
}
