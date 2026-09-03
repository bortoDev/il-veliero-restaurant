import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../../core/services/animation.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal-dialog" #modalContent>
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button (click)="close()" class="btn-close" aria-label="Chiudi">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(7, 25, 47, 0.7);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-dialog {
      background: #ffffff;
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--color-seafoam);

      .modal-title {
        font-size: 1.3rem;
        color: var(--color-navy-dark);
      }

      .btn-close {
        background: transparent;
        border: none;
        font-size: 1.3rem;
        color: var(--color-text-muted);
        cursor: pointer;
        transition: color var(--transition-fast);

        &:hover {
          color: var(--color-danger);
        }
      }
    }

    .modal-body {
      padding: 1.75rem;
      overflow-y: auto;
    }
  `],
})
export class ModalComponent implements AfterViewInit {
  @Input() title: string = '';
  @Output() closed = new EventEmitter<void>();
  @ViewChild('modalContent') modalContent!: ElementRef;
  private animService = inject(AnimationService);

  ngAfterViewInit(): void {
    if (this.modalContent) {
      this.animService.animateModalEntrance(this.modalContent.nativeElement);
    }
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }
}
