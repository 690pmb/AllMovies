import {
  Component,
  OnInit,
  Input,
  SimpleChange,
  Output,
  EventEmitter,
  OnChanges,
  HostListener,
} from '@angular/core';
import {faTimes, IconDefinition} from '@fortawesome/free-solid-svg-icons';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnChanges {
  @ViewChild('modal') modal: ElementRef;
  @Input() visible!: boolean;
  @Input() closeBtn!: IconDefinition;
  @Output() update = new EventEmitter<boolean>();
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(): void {
    if (this.visible) {
      this.close();
    }
  }

  @HostListener('window:popstate', ['$event'])
  onBackButtonHandler(): void {
    if (this.visible) {
      this.close();
    }
  }

  current: Location;

  constructor(
    private location: Location,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.closeBtn) {
      this.closeBtn = faTimes;
    }
    this.current = this.location;
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    for (const field of Object.keys(changes)) {
      if (field === 'visible') {
        const changedProp = changes[field];
        this.visible = changedProp.currentValue;
      }
      if (this.current) {
        const currentPath = this.current.path().split('?')[0];
        if (this.visible) {
          this.changeDetector.detectChanges();
          this.modal.nativeElement.style.height = `${window.innerHeight}px`;
          this.router.navigate([currentPath], {
            queryParams: {modal: true},
            replaceUrl: true,
            queryParamsHandling: 'merge',
          });
        } else {
          this.router.navigate([currentPath], {
            queryParams: null,
            replaceUrl: true,
          });
        }
      }
    }
  }

  close(): void {
    this.visible = false;
    this.update.emit(this.visible);
  }
}
