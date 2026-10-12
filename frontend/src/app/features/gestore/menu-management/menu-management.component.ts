import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuService } from '../../../core/services/menu.service';
import { MenuCategory, MenuItem } from '../../../core/models';
import { BoIconComponent } from '../shared/bo-icon.component';
import { BoSheetComponent } from '../shared/bo-sheet.component';
import { PhotoPickerComponent } from '../shared/photo-picker.component';
import { entityId } from '../shared/bo-utils';

const CATEGORIES: { key: MenuCategory; label: string }[] = [
  { key: 'pesce', label: 'Pesce' },
  { key: 'pizze', label: 'Pizze' },
  { key: 'insalatone', label: 'Insalatone' },
  { key: 'piatti_estivi', label: 'Piatti estivi' },
  { key: 'carne', label: 'Carne' },
  { key: 'contorni', label: 'Contorni' },
  { key: 'vini', label: 'Vini' },
  { key: 'bevande', label: 'Bevande' },
];

/** Sottocategorie usate dalla pagina pubblica del menù (stesse chiavi del database). */
const SUBCATEGORIES: Record<MenuCategory, { key: string; label: string }[]> = {
  pesce: [
    { key: 'antipasti', label: 'Antipasti' },
    { key: 'crudo', label: 'Crudo' },
    { key: 'pescato_della_settimana', label: 'Pescato della settimana' },
    { key: 'primi', label: 'Primi' },
    { key: 'secondi', label: 'Secondi' },
  ],
  pizze: [
    { key: 'stagionali', label: 'Di stagione' },
    { key: 'classiche', label: 'Classiche' },
    { key: 'della_casa', label: 'Della casa' },
    { key: 'speciali', label: 'Speciali' },
    { key: 'bianche', label: 'Bianche' },
    { key: 'vegetariane', label: 'Verdure' },
  ],
  insalatone: [{ key: 'insalatone', label: 'Insalatone' }],
  piatti_estivi: [{ key: 'piatti_estivi', label: 'Piatti estivi' }],
  carne: [
    { key: 'antipasti', label: 'Antipasti' },
    { key: 'primi', label: 'Primi' },
    { key: 'secondi', label: 'Secondi' },
  ],
  contorni: [
    { key: 'contorni', label: 'Contorni' },
    { key: 'coperto', label: 'Coperto' },
  ],
  vini: [
    { key: 'bollicine_charmat', label: 'Bollicine Charmat' },
    { key: 'bollicine_metodo_classico', label: 'Metodo classico' },
    { key: 'bianchi', label: 'Bianchi' },
    { key: 'rossi', label: 'Rossi' },
    { key: 'rosati', label: 'Rosati' },
  ],
  bevande: [
    { key: 'caffetteria', label: 'Caffetteria' },
    { key: 'bibite', label: 'Bibite' },
    { key: 'birre', label: 'Birre' },
    { key: 'vino_sfuso', label: 'Vino della casa' },
    { key: 'amari', label: 'Amari' },
    { key: 'grappe', label: 'Grappe' },
  ],
};

/** Tabella allergeni ufficiale 1–14, con le chiavi usate dal database. */
const ALLERGENS: { n: number; slug: string; label: string }[] = [
  { n: 1, slug: 'pesce', label: 'Pesce' },
  { n: 2, slug: 'crostacei', label: 'Crostacei' },
  { n: 3, slug: 'molluschi', label: 'Molluschi' },
  { n: 4, slug: 'glutine', label: 'Glutine' },
  { n: 5, slug: 'uova', label: 'Uova' },
  { n: 6, slug: 'latte', label: 'Latte' },
  { n: 7, slug: 'sedano', label: 'Sedano' },
  { n: 8, slug: 'senape', label: 'Senape' },
  { n: 9, slug: 'semi_di_sesamo', label: 'Sesamo' },
  { n: 10, slug: 'frutta_a_guscio', label: 'Frutta a guscio' },
  { n: 11, slug: 'arachidi', label: 'Arachidi' },
  { n: 12, slug: 'anidride_solforosa', label: 'Solfiti' },
  { n: 13, slug: 'lupini', label: 'Lupini' },
  { n: 14, slug: 'soia', label: 'Soia' },
];

interface DishForm {
  title: string;
  description: string;
  price: number | null;
  category: MenuCategory;
  subcategory: string;
  allergenNumbers: number[];
  isAvailable: boolean;
  isChefSpecial: boolean;
  images: string[];
}

