import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuService } from '../../../core/services/menu.service';
import { MenuItem, MenuCategory } from '../../../core/models';
import { DishCardComponent } from '../../../shared/components/dish-card/dish-card.component';
import { AllergenBadgeComponent, OFFICIAL_ALLERGENS } from '../../../shared/components/allergen-badge/allergen-badge.component';
import { OFFICIAL_ALLERGEN_EXPLANATIONS, OfficialAllergenEntry } from '../../../shared/components/allergen-badge/allergen-icons.data';
import { NauticalDecorComponent } from '../../../shared/components/nautical-decor/nautical-decor.component';
import {
  WoodPlaqueComponent,
  VelieroShipComponent,
  RosaDeiVentiComponent,
  NauticalStarComponent,
} from '../../../shared/components/svg-icons';

interface WeeklySeafoodDish {
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface MenuSectionGroup {
  id: string;
  category: string;
  subcategory?: string;
  title: string;
  subtitle?: string;
  icon: string;
  dishes: MenuItem[];
}

export interface SubcategoryFilter {
  key: string;
  label: string;
  icon?: string;
  badge?: string;
}

export interface MacroCategoryGroup {
  key: string;
  label: string;
  sections: MenuSectionGroup[];
}

export const MACRO_CATEGORIES = [
  { key: 'pesce',         label: 'Pesce' },
  { key: 'pizze',         label: 'Pizze' },
  { key: 'insalatone',    label: 'Insalatone' },
  { key: 'piatti_estivi', label: 'Piatti Estivi' },
  { key: 'carne',         label: 'Carne' },
  { key: 'contorni',      label: 'Contorni' },
  { key: 'vini',          label: 'Vini & Bevande' },
];

interface SectionDef {
  id: string;
  category: string;
  subcategoryMatch: (sub: string, dish: MenuItem) => boolean;
  title: string;
  subtitle?: string;
  icon: string;
}

const MASTER_SECTION_DEFS: SectionDef[] = [
  // 1. SPECIALITÀ PESCE (Antipasti, Crudo, Pescato della Settimana, Primi, Secondi)
  {
    id: 'pesce_antipasti',
    category: 'pesce',
    subcategoryMatch: (sub) => sub === 'antipasti' || sub === 'antipasti_pesce',
    title: 'Antipasti di Mare',
    subtitle: "Le prelibatezze calde e fredde dell'Adriatico",
    icon: 'fa-solid fa-plate-wheat',
  },
  {
    id: 'pesce_crudo',
    category: 'pesce',
    subcategoryMatch: (sub) => sub === 'crudo',
    title: 'Crudo di Pesce',
    subtitle: 'Freschezza assoluta, crostacei, tartare e carpacci',
    icon: 'fa-solid fa-shrimp',
  },
  {
    id: 'pesce_pescato_settimana',
    category: 'pesce',
    subcategoryMatch: (sub) => sub === 'pescato_della_settimana' || sub === 'pescato_settimana',
    title: 'Pescato della Settimana',
    subtitle: 'Lavagna del pescato fresco di giornata',
    icon: 'fa-solid fa-chalkboard-user',
  },
  {
    id: 'pesce_primi',
    category: 'pesce',
    subcategoryMatch: (sub) => sub === 'primi' || sub === 'primi_pesce',
    title: 'Primi di Pesce',
    subtitle: 'Pasta trafilata al bronzo e risotti di mare',
    icon: 'fa-solid fa-bowl-food',
  },
  {
    id: 'pesce_secondi',
    category: 'pesce',
    subcategoryMatch: (sub) => sub === 'secondi' || sub === 'secondi_pesce',
    title: 'Secondi alla Griglia & Fritti',
    subtitle: 'Grigliate imperiali, fritto misto reale e pescato alla brace',
    icon: 'fa-solid fa-fire',
  },

  // 2. PIATTI ESTIVI
  {
    id: 'piatti_estivi',
    category: 'piatti_estivi',
    subcategoryMatch: () => true,
    title: 'Piatti Freschi Estivi',
    subtitle: 'Proposte leggere e fresche per la stagione estiva',
    icon: 'fa-solid fa-sun',
  },

  // 3. CARNE (Antipasti, Primi, Secondi)
  {
    id: 'carne_antipasti',
    category: 'carne',
    subcategoryMatch: (sub) => sub === 'antipasti' || sub === 'antipasti_carne',
    title: 'Antipasti di Carne',
    subtitle: "Salumi selezionati e bresaola petto d'anca",
    icon: 'fa-solid fa-utensils',
  },
  {
    id: 'carne_primi',
    category: 'carne',
    subcategoryMatch: (sub) => sub === 'primi' || sub === 'primi_carne',
    title: 'Primi Piatti Tradizionali',
    subtitle: "Tagliolini all'uovo, spaghetti alla carbonara e gnocchi",
    icon: 'fa-solid fa-bowl-food',
  },
  {
    id: 'carne_secondi',
    category: 'carne',
    subcategoryMatch: (sub) => sub === 'secondi' || sub === 'secondi_carne',
    title: 'Secondi di Carne',
    subtitle: 'Tagliata di manzo al rosmarino, agnello e cotolette',
    icon: 'fa-solid fa-drumstick-bite',
  },

  // 4. INSALATONE
  {
    id: 'insalatone',
    category: 'insalatone',
    subcategoryMatch: () => true,
    title: 'Insalatone',
    subtitle: 'Insalatone ricche con burrata pugliese, tonno fresco e salmone',
    icon: 'fa-solid fa-leaf',
  },

  // 5. CONTORNI
  {
    id: 'contorni',
    category: 'contorni',
    subcategoryMatch: (sub, dish) => dish?.title?.toLowerCase().trim() !== 'coperto' && sub !== 'coperto',
    title: 'Contorni',
    subtitle: 'Patate al forno, fritte dorate e verdure al forno',
    icon: 'fa-solid fa-bowl-rice',
  },

  // 6. PIZZE DEL CAMPIONE (Di Stagione, Classiche, Della Casa, Speciali, Bianche, Verdure)
  {
    id: 'pizze_stagionali',
    category: 'pizze',
    subcategoryMatch: (sub) => sub === 'stagionali' || sub === 'stagione_finferli' || sub === 'finferli_stagione',
    title: 'Di Stagione',
    subtitle: 'Creazioni a rotazione con ingredienti freschi di stagione (finferli, asparagi, radicchio)',
    icon: 'fa-solid fa-fire-flame-curved',
  },
  {
    id: 'pizze_classiche',
    category: 'pizze',
    subcategoryMatch: (sub) => sub === 'classiche',
    title: 'Classiche',
    subtitle: 'I grandi classici della tradizione italiana con mozzarella Comalat',
    icon: 'fa-solid fa-pizza-slice',
  },
  {
    id: 'pizze_della_casa',
    category: 'pizze',
    subcategoryMatch: (sub) => sub === 'della_casa' || sub === 'ricercate',
    title: 'Della Casa',
    subtitle: 'Gli abbinamenti storici ed esclusivi de Il Veliero',
    icon: 'fa-solid fa-crown',
  },
  {
    id: 'pizze_speciali',
    category: 'pizze',
    subcategoryMatch: (sub) => sub === 'speciali',
    title: 'Speciali',
    subtitle: 'Le ricette pluripremiate e creative del Campione del Mondo',
    icon: 'fa-solid fa-trophy',
  },
  {
    id: 'pizze_bianche',
    category: 'pizze',
    subcategoryMatch: (sub) => sub === 'bianche',
    title: 'Bianche',
    subtitle: 'Base senza pomodoro con formaggi DOP e salumi di pregio',
    icon: 'fa-solid fa-circle-notch',
  },
  {
    id: 'pizze_verdure',
    category: 'pizze',
    subcategoryMatch: (sub) => sub === 'verdure' || sub === 'vegetariane',
    title: 'Verdure',
    subtitle: 'Verdure fresche grigliate e funghi porcini nostrani',
    icon: 'fa-solid fa-carrot',
  },

  // 7. VINI & BEVANDE (Caffetteria, Bibite, Birre Artigianali, Vino alla Spina, Amari, Grappe, Carta dei Vini)
  {
    id: 'bevande_caffetteria',
    category: 'bevande',
    subcategoryMatch: (sub) => sub === 'caffetteria' || sub === 'caffe',
    title: 'Caffetteria',
    subtitle: 'Espresso, caffè macchiato, corretto, cappuccino, decaffeinato, orzo e ginseng',
    icon: 'fa-solid fa-mug-hot',
  },
  {
    id: 'bevande_bibite',
    category: 'bevande',
    subcategoryMatch: (sub) => sub === 'bibite',
    title: 'Bibite',
    subtitle: 'Acqua minerale Levico 75cl in vetro, bibite in lattina e birra Beck\'s alla spina',
    icon: 'fa-solid fa-bottle-water',
  },
  {
    id: 'bevande_birre',
    category: 'bevande',
    subcategoryMatch: (sub) => sub === 'birre' || sub === 'birre_artigianali',
    title: 'Birre Artigianali',
    subtitle: 'Leffe Rossa, Valdesteiner Keller e Rossa, Schinner Weisse e Leffe Ambrata',
    icon: 'fa-solid fa-beer-mug-empty',
  },
  {
    id: 'bevande_vino_sfuso',
    category: 'bevande',
    subcategoryMatch: (sub) => sub === 'vino_sfuso' || sub === 'spina' || sub === 'vino' || sub === 'vino_della_casa',
    title: 'Vino alla Spina',
    subtitle: 'Chardonnay, Cabernet, Cuvée Extra Dry e Glera alla spina (1/4L, 1/2L, 1L)',
    icon: 'fa-solid fa-wine-glass',
  },
  {
    id: 'bevande_amari',
    category: 'bevande',
    subcategoryMatch: (sub, dish) => {
      if (sub === 'amari') return true;
      if (sub === 'amari_grappe') {
        const t = (dish.title || '').toLowerCase();
        return !t.startsWith('grappa') && !t.startsWith('gr.');
      }
      return false;
    },
    title: 'Amari',
    subtitle: 'Braulio, Averna, Unicum, Montenegro, Fernet, Brancamenta, Sambuca, Limoncello e grandi classici (€4,00)',
    icon: 'fa-solid fa-martini-glass-citrus',
  },
  {
    id: 'bevande_grappe',
    category: 'bevande',
    subcategoryMatch: (sub, dish) => {
      if (sub === 'grappe') return true;
      if (sub === 'amari_grappe') {
        const t = (dish.title || '').toLowerCase();
        return t.startsWith('grappa') || t.startsWith('gr.');
      }
      return false;
    },
    title: 'Grappe',
    subtitle: 'La grande tradizione di Bassano: Nardini, Riserva, Tagliatella, Sarpa Poli, Prime Uve e Storica Nera',
    icon: 'fa-solid fa-whiskey-glass',
  },
  {
    id: 'vini_carta',
    category: 'vini',
    subcategoryMatch: () => true,
    title: 'Carta dei Vini',
    subtitle: 'Bollicine Metodo Classico, Champagne e bianchi/rossi regionali in bottiglia',
    icon: 'fa-solid fa-wine-bottle',
  },
];

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DishCardComponent,
    AllergenBadgeComponent,
    NauticalDecorComponent,
    VelieroShipComponent,
    RosaDeiVentiComponent,
    NauticalStarComponent,
  ],
  template: `
    <div class="menu-page">
      <!-- THEMATIC HEADER: "Scopri il Nostro Menù" -->
      <section class="menu-hero-section">
        <div class="container hero-inner">
          <h1 class="hero-title">Scopri il Nostro Menù</h1>
        </div>
      </section>

      <!-- PESCATO DELLA SETTIMANA (EXPANDABLE SELECTION) -->
      <section class="section weekly-seafood-section">
        <div class="container">
          <div class="section-header compact-header">
            <h2>Pescato della Settimana</h2>
          </div>

          <div class="weekly-dishes-grid">
            <article
              class="weekly-dish-item dishoom-item"
              *ngFor="let dish of weeklySeafood; let i = index"
              [class.compact]="expandedWeeklyDishIndex() !== i"
              [class.expanded]="expandedWeeklyDishIndex() === i"
              (click)="toggleWeeklyDish(i)"
              role="button"
              [attr.aria-expanded]="expandedWeeklyDishIndex() === i"
              tabindex="0"
              (keydown.enter)="toggleWeeklyDish(i)"
              (keydown.space)="toggleWeeklyDish(i); $event.preventDefault()"
            >
              <div class="item-header">
                <div class="item-title-col">
                  <h3 class="item-title">{{ dish.name }}</h3>
                </div>
                <span class="dot-leader" aria-hidden="true"></span>
                <div class="item-price-wrap">
                  <span class="item-price">€ {{ dish.price.toFixed(2) }}</span>
                  <i class="fa-solid fa-chevron-down expand-chevron" aria-hidden="true"></i>
                </div>
              </div>

              <div class="item-body-drawer" [class.open]="expandedWeeklyDishIndex() === i">
                <div class="drawer-inner">
                  <p class="item-desc">{{ dish.description }}</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- MAIN MENU: Category Sticky Toolbar & Sections -->
      <section class="section main-menu-content">
        <div class="container">
          <div class="section-header">
            <span class="subtitle">La Carta</span>
            <h2>Menù Completo</h2>
          </div>
        </div>

        <!-- Sticky Menu Navigation Bar (Search + Category Dropdown + Allergen Filter + Subcategory Pills) -->
        <div class="menu-sticky-nav-container">
          <div class="container sticky-nav-inner">
            <div class="sticky-menu-toolbar">
              <div class="toolbar-controls-row">
                <!-- Expanding Search Bar -->
                <div class="expandable-search" [class.open]="isSearchOpen() || searchQuery">
                  <button
                    type="button"
                    class="search-icon-btn"
                    (click)="toggleSearch()"
                    [attr.aria-label]="isSearchOpen() ? 'Chiudi o cerca' : 'Cerca nel menu'"
                    [title]="isSearchOpen() ? 'Chiudi o cerca' : 'Cerca piatti o ingredienti'"
                  >
                    <i class="fa-solid fa-magnifying-glass"></i>
                  </button>
                  <input
                    #searchInput
                    id="dishoom-search-input"
                    type="text"
                    class="search-expand-input"
                    placeholder="Cerca piatto, pizza, ingrediente..."
                    [(ngModel)]="searchQuery"
                    (ngModelChange)="onFilterChange()"
                    (keydown.enter)="onSearchSubmit()"
                    (keydown.escape)="closeSearch()"
                    aria-label="Cerca piatti nel menu"
                  />
                  <button
                    *ngIf="searchQuery"
                    (click)="clearSearch()"
                    class="search-action-btn search-clear-btn"
                    title="Azzera testo"
                    type="button"
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                  <button
                    *ngIf="isSearchOpen() && !searchQuery"
                    (click)="closeSearch()"
                    class="search-action-btn search-close-btn"
                    title="Chiudi ricerca"
                    type="button"
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>

                <!-- Category Selector Button & Floating Dropdown -->
                <div class="category-selector-block" id="sezione-categoria-selettore">
                  <button
                    type="button"
                    class="category-header-btn"
                    (click)="toggleCategoryDropdown($event)"
                    [class.active]="isCategoryDropdownOpen()"
                    aria-expanded="isCategoryDropdownOpen()"
                    aria-controls="sezione-categoria-dropdown"
                  >
                    <div class="header-btn-left">
                      <span class="category-label-text">{{ currentCategoryTab().label }}</span>
                    </div>
                    <i class="fa-solid chevron-icon" [ngClass]="isCategoryDropdownOpen() ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                  </button>

                  <!-- Floating Category Dropdown Panel -->
                  <div
                    id="sezione-categoria-dropdown"
                    class="category-dropdown-panel"
                    *ngIf="isCategoryDropdownOpen()"
                  >
                    <div class="category-dropdown-header">
                      <span class="dropdown-header-title">Seleziona Categoria</span>
                      <button
                        type="button"
                        class="btn-close-dropdown"
                        (click)="toggleCategoryDropdown($event)"
                        title="Chiudi"
                        aria-label="Chiudi menu categorie"
                      >
                        <i class="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                    <div class="category-options-list">
                      <button
                        *ngFor="let tab of categoryTabs"
                        type="button"
                        class="category-option-item"
                        [class.active]="selectedCategory() === tab.key"
                        (click)="selectCategoryFromDropdown(tab.key)"
                      >
                        <span class="option-label">{{ tab.label }}</span>
                        <i *ngIf="selectedCategory() === tab.key" class="fa-solid fa-check option-check"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Official Allergen Filter Button & Floating Overlay Dropdown -->
                <div class="allergen-filter-block" id="sezione-allergeni">
                  <button
                    type="button"
                    class="allergen-header-btn"
                    (click)="toggleAllergensDropdown($event)"
                    [class.active]="isAllergensOpen()"
                    aria-expanded="isAllergensOpen()"
                    aria-controls="sezione-allergeni-dropdown"
                  >
                    <div class="header-btn-left">
                      <i class="fa-solid fa-shield-halved text-brass"></i>
                      <span>Allergeni</span>
                      <span *ngIf="selectedExcludedAllergens().length > 0" class="allergen-count-badge">
                        {{ selectedExcludedAllergens().length }}
                      </span>
                    </div>
                    <i class="fa-solid chevron-icon" [ngClass]="isAllergensOpen() ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                  </button>

                  <!-- Floating Overlay Allergen Dropdown Panel -->
                  <div
                    id="sezione-allergeni-dropdown"
                    class="allergen-dropdown-panel"
                    *ngIf="isAllergensOpen()"
                  >
                    <div class="allergen-dropdown-header">
                      <div class="header-title-box">
                        <i class="fa-solid fa-filter text-brass"></i>
                        <span class="dropdown-header-title">Escludi allergeni</span>
                      </div>
                      <div class="header-actions">
                        <button
                          *ngIf="selectedExcludedAllergens().length > 0"
                          type="button"
                          class="btn-reset-allergens"
                          (click)="clearAllergenExclusions()"
                        >
                          Azzera filtri
                        </button>
                        <button
                          type="button"
                          class="btn-close-allergens"
                          (click)="toggleAllergensDropdown($event)"
                          title="Chiudi pannello"
                          aria-label="Chiudi filtri allergeni"
                        >
                          <i class="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    </div>

                    <div class="allergen-grid-scroll-wrap">
                      <div class="allergen-grid">
                        <label *ngFor="let allergen of euAllergens" class="allergen-check-label">
                          <input
                            type="checkbox"
                            [checked]="isAllergenExcluded(allergen.key)"
                            (change)="toggleAllergenExclusion(allergen.key)"
                          />
                          <span class="allergen-check-badge">{{ allergen.number }}</span>
                          <span class="allergen-check-name">{{ allergen.label }}</span>
                        </label>
                      </div>
                    </div>

                    <div class="allergen-grid-footer">
                      <button type="button" class="btn-link-allergens" (click)="scrollToAllergens()">
                        <i class="fa-solid fa-book-open"></i>
                        <span>Tabella completa dettagliata (1–14) &rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="container">
          <!-- MENU LAYOUT: Main Dishes Grid (Full Width) -->
          <div class="menu-main-column">
            <!-- Dishes Render Area with Structured Grouped Sections & Dishoom Dividers -->
            <div class="dishes-render-area">
              <div *ngIf="isLoading()" class="loading-state">
                <i class="fa-solid fa-spinner fa-spin"></i> Caricamento pietanze in corso...
              </div>

              <div *ngIf="!isLoading() && dishes().length === 0 && selectedCategory() !== 'allergeni'" class="empty-state card">
                <i class="fa-solid fa-filter-circle-xmark"></i>
                <h3>Nessun piatto trovato</h3>
                <p>Nessuna pietanza corrisponde ai criteri di ricerca o ai filtri allergeni selezionati.</p>
                <button (click)="resetFilters()" class="btn btn-outline btn-sm">Resetta Filtri</button>
              </div>

              <div *ngIf="!isLoading() && dishes().length > 0" class="menu-sections-wrapper">
                <!-- Clean Editorial Categories (Unified for all dishes & search results) -->
                <div class="category-editorial-list">
                  <div
                    *ngFor="let macro of macroCategoryGroups()"
                    class="category-editorial-section"
                    [class.open]="isCategoryCardOpen(macro.key)"
                    [id]="'macro-cat-' + macro.key"
                  >
                    <!-- Header: Slender Editorial Title and Subtle Arrow (No box, no card frame) -->
                    <div
                      class="category-section-header"
                      (click)="toggleCategoryCard(macro.key)"
                      role="button"
                      [attr.aria-expanded]="isCategoryCardOpen(macro.key)"
                      [attr.aria-controls]="'cat-body-' + macro.key"
                      tabindex="0"
                      (keydown.enter)="toggleCategoryCard(macro.key)"
                      (keydown.space)="toggleCategoryCard(macro.key); $event.preventDefault()"
                    >
                      <div class="cat-header-left">
                        <h3 class="cat-section-title">{{ macro.label }}</h3>
                      </div>
                      <div class="cat-header-right">
                        <span class="cat-chevron-indicator" [class.open]="isCategoryCardOpen(macro.key)">
                          <i class="fa-solid fa-chevron-down"></i>
                        </span>
                      </div>
                    </div>

                    <!-- Body: Subcategories & Dishes (flows seamlessly onto page background) -->
                    <div
                      class="category-section-body"
                      *ngIf="isCategoryCardOpen(macro.key)"
                      [id]="'cat-body-' + macro.key"
                    >
                      <!-- Single Section Category: Direct dishes grid (e.g. Insalatone, Piatti Estivi, Contorni) -->
                      <div *ngIf="!hasSubcategories(macro.key)" class="single-section-dishes-wrap">
                        <div class="menu-dishes-grid">
                          <app-dish-card
                            *ngFor="let dish of macro.sections[0].dishes; let dIdx = index"
                            [dish]="dish"
                            [isExpanded]="isDishExpanded(macro.sections[0].id, dIdx)"
                            (click)="onDishClick(macro.sections[0].id, dIdx)"
                          ></app-dish-card>
                        </div>
                      </div>

                      <!-- Multi-Section Category: Subcategories Accordions (e.g. Pizze, Pesce, Carne, Vini) -->
                      <div *ngIf="hasSubcategories(macro.key)" class="multi-sections-wrap">
                        <div
                          *ngFor="let section of macro.sections"
                          class="menu-subcategory-block"
                          [id]="'section-' + section.id"
                          [attr.data-section-id]="section.id"
                        >
                          <div
                            class="dishoom-section-divider clickable"
                            [class.open]="isSectionOpen(section.id)"
                            (click)="toggleSection(section.id)"
                            role="button"
                            [attr.aria-expanded]="isSectionOpen(section.id)"
                            [attr.aria-controls]="'content-' + section.id"
                            tabindex="0"
                            (keydown.enter)="toggleSection(section.id)"
                            (keydown.space)="toggleSection(section.id); $event.preventDefault()"
                            [title]="isSectionOpen(section.id) ? 'Richiudi sezione' : 'Espandi sezione'"
                          >
                            <div class="divider-left">
                              <h4 class="section-heading">{{ section.title }}</h4>
                            </div>
                            <div class="divider-right">
                              <span class="section-chevron-indicator" [class.open]="isSectionOpen(section.id)" aria-hidden="true">
                                <i class="fa-solid fa-chevron-down"></i>
                              </span>
                            </div>
                          </div>

                          <div
                            class="section-collapse-drawer"
                            *ngIf="isSectionOpen(section.id)"
                            [id]="'content-' + section.id"
                          >
                            <div class="menu-dishes-grid">
                              <app-dish-card
                                *ngFor="let dish of section.dishes; let dIdx = index"
                                [dish]="dish"
                                [isExpanded]="isDishExpanded(section.id, dIdx)"
                                (click)="onDishClick(section.id, dIdx)"
                              ></app-dish-card>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Chiusura Menù: Avviso Coperto a fine menù -->
                <div class="menu-end-coperto-strip">
                  <span class="coperto-text">Coperto 3€</span>
                </div>
              </div>

              <!-- SEZIONE DEDICATA TABELLA ALLERGENI (1-14) -->
              <div
                id="sezione-tabella-allergeni"
                class="official-allergens-section"
                *ngIf="!searchQuery"
              >
                <!-- Elegant Dishoom Section Divider -->
                <div class="dishoom-section-divider">
                  <div class="divider-left">
                    <div class="section-title-box">
                      <h3 class="section-heading">Tabella Allergeni Ufficiali (1–14)</h3>
                    </div>
                  </div>
                  <span class="section-counter-pill">14 Allergeni</span>
                </div>

                <!-- 14 Allergen Cards Grid -->
                <div class="official-allergens-grid">
                  <div *ngFor="let item of officialAllergensList" class="official-allergen-card">
                    <div class="allergen-card-badge-col">
                      <span class="allergen-num-badge">{{ item.number }}</span>
                    </div>
                    <div class="allergen-card-text-col">
                      <h4 class="allergen-card-name">{{ item.name }}</h4>
                      <p class="allergen-card-desc">{{ item.description }}</p>
                    </div>
                  </div>
                </div>

                <!-- Authentic HACCP Communication from Il Veliero -->
                <div class="haccp-disclaimer-card">
                  <div class="haccp-badge-header">
                    <i class="fa-solid fa-file-shield"></i>
                    <h4>Comunicazione alla Gentile Clientela (Normativa HACCP)</h4>
                  </div>
                  <div class="haccp-body">
                    <p>
                      Le informazioni circa la presenza di sostanze o di prodotti che provocano allergie o intolleranze sono disponibili rivolgendosi al personale in servizio.
                    </p>
                    <p>
                      Le procedure Haccp adottate tengono conto del rischio di contaminazione crociata ed il personale è formato su tale rischio. Tuttavia, occorre segnalare che, in alcuni casi, a causa di esigenze oggettive, le attività di preparazione e somministrazione possono comportare la condivisione di aree ed utensili; quindi non si può escludere la possibilità che i prodotti entrino a contatto con allergeni.
                    </p>
                    <p class="haccp-note-alert">
                      Vi preghiamo di comunicarci eventuali intolleranze alimentari per non creare alcun disagio.
                    </p>
                    <div class="haccp-signature">il Veliero</div>
                  </div>
                </div>

                <!-- Chiusura: Avviso Coperto quando si consulta direttamente la sezione Allergeni -->
                <div class="menu-end-coperto-strip" *ngIf="selectedCategory() === 'allergeni'">
                  <span class="coperto-text">Coperto 3€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .menu-page {
      position: relative;
      background-color: var(--dishoom-bg-primary, #FAF7F2);
    }

    /* Thematic Header: "Scopri il Nostro Menù" */
    .menu-hero-section {
      background: var(--bg-navy-dark, #0B2545);
      color: #ffffff;
      margin-top: -82px;
      padding: calc(82px + 4rem) 0 4.5rem;
      text-align: center;
      position: relative;
      overflow: hidden;

      .hero-inner {
        position: relative;
        z-index: 2;
        max-width: 860px;
        margin: 0 auto;
      }

      .hero-title {
        font-family: var(--font-heading, 'Cinzel', serif);
        font-size: clamp(2.4rem, 4.5vw, 3.4rem);
        letter-spacing: 3px;
        color: #ffffff;
        margin-bottom: 0;
        line-height: 1.15;
      }

      .hero-subtitle {
        font-family: var(--font-serif-primary, 'Cormorant Garamond', Georgia, serif);
        font-size: clamp(1.15rem, 1.8vw, 1.35rem);
        font-style: italic;
        color: var(--color-seafoam, #E2E8F0);
        margin: 0 auto;
        max-width: 680px;
        line-height: 1.6;
        letter-spacing: 0.01em;
        opacity: 0.95;
      }

      .header-multimedia-box {
        max-width: 820px;
        margin: 0 auto;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(221, 161, 94, 0.35);
        border-radius: 16px;
        padding: 1.5rem 2rem;
        backdrop-filter: blur(8px);

        .media-box-inner {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          text-align: left;

          .box-icon {
            font-size: 2.5rem;
            color: var(--color-gold, #dda15e);
            flex-shrink: 0;
          }

          .box-text {
            flex: 1;

            h4 {
              color: #ffffff;
              font-size: 1.2rem;
              margin-bottom: 0.25rem;
            }

            p {
              color: var(--color-adriatic-cyan, #8da9c4);
              font-size: 0.92rem;
              margin-bottom: 0;
            }
          }
        }
      }
    }

    /* Pescato della Settimana (Frameless Editorial Style matching Main Menu Dishes) */
    .weekly-seafood-section {
      background: var(--dishoom-bg-primary, #FAF7F2);
      padding: 3.5rem 0 3.25rem;
      border-bottom: 1px solid var(--dishoom-border-sand, #E5DDD0);

      .compact-header {
        text-align: center;
        margin-bottom: 2rem;

        h2 {
          font-family: var(--font-heading-editorial, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(1.8rem, 3vw, 2.35rem);
          font-weight: 600;
          color: var(--dishoom-ink-charcoal, #1C1917);
          margin: 0;
          letter-spacing: 0.02em;
        }
      }

      .weekly-dishes-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem 3.5rem;
        align-items: start;

        @media (max-width: 900px) {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .weekly-dish-item {
          padding: 1.15rem 0;
          border-bottom: 1px dashed var(--dishoom-border-sand, #E5DDD0);
          background: transparent;
          cursor: pointer;
          user-select: none;
          transition: padding 0.25s ease;

          &.compact {
            padding: 0.75rem 0;

            .item-header {
              margin-bottom: 0;
            }
          }

          &.expanded {
            padding: 1.15rem 0;

            .item-header {
              margin-bottom: 0.35rem;
            }

            .item-price-wrap .expand-chevron {
              transform: rotate(180deg);
              color: var(--dishoom-brass-dark, #945C22);
            }

            .item-body-drawer {
              grid-template-rows: 1fr;
              opacity: 1;
            }
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
                transition: color 0.2s ease;
              }
            }

            .dot-leader {
              flex: 1;
              height: 1px;
              border-bottom: 1px dotted var(--dishoom-border-sand-dark, #D3C7B5);
              margin: 0 0.5rem;
              min-width: 24px;
            }

            .item-price-wrap {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              flex-shrink: 0;
              white-space: nowrap;

              .item-price {
                font-family: var(--font-serif-display, 'Playfair Display', Georgia, serif);
                font-size: 1.22rem;
                font-weight: 700;
                color: var(--dishoom-brass-dark, #945C22);
                letter-spacing: 0.02em;
                transition: color 0.2s ease;
              }

              .expand-chevron {
                font-size: 0.72rem;
                color: var(--dishoom-ink-muted, #78716C);
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
              }
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

              .item-desc {
                font-family: var(--font-serif-primary, 'Cormorant Garamond', Garamond, serif);
                font-style: italic;
                font-size: 1rem;
                line-height: 1.55;
                color: var(--dishoom-ink-espresso, #292524);
                margin: 0 0 0.25rem 0;
              }
            }
          }

          &:hover {
            .item-header .item-title-col .item-title {
              color: var(--dishoom-brass-dark, #945C22);
            }

            .item-price-wrap .expand-chevron {
              transform: rotate(180deg);
              color: var(--dishoom-brass-dark, #945C22);
            }

            .item-body-drawer {
              grid-template-rows: 1fr;
              opacity: 1;
            }
          }

          &:focus-visible {
            outline: 2px solid var(--dishoom-brass, #C58A3E);
            outline-offset: 4px;
          }
        }
      }
    }

    /* Main Menu Content */
    .main-menu-content {
      padding: 4.5rem 0;
      background-color: var(--dishoom-bg-primary, #FAF7F2);

      /* Sticky Navigation Container (Pinned under site navbar) */
      .menu-sticky-nav-container {
        position: sticky;
        top: 76px;
        z-index: 85;
        background-color: var(--dishoom-bg-primary, #FAF7F2);
        border-bottom: 1px solid var(--dishoom-border-sand, #E5DDD0);
        box-shadow: 0 4px 14px rgba(28, 25, 23, 0.05);
        margin-bottom: 2rem;

        @media (max-width: 768px) {
          top: 68px;
          margin-bottom: 1.5rem;
        }

        .sticky-nav-inner {
          padding: 0 1rem;

          @media (max-width: 640px) {
            padding: 0 0.75rem;
          }
        }

        .sticky-menu-toolbar {
          padding: 0.65rem 0;

          @media (max-width: 640px) {
            padding: 0.5rem 0;
          }

          .toolbar-controls-row {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            flex-wrap: nowrap;
            gap: 1.5rem;
            position: relative;

            @media (max-width: 640px) {
              flex-wrap: wrap;
              gap: 0.85rem;
            }

            /* 1. Expanding Search Bar (Frameless, slender) */
            .expandable-search {
              display: inline-flex;
              align-items: center;
              height: 38px;
              width: 36px;
              background: transparent;
              border: none;
              border-radius: 0;
              position: relative;
              overflow: hidden;
              flex: 0 0 36px;
              box-shadow: none;
              transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                          flex-basis 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                          border-color 0.2s ease;

              .search-icon-btn {
                width: 36px;
                height: 38px;
                background: transparent;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #bc6c25;
                font-size: 1.05rem;
                cursor: pointer;
                flex-shrink: 0;
                padding: 0;
                transition: color 0.2s ease, transform 0.2s ease;

                &:hover {
                  color: var(--dishoom-brass-dark, #945C22);
                  transform: scale(1.08);
                }
              }

              .search-expand-input {
                width: 0;
                opacity: 0;
                pointer-events: none;
                border: none;
                background: transparent;
                outline: none;
                padding: 0;
                font-family: var(--font-body-editorial, 'Plus Jakarta Sans', sans-serif);
                font-size: 0.95rem;
                font-weight: 400;
                color: var(--dishoom-ink-charcoal, #1C1917);
                letter-spacing: 0.01em;
                transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                            opacity 0.25s ease,
                            padding 0.35s ease;

                &::placeholder {
                  color: #94A3B8;
                  font-style: italic;
                  font-size: 0.88rem;
                }
              }

              .search-action-btn {
                background: transparent;
                border: none;
                color: var(--dishoom-ink-muted, #78716C);
                cursor: pointer;
                padding: 0 0.5rem;
                font-size: 0.85rem;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                transition: color 0.2s ease;
                flex-shrink: 0;

                &:hover {
                  color: #bc6c25;
                }
              }

              &.open {
                border-bottom: 1.5px solid #bc6c25;
                flex: 0 0 320px;
                width: 320px;

                @media (max-width: 640px) {
                  flex: 0 0 100%;
                  width: 100%;
                  max-width: 100%;
                  order: 1;
                  margin-bottom: 0.25rem;
                }

                .search-expand-input {
                  width: 100%;
                  opacity: 1;
                  pointer-events: auto;
                  padding: 0 0.4rem 0 0.2rem;
                }
              }
            }

            /* 2. Category Selector Dropdown Block (Frameless, slender Cormorant Garamond) */
            .category-selector-block {
              position: relative;
              display: inline-flex;
              align-items: center;
              flex: 0 0 auto;

              @media (max-width: 640px) {
                order: 2;
              }

              .category-header-btn {
                display: inline-flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.4rem;
                height: 38px;
                background: transparent;
                border: none;
                border-radius: 0;
                padding: 0.2rem 0.35rem;
                cursor: pointer;
                color: var(--dishoom-ink-espresso, #292524);
                box-shadow: none;
                transition: color 0.2s ease;
                width: auto;

                &:hover, &.active {
                  color: #bc6c25;
                  background: transparent;
                  border-color: transparent;

                  .header-btn-left .category-label-text {
                    color: #bc6c25;
                  }

                  .chevron-icon {
                    color: #bc6c25;
                  }
                }

                .header-btn-left {
                  display: flex;
                  align-items: center;
                  gap: 0.35rem;
                  min-width: 0;

                  .category-label-text {
                    font-family: var(--font-heading-editorial, 'Cormorant Garamond', Georgia, serif);
                    font-size: clamp(1.15rem, 2vw, 1.35rem);
                    font-weight: 500;
                    letter-spacing: 0.02em;
                    color: var(--dishoom-ink-charcoal, #1C1917);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    transition: color 0.2s ease;
                  }
                }

                .chevron-icon {
                  color: var(--dishoom-ink-muted, #78716C);
                  font-size: 0.72rem;
                  transition: transform 0.2s ease, color 0.2s ease;
                  margin-left: 0.2rem;
                  flex-shrink: 0;
                }
              }

              .category-dropdown-panel {
                position: absolute;
                top: calc(100% + 6px);
                left: 0;
                z-index: 95;
                width: 270px;
                max-width: calc(100vw - 32px);
                background: #FFFFFF;
                border: 1px solid var(--dishoom-border-sand, #E5DDD0);
                border-radius: 6px;
                box-shadow: 0 16px 36px -6px rgba(28, 25, 23, 0.16),
                            0 4px 12px -2px rgba(28, 25, 23, 0.06);
                padding: 0.75rem 0.65rem;
                animation: searchSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);

                .category-dropdown-header {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding-bottom: 0.5rem;
                  margin-bottom: 0.5rem;
                  border-bottom: 1px solid rgba(229, 221, 208, 0.6);
                  padding-left: 0.35rem;
                  padding-right: 0.35rem;

                  .dropdown-header-title {
                    font-family: var(--font-body-editorial, sans-serif);
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    color: var(--dishoom-ink-muted, #78716C);
                  }

                  .btn-close-dropdown {
                    background: transparent;
                    border: none;
                    color: var(--dishoom-ink-muted, #78716C);
                    cursor: pointer;
                    padding: 0.15rem;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s ease;

                    &:hover {
                      color: #bc6c25;
                    }
                  }
                }

                .category-options-list {
                  display: flex;
                  flex-direction: column;
                  gap: 0.2rem;

                  .category-option-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    background: transparent;
                    border: none;
                    border-radius: 4px;
                    padding: 0.48rem 0.65rem;
                    cursor: pointer;
                    text-align: left;
                    font-family: var(--font-heading-editorial, 'Cormorant Garamond', Georgia, serif);
                    font-size: 1.05rem;
                    font-weight: 500;
                    letter-spacing: 0.02em;
                    color: var(--dishoom-ink-charcoal, #1C1917);
                    transition: all 0.15s ease;

                    .option-label {
                      white-space: nowrap;
                    }

                    .option-check {
                      color: #bc6c25;
                      font-size: 0.75rem;
                    }

                    &:hover {
                      background: rgba(188, 108, 37, 0.07);
                      color: #bc6c25;
                    }

                    &.active {
                      background: rgba(188, 108, 37, 0.1);
                      color: #bc6c25;
                      font-weight: 600;
                    }
                  }
                }
              }
            }

            /* 3. Allergen Filter Block & Floating Overlay (Frameless, slender Cormorant Garamond) */
            .allergen-filter-block {
              position: relative;
              display: inline-flex;
              align-items: center;
              flex: 0 0 auto;

              @media (max-width: 768px) {
                position: static;
                order: 3;
              }

              .allergen-header-btn {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                height: 38px;
                background: transparent;
                border: none;
                border-radius: 0;
                padding: 0.2rem 0.35rem;
                cursor: pointer;
                box-shadow: none;
                transition: color 0.2s ease;

                &:hover, &.active {
                  color: #bc6c25;
                  background: transparent;
                  border-color: transparent;

                  .header-btn-left span {
                    color: #bc6c25;
                  }

                  .chevron-icon {
                    color: #bc6c25;
                  }
                }

                .header-btn-left {
                  display: flex;
                  align-items: center;
                  gap: 0.45rem;

                  .text-brass {
                    color: #bc6c25;
                    font-size: 0.95rem;
                  }

                  span {
                    font-family: var(--font-heading-editorial, 'Cormorant Garamond', Georgia, serif);
                    font-size: clamp(1.15rem, 2vw, 1.35rem);
                    font-weight: 500;
                    letter-spacing: 0.02em;
                    color: var(--dishoom-ink-charcoal, #1C1917);
                    transition: color 0.2s ease;
                  }

                  .allergen-count-badge {
                    background: #FEE2E2;
                    color: #B91C1C;
                    border: 1px solid #FCA5A5;
                    font-family: var(--font-body-editorial, sans-serif);
                    font-size: 0.68rem;
                    font-weight: 600;
                    padding: 0.05rem 0.35rem;
                    border-radius: 3px;
                  }
                }

                .chevron-icon {
                  color: var(--dishoom-ink-muted, #78716C);
                  font-size: 0.72rem;
                  transition: transform 0.2s ease, color 0.2s ease;
                  margin-left: 0.15rem;
                }
              }

              .allergen-dropdown-panel {
                position: absolute;
                top: calc(100% + 8px);
                left: 0;
                right: auto;
                z-index: 95;
                width: 440px;
                max-width: calc(100vw - 32px);
                background: #FFFFFF;
                border: 1px solid var(--dishoom-border-sand, #E5DDD0);
                border-radius: 8px;
                box-shadow: 0 16px 36px -6px rgba(28, 25, 23, 0.16),
                            0 4px 12px -2px rgba(28, 25, 23, 0.06);
                padding: 1rem 1.15rem 0.85rem;
                animation: searchSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);

                @media (max-width: 768px) {
                  left: 0.5rem;
                  right: 0.5rem;
                  width: auto;
                  max-width: none;
                  padding: 0.85rem 0.85rem 0.65rem;
                }

                .allergen-dropdown-header {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding-bottom: 0.55rem;
                  margin-bottom: 0.65rem;
                  border-bottom: 1px solid rgba(229, 221, 208, 0.6);

                  .header-title-box {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;

                    .text-brass {
                      color: #bc6c25;
                      font-size: 0.78rem;
                    }

                    .dropdown-header-title {
                      font-family: var(--font-body-editorial, sans-serif);
                      font-size: 0.75rem;
                      font-weight: 700;
                      text-transform: uppercase;
                      letter-spacing: 0.08em;
                      color: var(--dishoom-ink-muted, #78716C);
                    }
                  }

                  .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;

                    .btn-reset-allergens {
                      background: none;
                      border: none;
                      color: #bc6c25;
                      font-size: 0.72rem;
                      font-weight: 600;
                      cursor: pointer;
                      padding: 0;
                      transition: color 0.2s ease;

                      &:hover {
                        color: #8c4c15;
                        text-decoration: underline;
                      }
                    }

                    .btn-close-allergens {
                      background: transparent;
                      border: none;
                      color: var(--dishoom-ink-muted, #78716C);
                      font-size: 0.85rem;
                      cursor: pointer;
                      padding: 0.15rem;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      transition: color 0.2s ease;

                      &:hover {
                        color: var(--dishoom-ink-charcoal, #1C1917);
                      }
                    }
                  }
                }

                /* Scrollable container showing portion of allergens with generous height so all 14 fit without cramped scrolling */
                .allergen-grid-scroll-wrap {
                  max-height: min(360px, 60vh);
                  overflow-y: auto;
                  overflow-x: hidden;
                  padding-right: 0.35rem;
                  scrollbar-width: thin;
                  scrollbar-color: var(--dishoom-border-sand, #D6CEBE) transparent;

                  &::-webkit-scrollbar {
                    width: 4px;
                  }
                  &::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  &::-webkit-scrollbar-thumb {
                    background: var(--dishoom-border-sand, #D6CEBE);
                    border-radius: 2px;
                  }

                  .allergen-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.5rem 0.85rem;

                    @media (max-width: 640px) {
                      grid-template-columns: repeat(2, 1fr);
                      gap: 0.45rem 0.55rem;
                    }

                    .allergen-check-label {
                      display: flex;
                      align-items: center;
                      gap: 0.55rem;
                      font-size: 0.82rem;
                      cursor: pointer;
                      color: var(--dishoom-ink-espresso, #292524);
                      padding: 0.35rem 0.45rem;
                      border-radius: 4px;
                      transition: background 0.15s ease, color 0.15s ease;
                      user-select: none;

                      &:hover {
                        color: var(--dishoom-ink-charcoal, #1C1917);
                        background: rgba(188, 108, 37, 0.07);
                      }

                      input[type="checkbox"] {
                        accent-color: #bc6c25;
                        width: 16px;
                        height: 16px;
                        cursor: pointer;
                        flex-shrink: 0;
                        margin: 0;
                      }

                      .allergen-check-badge {
                        font-family: var(--font-body-editorial, 'Plus Jakarta Sans', sans-serif);
                        font-weight: 700;
                        color: #bc6c25;
                        font-size: 0.8rem;
                        min-width: 18px;
                        text-align: right;
                        flex-shrink: 0;
                        font-variant-numeric: tabular-nums;
                      }

                      .allergen-check-name {
                        line-height: 1.25;
                        font-weight: 500;
                        letter-spacing: 0.01em;
                        word-break: break-word;
                      }
                    }
                  }
                }

                .allergen-grid-footer {
                  margin-top: 0.75rem;
                  padding-top: 0.65rem;
                  border-top: 1px dashed rgba(229, 221, 208, 0.7);
                  text-align: center;

                  .btn-link-allergens {
                    background: none;
                    border: none;
                    color: #bc6c25;
                    font-family: var(--font-body-editorial, sans-serif);
                    font-size: 0.78rem;
                    font-weight: 600;
                    letter-spacing: 0.03em;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    transition: color 0.2s ease, transform 0.2s ease;

                    &:hover {
                      color: #8c4c15;
                      transform: translateX(2px);
                    }
                  }
                }
              }
            }
          }
        }
      }

      @keyframes searchSlideDown {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .menu-main-column {
        width: 100%;

        .menu-sections-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;

          /* VIEW 1: Clean Editorial Categories for "TUTTI I PIATTI" (No cards, no box shadows) */
          .category-editorial-list {
            display: flex;
            flex-direction: column;
            gap: 2.25rem;
            margin-bottom: 2.25rem;

            .category-editorial-section {
              background: transparent;
              border-bottom: 1px solid var(--dishoom-border-sand, #E5DDD0);
              padding-bottom: 1.75rem;
              transition: border-color 0.25s ease;

              &:last-child {
                border-bottom: none;
                padding-bottom: 0;
              }

              .category-section-header {
                display: flex;
                align-items: baseline;
                justify-content: space-between;
                padding: 0.75rem 0 1rem;
                cursor: pointer;
                user-select: none;
                background: transparent;
                transition: color 0.2s ease;

                &:hover {
                  .cat-section-title {
                    color: var(--dishoom-brass-dark, #945C22);
                  }

                  .cat-chevron-indicator {
                    color: var(--dishoom-brass-dark, #945C22);
                  }
                }

                &:focus-visible {
                  outline: 2px solid var(--dishoom-brass, #C58A3E);
                  outline-offset: 4px;
                }

                .cat-header-left {
                  display: flex;
                  align-items: baseline;
                  gap: 0.85rem;
                  flex-wrap: wrap;

                  .cat-section-title {
                    font-family: var(--font-heading-editorial, 'Cormorant Garamond', Georgia, serif);
                    font-size: clamp(1.8rem, 3.2vw, 2.35rem);
                    font-weight: 500;
                    letter-spacing: 0.01em;
                    color: var(--dishoom-ink-charcoal, #1C1917);
                    margin: 0;
                    line-height: 1.15;
                    transition: color 0.2s ease;

                    @media (max-width: 640px) {
                      font-size: 1.55rem;
                    }
                  }
                }

                .cat-header-right {
                  display: flex;
                  align-items: center;

                  .cat-chevron-indicator {
                    color: var(--dishoom-ink-muted, #78716C);
                    font-size: 0.95rem;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s ease;

                    i {
                      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    &.open i {
                      transform: rotate(180deg);
                    }
                  }
                }
              }

              .category-section-body {
                padding: 0.75rem 0 0.25rem;
                animation: sectionFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);

                .single-section-dishes-wrap {
                  margin-top: 0.5rem;
                }

                .multi-sections-wrap {
                  display: flex;
                  flex-direction: column;
                  gap: 1.5rem;
                }

                .menu-subcategory-block {
                  margin-bottom: 0.75rem;

                  &:last-child {
                    margin-bottom: 0;
                  }
                }
              }
            }
          }

          /* VIEW 2: Direct Sections List */
          .category-direct-sections {
            display: flex;
            flex-direction: column;
            gap: 1.75rem;
          }

          .menu-subcategory-block {
            scroll-margin-top: 150px;

            .dishoom-section-divider {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0.65rem 0;
              margin-bottom: 1rem;
              border-bottom: 1px solid var(--dishoom-border-sand, #E5DDD0);
              position: relative;
              user-select: none;

              &.clickable {
                cursor: pointer;
                border-radius: 2px;
                transition: color 0.2s ease, border-color 0.2s ease;

                &:hover {
                  border-color: rgba(188, 108, 37, 0.4);

                  .section-heading {
                    color: var(--dishoom-brass-dark, #945C22);
                  }

                  .section-chevron-indicator {
                    color: var(--dishoom-brass-dark, #945C22);
                  }
                }

                &:focus-visible {
                  outline: 2px solid var(--dishoom-brass, #C58A3E);
                  outline-offset: 4px;
                }
              }

              .divider-left {
                display: flex;
                align-items: baseline;
                gap: 0.75rem;

                .section-heading {
                  font-family: var(--font-heading-editorial, 'Cormorant Garamond', Georgia, serif);
                  font-size: clamp(1.35rem, 2.2vw, 1.75rem);
                  font-weight: 500;
                  letter-spacing: 0.02em;
                  color: var(--dishoom-ink-charcoal, #1C1917);
                  margin: 0;
                  line-height: 1.2;
                  transition: color 0.2s ease;
                }

                .section-subheading {
                  font-family: var(--font-heading-editorial, 'Cormorant Garamond', Georgia, serif);
                  font-size: 0.95rem;
                  font-style: italic;
                  color: var(--dishoom-ink-muted, #78716C);
                  margin: 0;
                  line-height: 1.2;
                }
              }

              .divider-right {
                display: flex;
                align-items: center;
                gap: 0.75rem;

                .section-chevron-indicator {
                  color: var(--dishoom-ink-muted, #78716C);
                  font-size: 0.85rem;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  transition: color 0.2s ease;

                  i {
                    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                  }

                  &.open i {
                    transform: rotate(180deg);
                  }
                }
              }
            }

            .section-collapse-drawer {
              animation: sectionFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
              margin-bottom: 1.5rem;
            }

            @keyframes sectionFadeIn {
              from {
                opacity: 0;
                transform: translateY(-4px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          }

          .menu-end-coperto-strip {
            margin-top: 2rem;
            margin-bottom: 2.5rem;
            display: flex;
            justify-content: center;
            align-items: center;

            .coperto-text {
              font-family: var(--font-heading-editorial, 'Cormorant Garamond', Georgia, serif);
              font-size: 1.25rem;
              font-weight: 500;
              font-style: italic;
              letter-spacing: 0.03em;
              color: var(--dishoom-ink-muted, #78716C);
            }
          }
          }

          .menu-dishes-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem 3.5rem;

            @media (max-width: 900px) {
              grid-template-columns: 1fr;
              gap: 1rem;
            }
          }

          /* Dedicated Official Allergens Section (1-14 Table + HACCP Note) */
          .official-allergens-section {
            margin-top: 2.25rem;
            margin-bottom: 2.5rem;

            .dishoom-section-divider {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-bottom: 0.75rem;
              margin-bottom: 1.5rem;
              border-bottom: 1px solid var(--dishoom-border-sand, #E5DDD0);
              position: relative;

              .divider-left {
                display: flex;
                align-items: baseline;
                gap: 0.85rem;

                .section-title-box {
                  .section-heading {
                    font-family: var(--font-heading-editorial, 'Cormorant Garamond', Georgia, serif);
                    font-size: clamp(1.4rem, 2.3vw, 1.8rem);
                    font-weight: 500;
                    letter-spacing: 0.02em;
                    color: var(--dishoom-ink-charcoal, #1C1917);
                    margin: 0;
                    line-height: 1.15;
                  }
                }
              }

              .section-counter-pill {
                font-family: var(--font-body-editorial, sans-serif);
                font-size: 0.75rem;
                font-weight: 500;
                color: var(--dishoom-brass-dark, #945C22);
                background: #FAF3E8;
                border: 1px solid var(--dishoom-border-sand, #E5DDD0);
                padding: 0.25rem 0.65rem;
                border-radius: 3px;
                white-space: nowrap;
              }
            }

            .official-allergens-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 1.25rem;

              @media (max-width: 768px) {
                grid-template-columns: 1fr;
                gap: 1rem;
              }

              .official-allergen-card {
                display: flex;
                align-items: flex-start;
                gap: 1.15rem;
                padding: 1.25rem 1.35rem;
                background: #FFFFFF;
                border: 1px solid var(--dishoom-border-sand, #E5DDD0);
                border-radius: 8px;
                box-shadow: 0 2px 6px rgba(28, 25, 23, 0.03);
                transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

                &:hover {
                  border-color: #0284c7;
                  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.12);
                  transform: translateY(-2px);

                  .allergen-num-badge {
                    transform: scale(1.05);
                    box-shadow: 0 3px 8px rgba(2, 132, 199, 0.35);
                  }
                }

                .allergen-card-badge-col {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 0.5rem;
                  flex-shrink: 0;
                  margin-top: 2px;

                  .allergen-num-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    width: 34px;
                    height: 34px;
                    min-width: 34px;
                    min-height: 34px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                    color: #FFFFFF;
                    font-family: var(--font-body-editorial, 'Plus Jakarta Sans', sans-serif);
                    font-weight: 700;
                    font-size: 0.95rem;
                    line-height: 1;
                    letter-spacing: -0.01em;
                    font-variant-numeric: tabular-nums;
                    font-feature-settings: 'tnum' 1;
                    box-shadow: 0 2px 6px rgba(2, 132, 199, 0.28);
                    box-sizing: border-box;
                    padding: 0;
                    margin: 0;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                  }
                }

                .allergen-card-text-col {
                  flex: 1;
                  min-width: 0;

                  .allergen-card-name {
                    font-family: var(--font-heading-editorial, 'Cormorant Garamond', Georgia, serif);
                    font-size: 1.15rem;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    color: var(--dishoom-ink-charcoal, #1C1917);
                    margin: 0 0 0.4rem 0;
                  }

                  .allergen-card-desc {
                    font-family: var(--font-serif-primary, 'Cormorant Garamond', Garamond, serif);
                    font-style: italic;
                    font-size: 0.98rem;
                    line-height: 1.48;
                    color: var(--dishoom-ink-espresso, #292524);
                    margin: 0;
                  }
                }
              }
            }

            .haccp-disclaimer-card {
              margin-top: 2.25rem;
              padding: 1.85rem 2rem;
              background: #FAF6EF;
              border: 1px solid var(--dishoom-border-sand, #E5DDD0);
              border-left: 4px solid var(--dishoom-brass, #C58A3E);
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(28, 25, 23, 0.03);

              .haccp-badge-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 1rem;
                color: var(--dishoom-brass-dark, #945C22);

                i {
                  font-size: 1.35rem;
                }

                h4 {
                  font-family: var(--font-heading, 'Cinzel', serif);
                  font-size: 1.05rem;
                  font-weight: 700;
                  letter-spacing: 0.04em;
                  color: var(--dishoom-ink-charcoal, #1C1917);
                  margin: 0;
                }
              }

              .haccp-body {
                font-family: var(--font-serif-primary, 'Cormorant Garamond', Garamond, serif);
                font-size: 1rem;
                line-height: 1.6;
                color: var(--dishoom-ink-espresso, #292524);

                p {
                  margin-bottom: 0.75rem;
                }

                .haccp-note-alert {
                  font-weight: 700;
                  color: var(--dishoom-ink-charcoal, #1C1917);
                }

                .haccp-signature {
                  font-family: var(--font-heading, 'Cinzel', serif);
                  font-style: italic;
                  font-size: 1.15rem;
                  color: var(--dishoom-brass-dark, #945C22);
                  text-align: right;
                  margin-top: 1rem;
                }
              }
            }

            .menu-end-coperto-strip {
              margin-top: 2rem;
              margin-bottom: 1rem;
              display: flex;
              justify-content: center;
              align-items: center;

              .coperto-text {
                font-family: var(--font-heading, 'Cinzel', serif);
                font-size: 1.1rem;
                font-weight: 700;
                letter-spacing: 0.06em;
                color: var(--dishoom-ink-charcoal, #1C1917);
              }
            }
          }

          .loading-state, .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--color-text-muted, #64748b);

            i {
              font-size: 3rem;
              margin-bottom: 1rem;
              color: var(--color-gold-dark, #bc6c25);
            }

            h3 {
              margin-bottom: 0.5rem;
            }
          }
        }
      }

    @media (max-width: 1024px) {
      .menu-hero-section .hero-title {
        font-size: 2.6rem;
      }
    }
  `],
})
export class MenuComponent implements OnInit, AfterViewInit, OnDestroy {
  private menuService = inject(MenuService);

