import { Component, OnInit, HostListener, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  distinctUntilChanged,
} from 'rxjs/operators';
import { faUser, faBars, faAtom, faPowerOff, faHome, faBoxOpen, faBookmark } from '@fortawesome/free-solid-svg-icons';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSidenav, MatSidenavContent } from '@angular/material';

import { TabsService } from './../../service/tabs.service';
import { Constants } from './../../../constant/constants';
import { AuthService } from '../../service/auth.service';
import { User } from '../../../model/user';
import { MenuService } from '../../service/menu.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  user: User;
  isLogged$ = new BehaviorSubject<boolean>(false);
  visible: boolean;

  faUser = faUser;
  faBars = faBars;
  faBookmark = faBookmark;
  faAtom = faAtom;
  faHome = faHome;
  faBoxOpen = faBoxOpen;
  faPowerOff = faPowerOff;

  private _mobileQueryListener: () => void;
  @ViewChild('sidenav') sidenav: MatSidenav;
  @ViewChild('content') content: MatSidenavContent;
  @HostListener('document:click', ['$event']) onClick(event: Event): void {
    this.handleClick(event);
  }

  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public media: MediaMatcher,
    private auth: AuthService,
    private tabs: TabsService,
    public menuService: MenuService,
    private elemRef: ElementRef
  ) {
    this.mobileQuery = media.matchMedia(Constants.MEDIA_MAX_700);
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.auth.isLogged.pipe(distinctUntilChanged()).subscribe(isLogged => {
      this.isLogged$.next(isLogged);
      if (isLogged) {
        this.auth.getCurrentUser().then(user => this.user = user);
      } else {
        this.user = undefined;
      }
    });
    this.auth.user$.subscribe(user => {
      if (user) {
        this.user = user;
      } else {
        this.auth.getCurrentUser().then(u => this.user = u);
      }
    });
    this.menuService.visible$.subscribe((visible) => {
      this.visible = visible;
      this.changeDetectorRef.detectChanges();
    });
    this.menuService.scrollTo$.subscribe((scrollTo: number) => {
      console.log('scrollTo', scrollTo);
      this.elemRef.nativeElement.querySelector('.mat-sidenav-content').scrollTo(0, scrollTo);
    });
  }

  handleClick(event: any): void {
    let result = false;
    let clickedComponent = event.target;
    do {
      if (clickedComponent === this.content.getElementRef().nativeElement) {
        result = true;
      }
      clickedComponent = clickedComponent.parentNode;
    } while (clickedComponent);
    if (this.sidenav && this.sidenav.opened && result) {
      this.sidenav.toggle();
    }
  }

  logout(): void {
    this.user = undefined;
    this.auth.logout();
    this.tabs.closeAll();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
