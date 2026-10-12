import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvvisoService } from '../../../core/services/avviso.service';
import { Avviso } from '../../../core/models';

@Component({
  selector: 'app-notice-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="activeNotices().length > 0 && isVisible()" class="notice-wrapper">
      <div *ngFor="let notice of activeNotices()" class="notice-banner" [ngClass]="'banner-' + notice.severity">
        <div class="container banner-inner">
          <div class="banner-icon">
            <i class="fa-solid" [ngClass]="{
              'fa-circle-info': notice.severity === 'info',
              'fa-triangle-exclamation': notice.severity === 'warning',
              'fa-bell': notice.severity === 'danger'
            }"></i>
          </div>
          <div class="banner-text">
            <strong>{{ notice.title }}:</strong> {{ notice.message }}
          </div>
          <button (click)="dismiss()" class="btn-close-banner" aria-label="Chiudi avviso">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notice-wrapper {
      position: relative;
      z-index: 990;
    }

    .notice-banner {
      padding: 0.75rem 0;
      color: #ffffff;
      font-size: 0.92rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);

      &.banner-info {
        background: linear-gradient(90deg, #0369a1, #075985);
      }

      &.banner-warning {
        background: linear-gradient(90deg, #d97706, #b45309);
      }

      &.banner-danger {
        background: linear-gradient(90deg, #dc2626, #991b1b);
      }

      .banner-inner {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .banner-icon {
        font-size: 1.25rem;
      }

      .banner-text {
        flex: 1;
        line-height: 1.4;

        strong {
          font-weight: 700;
          letter-spacing: 0.3px;
        }
      }

      .btn-close-banner {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.2rem 0.5rem;
        transition: color var(--transition-fast);

        &:hover {
          color: #ffffff;
        }
      }
    }
  `],
})
export class NoticeBannerComponent implements OnInit {
  private avvisoService = inject(AvvisoService);
  public activeNotices = signal<Avviso[]>([]);
  public isVisible = signal(true);

  ngOnInit(): void {
    this.avvisoService.getActiveAvvisi().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.activeNotices.set(res.data);
        }
      },
    });
  }

  dismiss(): void {
    this.isVisible.set(false);
  }
}
