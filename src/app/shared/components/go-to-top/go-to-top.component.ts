import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {fromEvent} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  share,
  throttleTime,
} from 'rxjs/operators';
import {faAngleUp} from '@fortawesome/free-solid-svg-icons';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-go-to-top',
  templateUrl: './go-to-top.component.html',
  styleUrls: ['./go-to-top.component.scss'],
})
export class GoToTopComponent implements OnInit, AfterViewInit {
  @ViewChild('goToTop', {static: true}) goToTop: MatButton;
  isVisible = false;
  faAngleUp = faAngleUp;

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
    const scroll$ = fromEvent(window, 'scroll').pipe(
      throttleTime(10),
      map(x => {
        const doc = (x.target as Document).documentElement;
        return (
          doc.scrollTop > (doc.scrollHeight - doc.offsetHeight) / 5 &&
          doc.scrollHeight - doc.offsetHeight > doc.offsetHeight
        );
      }),
      distinctUntilChanged(),
      share()
    );
    scroll$.pipe(filter(direction => !direction)).subscribe(() => {
      this.goToTop._elementRef.nativeElement.classList.add('hidden');
      this.goToTop._elementRef.nativeElement.classList.add('fade-out');
      this.goToTop._elementRef.nativeElement.classList.remove('fade-in');
    });

    scroll$.pipe(filter(direction => direction)).subscribe(() => {
      this.goToTop._elementRef.nativeElement.classList.remove('hidden');
      this.goToTop._elementRef.nativeElement.classList.remove('fade-out');
      this.goToTop._elementRef.nativeElement.classList.add('fade-in');
    });
  }

  onTop(): void {
    window.scrollTo(0, 0);
  }
}
