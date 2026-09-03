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
            <span>IL VELIERO — Menù Tavolo</span>
          </div>
          <a routerLink="/menu" class="btn-desktop-view">Versione Completa</a>
        </div>

        <!-- Sticky Quick Category Bar -->
        <div class="quick-category-scroll">
          <button
            class="pill-btn"
            [class.active]="activeCategory() === ''"
            (click)="selectCategory('')"
          >
            Tutti
          </button>
          <button
            class="pill-btn"
            [class.active]="activeCategory() === 'pesce'"
            (click)="selectCategory('pesce')"
          >
            Pesce
          </button>
          <button
            class="pill-btn"
            [class.active]="activeCategory() === 'pizze'"
            (click)="selectCategory('pizze')"
          >
            Pizze
          </button>
          <button
            class="pill-btn"
            [class.active]="activeCategory() === 'insalatone'"
            (click)="selectCategory('insalatone')"
          >
            Insalatone
          </button>
          <button
            class="pill-btn"
            [class.active]="activeCategory() === 'piatti_estivi'"
            (click)="selectCategory('piatti_estivi')"
          >
            Piatti Estivi
          </button>
          <button
            class="pill-btn"
            [class.active]="activeCategory() === 'carne'"
            (click)="selectCategory('carne')"
          >
            Carne
          </button>
          <button
            class="pill-btn"
            [class.active]="activeCategory() === 'contorni'"
            (click)="selectCategory('contorni')"
          >
            Contorni
          </button>
          <button
            class="pill-btn"
            [class.active]="activeCategory() === 'vini'"
            (click)="selectCategory('vini')"
          >
            Vini
          </button>
          <button
            class="pill-btn"
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
                <span *ngIf="dish.isChefSpecial" class="badge-chef"><i class="fa-solid fa-star"></i> Chef</span>
              </div>
              <p class="qr-dish-desc">{{ dish.description }}</p>
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
      background: #f8fafc;
      min-height: 100vh;
      padding-bottom: 4rem;
    }

    .qr-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--color-navy-dark);
      color: #ffffff;
      padding: 0.75rem 1rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);

      .qr-header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;

        .qr-brand {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--color-gold);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-desktop-view {
          font-size: 0.75rem;
          color: var(--color-seafoam);
          text-decoration: underline;
        }
      }

      .quick-category-scroll {
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
        padding-bottom: 0.5rem;
        scrollbar-width: none;
        &::-webkit-scrollbar { display: none; }

        .pill-btn {
          white-space: nowrap;
          padding: 0.4rem 0.9rem;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.08);
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;

          &.active {
            background: var(--color-gold);
            color: var(--color-navy-dark);
            border-color: var(--color-gold);
          }
        }
      }

      .quick-search {
        margin-top: 0.5rem;

        input {
          width: 100%;
          padding: 0.5rem 0.85rem;
          border-radius: 6px;
          border: 1px solid var(--color-border);
          font-size: 0.85rem;
          outline: none;
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
        color: var(--color-text-muted);
      }

      .qr-dish-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .qr-dish-item {
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid var(--color-border);
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
              gap: 0.5rem;
              margin-bottom: 0.35rem;

              .qr-dish-name {
                font-size: 1.05rem;
                font-weight: 700;
                color: var(--color-navy-dark);
              }

              .badge-chef {
                font-size: 0.65rem;
                font-weight: 700;
                color: var(--color-gold-dark);
                background: rgba(221, 161, 94, 0.2);
                padding: 0.15rem 0.4rem;
                border-radius: 10px;
                text-transform: uppercase;
              }
            }

            .qr-dish-desc {
              font-size: 0.82rem;
              color: var(--color-text-muted);
              line-height: 1.4;
              margin-bottom: 0.5rem;
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
              font-family: var(--font-heading);
              font-size: 1.15rem;
              font-weight: 700;
              color: var(--color-navy-medium);
            }

            .qr-out-tag {
              font-size: 0.65rem;
              color: var(--color-danger);
              font-weight: 600;
              margin-top: 0.25rem;
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
    this.menuService.getMenuItems().subscribe({
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
          d.description.toLowerCase().includes(q)
      );
    }

    this.filteredDishes.set(result);
  }
}
