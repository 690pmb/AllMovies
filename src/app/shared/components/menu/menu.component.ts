import {
  Component,
  OnInit,
  HostListener,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {
  faUser,
  faBars,
  faAtom,
  faPowerOff,
  faHome,
  faBoxOpen,
  faBookmark,
  faTags,
  faSignInAlt,
} from '@fortawesome/free-solid-svg-icons';
import {MediaMatcher} from '@angular/cdk/layout';
import {MatSidenav, MatSidenavContent} from '@angular/material/sidenav';
import {filter, take} from 'rxjs/operators';
import {Router} from '@angular/router';

import {Constants} from './../../../constant/constants';
import {AuthService} from '../../../service/auth.service';
import {User} from '../../../model/user';
import {MenuService} from '../../../service/menu.service';
import {ToastService} from '../../../service/toast.service';
import {Level} from '../../../model/model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  user!: User;
  visible!: boolean;
  subs: Subscription[] = [];
  isNotLoginPage$ = this.menuService.isNotLoginPage$;

  faUser = faUser;
  faBars = faBars;
  faBookmark = faBookmark;
  faAtom = faAtom;
  faTags = faTags;
  faHome = faHome;
  faBoxOpen = faBoxOpen;
  faPowerOff = faPowerOff;
  faSignInAlt = faSignInAlt;

  private _mobileQueryListener: () => void;
  @ViewChild('sidenav', {static: false}) sidenav!: MatSidenav;
  @ViewChild('content', {static: true}) content!: MatSidenavContent;
  @HostListener('document:click', ['$event']) onClick(event: Event): void {
    this.handleClick(event);
  }

  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public media: MediaMatcher,
    private auth: AuthService,
    private router: Router,
    public menuService: MenuService,
    private elemRef: ElementRef,
    private toast: ToastService
  ) {
    this.mobileQuery = media.matchMedia(Constants.MEDIA_MAX_700);
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.subs.push(
      this.menuService.visible$.subscribe(visible => {
        this.visible = visible;
        this.changeDetectorRef.detectChanges();
      })
    );
    this.subs.push(
      this.menuService.scrollTo$.subscribe((scrollTo: number) => {
        this.elemRef.nativeElement
          .querySelector('.mat-sidenav-content')
          .scrollTo(0, scrollTo);
      })
    );
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

  login(): void {
    this.auth.redirectToLogin(false);
  }

  logout(): void {
    this.auth.logout();
    this.toast.open(Level.success, 'login.connect.disconnected');
    this.menuService.url$
      .pipe(
        take(1),
        filter(u => u.includes('/login'))
      )
      .subscribe(() => this.router.navigateByUrl('/'));
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