  @ViewChild('categoryTrack') categoryTrack?: ElementRef<HTMLElement>;
  public canScrollLeft = signal<boolean>(false);
  public canScrollRight = signal<boolean>(false);

  public selectedCategory = signal<string>('');
  public isCategoryDropdownOpen = signal<boolean>(false);
  public openCategoryCardIds = signal<Set<string>>(new Set<string>());
  public selectedSubcategory = signal<string>('');
  public openSectionIds = signal<Set<string>>(new Set<string>());
  public searchQuery: string = '';
  public isSearchOpen = signal<boolean>(false);
  public expandedWeeklyDishIndex = signal<number | null>(null);
  public selectedExcludedAllergens = signal<string[]>([]);
  public isAllergensOpen = signal<boolean>(false);
  public collapsedSearchCategoryIds = signal<Set<string>>(new Set<string>());
  public collapsedSearchSectionIds = signal<Set<string>>(new Set<string>());

  public dishes = signal<MenuItem[]>([]);
  public isLoading = signal<boolean>(true);

  // Category Tabs in Exact Specified Order (Pesce, Pizze, Insalatone, Piatti Estivi, Carne, Contorni, Vini, Allergeni)
  public categoryTabs = [
    { key: '',              label: 'Tutti i Piatti' },
    { key: 'pesce',         label: 'Pesce' },
    { key: 'pizze',         label: 'Pizze' },
    { key: 'insalatone',    label: 'Insalatone' },
    { key: 'piatti_estivi', label: 'Piatti Estivi' },
    { key: 'carne',         label: 'Carne' },
    { key: 'contorni',      label: 'Contorni' },
    { key: 'vini',          label: 'Vini & Bevande' },
    { key: 'allergeni',     label: 'Allergeni' },
  ];

