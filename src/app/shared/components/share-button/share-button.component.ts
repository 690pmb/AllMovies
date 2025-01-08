import {Component, OnInit, ViewChild, TemplateRef, Inject} from '@angular/core';
import {
  faShareAlt,
  faTicketAlt,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import {Site} from '../../../constant/meta';
import {MetaService} from '../meta/service/meta.service';
import {UtilsService} from '../../../service/utils.service';
import {ToastService} from '../../../service/toast.service';
import {environment} from '../../../../environments/environment';
import {MatDialog} from '@angular/material/dialog';
import {faWhatsapp} from '@fortawesome/free-brands-svg-icons';
import {Level} from '../../../model/model';
import {
  faEnvelope,
  faCommentAlt,
  faCopy,
} from '@fortawesome/free-regular-svg-icons';
import {APP_BASE_HREF} from '@angular/common';

type App = {
  icon: IconDefinition;
  label: string;
  prefix: string | ((x: string) => Promise<void> | string);
  label_done?: string;
};

@Component({
  selector: 'app-share-button',
  templateUrl: './share-button.component.html',
  styleUrls: ['./share-button.component.scss'],
})
export class ShareButtonComponent implements OnInit {
  @ViewChild('shareDialog')
  shareDialog: TemplateRef<string>;

  readyToBeClosed = false;
  private readonly ALLMOVIES = 'allmovies';
  faShareAlt = faShareAlt;
  sites: Site[] = [];
  apps: App[] = [
    {icon: faWhatsapp, label: 'whatsapp', prefix: 'whatsapp://send?text='},
    {
      icon: faEnvelope,
      label: 'email',
      prefix: url =>
        `mailto:?subject=${document.title.replace(/.*\|/g, '')}&body=${url}`,
    },
    {icon: faCommentAlt, label: 'sms', prefix: 'sms:?body='},
    {
      icon: faCopy,
      label: 'clipboard',
      prefix: url => navigator.clipboard.writeText(url),
      label_done: 'share.copied',
    },
  ];

  constructor(
    private meta: MetaService,
    private utils: UtilsService,
    private toast: ToastService,
    public dialog: MatDialog,
    @Inject(APP_BASE_HREF) private href: string
  ) {}

  ngOnInit(): void {
    this.meta.sites.subscribe(sites => {
      const url = environment.base_url
        ? `${environment.base_url}/${window.location.pathname.replace(
            this.href,
            ''
          )}`
        : window.location.href;
      this.sites = sites;
      if (!this.sites.map(s => s.label).includes(this.ALLMOVIES)) {
        this.sites.unshift({
          icon: faTicketAlt,
          label: this.ALLMOVIES,
          url,
        });
      } else {
        this.sites.find(s => s.label === this.ALLMOVIES).url = url;
      }
    });
  }

  share(url: string): void {
    if (this.isSupported) {
      navigator
        .share({
          title: document.title.replace(/.*\|/g, ''),
          url: url,
        })
        .catch(err => this.utils.handleError(err, this.toast));
    } else {
      const ref = this.dialog.open(this.shareDialog, {
        data: {
          url,
        },
      });
      ref.afterClosed().subscribe(() => (this.readyToBeClosed = false));
      ref.afterOpened().subscribe(() => (this.readyToBeClosed = true));
    }
  }

  shareWithApp(app: App, url: string): void {
    if (typeof app.prefix === 'string') {
      window.open(`${app.prefix}${url}`);
    } else {
      const res = app.prefix(url);
      if (typeof res === 'object') {
        res.then(() => this.toast.open(Level.success, app.label_done));
      } else {
        window.open(res);
      }
    }
  }

  close(): void {
    if (this.readyToBeClosed) {
      this.dialog.closeAll();
    }
  }

  get isSupported(): boolean {
    return navigator.share !== undefined;
  }
}
