import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonType = 'dish-list' | 'pescato-card' | 'event-card' | 'generic';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- 1. DISH LIST SKELETON (Dot-Leader Style) -->
    <div *ngIf="type === 'dish-list'" class="skeleton-dishes-wrapper" aria-hidden="true">
      <div *ngFor="let item of itemsArray" class="skeleton-dish-row">
        <div class="dish-header-row">
          <div class="skeleton-shimmer skeleton-dish-title"></div>
          <div class="skeleton-dot-leader"></div>
          <div class="skeleton-shimmer skeleton-dish-price"></div>
        </div>
        <div class="skeleton-shimmer skeleton-dish-desc"></div>
        <div class="dish-footer-row">
          <div class="skeleton-shimmer skeleton-chip"></div>
          <div class="skeleton-shimmer skeleton-chip"></div>
          <div class="skeleton-shimmer skeleton-chip"></div>
        </div>
      </div>
    </div>

    <!-- 2. PESCATO EDITORIAL POST SKELETON -->
    <div *ngIf="type === 'pescato-card'" class="skeleton-pescato-wrapper" aria-hidden="true">
      <div *ngFor="let item of itemsArray" class="skeleton-pescato-post">
        <div class="skeleton-date-divider">
          <div class="skeleton-divider-line"></div>
          <div class="skeleton-shimmer skeleton-date-chip"></div>
          <div class="skeleton-divider-line"></div>
        </div>
        <div class="skeleton-shimmer skeleton-post-title"></div>
        <div class="skeleton-shimmer skeleton-showcase-frame"></div>
        <div class="skeleton-post-text">
          <div class="skeleton-shimmer skeleton-text-line"></div>
          <div class="skeleton-shimmer skeleton-text-line"></div>
          <div class="skeleton-shimmer skeleton-text-line short"></div>
        </div>
        <div class="skeleton-marginal-actions">
          <div class="skeleton-shimmer skeleton-action-chip"></div>
          <div class="skeleton-shimmer skeleton-action-chip"></div>
        </div>
      </div>
    </div>

    <!-- 3. EVENT CARD SKELETON -->
    <div *ngIf="type === 'event-card'" class="skeleton-events-grid" aria-hidden="true">
      <div *ngFor="let item of itemsArray" class="skeleton-event-card card">
        <div class="skeleton-shimmer skeleton-event-media"></div>
        <div class="skeleton-event-body">
          <div class="skeleton-shimmer skeleton-event-date"></div>
          <div class="skeleton-shimmer skeleton-event-title"></div>
          <div class="skeleton-shimmer skeleton-event-desc"></div>
          <div class="skeleton-shimmer skeleton-event-desc short"></div>
          <div class="skeleton-shimmer skeleton-progress-box"></div>
          <div class="skeleton-event-footer">
            <div class="skeleton-shimmer skeleton-event-price"></div>
            <div class="skeleton-shimmer skeleton-btn-placeholder"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. GENERIC CARD SKELETON -->
    <div *ngIf="type === 'generic'" class="skeleton-generic-wrapper" aria-hidden="true">
      <div *ngFor="let item of itemsArray" class="skeleton-generic-card card">
        <div class="skeleton-shimmer skeleton-card-title"></div>
        <div class="skeleton-shimmer skeleton-desc-line"></div>
        <div class="skeleton-shimmer skeleton-desc-line short"></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    /* Dish List Skeleton */
    .skeleton-dishes-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      width: 100%;
    }

    .skeleton-dish-row {
      padding: 1.25rem 0;
      border-bottom: 1px dashed var(--border-subtle, #E5DDD0);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;

      .dish-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;

        .skeleton-dish-title {
          width: 38%;
          max-width: 260px;
          height: 22px;
        }

        .skeleton-dot-leader {
          flex: 1;
          height: 1px;
          border-bottom: 1px dotted var(--border-medium, #D3C7B5);
          margin: 0 0.5rem;
          opacity: 0.6;
        }

        .skeleton-dish-price {
          width: 65px;
          height: 22px;
        }
      }

      .skeleton-dish-desc {
        width: 75%;
        max-width: 520px;
        height: 14px;
      }

      .dish-footer-row {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.25rem;

        .skeleton-chip {
          width: 55px;
          height: 18px;
          border-radius: 2px;
        }
      }
    }

    /* Pescato Editorial Post Skeleton */
    .skeleton-pescato-wrapper {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
      max-width: 680px;
      margin: 0 auto;
      width: 100%;
    }

    .skeleton-pescato-post {
      display: flex;
      flex-direction: column;
      width: 100%;

      &:first-child .skeleton-date-divider {
        margin-top: 0.5rem;
      }

      .skeleton-date-divider {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        margin: 2.25rem 0 1.25rem;

        .skeleton-divider-line {
          flex: 1;
          height: 1px;
          background: var(--border-subtle, #E2E8F0);
          opacity: 0.6;
        }

        .skeleton-date-chip {
          width: 160px;
          height: 14px;
          border-radius: 2px;
        }
      }

      .skeleton-post-title {
        width: 60%;
        max-width: 360px;
        height: 28px;
        margin-bottom: 1rem;
        border-radius: 3px;
      }

      .skeleton-showcase-frame {
        width: 100%;
        height: 260px;
        border-radius: 4px;
        margin-bottom: 1.25rem;
      }

      .skeleton-post-text {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        margin-top: 1rem;
        margin-bottom: 0.85rem;

        .skeleton-text-line {
          width: 95%;
          height: 16px;

          &.short {
            width: 50%;
          }
        }
      }

      .skeleton-marginal-actions {
        display: flex;
        gap: 1rem;
        margin-top: 0.75rem;
        padding-top: 0;
        border-top: none;

        .skeleton-action-chip {
          width: 110px;
          height: 18px;
          border-radius: 3px;
        }
      }
    }

    /* Events Grid Skeleton */
    .skeleton-events-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 2.5rem;
      width: 100%;
    }

    .skeleton-event-card {
      padding: 0;
      overflow: hidden;
      border-radius: 4px;

      .skeleton-event-media {
        height: 210px;
        width: 100%;
      }

      .skeleton-event-body {
        padding: 1.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .skeleton-event-date {
          width: 140px;
          height: 14px;
        }

        .skeleton-event-title {
          width: 80%;
          height: 24px;
        }

        .skeleton-event-desc {
          width: 95%;
          height: 14px;

          &.short {
            width: 65%;
          }
        }

        .skeleton-progress-box {
          width: 100%;
          height: 30px;
          border-radius: 3px;
        }

        .skeleton-event-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-subtle, #E5DDD0);

          .skeleton-event-price {
            width: 90px;
            height: 26px;
          }

          .skeleton-btn-placeholder {
            width: 120px;
            height: 34px;
            border-radius: 3px;
          }
        }
      }
    }

    @media (max-width: 900px) {
      .skeleton-pescato-post .skeleton-showcase-frame {
        height: 200px;
      }

      .skeleton-pescato-card .pescato-body-layout {
        grid-template-columns: 1fr;

        .skeleton-media-box {
          height: 200px;
        }
      }
    }
  `],
})
export class SkeletonLoaderComponent {
  @Input() type: SkeletonType = 'dish-list';
  @Input() set count(val: number) {
    this.itemsArray = Array.from({ length: val || 4 }, (_, i) => i);
  }

  public itemsArray: number[] = [0, 1, 2, 3];
}