  public currentCategoryTab = computed(() => {
    const cat = this.selectedCategory();
    return this.categoryTabs.find((t) => t.key === cat) || this.categoryTabs[0];
  });

  // Authentic Blackboard Specials transcribed from real restaurant photographs (€7 to €30)
  public weeklySeafood: WeeklySeafoodDish[] = [
    {
      name: 'Crostoni pane pizza con crema di dentice',
      description: 'Croccante base di pane pizza cotto a legna con crema vellutata di dentice nostrano mantecato.',
      price: 9.0,
      category: 'pesce',
    },
    {
      name: '6 Canocce crude',
      description: 'Canocce freschissime dell\'Adriatico aperte a crudo, servite con emulsione di olio EVO e limone.',
      price: 7.0,
      category: 'pesce',
    },
    {
      name: 'Paccheri freschi al pesto con mazzancolle e ricotta affumicata',
      description: 'Pasta fresca trafilata al bronzo, mazzancolle dell\'Adriatico, pesto artigianale e grattugiata di ricotta affumicata.',
      price: 16.5,
      category: 'pesce',
    },
    {
      name: 'Tagliata di tonno pinne gialle con patate al forno',
      description: 'Trancio di tonno pinne gialle scottato alla griglia con cuore rosato, accompagnato da patate dorate al forno.',
      price: 24.0,
      category: 'pesce',
    },
    {
      name: 'Soaso intero pescato alla griglia con patate al forno',
      description: 'Soaso (rombo liscio) nostrano intero cotto lentamente alla brace con erbe aromatiche e patate al forno.',
      price: 30.0,
      category: 'pesce',
    },
  ];