interface DishGroup {
  label: string;
  dishes: MenuItem[];
}

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BoIconComponent, BoSheetComponent, PhotoPickerComponent],
  template: `
    <div class="bo-page">
      <header class="bo-header">
        <div>
          <h1>Menù</h1>
          <p>Prezzi, descrizioni, allergeni e disponibilità. Se un piatto finisce, spegnilo: sparisce subito dal sito.</p>
        </div>
        <button type="button" class="bo-btn primary" (click)="openCreate()">
          <bo-icon name="plus"></bo-icon> Nuova voce
        </button>
      </header>

      <div class="bo-tabs" role="tablist">
        <button
          type="button"
          *ngFor="let c of categories"
          role="tab"
          [class.active]="activeCategory() === c.key"
          [attr.aria-selected]="activeCategory() === c.key"
          (click)="activeCategory.set(c.key)"
        >
          {{ c.label }}<span class="count">{{ countFor(c.key) }}</span>
        </button>
      </div>

      <input class="bo-search" type="search" placeholder="Cerca in tutto il menù…" [ngModel]="query()" (ngModelChange)="query.set($event)" />

      <ng-container *ngFor="let group of groups()">
        <h2 class="bo-section-label">{{ group.label }}</h2>
        <section class="bo-panel">
          <ul class="bo-list">
            <li class="bo-row dish-row" *ngFor="let dish of group.dishes" [class.is-muted]="!dish.isAvailable">
              <div class="bo-row-main">
                <div class="bo-row-title">
                  {{ dish.title }}
                  <span class="bo-chip info" *ngIf="dish.isChefSpecial">Consigliato</span>
                </div>
                <div class="bo-row-sub">
                  <span class="allergen-nums" *ngIf="dish.allergenNumbers?.length">Allergeni {{ dish.allergenNumbers!.join(', ') }} · </span>{{ dish.description }}
                </div>
              </div>
              <span class="price">{{ dish.price | currency:'EUR':'symbol':'1.2-2':'it' }}</span>
              <div class="bo-row-actions">
                <label class="bo-switch" [title]="dish.isAvailable ? 'Disponibile' : 'Non disponibile'">
                  <input type="checkbox" [checked]="dish.isAvailable" (change)="toggleAvailability(dish)" [attr.aria-label]="'Disponibilità ' + dish.title" />
                  <span class="track"></span>
                </label>
                <button type="button" class="bo-btn small" (click)="openEdit(dish)">
                  <bo-icon name="edit" [size]="16"></bo-icon> Modifica
                </button>
              </div>
            </li>
          </ul>
        </section>
      </ng-container>

      <div class="bo-empty" *ngIf="groups().length === 0 && !isLoading()">
        <strong>Nessuna voce trovata</strong>
        <p>Prova con un'altra parola o un'altra categoria.</p>
      </div>
    </div>

    <bo-sheet *ngIf="isEditorOpen()" [title]="editingId() ? 'Modifica voce' : 'Nuova voce di menù'" (closed)="closeEditor()">
      <form class="bo-form" id="dish-form" (ngSubmit)="save()">
        <div class="bo-field">
          <label for="d-title">Nome</label>
          <input id="d-title" name="title" [(ngModel)]="form.title" required placeholder="Es. Spaghetti con vongole veraci" />
        </div>

        <div class="bo-field">
          <label for="d-desc">Descrizione</label>
          <textarea id="d-desc" name="description" rows="3" [(ngModel)]="form.description" required></textarea>
        </div>

        <div class="bo-grid-3">
          <div class="bo-field">
            <label for="d-price">Prezzo (€)</label>
            <input id="d-price" name="price" type="number" min="0" step="0.5" inputmode="decimal" [(ngModel)]="form.price" required />
          </div>
          <div class="bo-field">
            <label for="d-cat">Categoria</label>
            <select id="d-cat" name="category" [(ngModel)]="form.category" (ngModelChange)="onCategoryChange()">
              <option *ngFor="let c of categories" [value]="c.key">{{ c.label }}</option>
            </select>
          </div>
          <div class="bo-field">
            <label for="d-sub">Sezione</label>
            <select id="d-sub" name="subcategory" [(ngModel)]="form.subcategory">
              <option *ngFor="let s of subcategoriesFor(form.category)" [value]="s.key">{{ s.label }}</option>
            </select>
          </div>
        </div>

        <div class="bo-field">
          <span class="bo-label">Allergeni</span>
          <div class="allergen-grid">
            <label *ngFor="let a of allergens" [class.on]="hasAllergen(a.n)">
              <input type="checkbox" [checked]="hasAllergen(a.n)" (change)="toggleAllergen(a.n)" />
              <span class="num">{{ a.n }}</span> {{ a.label }}
            </label>
          </div>
        </div>

        <div class="bo-field">
          <span class="bo-label">Foto (facoltativa)</span>
          <bo-photo-picker [(images)]="form.images" [multiple]="false"></bo-photo-picker>
        </div>

        <div class="switches">
          <label class="bo-switch">
            <input type="checkbox" name="isAvailable" [(ngModel)]="form.isAvailable" />
            <span class="track"></span>
            Disponibile
          </label>
          <label class="bo-switch">
            <input type="checkbox" name="isChefSpecial" [(ngModel)]="form.isChefSpecial" />
            <span class="track"></span>
            Consigliato dallo chef
          </label>
        </div>

        <button *ngIf="editingId()" type="button" class="bo-btn danger-ghost delete-btn" (click)="remove()">
          <bo-icon name="trash" [size]="16"></bo-icon> Elimina questa voce dal menù
        </button>
      </form>

      <ng-container sheet-footer>
        <button type="button" class="bo-btn" (click)="closeEditor()">Annulla</button>
        <button type="submit" form="dish-form" class="bo-btn primary"
          [disabled]="isSaving() || !form.title.trim() || !form.description.trim() || form.price === null">
          {{ isSaving() ? 'Salvataggio…' : (editingId() ? 'Salva modifiche' : 'Aggiungi al menù') }}
        </button>
      </ng-container>
    </bo-sheet>

    <div class="bo-toast" *ngIf="toast() as t" [class.error]="t.error">{{ t.text }}</div>
  `,
  styles: [`
    .dish-row .bo-row-title { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

    .allergen-nums { color: var(--text-stone); font-weight: 500; }

    .price {
      flex-shrink: 0;
      min-width: 72px;
      text-align: right;
      font-family: var(--font-heading);
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .allergen-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.4rem;

      label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-height: 40px;
        padding: 0 0.6rem;
        border: 1px solid var(--border-subtle);
        border-radius: 6px;
        background: var(--bg-surface);
        font-size: 0.88rem;
        cursor: pointer;

        input { position: absolute; opacity: 0; width: 1px; height: 1px; }

        .num {
          width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--bg-surface-alt);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-stone);
        }

        &.on {
          border-color: var(--color-accent);
          background: var(--color-accent-subtle);
          font-weight: 600;

          .num { background: var(--color-accent); color: #FFFFFF; }
        }
      }
    }

    .switches { display: flex; flex-wrap: wrap; gap: 1.5rem; }

    .delete-btn { align-self: flex-start; margin-top: 0.5rem; }

    @media (max-width: 760px) {
      .dish-row .price { order: 2; }
      .dish-row .bo-row-actions { order: 3; width: auto; margin-left: auto; }
    }
  `],
})
export class MenuManagementComponent implements OnInit {
  private menuService = inject(MenuService);

