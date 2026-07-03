import {TranslateService} from '@ngx-translate/core';
import {
  faPlus,
  faMinus,
  faChevronCircleRight,
} from '@fortawesome/free-solid-svg-icons';
import {BreakpointObserver} from '@angular/cdk/layout';
import {
  OnInit,
  Component,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core';

import {take} from 'rxjs/operators';
import {Constants} from './../../../../constant/constants';
import {Utils} from './../../../../shared/utils';
import {List, ImageSize} from './../../../../model/model';
import {ListService} from '../../../../service/list.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss'],
})
export class ListsComponent implements OnInit, OnChanges {
  @Input() id: number;
  overviewId: number;
  overview: string;
  showLists = false;
  lists: List[] = [];

  imageSize = ImageSize;
  faChevronCircleRight = faChevronCircleRight;
  faPlus = faPlus;
  faMinus = faMinus;
  direction: 'horizontal' | 'vertical' = 'horizontal';
  slidesPerView: number | 'auto' = 5;
  swiperReady = true;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public translate: TranslateService,
    private listService: ListService
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Constants.MEDIA_MAX_700, Constants.MEDIA_MAX_1400])
      .subscribe(result => {
        const isMobile = result.breakpoints[Constants.MEDIA_MAX_700];
        const newDirection = isMobile ? 'vertical' : 'horizontal';
        if (newDirection !== this.direction) {
          this.direction = newDirection;
          this.swiperReady = false;
          setTimeout(() => (this.swiperReady = true));
        }
        if (
          result.breakpoints[Constants.MEDIA_MAX_1400] &&
          result.breakpoints[Constants.MEDIA_MAX_700]
        ) {
          this.slidesPerView = 1;
        } else if (
          result.breakpoints[Constants.MEDIA_MAX_1400] &&
          !result.breakpoints[Constants.MEDIA_MAX_700]
        ) {
          this.slidesPerView = 4;
        } else {
          this.slidesPerView = 8;
        }
      });
  }

  getLists(): void {
    this.showLists = false;
    this.listService
      .getDataLists(this.id, this.translate.currentLang)
      .pipe(take(1))
      .subscribe((lists: List[]) => {
        this.showLists = true;
        console.log('list', lists);
        this.lists = lists.sort((a, b) => Utils.compare(a.id, b.id, true));
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.id) {
      this.id = changes.id.currentValue;
      this.showLists = false;
      this.lists = [];
    }
  }
}
