import {SwiperConfigInterface} from 'ngx-swiper-wrapper';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import {
  faExpand,
  IconDefinition,
  faCompress,
} from '@fortawesome/free-solid-svg-icons';

import {MenuService} from '../../../service/menu.service';
import {ImageSize} from '../../../model/model';
import {ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
})
export class ImageViewerComponent implements OnChanges, AfterViewInit {
  @ViewChild('galleryTop') galleryTop: ElementRef;
  @ViewChild('galleryThumbs') galleryThumbs: ElementRef;
  @ViewChildren('img') imgs: QueryList<HTMLImageElement>;
  @Input() visible!: boolean;
  @Input() images!: string[] | string;
  @Input() thumbnails!: string[] | string;
  index!: number;
  imageSize = ImageSize;
  nextBtn!: HTMLButtonElement;
  prevBtn!: HTMLButtonElement;
  config: SwiperConfigInterface = {
    observer: true,
    direction: 'horizontal',
    slidesPerView: 1,
    keyboard: true,
    mousewheel: true,
    scrollbar: false,
    navigation: true,
    pagination: {
      el: '.swiper-pagination',
      type: 'custom',
    },
    spaceBetween: 30,
    zoom: false,
    slideToClickedSlide: true,
    touchEventsTarget: 'wrapper',
  };

  thumbs: SwiperConfigInterface = {
    observer: true,
    slidesPerView: 4,
    slideToClickedSlide: true,
    mousewheel: true,
  };

  isOnePicture!: boolean;
  faExpand = faExpand;
  isFullscreen = false;
  fullScreenImg!: string;
  closeBtn!: IconDefinition;
  isPortrait!: boolean;

  constructor(private menuService: MenuService) {}

  ngAfterViewInit(): void {
    this.imgs.changes.subscribe(
      (x: QueryList<ElementRef<HTMLImageElement>>) => {
        if (x.length > 0) {
          this.setGalleriesHeight();
          x.first.nativeElement.onload = event => {
            const target = event.currentTarget as HTMLImageElement;
            this.isPortrait = target.naturalHeight > target.naturalWidth;
          };
        }
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.visible = changes.visible
      ? changes.visible.currentValue
      : this.visible;
    this.images = changes.images ? changes.images.currentValue : this.images;
    this.thumbnails = changes.thumbnails
      ? changes.thumbnails.currentValue
      : this.thumbnails;
    if (this.visible) {
      this.isOnePicture =
        typeof this.images === 'string' ||
        this.images === undefined ||
        this.images === null;
      this.index = 0;
      if (!this.isOnePicture) {
        this.closeBtn = faCompress;
      }
    }
    if (!this.isOnePicture) {
      this.menuService.visible$.next(!this.visible);
    }
  }

  setGalleriesHeight(): void {
    this.galleryTop.nativeElement.style.height = `${
      window.innerHeight * 0.8
    }px`;
    this.galleryThumbs.nativeElement.style.height = `${
      window.innerHeight * 0.2
    }px`;
  }

  fullscreen(): void {
    this.isFullscreen = true;
    this.fullScreenImg = this.isOnePicture
      ? <string>this.images
      : this.images[this.index];
    this.menuService.visible$.next(this.isOnePicture && !this.isFullscreen);
  }

  closeFullscreen(event: boolean): void {
    this.isFullscreen = event;
    this.menuService.visible$.next(this.isOnePicture && !this.isFullscreen);
  }
}
