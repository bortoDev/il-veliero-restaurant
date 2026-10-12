import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuService } from '../../../core/services/menu.service';
import { MenuItem } from '../../../core/models';
import { AllergenBadgeComponent } from '../../../shared/components/allergen-badge/allergen-badge.component';

@Component({
  selector: 'app-qr-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AllergenBadgeComponent],
  template: `
    <div class="qr-menu-page">
      <!-- Sticky Quick Header -->
      <div class="qr-header">
        <div class="qr-header-top">
          <div class="qr-brand">
            <i class="fa-solid fa-anchor"></i>
            <span>IL VELIERO: Menù Digitale</span>
          </div>
          <a routerLink="/menu" class="btn-desktop-view">Versione Completa</a>
        </div>

        <!-- Category Bar (No Pills) -->
        <div class="quick-category-scroll">
          <button
            class="category-btn"
            [class.active]="activeCategory() === ''"
            (click)="selectCategory('')"
          >
            Tutti
          </button>
          <button
            class="category-btn"
            [class.active]="activeCategory() === 'pesce'"
            (click)="selectCategory('pesce')"
          >
            Pesce
          </button>
          <button
            class="category-btn"
            [class.active]="activeCategory() === 'pizze'"
            (click)="selectCategory('pizze')"
          >
            Pizze
          </button>
          <button
            class="category-btn"
            [class.active]="activeCategory() === 'insalatone'"
            (click)="selectCategory('insalatone')"
          >
            Insalatone
          </button>
          <button
            class="category-btn"
            [class.active]="activeCategory() === 'piatti_estivi'"
            (click)="selectCategory('piatti_estivi')"
          >
            Piatti Estivi
          </button>
          <button
            class="category-btn"
            [class.active]="activeCategory() === 'carne'"
            (click)="selectCategory('carne')"
          >
            Carne
          </button>
          <button
            class="category-btn"
            [class.active]="activeCategory() === 'contorni'"
            (click)="selectCategory('contorni')"
          >
            Contorni
          </button>
          <button
            class="category-btn"
            [class.active]="activeCategory() === 'vini'"
            (click)="selectCategory('vini')"
          >
            Vini
          </button>
          <button
            class="category-btn"
            [class.active]="activeCategory() === 'bevande'"
            (click)="selectCategory('bevande')"
          >
            Bevande & Bar
          </button>
        </div>

        <!-- Search Bar -->
        <div class="quick-search">
          <input
            type="text"
            placeholder="Cerca piatto rapido..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
          >
        </div>
      </div>

      <div class="qr-body container">
        <div *ngIf="isLoading()" class="qr-loading">
          <i class="fa-solid fa-spinner fa-spin"></i> Caricamento menù digitale...
        </div>

        <div *ngIf="!isLoading() && filteredDishes().length === 0" class="qr-empty">
          <p>Nessun piatto trovato.</p>
        </div>

        <div *ngIf="!isLoading()" class="qr-dish-list">
          <div
            *ngFor="let dish of filteredDishes()"
            class="qr-dish-item"
            [class.out-of-stock]="!dish.isAvailable"
          >
            <div class="qr-dish-info">
              <div class="qr-dish-headline">
                <h4 class="qr-dish-name">{{ dish.title }}</h4>
              </div>
              <p class="qr-dish-desc" *ngIf="dish.description">{{ dish.description }}</p>
              <div class="qr-allergens-wrap" *ngIf="dish.allergens && dish.allergens.length > 0">
                <app-allergen-badge *ngFor="let a of dish.allergens" [allergen]="a"></app-allergen-badge>
              </div>
            </div>
            <div class="qr-dish-side">
              <span class="qr-dish-price">€ {{ dish.price.toFixed(2) }}</span>
              <span *ngIf="!dish.isAvailable" class="qr-out-tag">Esaurito</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .qr-menu-page {
      background: var(--bg-primary, #FAF7F2);
      min-height: 100vh;
      padding-bottom: 4rem;
    }

    .qr-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--bg-navy-dark, #0B2545);
      color: #ffffff;
      padding: 0.75rem 1rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);

      .qr-header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.65rem;

        .qr-brand {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--color-accent-light, #BDE0FE);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-desktop-view {
          font-size: 0.75rem;
          color: var(--text-inverse-muted, #DDD3C4);
          text-decoration: underline;
        }
      }

      .quick-category-scroll {
        display: flex;
        gap: 0.4rem;
        overflow-x: auto;
        padding-bottom: 0.4rem;
        scrollbar-width: none;
        &::-webkit-scrollbar { display: none; }

        .category-btn {
          white-space: nowrap;
          padding: 0.35rem 0.75rem;
          border-radius: 3px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.08);
          color: #ffffff;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);

          &.active {
            background: var(--color-accent, #0096C7);
            color: #ffffff;
            border-color: var(--color-accent, #0096C7);
          }
        }
      }

      .quick-search {
        margin-top: 0.4rem;

        input {
          width: 100%;
          padding: 0.5rem 0.85rem;
          border-radius: 3px;
          border: 1px solid var(--border-subtle, #E5DDD0);
          font-size: 0.85rem;
          outline: none;
          background: #FFFFFF;
          color: var(--text-primary, #1C1917);
        }
      }
    }

    .qr-body {
      padding: 1rem;
      max-width: 720px;
      margin: 0 auto;

      .qr-loading, .qr-empty {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-muted, #78716C);
      }

      .qr-dish-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .qr-dish-item {
          background: #ffffff;
          border-radius: 4px;
          border: 1px solid var(--border-subtle, #E5DDD0);
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          gap: 1rem;

          &.out-of-stock {
            opacity: 0.6;
          }

          .qr-dish-info {
            flex: 1;

            .qr-dish-headline {
              display: flex;
              align-items: center;
              gap: 0.45rem;
              margin-bottom: 0.25rem;

              .qr-dish-name {
                font-family: var(--font-serif-primary);
                font-size: 1.15rem;
                font-weight: 700;
                color: var(--text-primary, #1C1917);
              }
            }

            .qr-dish-desc {
              font-family: var(--font-serif-primary);
              font-style: italic;
              font-size: 0.88rem;
              color: var(--text-secondary, #292524);
              line-height: 1.4;
              margin-bottom: 0.4rem;
            }

            .qr-allergens-wrap {
              display: flex;
              flex-wrap: wrap;
              gap: 0.25rem;
            }
          }

          .qr-dish-side {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: flex-start;
            min-width: 65px;

            .qr-dish-price {
              font-family: var(--font-serif-display);
              font-size: 1.15rem;
              font-weight: 700;
              color: var(--color-accent-hover, #0077B6);
            }

            .qr-out-tag {
              font-size: 0.68rem;
              color: var(--status-danger, #B91C1C);
              font-weight: 600;
              margin-top: 0.2rem;
            }
          }
        }
      }
    }
  `],
})
export class QrMenuComponent implements OnInit {
  private menuService = inject(MenuService);

  public dishes = signal<MenuItem[]>([]);
  public activeCategory = signal<string>('');
  public searchQuery: string = '';
  public isLoading = signal<boolean>(true);

  public filteredDishes = signal<MenuItem[]>([]);

  ngOnInit(): void {
    this.menuService.getMenuItems({ available: true }).subscribe({
      next: (res) => {
        if (res.success) {
          this.dishes.set(res.data);
          this.applyFilters();
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  selectCategory(cat: string): void {
    this.activeCategory.set(cat);
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = this.dishes();

    if (this.activeCategory()) {
      result = result.filter((d) => d.category === this.activeCategory());
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q))
      );
    }

    this.filteredDishes.set(result);
  }
}