  readonly categories = CATEGORIES;
  readonly allergens = ALLERGENS;

  dishes = signal<MenuItem[]>([]);
  isLoading = signal(true);
  activeCategory = signal<MenuCategory>('pesce');
  query = signal('');
  isEditorOpen = signal(false);
  editingId = signal<string | null>(null);
  isSaving = signal(false);
  toast = signal<{ text: string; error: boolean } | null>(null);

  form: DishForm = this.emptyForm('pesce');

  /** Con una ricerca attiva si cerca in tutto il menù, altrimenti si mostra la categoria scelta. */
  groups = computed<DishGroup[]>(() => {
    const q = this.query().trim().toLowerCase();
    const source = q
      ? this.dishes().filter((d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q))
      : this.dishes().filter((d) => d.category === this.activeCategory());

    const groups: DishGroup[] = [];
    for (const dish of source) {
      const label = q ? this.categoryLabel(dish.category) : this.subcategoryLabel(dish.category, dish.subcategory);
      let group = groups.find((g) => g.label === label);
      if (!group) {
        group = { label, dishes: [] };
        groups.push(group);
      }
      group.dishes.push(dish);
    }
    return groups;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.menuService.getMenuItems().subscribe({
      next: (res) => {
        this.dishes.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  countFor(category: MenuCategory): number {
    return this.dishes().filter((d) => d.category === category).length;
  }

  subcategoriesFor(category: MenuCategory) {
    return SUBCATEGORIES[category] || [];
  }

  categoryLabel(category: MenuCategory): string {
    return CATEGORIES.find((c) => c.key === category)?.label || category;
  }

  subcategoryLabel(category: MenuCategory, sub?: string): string {
    return SUBCATEGORIES[category]?.find((s) => s.key === sub)?.label || 'Altro';
  }

  toggleAvailability(dish: MenuItem): void {
    const id = entityId(dish);
    const next = !dish.isAvailable;
    this.dishes.update((list) => list.map((d) => (entityId(d) === id ? { ...d, isAvailable: next } : d)));
    this.menuService.updateMenuItem(id, { isAvailable: next }).subscribe({
      next: () => this.showToast(next ? `«${dish.title}» di nuovo disponibile.` : `«${dish.title}» segnato come finito.`),
      error: (err) => {
        this.showToast(err.message || 'Aggiornamento non riuscito.', true);
        this.load();
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form = this.emptyForm(this.activeCategory());
    this.isEditorOpen.set(true);
  }

  openEdit(dish: MenuItem): void {
    this.editingId.set(entityId(dish));
    this.form = {
      title: dish.title,
      description: dish.description,
      price: dish.price,
      category: dish.category,
      subcategory: dish.subcategory || this.subcategoriesFor(dish.category)[0]?.key || '',
      allergenNumbers: [...(dish.allergenNumbers || [])],
      isAvailable: dish.isAvailable,
      isChefSpecial: !!dish.isChefSpecial,
      images: dish.image ? [dish.image] : [],
    };
    this.isEditorOpen.set(true);
  }

  closeEditor(): void {
    this.isEditorOpen.set(false);
  }

  onCategoryChange(): void {
    const subs = this.subcategoriesFor(this.form.category);
    if (!subs.some((s) => s.key === this.form.subcategory)) {
      this.form.subcategory = subs[0]?.key || '';
    }
  }

  hasAllergen(n: number): boolean {
    return this.form.allergenNumbers.includes(n);
  }

  toggleAllergen(n: number): void {
    this.form.allergenNumbers = this.hasAllergen(n)
      ? this.form.allergenNumbers.filter((x) => x !== n)
      : [...this.form.allergenNumbers, n].sort((a, b) => a - b);
  }

  save(): void {
    // Numeri e chiavi degli allergeni vengono inviati insieme, così restano allineati nel database.
    const payload: Partial<MenuItem> = {
      title: this.form.title.trim(),
      description: this.form.description.trim(),
      price: Number(this.form.price),
      category: this.form.category,
      subcategory: this.form.subcategory,
      allergenNumbers: this.form.allergenNumbers,
      allergens: ALLERGENS.filter((a) => this.form.allergenNumbers.includes(a.n)).map((a) => a.slug),
      isAvailable: this.form.isAvailable,
      isChefSpecial: this.form.isChefSpecial,
      image: this.form.images[0] || '',
    };

    const id = this.editingId();
    const request = id ? this.menuService.updateMenuItem(id, payload) : this.menuService.createMenuItem(payload);
    this.isSaving.set(true);
    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeEditor();
        this.activeCategory.set(this.form.category);
        this.showToast(id ? 'Modifiche salvate.' : 'Voce aggiunta al menù.');
        this.load();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showToast(err.message || 'Salvataggio non riuscito.', true);
      },
    });
  }

  remove(): void {
    const id = this.editingId();
    if (!id || !confirm(`Eliminare «${this.form.title}» dal menù? Se è solo finita, basta spegnerla.`)) return;
    this.menuService.deleteMenuItem(id).subscribe({
      next: () => {
        this.closeEditor();
        this.showToast('Voce eliminata.');
        this.load();
      },
      error: (err) => this.showToast(err.message || 'Eliminazione non riuscita.', true),
    });
  }

  private emptyForm(category: MenuCategory): DishForm {
    return {
      title: '',
      description: '',
      price: null,
      category,
      subcategory: SUBCATEGORIES[category]?.[0]?.key || '',
      allergenNumbers: [],
      isAvailable: true,
      isChefSpecial: false,
      images: [],
    };
  }

  private showToast(text: string, error = false): void {
    this.toast.set({ text, error });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