  // Dedicated Official Allergen Explanations (1-14 Table from real restaurant menu)
  public officialAllergensList: OfficialAllergenEntry[] = OFFICIAL_ALLERGEN_EXPLANATIONS;

  // Official EU 1-14 Allergen Mapping Table
  public euAllergens = OFFICIAL_ALLERGENS.map((def) => ({
    number: def.number,
    key: String(def.number),
    slug: def.key,
    label: def.label,
    icon: def.icon,
  }));

  // Subcategory Definitions per Category (Computed dynamically from rendered sections)
  public currentSubcategories = computed<SubcategoryFilter[]>(() => {
    const cat = this.selectedCategory();
    if (!cat || cat === 'allergeni') return [];
    const allSections = this.groupedSections();
    const sections = allSections.filter((sec) => {
      if (cat === 'vini') return sec.category === 'vini' || sec.category === 'bevande';
      return sec.category === cat;
    });
    if (sections.length <= 1) return [];

    return sections.map((sec) => {
      let badge: string | undefined;
      if (sec.id === 'pizze_stagionali') {
        badge = 'Finferli';
      }
      return {
        key: sec.id,
        label: sec.title,
        icon: sec.icon,
        badge,
      };
    });
  });

  // Check if a macro category has multiple subcategories defined
  public hasSubcategories(catKey: string): boolean {
    const defs = MASTER_SECTION_DEFS.filter((d) => {
      if (catKey === 'vini') return d.category === 'vini' || d.category === 'bevande';
      return d.category === catKey;
    });
    return defs.length > 1;
  }

