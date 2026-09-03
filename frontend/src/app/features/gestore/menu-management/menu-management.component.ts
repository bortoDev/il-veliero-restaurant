import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuService } from '../../../core/services/menu.service';
import { MenuItem, MenuCategory } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AllergenBadgeComponent } from '../../../shared/components/allergen-badge/allergen-badge.component';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalComponent, AllergenBadgeComponent],
  template: `
    <div class="management-page">
      <div class="container">
        <div class="page-top-nav">
          <a routerLink="/gestore/dashboard" class="back-link">
            <i class="fa-solid fa-arrow-left"></i> Torna alla Dashboard
          </a>
        </div>

        <div class="management-header">
          <div>
            <h1>Gestione Menù</h1>
            <p>Aggiungi, modifica o elimina i piatti presenti nel menù del ristorante.</p>
          </div>
          <button (click)="openCreateModal()" class="btn btn-gold">
            <i class="fa-solid fa-plus"></i> Nuovo Piatto
          </button>
        </div>

        <!-- Success/Error Feedback -->
        <div *ngIf="feedbackMsg()" class="alert-box" [ngClass]="isErrorFeedback() ? 'alert-error' : 'alert-success'">
          <i class="fa-solid" [ngClass]="isErrorFeedback() ? 'fa-circle-xmark' : 'fa-circle-check'"></i>
          <span>{{ feedbackMsg() }}</span>
        </div>

        <!-- Dishes Table Card -->
        <div class="table-card card">
          <div class="table-filters">
            <input
              type="text"
              class="form-control table-search"
              placeholder="Filtra per nome o descrizione..."
              [(ngModel)]="searchFilter"
              (ngModelChange)="applyLocalFilter()"
            >
            <select class="form-control table-cat-select" [(ngModel)]="categoryFilter" (ngModelChange)="applyLocalFilter()">
              <option value="">Tutte le Categorie</option>
              <option value="pesce">Pesce</option>
              <option value="carne">Carne</option>
              <option value="pizze">Pizze</option>
              <option value="contorni">Contorni</option>
              <option value="vini">Vini</option>
            </select>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Piatto</th>
                  <th>Categoria</th>
                  <th>Prezzo</th>
                  <th>Allergeni</th>
                  <th>Disponibile</th>
                  <th>Specialità</th>
                  <th style="text-align: right;">Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let dish of filteredDishes()">
                  <td>
                    <strong>{{ dish.title }}</strong>
                    <p class="dish-sub-desc">{{ dish.description }}</p>
                  </td>
                  <td>
                    <span class="badge badge-info">{{ dish.category }}</span>
                    <span *ngIf="dish.subcategory" class="subcat-text">({{ dish.subcategory }})</span>
                  </td>
                  <td><strong>€ {{ dish.price.toFixed(2) }}</strong></td>
                  <td>
                    <div class="allergens-cell">
                      <app-allergen-badge *ngFor="let a of dish.allergens" [allergen]="a"></app-allergen-badge>
                    </div>
                  </td>
                  <td>
                    <button
                      (click)="toggleAvailability(dish)"
                      class="badge"
                      [ngClass]="dish.isAvailable ? 'badge-success' : 'badge-danger'"
                      style="cursor: pointer; border: none;"
                    >
                      {{ dish.isAvailable ? 'Sì' : 'No' }}
                    </button>
                  </td>
                  <td>
                    <span *ngIf="dish.isChefSpecial" class="badge badge-gold">Chef</span>
                  </td>
                  <td style="text-align: right;">
                    <div class="action-btns">
                      <button (click)="openEditModal(dish)" class="btn-action edit" title="Modifica">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button (click)="deleteDish(dish)" class="btn-action delete" title="Elimina">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Create / Edit Dish Modal -->
      <app-modal
        *ngIf="isModalOpen()"
        [title]="editingDishId() ? 'Modifica Piatto' : 'Nuovo Piatto in Menù'"
        (closed)="closeModal()"
      >
        <form (ngSubmit)="saveDish()">
          <div class="form-group">
            <label>Titolo Piatto *</label>
            <input type="text" class="form-control" [(ngModel)]="formData.title" name="title" required placeholder="Spaghetti alle Vongole">
          </div>

          <div class="form-group">
            <label>Descrizione *</label>
            <textarea class="form-control" [(ngModel)]="formData.description" name="description" rows="3" required placeholder="Ingredienti, preparazione e provenienza..."></textarea>
          </div>

          <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Prezzo (€) *</label>
              <input type="number" step="0.5" class="form-control" [(ngModel)]="formData.price" name="price" min="0" required>
            </div>
            <div class="form-group">
              <label>Categoria *</label>
              <select class="form-control" [(ngModel)]="formData.category" name="category" required>
                <option value="pesce">Pesce</option>
                <option value="carne">Carne</option>
                <option value="pizze">Pizze</option>
                <option value="contorni">Contorni</option>
                <option value="vini">Vini</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Sottocategoria (es. antipasti, primi, secondi, crudo, dolci)</label>
            <input type="text" class="form-control" [(ngModel)]="formData.subcategory" name="subcategory" placeholder="primi">
          </div>

          <div class="form-group">
            <label>URL Immagine</label>
            <input type="text" class="form-control" [(ngModel)]="formData.image" name="image" placeholder="/uploads/dishes/dish.jpg">
          </div>

          <div class="form-group">
            <label>Allergeni (seleziona tutti quelli presenti)</label>
            <div class="allergen-selection-grid">
              <label *ngFor="let a of availableAllergens" class="allergen-label">
                <input
                  type="checkbox"
                  [checked]="isAllergenSelected(a.key)"
                  (change)="toggleAllergen(a.key)"
                >
                <span>{{ a.label }}</span>
              </label>
            </div>
          </div>

          <div class="form-row" style="display: flex; gap: 2rem; margin: 1.5rem 0;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" [(ngModel)]="formData.isAvailable" name="isAvailable">
              <strong>Disponibile per l'ordine</strong>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" [(ngModel)]="formData.isChefSpecial" name="isChefSpecial">
              <strong>Specialità dello Chef</strong>
            </label>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" (click)="closeModal()" class="btn btn-outline btn-sm">Annulla</button>
            <button type="submit" class="btn btn-gold btn-sm" [disabled]="!formData.title || !formData.description || formData.price === undefined">
              {{ editingDishId() ? 'Salva Modifiche' : 'Crea Piatto' }}
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
  styles: [`
    .management-page {
      padding: 2.5rem 0 5rem;
      background: var(--color-bg-main);
      min-height: 80vh;
    }

    .page-top-nav {
      margin-bottom: 1.5rem;

      .back-link {
        color: var(--color-navy-medium);
        font-weight: 600;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;

        &:hover {
          color: var(--color-gold-dark);
        }
      }
    }

    .management-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 2rem;

      h1 {
        font-size: 2.2rem;
        color: var(--color-navy-dark);
        margin-bottom: 0.25rem;
      }

      p {
        color: var(--color-text-muted);
        margin-bottom: 0;
      }
    }

    .alert-box {
      padding: 0.85rem 1.25rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.92rem;

      &.alert-success { background: rgba(42, 157, 143, 0.15); color: var(--color-success); }
      &.alert-error { background: rgba(217, 4, 41, 0.15); color: var(--color-danger); }
    }

    .table-card {
      padding: 1.5rem;

      .table-filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;

        .table-search { max-width: 320px; }
        .table-cat-select { max-width: 220px; }
      }

      .table-responsive {
        overflow-x: auto;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.92rem;

        th {
          background: var(--color-seafoam);
          color: var(--color-navy-dark);
          font-family: var(--font-body);
          font-weight: 700;
          padding: 0.85rem 1rem;
          border-bottom: 2px solid var(--color-border);
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid var(--color-border);
          vertical-align: middle;

          .dish-sub-desc {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            margin-bottom: 0;
            max-width: 300px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .subcat-text {
            font-size: 0.75rem;
            color: var(--color-text-light);
            margin-left: 0.25rem;
          }

          .allergens-cell {
            display: flex;
            flex-wrap: wrap;
            gap: 0.25rem;
            max-width: 180px;
          }

          .action-btns {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;

            .btn-action {
              background: transparent;
              border: 1px solid var(--color-border);
              border-radius: 4px;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all var(--transition-fast);

              &.edit {
                color: var(--color-navy-medium);
                &:hover { background: var(--color-navy-medium); color: #fff; }
              }

              &.delete {
                color: var(--color-danger);
                &:hover { background: var(--color-danger); color: #fff; }
              }
            }
          }
        }
      }
    }

    .allergen-selection-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.5rem;
      background: var(--color-seafoam);
      padding: 0.75rem;
      border-radius: 6px;
      max-height: 150px;
      overflow-y: auto;

      .allergen-label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        cursor: pointer;
      }
    }
  `],
})
export class MenuManagementComponent implements OnInit {
  private menuService = inject(MenuService);

  public dishes = signal<MenuItem[]>([]);
  public filteredDishes = signal<MenuItem[]>([]);
  public searchFilter: string = '';
  public categoryFilter: string = '';

  public isModalOpen = signal<boolean>(false);
  public editingDishId = signal<string | null>(null);
  public feedbackMsg = signal<string>('');
  public isErrorFeedback = signal<boolean>(false);

  public formData: Partial<MenuItem> = {
    title: '',
    description: '',
    price: 0,
    category: 'pesce',
    subcategory: '',
    allergens: [],
    image: '',
    isAvailable: true,
    isChefSpecial: false,
  };

  public availableAllergens = [
    { key: 'glutine', label: 'Glutine' },
    { key: 'crostacei', label: 'Crostacei' },
    { key: 'uova', label: 'Uova' },
    { key: 'pesce', label: 'Pesce' },
    { key: 'arachidi', label: 'Arachidi' },
    { key: 'soia', label: 'Soia' },
    { key: 'latte', label: 'Latte' },
    { key: 'frutta_a_guscio', label: 'Frutta a Guscio' },
    { key: 'sedano', label: 'Sedano' },
    { key: 'senape', label: 'Senape' },
    { key: 'semi_di_sesamo', label: 'Sesamo' },
    { key: 'anidride_solforosa', label: 'Solfiti' },
    { key: 'lupini', label: 'Lupini' },
    { key: 'molluschi', label: 'Molluschi' },
  ];

  ngOnInit(): void {
    this.loadDishes();
  }

  loadDishes(): void {
    this.menuService.getMenuItems().subscribe({
      next: (res) => {
        if (res.success) {
          this.dishes.set(res.data);
          this.applyLocalFilter();
        }
      },
    });
  }

  applyLocalFilter(): void {
    let list = this.dishes();
    if (this.categoryFilter) {
      list = list.filter((d) => d.category === this.categoryFilter);
    }
    if (this.searchFilter.trim()) {
      const q = this.searchFilter.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }
    this.filteredDishes.set(list);
  }

  openCreateModal(): void {
    this.editingDishId.set(null);
    this.formData = {
      title: '',
      description: '',
      price: 15.0,
      category: 'pesce',
      subcategory: 'primi',
      allergens: [],
      image: '',
      isAvailable: true,
      isChefSpecial: false,
    };
    this.isModalOpen.set(true);
  }

  openEditModal(dish: MenuItem): void {
    this.editingDishId.set(dish.id || dish._id || null);
    this.formData = {
      title: dish.title,
      description: dish.description,
      price: dish.price,
      category: dish.category,
      subcategory: dish.subcategory,
      allergens: [...dish.allergens],
      image: dish.image,
      isAvailable: dish.isAvailable,
      isChefSpecial: dish.isChefSpecial,
    };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  isAllergenSelected(key: string): boolean {
    return this.formData.allergens?.includes(key) || false;
  }

  toggleAllergen(key: string): void {
    const list = this.formData.allergens || [];
    if (list.includes(key)) {
      this.formData.allergens = list.filter((a) => a !== key);
    } else {
      this.formData.allergens = [...list, key];
    }
  }

  saveDish(): void {
    const id = this.editingDishId();
    if (id) {
      this.menuService.updateMenuItem(id, this.formData).subscribe({
        next: () => {
          this.setFeedback('Piatto aggiornato con successo.');
          this.closeModal();
          this.loadDishes();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    } else {
      this.menuService.createMenuItem(this.formData).subscribe({
        next: () => {
          this.setFeedback('Nuovo piatto aggiunto con successo.');
          this.closeModal();
          this.loadDishes();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    }
  }

  toggleAvailability(dish: MenuItem): void {
    const id = dish.id || dish._id;
    if (!id) return;

    this.menuService.updateMenuItem(id, { isAvailable: !dish.isAvailable }).subscribe({
      next: () => {
        this.loadDishes();
      },
    });
  }

  deleteDish(dish: MenuItem): void {
    const id = dish.id || dish._id;
    if (!id) return;

    if (confirm(`Sei sicuro di voler eliminare "${dish.title}" dal menù?`)) {
      this.menuService.deleteMenuItem(id).subscribe({
        next: () => {
          this.setFeedback('Piatto rimosso con successo.');
          this.loadDishes();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    }
  }

  private setFeedback(msg: string, isError = false): void {
    this.feedbackMsg.set(msg);
    this.isErrorFeedback.set(isError);
    setTimeout(() => this.feedbackMsg.set(''), 4000);
  }
}
