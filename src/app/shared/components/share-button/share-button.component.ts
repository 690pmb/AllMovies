import {Component, OnInit} from '@angular/core';
import {faShareAlt, faTicketAlt} from '@fortawesome/free-solid-svg-icons';
import {Site} from '../../../constant/duck-duck-go';
import {MetaService} from '../meta/service/meta.service';
import {UtilsService} from '../../../service/utils.service';
import {ToastService} from '../../../service/toast.service';

@Component({
  selector: 'app-share-button',
  templateUrl: './share-button.component.html',
  styleUrls: ['./share-button.component.scss'],
})
export class ShareButtonComponent implements OnInit {
  private readonly ALLMOVIES = 'allmovies';
  faShareAlt = faShareAlt;
  sites: Site[] = [];

  constructor(
    private meta: MetaService,
    private utils: UtilsService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.meta.sites.subscribe(sites => {
      this.sites = sites;
      if (!this.sites.map(s => s.label).includes(this.ALLMOVIES)) {
        this.sites.unshift({
          icon: faTicketAlt,
          label: this.ALLMOVIES,
          url: window.location.href,
        });
      } else {
        this.sites.find(s => s.label === this.ALLMOVIES).url =
          window.location.href;
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
      console.warn('Share is not supported');
    }
  }

  get isSupported(): boolean {
    return navigator.share !== undefined;
  }
}