  // Natural numerical / alphabetical sorting helper (e.g. #70, #71, #72...)
  private sortDishesNaturally(dishesList: MenuItem[]): MenuItem[] {
    return [...dishesList].sort((a, b) => {
      const matchA = (a.title || '').match(/\d+/);
      const matchB = (b.title || '').match(/\d+/);
      const numA = matchA ? parseInt(matchA[0], 10) : null;
      const numB = matchB ? parseInt(matchB[0], 10) : null;

      if (numA !== null && numB !== null) {
        if (numA !== numB) return numA - numB;
      } else if (numA !== null) {
        return -1; // numbered items first
      } else if (numB !== null) {
        return 1;
      }
      return (a.title || '').localeCompare(b.title || '', 'it', { numeric: true, sensitivity: 'base' });
    });
  }

  // Grouped Menu Sections Computed Signal for Structured Layout with Dishoom Dividers
  public groupedSections = computed<MenuSectionGroup[]>(() => {
    const allDishes = this.dishes();
    if (!allDishes || allDishes.length === 0) return [];

    const sections: MenuSectionGroup[] = [];

    for (const def of MASTER_SECTION_DEFS) {
      // Filter dishes matching this section definition
      const sectionDishes = allDishes.filter((dish) => {
        if (def.category === 'vini' && dish.category !== 'vini') return false;
        if (def.category === 'bevande' && dish.category !== 'bevande') return false;
        if (def.category !== 'vini' && def.category !== 'bevande' && dish.category !== def.category) {
          return false;
        }
        const sub = (dish.subcategory || '').toLowerCase().trim();
        return def.subcategoryMatch(sub, dish);
      });

      if (sectionDishes.length > 0) {
        const sortedDishes = this.sortDishesNaturally(sectionDishes);
        sections.push({
          id: def.id,
          category: def.category,
          title: def.title,
          subtitle: def.subtitle,
          icon: def.icon,
          dishes: sortedDishes,
        });
      }
    }

    // Fallback: any dishes not matched by standard definitions
    const handledDishTitles = new Set(sections.flatMap((s) => s.dishes.map((d) => d.title)));
    const remainingDishes = allDishes.filter((d) => !handledDishTitles.has(d.title));
    if (remainingDishes.length > 0) {
      const sortedRemaining = this.sortDishesNaturally(remainingDishes);
      sections.push({
        id: 'altre_proposte',
        category: 'varie',
        title: 'Altre Specialità del Menù',
        subtitle: 'Ulteriori creazioni della nostra cucina',
        icon: 'fa-solid fa-utensils',
        dishes: sortedRemaining,
      });
    }

    return sections;
  });

