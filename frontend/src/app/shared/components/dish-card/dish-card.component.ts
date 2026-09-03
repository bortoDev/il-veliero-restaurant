import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../../core/models';
import { AllergenBadgeComponent } from '../allergen-badge/allergen-badge.component';

@Component({
  selector: 'app-dish-card',
  standalone: true,
  imports: [CommonModule, AllergenBadgeComponent],
  template: `
    <article
      class="dishoom-item"
      [class.unavailable]="!dish.isAvailable"
    >
      <div class="item-header">
        <div class="item-title-col">
          <h3 class="item-title">{{ dish.title }}</h3>
          <span *ngIf="dish.isChefSpecial" class="special-badge">
            <i class="fa-solid fa-trophy"></i> Campione del Mondo
          </span>
        </div>
        <span class="dot-leader" aria-hidden="true"></span>
        <div class="item-price">€ {{ dish.price.toFixed(2) }}</div>
      </div>

      <p class="item-desc">{{ dish.description }}</p>

      <div class="item-footer">
        <div class="allergens-wrap" *ngIf="dish.allergens && dish.allergens.length > 0">
          <span class="allergens-label">Allergeni:</span>
          <div class="allergens-chips">
            <app-allergen-badge *ngFor="let a of dish.allergens" [allergen]="a"></app-allergen-badge>
          </div>
        </div>

        <span *ngIf="!dish.isAvailable" class="unavailable-tag">
          <i class="fa-solid fa-clock-rotate-left"></i> Esaurito per oggi
        </span>
      </div>
    </article>
  `,
  styles: [`
    :host {
      display: block;
    }

    .dishoom-item {
      padding: 1.15rem 0;
      border-bottom: 1px dashed var(--dishoom-border-sand, #E5DDD0);
      transition: background 0.2s ease;
      background: transparent;

      &.unavailable {
        opacity: 0.6;
      }

      .item-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.35rem;

        .item-title-col {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;

          .item-title {
            font-family: var(--font-serif-primary, 'Cormorant Garamond', Garamond, serif);
            font-size: 1.28rem;
            font-weight: 700;
            color: var(--dishoom-ink-charcoal, #1C1917);
            margin: 0;
            line-height: 1.25;
            letter-spacing: 0.015em;
          }

          .special-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            font-size: 0.68rem;
            font-weight: 700;
            font-family: var(--font-body-editorial, sans-serif);
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--dishoom-brass-dark, #945C22);
            background: rgba(197, 138, 62, 0.12);
            border: 1px solid rgba(197, 138, 62, 0.35);
            padding: 0.15rem 0.5rem;
            border-radius: 3px;
          }
        }

        .dot-leader {
          flex: 1;
          height: 1px;
          border-bottom: 1px dotted var(--dishoom-border-sand-dark, #D3C7B5);
          margin: 0 0.5rem;
          min-width: 24px;
        }

        .item-price {
          font-family: var(--font-serif-display, 'Playfair Display', Georgia, serif);
          font-size: 1.22rem;
          font-weight: 700;
          color: var(--dishoom-brass-dark, #945C22);
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
      }

      .item-desc {
        font-family: var(--font-serif-primary, 'Cormorant Garamond', Garamond, serif);
        font-style: italic;
        font-size: 1rem;
        line-height: 1.55;
        color: var(--dishoom-ink-espresso, #292524);
        margin: 0 0 0.5rem 0;
      }

      .item-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;

        .allergens-wrap {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;

          .allergens-label {
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--dishoom-ink-muted, #78716C);
            font-weight: 600;
          }

          .allergens-chips {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            flex-wrap: wrap;
          }
        }

        .unavailable-tag {
          font-size: 0.75rem;
          color: var(--dishoom-status-danger, #B91C1C);
          font-style: italic;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
      }

      &:hover {
        .item-header .item-title {
          color: var(--dishoom-brass-dark, #945C22);
        }
      }
    }
  `],
})
export class DishCardComponent {
  @Input({ required: true }) dish!: MenuItem;
}
