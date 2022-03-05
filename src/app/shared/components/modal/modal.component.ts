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
import {LocationStrategy} from '@angular/common';

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

  constructor(private locationStrategy: LocationStrategy) {}

  ngOnInit(): void {
    if (!this.closeBtn) {
      this.closeBtn = faTimes;
    }
    history.pushState(null, null, location.href);
    this.locationStrategy.onPopState(() => {
      if (this.visible) {
        history.pushState(null, null, location.href);
        this.close();
      }
    });
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    for (const field of Object.keys(changes)) {
      if (field === 'visible') {
        const changedProp = changes[field];
        this.visible = changedProp.currentValue;
      }
    }
  }

  close(): void {
    this.visible = false;
    this.update.emit(this.visible);
  }
}