  // Macro-Category Groups for "TUTTI I PIATTI" Accordion Cards View
  public macroCategoryGroups = computed<MacroCategoryGroup[]>(() => {
    const sections = this.groupedSections();
    if (sections.length === 0) return [];

    const groups: MacroCategoryGroup[] = [];

    for (const macro of MACRO_CATEGORIES) {
      const catSections = sections.filter((sec) => {
        if (macro.key === 'vini') {
          return sec.category === 'vini' || sec.category === 'bevande';
        }
        return sec.category === macro.key;
      });

      if (catSections.length > 0) {
        groups.push({
          key: macro.key,
          label: macro.label,
          sections: catSections,
        });
      }
    }

    const handledSecIds = new Set(groups.flatMap((g) => g.sections.map((s) => s.id)));
    const remaining = sections.filter((s) => !handledSecIds.has(s.id));
    if (remaining.length > 0) {
      groups.push({
        key: 'varie',
        label: 'Altre Proposte',
        sections: remaining,
      });
    }

    return groups;
  });

  public activeSectionRows = signal<Record<string, number>>({});

  public isDishExpanded(sectionId: string, dishIndex: number): boolean {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 900 : false;
    const section = this.groupedSections().find((s) => s.id === sectionId);
    if (!section) return true;

    const totalDishes = section.dishes.length;
    const count = isMobile ? 3 : 6;
    if (totalDishes <= count) {
      return true;
    }

    const activeRow = this.activeSectionRows()[sectionId] ?? 0;

    if (isMobile) {
      // Single column on mobile: 3 consecutive dishes
      return dishIndex >= activeRow && dishIndex < activeRow + 3;
    } else {
      // 2-column grid on desktop: 3 rows = 6 dishes
      const dishRow = Math.floor(dishIndex / 2);
      return dishRow >= activeRow && dishRow <= activeRow + 2;
    }
  }

