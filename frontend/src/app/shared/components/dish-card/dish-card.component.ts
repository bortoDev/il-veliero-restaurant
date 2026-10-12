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
      [class.compact]="!isExpanded"
      [class.expanded]="isExpanded"
    >
      <div class="item-header">
        <div class="item-title-col">
          <h3 class="item-title">{{ dish.title }}</h3>
        </div>
        <span class="dot-leader" aria-hidden="true"></span>
        <div class="item-price">€ {{ dish.price.toFixed(2) }}</div>
      </div>

      <div class="item-body-drawer" [class.open]="isExpanded">
        <div class="drawer-inner">
          <p class="item-desc" *ngIf="dish.description">{{ dish.description }}</p>

          <div class="item-footer">
            <div class="allergens-chips" *ngIf="dish.allergens && dish.allergens.length > 0">
              <app-allergen-badge *ngFor="let a of dish.allergens" [allergen]="a"></app-allergen-badge>
            </div>

            <span *ngIf="!dish.isAvailable" class="unavailable-tag">
              <i class="fa-solid fa-clock-rotate-left"></i> Esaurito per oggi
            </span>
          </div>
        </div>
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
      background: transparent;
      transition: padding 0.25s ease;

      &.compact {
        padding: 0.6rem 0;
        cursor: pointer;

        .item-header {
          margin-bottom: 0;
        }
      }

      &.expanded {
        padding: 1.15rem 0;
      }

      &.unavailable {
        opacity: 0.6;
      }

      .item-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.35rem;
        transition: margin-bottom 0.25s ease;

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
            transition: color 0.2s ease, font-size 0.2s ease;
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
          transition: font-size 0.2s ease;
        }
      }

      .item-body-drawer {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
        opacity: 0;
        overflow: hidden;

        &.open {
          grid-template-rows: 1fr;
          opacity: 1;
        }

        .drawer-inner {
          min-height: 0;
          overflow: hidden;
          padding-top: 0.35rem;
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

        .allergens-chips {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
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
  @Input() isExpanded: boolean = true;
}
