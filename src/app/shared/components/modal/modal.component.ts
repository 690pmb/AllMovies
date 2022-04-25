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

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnChanges {
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

  constructor(private location: Location, private router: Router) {}

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
        if (this.visible) {
          this.router.navigate([this.current.path().split('?')[0]], {
            queryParams: {modal: true},
            replaceUrl: true,
            queryParamsHandling: 'merge',
          });
        } else {
          this.router.navigate([this.current.path().split('?')[0]], {
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