  public onDishClick(sectionId: string, dishIndex: number): void {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 900 : false;
    const section = this.groupedSections().find((s) => s.id === sectionId);
    if (!section) return;

    const totalDishes = section.dishes.length;
    const count = isMobile ? 3 : 6;
    if (totalDishes <= count) return;

    if (isMobile) {
      const maxRow = Math.max(0, totalDishes - 3);
      const target = Math.min(Math.max(0, dishIndex), maxRow);
      this.activeSectionRows.update((map) => ({ ...map, [sectionId]: target }));
    } else {
      const dishRow = Math.floor(dishIndex / 2);
      const totalRows = Math.ceil(totalDishes / 2);
      const maxRow = Math.max(0, totalRows - 3);
      const target = Math.min(Math.max(0, dishRow), maxRow);
      this.activeSectionRows.update((map) => ({ ...map, [sectionId]: target }));
    }
  }

  private ticking = false;

  private onWindowScroll = (): void => {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.updateFocalDishWindow();
        this.ticking = false;
      });
      this.ticking = true;
    }
  };

  private onWindowResize = (): void => {
    this.checkCategoryScroll();
    this.updateFocalDishWindow();
  };

  public updateFocalDishWindow(): void {
    if (this.isLoading() || typeof window === 'undefined') return;

    const isMobile = window.innerWidth <= 900;
    const focalY = window.innerHeight * 0.35;

    const sectionBlocks = document.querySelectorAll<HTMLElement>('.menu-subcategory-block');
    if (!sectionBlocks || sectionBlocks.length === 0) return;

    const updatedRows: Record<string, number> = { ...this.activeSectionRows() };
    let hasChanges = false;

    sectionBlocks.forEach((block) => {
      const sectionId = block.getAttribute('data-section-id');
      if (!sectionId) return;

      const cards = block.querySelectorAll<HTMLElement>('.menu-dishes-grid app-dish-card');
      const totalDishes = cards.length;
      const count = isMobile ? 3 : 6;

      if (totalDishes <= count) {
        if (updatedRows[sectionId] !== 0) {
          updatedRows[sectionId] = 0;
          hasChanges = true;
        }
        return;
      }

      const blockRect = block.getBoundingClientRect();
      const totalRows = isMobile ? totalDishes : Math.ceil(totalDishes / 2);
      const maxRow = Math.max(0, totalRows - 3);

      // If block is completely above the reading area, keep at maxRow
      if (blockRect.bottom < focalY) {
        if (updatedRows[sectionId] !== maxRow) {
          updatedRows[sectionId] = maxRow;
          hasChanges = true;
        }
        return;
      }

      // If block is completely below the reading area, keep at row 0
      if (blockRect.top > focalY + 250) {
        if (updatedRows[sectionId] !== 0) {
          updatedRows[sectionId] = 0;
          hasChanges = true;
        }
        return;
      }

      // Block is in the reading zone: find card closest to focalY
      let closestIndex = 0;
      let minDistance = Infinity;

      cards.forEach((card, idx) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height * 0.35;
        const distance = Math.abs(cardCenter - focalY);

        if (rect.top <= focalY && rect.bottom >= focalY) {
          closestIndex = idx;
          minDistance = -1;
        } else if (minDistance !== -1 && distance < minDistance) {
          minDistance = distance;
          closestIndex = idx;
        }
      });

      const targetRow = isMobile ? closestIndex : Math.floor(closestIndex / 2);
      const clampedRow = Math.min(Math.max(0, targetRow), maxRow);

      if (updatedRows[sectionId] !== clampedRow) {
        updatedRows[sectionId] = clampedRow;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.activeSectionRows.set(updatedRows);
    }
  }

  ngOnInit(): void {
    this.fetchMenu();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.checkCategoryScroll();
      this.updateFocalDishWindow();
    }, 180);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onWindowResize);
      window.addEventListener('scroll', this.onWindowScroll, { passive: true });
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onWindowResize);
      window.removeEventListener('scroll', this.onWindowScroll);
    }
  }

  public checkCategoryScroll(): void {
    const el = this.categoryTrack?.nativeElement;
    if (!el) return;
    const canLeft = el.scrollLeft > 8;
    const canRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 8;
    this.canScrollLeft.set(canLeft);
    this.canScrollRight.set(canRight);
  }

  public scrollCategoryNav(direction: 'left' | 'right'): void {
    const el = this.categoryTrack?.nativeElement;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.65, 240);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(() => this.checkCategoryScroll(), 350);
  }

  fetchMenu(): void {
    this.isLoading.set(true);

    const params: any = {};

    if (this.searchQuery.trim()) params.search = this.searchQuery.trim();
    if (this.selectedExcludedAllergens().length > 0) {
      params.excludeAllergens = this.selectedExcludedAllergens().join(',');
    }

    this.menuService.getMenuItems(params).subscribe({
      next: (res) => {
        if (res.success) {
          const items = (res.data || []).filter(
            (dish) => dish.title?.toLowerCase().trim() !== 'coperto' && dish.subcategory?.toLowerCase().trim() !== 'coperto'
          );
          this.dishes.set(this.sortDishesNaturally(items));
        }
        this.isLoading.set(false);
        setTimeout(() => this.updateFocalDishWindow(), 120);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setCategory(cat: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (cat === '') {
      this.selectedCategory.set('');
      this.selectedSubcategory.set('');
      this.openCategoryCardIds.set(new Set<string>());
      this.scrollToMenuTop();
    } else if (cat === 'allergeni') {
      this.selectedCategory.set('allergeni');
      this.selectedSubcategory.set('');
      this.openCategoryCardIds.set(new Set<string>());
      this.scrollToAllergens();
    } else {
      this.selectedSubcategory.set('');
      this.openCategory(cat);
      this.scrollToCategory(cat);
    }
  }

  toggleCategoryDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isCategoryDropdownOpen.update((v) => !v);
    if (this.isCategoryDropdownOpen()) {
      if (this.isAllergensOpen()) {
        this.isAllergensOpen.set(false);
      }
      if (this.isSearchOpen() && !this.searchQuery) {
        this.isSearchOpen.set(false);
      }
    }
  }

  selectCategoryFromDropdown(catKey: string): void {
    this.isCategoryDropdownOpen.set(false);
    this.setCategory(catKey);
  }

  openCategory(catKey: string): void {
    this.selectedCategory.set(catKey);
    // Mutual exclusivity: only one category is open at a time
    this.openCategoryCardIds.set(new Set<string>([catKey]));
    // Subcategories start closed when category is opened
    this.openSectionIds.set(new Set<string>());
    this.selectedSubcategory.set('');

    setTimeout(() => this.updateFocalDishWindow(), 120);
  }

  toggleCategoryCard(catKey: string): void {
    if (this.searchQuery.trim().length > 0) {
      this.collapsedSearchCategoryIds.update((set) => {
        const next = new Set(set);
        if (next.has(catKey)) {
          next.delete(catKey);
        } else {
          next.add(catKey);
        }
        return next;
      });
      return;
    }

    if (this.openCategoryCardIds().has(catKey)) {
      this.openCategoryCardIds.set(new Set<string>());
      this.selectedCategory.set('');
      this.openSectionIds.set(new Set<string>());
      this.selectedSubcategory.set('');
    } else {
      this.openCategory(catKey);
    }
  }

  isCategoryCardOpen(catKey: string): boolean {
    if (this.searchQuery.trim().length > 0) {
      return !this.collapsedSearchCategoryIds().has(catKey);
    }
    return this.openCategoryCardIds().has(catKey);
  }

  selectCategoryFromCard(catKey: string, event: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.setCategory(catKey);
  }

  scrollToCategory(catKey: string): void {
    if (typeof window === 'undefined') return;
    setTimeout(() => {
      const el = document.getElementById(`macro-cat-${catKey}`);
      if (!el) return;
      const headerOffset = 135;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }, 80);
  }

  scrollToMenuTop(): void {
    if (typeof window === 'undefined') return;
    setTimeout(() => {
      const el = document.querySelector('.menu-main-column');
      if (el) {
        const headerOffset = 135;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });
      }
    }, 50);
  }

  onSubcategoryClick(sectionId: string): void {
    this.selectedSubcategory.set(sectionId);
    this.openSectionIds.update((set) => {
      const next = new Set(set);
      next.add(sectionId);
      return next;
    });

    setTimeout(() => {
      this.scrollToSection(sectionId);
      this.updateFocalDishWindow();
    }, 50);
  }

  setSubcategory(sub: string): void {
    this.onSubcategoryClick(sub);
  }

  toggleSection(sectionId: string): void {
    if (this.searchQuery.trim().length > 0) {
      this.collapsedSearchSectionIds.update((set) => {
        const next = new Set(set);
        if (next.has(sectionId)) {
          next.delete(sectionId);
        } else {
          next.add(sectionId);
        }
        return next;
      });
      return;
    }

    this.openSectionIds.update((set) => {
      const next = new Set(set);
      if (next.has(sectionId)) {
        next.delete(sectionId);
        if (this.selectedSubcategory() === sectionId) {
          this.selectedSubcategory.set('');
        }
      } else {
        next.add(sectionId);
        this.selectedSubcategory.set(sectionId);
      }
      return next;
    });
    setTimeout(() => this.updateFocalDishWindow(), 120);
  }

  isSectionOpen(sectionId: string): boolean {
    if (this.searchQuery.trim().length > 0) {
      return !this.collapsedSearchSectionIds().has(sectionId);
    }
    return this.openSectionIds().has(sectionId);
  }

  scrollToSection(sectionId: string): void {
    if (typeof window === 'undefined') return;
    const el = document.getElementById(`section-${sectionId}`) || document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!el) return;

    const headerOffset = 135;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: 'smooth',
    });
  }

  filterByCategory(cat: string): void {
    this.setCategory(cat);
  }

  onFilterChange(): void {
    this.collapsedSearchCategoryIds.set(new Set<string>());
    this.collapsedSearchSectionIds.set(new Set<string>());
    this.activeSectionRows.set({});
    this.fetchMenu();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.collapsedSearchCategoryIds.set(new Set<string>());
    this.collapsedSearchSectionIds.set(new Set<string>());
    this.activeSectionRows.set({});
    this.fetchMenu();
  }

  toggleSearch(): void {
    if (this.isSearchOpen()) {
      if (this.searchQuery.trim()) {
        this.onSearchSubmit();
      } else {
        this.closeSearch();
      }
    } else {
      this.isSearchOpen.set(true);
      if (this.isAllergensOpen()) {
        this.isAllergensOpen.set(false);
      }
      setTimeout(() => {
        const input = document.getElementById('dishoom-search-input') as HTMLInputElement | null;
        input?.focus();
      }, 100);
    }
  }

  closeSearch(): void {
    this.isSearchOpen.set(false);
    if (this.searchQuery) {
      this.clearSearch();
    }
  }

  onSearchSubmit(): void {
    this.collapsedSearchCategoryIds.set(new Set<string>());
    this.collapsedSearchSectionIds.set(new Set<string>());
    this.activeSectionRows.set({});
    this.fetchMenu();
    const input = document.getElementById('dishoom-search-input') as HTMLInputElement | null;
    input?.blur();
  }

  toggleAllergensDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isAllergensOpen.update((v) => !v);
    if (this.isAllergensOpen()) {
      if (this.isCategoryDropdownOpen()) {
        this.isCategoryDropdownOpen.set(false);
      }
      if (this.isSearchOpen() && !this.searchQuery) {
        this.isSearchOpen.set(false);
      }
    }
  }

  clearAllergenExclusions(): void {
    this.selectedExcludedAllergens.set([]);
    this.fetchMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Close category dropdown if clicking outside
    if (this.isCategoryDropdownOpen()) {
      const catBlock = document.getElementById('sezione-categoria-selettore');
      if (catBlock && !catBlock.contains(target)) {
        this.isCategoryDropdownOpen.set(false);
      }
    }

    // Close allergen dropdown if clicking outside
    if (this.isAllergensOpen()) {
      const allergenBlock = document.getElementById('sezione-allergeni');
      if (allergenBlock && !allergenBlock.contains(target)) {
        this.isAllergensOpen.set(false);
      }
    }

    // Close search bar if empty and clicking outside
    if (this.isSearchOpen() && !this.searchQuery) {
      const searchEl = document.querySelector('.expandable-search');
      if (searchEl && !searchEl.contains(target)) {
        this.isSearchOpen.set(false);
      }
    }
  }

  scrollToAllergens(): void {
    this.isAllergensOpen.set(false);
    this.isCategoryDropdownOpen.set(false);
    this.selectedCategory.set('allergeni');
    this.selectedSubcategory.set('');
    this.openCategoryCardIds.set(new Set<string>());
    setTimeout(() => {
      const el = document.getElementById('sezione-tabella-allergeni');
      if (el) {
        const headerOffset = 135;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });
      }
    }, 100);
  }

  isAllergenExcluded(key: string): boolean {
    return this.selectedExcludedAllergens().includes(key);
  }

  toggleAllergenExclusion(key: string): void {
    this.selectedExcludedAllergens.update((list) => {
      if (list.includes(key)) {
        return list.filter((item) => item !== key);
      } else {
        return [...list, key];
      }
    });
    this.fetchMenu();
  }

  toggleWeeklyDish(index: number): void {
    this.expandedWeeklyDishIndex.update((current) => (current === index ? null : index));
  }

  resetFilters(): void {
    this.selectedCategory.set('');
    this.selectedSubcategory.set('');
    this.openSectionIds.set(new Set<string>());
    this.openCategoryCardIds.set(new Set<string>());
    this.collapsedSearchCategoryIds.set(new Set<string>());
    this.collapsedSearchSectionIds.set(new Set<string>());
    this.searchQuery = '';
    this.isSearchOpen.set(false);
    this.selectedExcludedAllergens.set([]);
    this.activeSectionRows.set({});
    this.fetchMenu();
  }
}
