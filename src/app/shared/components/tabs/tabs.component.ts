import {Component, OnInit, ElementRef, ChangeDetectorRef} from '@angular/core';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {delay, filter} from 'rxjs/operators';

import {TabsService} from '../../../service/tabs.service';
import {TitleService} from '../../../service/title.service';
import {MenuService} from '../../../service/menu.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit {
  title!: string;
  faClose = faTimes;
  isNotLoginPage$ = this.menuService.isNotLoginPage$;

  constructor(
    private titleService: TitleService,
    public tabsService: TabsService,
    private elemRef: ElementRef,
    private cdRef: ChangeDetectorRef,
    public menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.titleService.header.subscribe(title => {
      this.tabsService.updateCurTabLabel(title);
      this.cdRef.detectChanges();
    });
    this.tabsService.isSelectAfterAdding
      .pipe(
        delay(1000),
        filter(x => x)
      )
      .subscribe(() => {
        const active = this.elemRef.nativeElement.querySelector(
          '.mat-tab-label-active'
        );
        if (active) {
          active.scrollIntoView(0);
        }
      });
  }
}
