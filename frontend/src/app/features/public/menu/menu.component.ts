import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuService } from '../../../core/services/menu.service';
import { MenuItem, MenuCategory } from '../../../core/models';
import { DishCardComponent } from '../../../shared/components/dish-card/dish-card.component';
import { AllergenBadgeComponent, OFFICIAL_ALLERGENS } from '../../../shared/components/allergen-badge/allergen-badge.component';
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
  tag: string;
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
    title: 'Primi Piatti di Pesce',
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

  // 3. TRADIZIONE CARNE (Antipasti, Primi, Secondi)
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
    title: 'Secondi di Carne & Grigliate',
    subtitle: 'Tagliata di manzo al rosmarino, agnello e cotolette',
    icon: 'fa-solid fa-drumstick-bite',
  },

  // 4. INSALATONE GOURMET
  {
    id: 'insalatone',
    category: 'insalatone',
    subcategoryMatch: () => true,
    title: 'Le Nostre Insalatone Gourmet',
    subtitle: 'Insalatone ricche con burrata pugliese, tonno fresco e salmone',
    icon: 'fa-solid fa-leaf',
  },

  // 5. CONTORNI & COPERTO
  {
    id: 'contorni',
    category: 'contorni',
    subcategoryMatch: () => true,
    title: 'Contorni Caldi e Freddi & Coperto',
    subtitle: 'Patate al forno, fritte dorate, verdure al forno e coperto',
    icon: 'fa-solid fa-bowl-rice',
  },

  // 6. PIZZE DEL CAMPIONE (Pizze di Stagione, Classiche, Della Casa, Speciali, Bianche, Verdure)
  {
    id: 'pizze_stagionali',
    category: 'pizze',
    subcategoryMatch: (sub) => sub === 'stagionali' || sub === 'stagione_finferli' || sub === 'finferli_stagione',
    title: 'Pizze di Stagione',
    subtitle: 'Creazioni a rotazione con ingredienti freschi di stagione (finferli, asparagi, radicchio)',
    icon: 'fa-solid fa-fire-flame-curved',
  },
  {
    id: 'pizze_classiche',
    category: 'pizze',
    subcategoryMatch: (sub) => sub === 'classiche',
    title: 'Pizze Classiche',
    subtitle: 'I grandi classici della tradizione italiana con mozzarella Comalat',
    icon: 'fa-solid fa-pizza-slice',
  },
  {
    id: 'pizze_della_casa',
    category: 'pizze',
    subcategoryMatch: (sub) => sub === 'della_casa' || sub === 'ricercate',
    title: 'Pizze della Casa / Ricercate',
    subtitle: 'Gli abbinamenti storici ed esclusivi de Il Veliero',
    icon: 'fa-solid fa-crown',
  },
  {
    id: 'pizze_speciali',
    category: 'pizze',
    subcategoryMatch: (sub) => sub === 'speciali',
    title: 'Pizze Speciali del Campione',
    subtitle: 'Le ricette pluripremiate e creative del Campione del Mondo',
    icon: 'fa-solid fa-trophy',
  },
  {
    id: 'pizze_bianche',
    category: 'pizze',
    subcategoryMatch: (sub) => sub === 'bianche',
    title: 'Pizze Bianche',
    subtitle: 'Base senza pomodoro con formaggi DOP e salumi di pregio',
    icon: 'fa-solid fa-circle-notch',
  },
  {
    id: 'pizze_verdure',
    category: 'pizze',
    subcategoryMatch: (sub) => sub === 'verdure',
    title: 'Pizze con Verdure ai Ferri',
    subtitle: 'Verdure fresche grigliate e funghi porcini nostrani',
    icon: 'fa-solid fa-carrot',
  },

  // 7. VINI & BEVANDE (Carta dei Vini, Birre Artigianali, Caffetteria & Bibite, Grappe & Amari)
  {
    id: 'vini_carta',
    category: 'vini',
    subcategoryMatch: () => true,
    title: 'Carta dei Vini',
    subtitle: 'Bollicine Metodo Classico, Champagne e bianchi/rossi regionali',
    icon: 'fa-solid fa-wine-bottle',
  },
  {
    id: 'bevande_birre',
    category: 'bevande',
    subcategoryMatch: (sub) => sub === 'birre' || sub === 'birre_artigianali',
    title: 'Birre Artigianali',
    subtitle: 'Selezione di birre artigianali alla spina e in bottiglia',
    icon: 'fa-solid fa-beer-mug-empty',
  },
  {
    id: 'bevande_caffetteria',
    category: 'bevande',
    subcategoryMatch: (sub) => sub === 'caffetteria' || sub === 'bibite' || sub === 'vino_sfuso',
    title: 'Caffetteria, Bibite & Vino Sfuso',
    subtitle: 'Espresso di qualità, bibite in vetro, vino della casa e acqua Levico',
    icon: 'fa-solid fa-mug-hot',
  },
  {
    id: 'bevande_amari_grappe',
    category: 'bevande',
    subcategoryMatch: (sub) => sub === 'amari' || sub === 'grappe' || sub === 'amari_grappe',
    title: 'Grappe & Amari Veneti',
    subtitle: 'La tradizione delle grandi distillerie di Bassano (Nardini, Poli) e amari storici',
    icon: 'fa-solid fa-whiskey-glass',
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
      <!-- THEMATIC HEADER: "Il Pesce fresco dei Nostri Mari" (Mockup Page 5) -->
      <section class="menu-hero-section">
        <app-nautical-decor></app-nautical-decor>
        <div class="container hero-inner">
          <div class="hero-header-badge">
            <app-nautical-star size="26px"></app-nautical-star>
            <span>Dall'Asta del Pesce alla Tavola</span>
            <app-nautical-star size="26px"></app-nautical-star>
          </div>
          <h1 class="hero-title">IL PESCE FRESCO DEI NOSTRI MARI</h1>
          <p class="hero-subtitle">
            Un itinerario gastronomico che unisce la purezza del pescato adriatico e la sapienza dell'arte bianca cotta nel forno a legna del Campione del Mondo.
          </p>

          <div class="header-multimedia-box">
            <div class="media-box-inner">
              <div class="box-icon">
                <i class="fa-solid fa-fish-fins"></i>
              </div>
              <div class="box-text">
                <h4>Freschezza & Tracciabilità</h4>
                <p>Ogni piatto marinaro racconta la provenienza certificata e la selezione quotidiana delle nostre paranze.</p>
              </div>
              <div class="box-actions">
                <a routerLink="/pescato" class="btn btn-gold btn-sm">
                  <i class="fa-solid fa-book-bookmark"></i> Diario del Pescato
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- PESCATO DELLA SETTIMANA (Authentic Handwritten Specials from Blackboard) -->
      <section class="section weekly-seafood-section">
        <div class="container">
          <div class="section-header">
            <span class="subtitle">I Piatti in Evidenza — Fuori Carta</span>
            <h2>Pescato della Settimana</h2>
            <p class="description">
              Le proposte selezionate dal nostro Chef trascritte direttamente dalla lavagna del pescato fresco di giornata.
            </p>
          </div>

          <div class="weekly-dishes-grid">
            <div class="weekly-dish-card card" *ngFor="let dish of weeklySeafood">
              <div class="dish-top-bar">
                <span class="dish-tag">{{ dish.tag }}</span>
                <span class="dish-price">€ {{ dish.price.toFixed(2) }}</span>
              </div>
              <h3 class="dish-name">{{ dish.name }}</h3>
              <p class="dish-desc">{{ dish.description }}</p>
              <div class="dish-card-footer">
                <span class="dish-freshness">
                  <i class="fa-solid fa-water"></i> Pescato Fresco
                </span>
                <button
                  class="btn-order-interest"
                  (click)="filterByCategory(dish.category)"
                  title="Vedi categoria"
                >
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- MAIN MENU: 8 Category Navigation Tabs & Sub-Filters -->
      <section class="section main-menu-content">
        <div class="container">
          <div class="section-header">
            <span class="subtitle">La Nostra Carta Completa</span>
            <h2>Seleziona la Categoria</h2>
            <p class="description">
              Consulta l'intera offerta culinaria tra specialità marinare, pizze pluripremiate, piatti estivi, carni scelte e la carta dei vini.
            </p>
          </div>

          <!-- Dishoom Minimalist Editorial 8-Category Navigation (R4) -->
          <nav class="dishoom-category-nav" aria-label="Selettore Categorie Menù">
            <div class="category-nav-track">
              <button
                *ngFor="let tab of categoryTabs"
                class="category-nav-btn"
                [class.active]="selectedCategory() === tab.key"
                (click)="setCategory(tab.key)"
              >
                <i [class]="tab.icon" style="margin-right: 0.4rem; font-size: 0.85rem;"></i>
                <span>{{ tab.label }}</span>
              </button>
            </div>
          </nav>

          <!-- Sub-Filter Pill Selector Bar -->
          <div class="subcategories-bar-wrapper" *ngIf="currentSubcategories().length > 0">
            <div class="subcategories-bar">
              <button
                *ngFor="let sub of currentSubcategories()"
                class="subcat-pill"
                [class.active]="selectedSubcategory() === sub.key"
                [class.featured-finferli]="sub.key === 'stagionali' || sub.key === 'finferli'"
                (click)="setSubcategory(sub.key)"
              >
                <i *ngIf="sub.icon" [class]="sub.icon"></i>
                <span>{{ sub.label }}</span>
                <span *ngIf="sub.badge" class="subcat-badge">{{ sub.badge }}</span>
              </button>
            </div>
          </div>

          <!-- Section Banner for Season Highlight (Pizze di stagione) -->
          <div *ngIf="selectedCategory() === 'pizze' && (!selectedSubcategory() || selectedSubcategory() === 'stagionali')" class="finferli-highlight-banner">
            <div class="banner-badge"><i class="fa-solid fa-fire-flame-curved"></i> IN EVIDENZA</div>
            <div class="banner-content">
              <h3>Pizze di Stagione</h3>
              <p>Le nostre speciali creazioni di stagione con ingredienti freschissimi di mercato (finferli, asparagi, radicchio tardivo) abbinati ai migliori impasti a lunga lievitazione del Campione del Mondo.</p>
            </div>
          </div>

          <!-- MENU LAYOUT: Main Dishes Grid + Sticky Lateral Quick Menu -->
          <div class="menu-dual-layout">
            <!-- Left/Center: Dishes & Filters -->
            <div class="menu-main-column">
              <!-- Dishoom Heritage Search & Culinary Filtering Bar -->
              <div class="dishoom-search-panel">
                <div class="search-panel-top">
                  <div class="search-label-group">
                    <span class="search-kicker"><i class="fa-solid fa-compass"></i> GUIDA GASTRONOMICA</span>
                    <h3 class="search-title">Cerca nella Nostra Carta</h3>
                  </div>
                  <span class="dish-counter-badge" *ngIf="!isLoading()">
                    <strong>{{ dishes().length }}</strong> {{ dishes().length === 1 ? 'proposta' : 'proposte nel menù' }}
                  </span>
                </div>

                <div class="dishoom-search-field-wrap">
                  <div class="search-field-inner">
                    <span class="field-icon-box">
                      <i class="fa-solid fa-magnifying-glass"></i>
                    </span>
                    <input
                      type="text"
                      class="dishoom-search-input"
                      placeholder="Cerca piatto, pizza, ingrediente (es. finferli, vongole veraci, burrata, amarone...)"
                      [(ngModel)]="searchQuery"
                      (ngModelChange)="onFilterChange()"
                      aria-label="Cerca piatti nel menu"
                    />
                    <button
                      *ngIf="searchQuery"
                      (click)="clearSearch()"
                      class="dishoom-clear-search-btn"
                      title="Cancella ricerca"
                      type="button"
                    >
                      <i class="fa-solid fa-xmark"></i>
                      <span>Azzera</span>
                    </button>
                  </div>
                </div>

                <!-- Quick Suggestion Tags (Dynamic per Category) -->
                <div class="search-quick-tags">
                  <span class="quick-tags-label">Suggeriti per questa sezione:</span>
                  <div class="quick-tags-list">
                    <button
                      *ngFor="let tag of currentCategorySuggestions()"
                      type="button"
                      class="quick-tag-chip"
                      [class.active]="searchQuery.toLowerCase() === tag.toLowerCase()"
                      (click)="setSearchSuggestion(tag)"
                    >
                      {{ tag }}
                    </button>
                  </div>
                </div>

                <!-- Filters Sub-Row (Allergen Accordion + Chef Specials) -->
                <div class="search-controls-row">
                  <!-- Official 1-14 Allergen Exclusion Filter Accordion -->
                  <div class="allergen-filter-block" id="sezione-allergeni">
                    <button
                      type="button"
                      class="allergen-header-btn"
                      (click)="toggleAllergensDropdown()"
                      [class.active]="isAllergensOpen()"
                    >
                      <div class="header-btn-left">
                        <i class="fa-solid fa-shield-halved text-brass"></i>
                        <span>Filtro Allergeni Ufficiali (1–14)</span>
                        <span *ngIf="selectedExcludedAllergens().length > 0" class="allergen-count-badge">
                          {{ selectedExcludedAllergens().length }} esclusi
                        </span>
                      </div>
                      <i class="fa-solid chevron-icon" [ngClass]="isAllergensOpen() ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                    </button>

                    <div class="allergen-grid" *ngIf="isAllergensOpen()">
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

                  <div class="special-filter-toggle">
                    <label class="toggle-label">
                      <input
                        type="checkbox"
                        [(ngModel)]="onlyChefSpecials"
                        (ngModelChange)="onFilterChange()"
                      />
                      <span class="toggle-text">
                        <i class="fa-solid fa-trophy text-brass"></i> Specialità del Campione
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Dishes Render Area with Structured Grouped Sections & Dishoom Dividers -->
              <div class="dishes-render-area">
                <div *ngIf="isLoading()" class="loading-state">
                  <i class="fa-solid fa-spinner fa-spin"></i> Caricamento pietanze in corso...
                </div>

                <div *ngIf="!isLoading() && dishes().length === 0" class="empty-state card">
                  <i class="fa-solid fa-filter-circle-xmark"></i>
                  <h3>Nessun piatto trovato</h3>
                  <p>Nessuna pietanza corrisponde ai criteri di ricerca o ai filtri allergeni selezionati.</p>
                  <button (click)="resetFilters()" class="btn btn-outline btn-sm">Resetta Filtri</button>
                </div>

                <div *ngIf="!isLoading() && dishes().length > 0" class="menu-sections-wrapper">
                  <div *ngFor="let section of groupedSections()" class="menu-subcategory-block">
                    <!-- Elegant Dishoom Subcategory Section Divider -->
                    <div class="dishoom-section-divider">
                      <div class="divider-left">
                        <span class="section-icon-wrap"><i [class]="section.icon"></i></span>
                        <div class="section-title-box">
                          <h3 class="section-heading">{{ section.title }}</h3>
                          <p *ngIf="section.subtitle" class="section-subheading">{{ section.subtitle }}</p>
                        </div>
                      </div>
                      <span class="section-counter-pill">{{ section.dishes.length }} {{ section.dishes.length === 1 ? 'proposta' : 'proposte' }}</span>
                    </div>

                    <div class="menu-dishes-grid">
                      <app-dish-card *ngFor="let dish of section.dishes" [dish]="dish"></app-dish-card>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Sticky Lateral Quick Menu -->
            <aside class="sticky-lateral-quick-menu">
              <div class="quick-menu-card card">
                <div class="quick-header">
                  <i class="fa-solid fa-compass"></i>
                  <h4>Navigazione Menù</h4>
                </div>

                <ul class="quick-links-list">
                  <li>
                    <button
                      (click)="setCategory('pesce')"
                      [class.active]="selectedCategory() === 'pesce'"
                    >
                      <i class="fa-solid fa-fish"></i>
                      <span>Specialità Pesce</span>
                    </button>
                  </li>
                  <li>
                    <button
                      (click)="setCategory('pizze')"
                      [class.active]="selectedCategory() === 'pizze'"
                    >
                      <i class="fa-solid fa-pizza-slice"></i>
                      <span>Pizze del Campione</span>
                    </button>
                  </li>
                  <li>
                    <button
                      (click)="setCategory('insalatone')"
                      [class.active]="selectedCategory() === 'insalatone'"
                    >
                      <i class="fa-solid fa-leaf"></i>
                      <span>Insalatone Gourmet</span>
                    </button>
                  </li>
                  <li>
                    <button
                      (click)="setCategory('piatti_estivi')"
                      [class.active]="selectedCategory() === 'piatti_estivi'"
                    >
                      <i class="fa-solid fa-sun"></i>
                      <span>Piatti Estivi</span>
                    </button>
                  </li>
                  <li>
                    <button
                      (click)="setCategory('carne')"
                      [class.active]="selectedCategory() === 'carne'"
                    >
                      <i class="fa-solid fa-drumstick-bite"></i>
                      <span>Tradizione Carne</span>
                    </button>
                  </li>
                  <li>
                    <button
                      (click)="setCategory('contorni')"
                      [class.active]="selectedCategory() === 'contorni'"
                    >
                      <i class="fa-solid fa-bowl-rice"></i>
                      <span>Contorni & Coperto</span>
                    </button>
                  </li>
                  <li>
                    <button
                      (click)="setCategory('vini')"
                      [class.active]="selectedCategory() === 'vini'"
                    >
                      <i class="fa-solid fa-wine-glass"></i>
                      <span>Vini & Bevande</span>
                    </button>
                  </li>
                  <li class="divider-item"></li>
                  <li>
                    <button
                      (click)="scrollToAllergens()"
                      class="allergen-jump-btn"
                    >
                      <i class="fa-solid fa-shield-halved"></i>
                      <span>Tabella Allergeni 1–14</span>
                    </button>
                  </li>
                </ul>

                <div class="quick-footer-box">
                  <small>Forno a Legna & Pescato del Giorno</small>
                  <p class="quick-subnote">Bassano del Grappa (VI)</p>
                  <a href="tel:0424500200" class="btn btn-gold btn-sm w-100" style="width: 100%; margin-top: 0.75rem;">
                    <i class="fa-solid fa-phone"></i> Chiama 0424 500 200
                  </a>
                </div>
              </div>
            </aside>
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

    /* Thematic Header: "Il Pesce fresco dei Nostri Mari" */
    .menu-hero-section {
      background: linear-gradient(135deg, var(--color-navy-dark, #07192f) 0%, var(--color-navy-primary, #0b2545) 100%);
      color: #ffffff;
      padding: 5rem 0 4.5rem;
      text-align: center;
      position: relative;
      overflow: hidden;

      .hero-inner {
        position: relative;
        z-index: 2;
      }

      .hero-header-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--color-gold, #dda15e);
        font-family: var(--font-heading, 'Cinzel', serif);
        font-size: 0.92rem;
        text-transform: uppercase;
        letter-spacing: 2.5px;
        margin-bottom: 0.75rem;
      }

      .hero-title {
        font-size: 3.4rem;
        letter-spacing: 3px;
        color: #ffffff;
        margin-bottom: 1.25rem;
        line-height: 1.1;
      }

      .hero-subtitle {
        color: var(--color-seafoam, #eef4f8);
        font-size: 1.15rem;
        max-width: 720px;
        margin: 0 auto 2.5rem;
        line-height: 1.7;
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

    /* Pescato della Settimana */
    .weekly-seafood-section {
      background: var(--color-seafoam, #eef4f8);
      padding: 4.5rem 0;

      .weekly-dishes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.75rem;

        .weekly-dish-card {
          background: #ffffff;
          padding: 1.75rem;
          border-radius: 14px;
          border-top: 4px solid var(--color-gold, #dda15e);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;

          &:hover {
            transform: translateY(-6px);
            box-shadow: var(--shadow-hover, 0 15px 35px rgba(11, 37, 69, 0.18));
          }

          .dish-top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;

            .dish-tag {
              font-size: 0.75rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: var(--color-gold-dark, #bc6c25);
              background: rgba(221, 161, 94, 0.15);
              padding: 0.2rem 0.6rem;
              border-radius: 20px;
            }

            .dish-price {
              font-family: var(--font-heading, 'Cinzel', serif);
              font-size: 1.35rem;
              font-weight: 700;
              color: var(--color-navy-dark, #07192f);
            }
          }

          .dish-name {
            font-size: 1.25rem;
            color: var(--color-navy-dark, #07192f);
            margin-bottom: 0.5rem;
          }

          .dish-desc {
            font-size: 0.92rem;
            color: var(--color-text-muted, #64748b);
            line-height: 1.55;
            margin-bottom: 1.5rem;
            flex: 1;
          }

          .dish-card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid var(--color-border, #e2e8f0);
            padding-top: 0.75rem;

            .dish-freshness {
              font-size: 0.8rem;
              color: var(--color-navy-medium, #134074);
              font-weight: 600;
              display: inline-flex;
              align-items: center;
              gap: 0.35rem;
            }

            .btn-order-interest {
              background: var(--color-seafoam, #eef4f8);
              border: none;
              color: var(--color-navy-dark, #07192f);
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s ease;

              &:hover {
                background: var(--color-gold, #dda15e);
                color: #ffffff;
              }
            }
          }
        }
      }
    }

    /* Main Menu Content */
    .main-menu-content {
      padding: 4.5rem 0;
      background-color: var(--dishoom-bg-primary, #FAF7F2);

      /* Dishoom Editorial 8-Category Navigation Bar */
      .dishoom-category-nav {
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--dishoom-border-sand, #E5DDD0);
        background: var(--dishoom-bg-surface, #F5EFEB);
        padding: 0.65rem 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(28, 25, 23, 0.04);

        .category-nav-track {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .category-nav-btn {
          background: transparent;
          border: none;
          padding: 0.7rem 1.1rem;
          font-family: var(--font-body-editorial, sans-serif);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--dishoom-ink-muted, #78716C);
          cursor: pointer;
          position: relative;
          transition: all 0.25s ease;
          border-radius: 5px;
          display: inline-flex;
          align-items: center;

          &:hover {
            color: var(--dishoom-ink-charcoal, #1C1917);
            background: rgba(197, 138, 62, 0.09);
          }

          &.active {
            color: var(--dishoom-brass-dark, #945C22);
            background: rgba(197, 138, 62, 0.16);

            &::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 12%;
              width: 76%;
              height: 2px;
              background: var(--dishoom-brass, #C58A3E);
            }
          }
        }
      }

      /* Subcategory Filter Pill Bar */
      .subcategories-bar-wrapper {
        margin-bottom: 2rem;
        display: flex;
        justify-content: center;

        .subcategories-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          background: #FAF6F0;
          border: 1px solid var(--dishoom-border-sand, #E5DDD0);
          border-radius: 30px;

          .subcat-pill {
            background: #ffffff;
            border: 1px solid #E2D9CC;
            border-radius: 20px;
            padding: 0.4rem 0.9rem;
            font-size: 0.78rem;
            font-weight: 600;
            color: var(--dishoom-ink-charcoal, #292524);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            transition: all 0.2s ease;

            i {
              color: var(--dishoom-brass, #C58A3E);
              font-size: 0.75rem;
            }

            .subcat-badge {
              font-size: 0.65rem;
              background: #FEE2E2;
              color: #DC2626;
              padding: 0.1rem 0.4rem;
              border-radius: 10px;
              font-weight: 700;
            }

            &:hover {
              background: #FDF8F3;
              border-color: var(--dishoom-brass, #C58A3E);
              color: var(--dishoom-brass-dark, #945C22);
            }

            &.active {
              background: var(--dishoom-brass-dark, #945C22);
              border-color: var(--dishoom-brass-dark, #945C22);
              color: #ffffff;

              i {
                color: #FFE6B0;
              }

              .subcat-badge {
                background: #ffffff;
                color: var(--dishoom-brass-dark, #945C22);
              }
            }

            &.featured-finferli {
              border-color: #F59E0B;
              background: #FFFBEB;
              color: #B45309;

              &.active {
                background: #D97706;
                color: #ffffff;
                border-color: #D97706;
              }
            }
          }
        }
      }

      /* Finferli Season Highlight Banner */
      .finferli-highlight-banner {
        background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
        border: 1px solid #FCD34D;
        border-left: 5px solid #F59E0B;
        border-radius: 8px;
        padding: 1.25rem 1.75rem;
        margin-bottom: 2.5rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;

        .banner-badge {
          background: #D97706;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .banner-content {
          h3 {
            font-family: var(--font-serif-primary, 'Cormorant Garamond', Garamond, serif);
            font-size: 1.35rem;
            font-weight: 700;
            color: #92400E;
            margin: 0 0 0.25rem 0;
          }

          p {
            font-size: 0.88rem;
            color: #78350F;
            margin: 0;
            line-height: 1.45;
          }
        }
      }

      .menu-dual-layout {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 2.5rem;
        align-items: start;

        .menu-main-column {
          .dishoom-search-panel {
            background: #FAF7F2;
            border: 1px solid var(--dishoom-border-sand, #E5DDD0);
            border-radius: 8px;
            padding: 1.5rem 1.75rem;
            margin-bottom: 2.25rem;
            box-shadow: 0 4px 20px rgba(28, 25, 23, 0.04);
            position: relative;

            .search-panel-top {
              display: flex;
              align-items: flex-end;
              justify-content: space-between;
              margin-bottom: 1.1rem;
              gap: 1rem;

              .search-label-group {
                .search-kicker {
                  display: block;
                  font-size: 0.72rem;
                  font-weight: 700;
                  letter-spacing: 0.14em;
                  text-transform: uppercase;
                  color: var(--dishoom-brass-dark, #945C22);
                  margin-bottom: 0.25rem;

                  i {
                    margin-right: 0.35rem;
                    color: var(--dishoom-brass, #C58A3E);
                  }
                }

                .search-title {
                  font-family: var(--font-heading-editorial, 'Cormorant Garamond', Georgia, serif);
                  font-size: 1.45rem;
                  font-weight: 600;
                  color: var(--dishoom-ink-charcoal, #1C1917);
                  margin: 0;
                  line-height: 1.1;
                }
              }

              .dish-counter-badge {
                font-size: 0.82rem;
                color: var(--dishoom-ink-muted, #78716C);
                background: #F0E9DF;
                border: 1px solid var(--dishoom-border-sand, #E5DDD0);
                padding: 0.3rem 0.75rem;
                border-radius: 20px;
                white-space: nowrap;

                strong {
                  color: var(--dishoom-brass-dark, #945C22);
                  font-weight: 700;
                }
              }
            }

            .dishoom-search-field-wrap {
              position: relative;
              margin-bottom: 1rem;

              .search-field-inner {
                position: relative;
                display: flex;
                align-items: center;

                .field-icon-box {
                  position: absolute;
                  left: 1.1rem;
                  top: 50%;
                  transform: translateY(-50%);
                  color: var(--dishoom-brass, #C58A3E);
                  font-size: 1.05rem;
                  pointer-events: none;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }

                .dishoom-search-input {
                  width: 100%;
                  height: 52px;
                  background: #FFFFFF;
                  border: 1.5px solid #D8CEBE;
                  border-radius: 6px;
                  padding: 0 5.5rem 0 3.2rem;
                  font-size: 0.96rem;
                  color: var(--dishoom-ink-charcoal, #1C1917);
                  font-family: inherit;
                  transition: all 0.25s ease;

                  &::placeholder {
                    color: #9C948B;
                    font-style: italic;
                    font-size: 0.92rem;
                  }

                  &:focus {
                    outline: none;
                    border-color: var(--dishoom-brass, #C58A3E);
                    background: #FFFDF9;
                    box-shadow: 0 0 0 3px rgba(197, 138, 62, 0.16), 0 4px 16px rgba(28, 25, 23, 0.06);
                  }
                }

                .dishoom-clear-search-btn {
                  position: absolute;
                  right: 0.75rem;
                  top: 50%;
                  transform: translateY(-50%);
                  background: #F3ECE2;
                  border: 1px solid var(--dishoom-border-sand, #E5DDD0);
                  border-radius: 4px;
                  color: var(--dishoom-ink-muted, #78716C);
                  cursor: pointer;
                  padding: 0.35rem 0.65rem;
                  font-size: 0.76rem;
                  font-weight: 600;
                  display: inline-flex;
                  align-items: center;
                  gap: 0.35rem;
                  transition: all 0.2s ease;

                  &:hover {
                    background: #E8DDCE;
                    color: var(--dishoom-ink-charcoal, #1C1917);
                    border-color: var(--dishoom-brass, #C58A3E);
                  }
                }
              }
            }

            .search-quick-tags {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 0.5rem;
              margin-bottom: 1.25rem;
              padding-bottom: 1rem;
              border-bottom: 1px dashed var(--dishoom-border-sand, #E5DDD0);

              .quick-tags-label {
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: var(--dishoom-ink-muted, #78716C);
              }

              .quick-tags-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.4rem;

                .quick-tag-chip {
                  background: #FFFFFF;
                  border: 1px solid #E2D9CC;
                  border-radius: 4px;
                  padding: 0.2rem 0.6rem;
                  font-size: 0.76rem;
                  color: var(--dishoom-ink-espresso, #292524);
                  cursor: pointer;
                  transition: all 0.2s ease;

                  &:hover {
                    border-color: var(--dishoom-brass, #C58A3E);
                    background: #FAF4EB;
                    color: var(--dishoom-brass-dark, #945C22);
                  }

                  &.active {
                    background: var(--dishoom-brass-dark, #945C22);
                    border-color: var(--dishoom-brass-dark, #945C22);
                    color: #FFFFFF;
                    font-weight: 600;
                  }
                }
              }
            }

            .search-controls-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 1rem;

              .allergen-filter-block {
                flex: 1;
                min-width: 260px;

                .allergen-header-btn {
                  width: 100%;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  background: #FFFFFF;
                  border: 1px solid #E2D9CC;
                  border-radius: 6px;
                  padding: 0.6rem 0.9rem;
                  cursor: pointer;
                  font-size: 0.86rem;
                  font-weight: 600;
                  color: var(--dishoom-ink-charcoal, #1C1917);
                  transition: all 0.2s ease;

                  &:hover, &.active {
                    border-color: var(--dishoom-brass, #C58A3E);
                    background: #FFFDF9;
                  }

                  .header-btn-left {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;

                    .text-brass {
                      color: var(--dishoom-brass, #C58A3E);
                    }

                    .allergen-count-badge {
                      background: #FEE2E2;
                      color: #B91C1C;
                      border: 1px solid #FCA5A5;
                      font-size: 0.7rem;
                      font-weight: 700;
                      padding: 0.15rem 0.45rem;
                      border-radius: 12px;
                    }
                  }

                  .chevron-icon {
                    color: var(--dishoom-ink-muted, #78716C);
                    font-size: 0.8rem;
                  }
                }

                .allergen-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
                  gap: 0.55rem;
                  margin-top: 0.85rem;
                  padding: 1rem;
                  background: #FFFFFF;
                  border: 1px solid var(--dishoom-border-sand, #E5DDD0);
                  border-radius: 6px;
                  box-shadow: inset 0 2px 6px rgba(0,0,0,0.02);

                  .allergen-check-label {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.8rem;
                    cursor: pointer;
                    color: var(--dishoom-ink-espresso, #292524);

                    input[type="checkbox"] {
                      accent-color: var(--dishoom-status-danger, #B91C1C);
                      width: 14px;
                      height: 14px;
                    }

                    .allergen-check-badge {
                      font-weight: 700;
                      color: var(--dishoom-brass-dark, #945C22);
                      font-size: 0.72rem;
                    }

                    .allergen-check-name {
                      line-height: 1.2;
                    }
                  }
                }
              }

              .special-filter-toggle {
                .toggle-label {
                  display: inline-flex;
                  align-items: center;
                  gap: 0.55rem;
                  font-size: 0.86rem;
                  font-weight: 600;
                  cursor: pointer;
                  color: var(--dishoom-ink-charcoal, #1C1917);
                  background: #FFFFFF;
                  border: 1px solid #E2D9CC;
                  border-radius: 6px;
                  padding: 0.6rem 0.9rem;
                  transition: all 0.2s ease;

                  &:hover {
                    border-color: var(--dishoom-brass, #C58A3E);
                    background: #FFFDF9;
                  }

                  input[type="checkbox"] {
                    accent-color: var(--dishoom-brass, #C58A3E);
                    width: 15px;
                    height: 15px;
                  }

                  .toggle-text {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;

                    .text-brass {
                      color: var(--dishoom-brass, #C58A3E);
                    }
                  }
                }
              }
            }
          }

          .menu-sections-wrapper {
            display: flex;
            flex-direction: column;
            gap: 2.75rem;

            .menu-subcategory-block {
              .dishoom-section-divider {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-bottom: 0.85rem;
                margin-bottom: 1.5rem;
                border-bottom: 1.5px solid var(--dishoom-border-sand, #E5DDD0);
                position: relative;

                &::after {
                  content: '';
                  position: absolute;
                  bottom: -1.5px;
                  left: 0;
                  width: 65px;
                  height: 2px;
                  background: var(--dishoom-brass, #C58A3E);
                }

                .divider-left {
                  display: flex;
                  align-items: center;
                  gap: 0.85rem;

                  .section-icon-wrap {
                    width: 38px;
                    height: 38px;
                    border-radius: 6px;
                    background: #FAF3E8;
                    border: 1px solid var(--dishoom-border-sand, #E5DDD0);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--dishoom-brass-dark, #945C22);
                    font-size: 1.05rem;
                    flex-shrink: 0;
                  }

                  .section-title-box {
                    .section-heading {
                      font-family: var(--font-heading-editorial, 'Cormorant Garamond', Georgia, serif);
                      font-size: 1.45rem;
                      font-weight: 700;
                      letter-spacing: 0.02em;
                      color: var(--dishoom-ink-charcoal, #1C1917);
                      margin: 0;
                      line-height: 1.15;
                    }

                    .section-subheading {
                      font-size: 0.82rem;
                      font-style: italic;
                      color: var(--dishoom-ink-muted, #78716C);
                      margin: 0.15rem 0 0 0;
                      line-height: 1.2;
                    }
                  }
                }

                .section-counter-pill {
                  font-size: 0.76rem;
                  font-weight: 600;
                  color: var(--dishoom-brass-dark, #945C22);
                  background: #FAF3E8;
                  border: 1px solid var(--dishoom-border-sand, #E5DDD0);
                  padding: 0.25rem 0.65rem;
                  border-radius: 20px;
                  white-space: nowrap;
                }
              }
            }
          }

          .menu-dishes-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem 2.5rem;

            @media (max-width: 900px) {
              grid-template-columns: 1fr;
              gap: 1rem;
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

        /* Sticky Lateral Quick Menu */
        .sticky-lateral-quick-menu {
          position: sticky;
          top: 110px;

          .quick-menu-card {
            padding: 1.5rem;
            border-top: 4px solid var(--color-gold, #dda15e);

            .quick-header {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              margin-bottom: 1.25rem;
              padding-bottom: 0.75rem;
              border-bottom: 1px solid var(--color-border, #e2e8f0);

              i {
                color: var(--color-gold-dark, #bc6c25);
                font-size: 1.2rem;
              }

              h4 {
                font-size: 1.15rem;
                color: var(--color-navy-dark, #07192f);
                margin-bottom: 0;
              }
            }

            .quick-links-list {
              list-style: none;
              display: flex;
              flex-direction: column;
              gap: 0.4rem;
              padding: 0;
              margin: 0;

              .divider-item {
                height: 1px;
                background: var(--color-border, #e2e8f0);
                margin: 0.4rem 0;
              }

              li button {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.6rem 0.85rem;
                border-radius: 8px;
                background: transparent;
                border: 1px solid transparent;
                color: var(--color-text-main, #1d2d44);
                font-family: var(--font-body, 'Montserrat', sans-serif);
                font-weight: 600;
                font-size: 0.88rem;
                cursor: pointer;
                text-align: left;
                transition: all 0.2s ease;

                i {
                  color: var(--color-gold-dark, #bc6c25);
                  font-size: 0.95rem;
                  width: 18px;
                  text-align: center;
                }

                &:hover {
                  background: var(--color-seafoam, #eef4f8);
                  color: var(--color-navy-dark, #07192f);
                  border-color: var(--color-border, #e2e8f0);
                }

                &.active {
                  background: var(--color-navy-primary, #0b2545);
                  color: #ffffff;

                  i {
                    color: var(--color-gold, #dda15e);
                  }
                }

                &.allergen-jump-btn {
                  color: var(--dishoom-brass-dark, #945C22);
                  background: #FFFDF9;
                  border: 1px dashed var(--dishoom-border-sand, #E5DDD0);

                  &:hover {
                    background: #FAF3E8;
                    border-color: var(--dishoom-brass, #C58A3E);
                  }
                }
              }
            }

            .quick-footer-box {
              margin-top: 1.5rem;
              padding-top: 1rem;
              border-top: 1px dashed var(--color-border, #e2e8f0);
              text-align: center;

              small {
                color: var(--color-text-muted, #64748b);
                font-weight: 600;
                font-size: 0.78rem;
                display: block;
              }

              .quick-subnote {
                font-size: 0.72rem;
                color: var(--color-text-light, #94a3b8);
                margin: 0.2rem 0 0 0;
              }
            }
          }
        }
      }
    }

    @media (max-width: 1024px) {
      .menu-hero-section .hero-title {
        font-size: 2.6rem;
      }

      .main-menu-content .menu-dual-layout {
        grid-template-columns: 1fr;

        .sticky-lateral-quick-menu {
          position: static;
        }
      }
    }
  `],
})
export class MenuComponent implements OnInit {
  private menuService = inject(MenuService);

  public selectedCategory = signal<string>('pesce');
  public selectedSubcategory = signal<string>('');
  public searchQuery: string = '';
  public onlyChefSpecials: boolean = false;
  public selectedExcludedAllergens = signal<string[]>([]);
  public isAllergensOpen = signal<boolean>(false);

  public dishes = signal<MenuItem[]>([]);
  public isLoading = signal<boolean>(true);

  // Dynamic Search Suggestions Map per Category
  public categorySuggestionsMap: Record<string, string[]> = {
    '': ['Pesce', 'Pizze', 'Pizze di stagione', 'Tagliata', 'Insalatona', 'Valpolicella', 'Birra artigianale'],
    'pesce': ['Vongole veraci', 'Scoglio', 'Crudo', 'Tartare tonno', 'Branzino', 'Calamari in umido', 'Pescato della settimana'],
    'pizze': ['West', 'Pizze di stagione', 'Burratina', 'Campione', 'San Daniele', '4 Formaggi', 'Bufala', 'Atomica'],
    'insalatone': ['#CINZIA', '#MELODY', '#IRENE', 'Burrata pugliese', 'Salmone', 'Avocado'],
    'piatti_estivi': ['Cous cous', 'Roast-beef', 'Caprese', 'Mazzancolle'],
    'carne': ['Tagliata al rosmarino', 'Agnello', 'Carbonara', 'Tagliolini', 'Cotoletta'],
    'contorni': ['Patate al forno', 'Patate fritte', 'Macedonia verdure', 'Insalata mista'],
    'vini': ['Valpolicella', 'Prosecco', 'Champagne', 'Lugana', 'Birra artigianale', 'Grappa Nardini', 'Sarpa Poli'],
    'bevande': ['Valpolicella', 'Prosecco', 'Champagne', 'Lugana', 'Birra artigianale', 'Grappa Nardini', 'Sarpa Poli'],
  };

  public currentCategorySuggestions = computed<string[]>(() => {
    const cat = this.selectedCategory() || '';
    return this.categorySuggestionsMap[cat] || this.categorySuggestionsMap[''];
  });

  // 8 Official Category Tabs in Exact Specified Order (R4)
  public categoryTabs = [
    { key: '',              label: 'TUTTI I PIATTI',       icon: 'fa-solid fa-utensils' },
    { key: 'pesce',         label: 'SPECIALITÀ PESCE',     icon: 'fa-solid fa-fish' },
    { key: 'pizze',         label: 'PIZZE DEL CAMPIONE',   icon: 'fa-solid fa-pizza-slice' },
    { key: 'insalatone',    label: 'INSALATONE',           icon: 'fa-solid fa-leaf' },
    { key: 'piatti_estivi', label: 'PIATTI ESTIVI',        icon: 'fa-solid fa-sun' },
    { key: 'carne',         label: 'TRADIZIONE CARNE',     icon: 'fa-solid fa-drumstick-bite' },
    { key: 'contorni',      label: 'CONTORNI',             icon: 'fa-solid fa-bowl-rice' },
    { key: 'vini',          label: 'VINI & BEVANDE',       icon: 'fa-solid fa-wine-glass' },
  ];

  // Authentic Blackboard Specials transcribed from real restaurant photographs (€7 to €30)
  public weeklySeafood: WeeklySeafoodDish[] = [
    {
      name: 'Crostoni pane pizza con crema di dentice',
      description: 'Croccante base di pane pizza cotto a legna con crema vellutata di dentice nostrano mantecato.',
      price: 9.0,
      category: 'pesce',
      tag: 'Specialità della Casa',
    },
    {
      name: '6 Canocce crude',
      description: 'Canocce freschissime dell\'Adriatico aperte a crudo, servite con emulsione di olio EVO e limone.',
      price: 7.0,
      category: 'pesce',
      tag: 'Crudo Fresco',
    },
    {
      name: 'Paccheri freschi al pesto con mazzancolle e ricotta affumicata',
      description: 'Pasta fresca trafilata al bronzo, mazzancolle dell\'Adriatico, pesto artigianale e grattugiata di ricotta affumicata.',
      price: 16.5,
      category: 'pesce',
      tag: 'Primo Piatto',
    },
    {
      name: 'Tagliata di tonno pinne gialle con patate al forno',
      description: 'Trancio di tonno pinne gialle scottato alla griglia con cuore rosato, accompagnato da patate dorate al forno.',
      price: 24.0,
      category: 'pesce',
      tag: 'Secondo Piatto',
    },
    {
      name: 'Soaso intero pescato alla griglia con patate al forno',
      description: 'Soaso (rombo liscio) nostrano intero cotto lentamente alla brace con erbe aromatiche e patate al forno.',
      price: 30.0,
      category: 'pesce',
      tag: 'Pescato Nobile',
    },
  ];

  // Official EU 1-14 Allergen Mapping Table
  public euAllergens = OFFICIAL_ALLERGENS.map((def) => ({
    number: def.number,
    key: String(def.number),
    slug: def.key,
    label: def.label,
    icon: def.icon,
  }));

  // Subcategory Definitions per Category
  public currentSubcategories = computed<SubcategoryFilter[]>(() => {
    const cat = this.selectedCategory();
    if (cat === 'pizze') {
      return [
        { key: '', label: 'Tutte le Pizze', icon: 'fa-solid fa-border-all' },
        { key: 'stagionali', label: 'Pizze di stagione', icon: 'fa-solid fa-fire-flame-curved', badge: 'Stagionale' },
        { key: 'classiche', label: 'Classiche', icon: 'fa-solid fa-pizza-slice' },
        { key: 'della_casa', label: 'Della Casa', icon: 'fa-solid fa-crown' },
        { key: 'speciali', label: 'Speciali del Campione', icon: 'fa-solid fa-trophy' },
        { key: 'bianche', label: 'Pizze Bianche', icon: 'fa-solid fa-circle-notch' },
        { key: 'verdure', label: 'Verdure ai Ferri', icon: 'fa-solid fa-carrot' },
      ];
    }
    if (cat === 'vini' || cat === 'bevande') {
      return [
        { key: '', label: 'Tutti i Vini & Bevande', icon: 'fa-solid fa-border-all' },
        { key: 'vini', label: 'Carta dei Vini', icon: 'fa-solid fa-wine-bottle' },
        { key: 'birre', label: 'Birre Artigianali', icon: 'fa-solid fa-beer-mug-empty' },
        { key: 'caffe_bibite', label: 'Caffetteria & Bibite', icon: 'fa-solid fa-mug-hot' },
        { key: 'grappe_amari', label: 'Grappe & Amari Veneti', icon: 'fa-solid fa-whiskey-glass' },
      ];
    }
    if (cat === 'pesce') {
      return [
        { key: '', label: 'Tutto il Pesce', icon: 'fa-solid fa-border-all' },
        { key: 'antipasti', label: 'Antipasti di Mare', icon: 'fa-solid fa-plate-wheat' },
        { key: 'crudo', label: 'Crudo di Pesce', icon: 'fa-solid fa-shrimp' },
        { key: 'pescato_settimana', label: 'Pescato della Settimana', icon: 'fa-solid fa-chalkboard-user' },
        { key: 'primi', label: 'Primi di Pesce', icon: 'fa-solid fa-bowl-food' },
        { key: 'secondi', label: 'Secondi alla Griglia & Fritti', icon: 'fa-solid fa-fire' },
      ];
    }
    if (cat === 'carne') {
      return [
        { key: '', label: 'Tutta la Carne', icon: 'fa-solid fa-border-all' },
        { key: 'antipasti', label: 'Antipasti di Carne', icon: 'fa-solid fa-utensils' },
        { key: 'primi', label: 'Primi Piatti', icon: 'fa-solid fa-bowl-food' },
        { key: 'secondi', label: 'Secondi & Grigliate', icon: 'fa-solid fa-drumstick-bite' },
      ];
    }
    return [];
  });

  // Grouped Menu Sections Computed Signal for Structured Layout with Dishoom Dividers
  public groupedSections = computed<MenuSectionGroup[]>(() => {
    const allDishes = this.dishes();
    if (!allDishes || allDishes.length === 0) return [];

    const activeCat = this.selectedCategory();
    const sections: MenuSectionGroup[] = [];

    for (const def of MASTER_SECTION_DEFS) {
      // If a category is selected and it doesn't match this definition, skip (handling combined vini/bevande)
      if (activeCat && activeCat !== 'vini,bevande') {
        if (activeCat === 'vini') {
          if (def.category !== 'vini' && def.category !== 'bevande') continue;
        } else if (def.category !== activeCat) {
          continue;
        }
      }

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
        sections.push({
          id: def.id,
          category: def.category,
          title: def.title,
          subtitle: def.subtitle,
          icon: def.icon,
          dishes: sectionDishes,
        });
      }
    }

    // Fallback: any dishes not matched by standard definitions
    const handledDishTitles = new Set(sections.flatMap((s) => s.dishes.map((d) => d.title)));
    const remainingDishes = allDishes.filter((d) => !handledDishTitles.has(d.title));
    if (remainingDishes.length > 0) {
      sections.push({
        id: 'altre_proposte',
        category: activeCat || 'varie',
        title: 'Altre Specialità del Menù',
        subtitle: 'Ulteriori creazioni della nostra cucina',
        icon: 'fa-solid fa-utensils',
        dishes: remainingDishes,
      });
    }

    return sections;
  });

  ngOnInit(): void {
    this.fetchMenu();
  }

  fetchMenu(): void {
    this.isLoading.set(true);

    const params: any = {};
    const cat = this.selectedCategory();
    const sub = this.selectedSubcategory();

    if (cat === 'vini' || cat === 'vini,bevande') {
      if (!sub) {
        params.category = 'vini,bevande';
      } else if (sub === 'vini') {
        params.category = 'vini';
      } else if (sub === 'birre') {
        params.category = 'bevande';
        params.subcategory = 'birre,birre_artigianali';
      } else if (sub === 'caffe_bibite') {
        params.category = 'bevande';
        params.subcategory = 'caffetteria,bibite';
      } else if (sub === 'grappe_amari') {
        params.category = 'bevande';
        params.subcategory = 'amari,grappe,amari_grappe';
      }
    } else if (cat) {
      params.category = cat;
      if (sub) {
        if (cat === 'pizze') {
          if (sub === 'stagionali' || sub === 'finferli') {
            params.subcategory = 'stagionali,stagione_finferli,finferli_stagione';
          } else if (sub === 'della_casa') {
            params.subcategory = 'della_casa,ricercate';
          } else {
            params.subcategory = sub;
          }
        } else if (cat === 'pesce') {
          if (sub === 'pescato_settimana') {
            params.subcategory = 'pescato_della_settimana,pescato_settimana';
          } else {
            params.subcategory = sub;
          }
        } else if (cat === 'carne') {
          if (sub === 'antipasti') params.subcategory = 'antipasti,antipasti_carne';
          else if (sub === 'primi') params.subcategory = 'primi,primi_carne';
          else if (sub === 'secondi') params.subcategory = 'secondi,secondi_carne';
          else params.subcategory = sub;
        } else {
          params.subcategory = sub;
        }
      }
    }

    if (this.searchQuery.trim()) params.search = this.searchQuery.trim();
    if (this.onlyChefSpecials) params.isChefSpecial = true;
    if (this.selectedExcludedAllergens().length > 0) {
      params.excludeAllergens = this.selectedExcludedAllergens().join(',');
    }

    this.menuService.getMenuItems(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.dishes.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
    this.selectedSubcategory.set('');
    this.fetchMenu();
  }

  setSubcategory(sub: string): void {
    this.selectedSubcategory.set(sub);
    this.fetchMenu();
  }

  filterByCategory(cat: string): void {
    this.setCategory(cat);
  }

  onFilterChange(): void {
    this.fetchMenu();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.fetchMenu();
  }

  setSearchSuggestion(keyword: string): void {
    if (this.searchQuery.toLowerCase() === keyword.toLowerCase()) {
      this.searchQuery = '';
    } else {
      this.searchQuery = keyword;
    }
    this.fetchMenu();
  }

  toggleAllergensDropdown(): void {
    this.isAllergensOpen.update((v) => !v);
  }

  scrollToAllergens(): void {
    this.isAllergensOpen.set(true);
    const el = document.getElementById('sezione-allergeni');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
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

  resetFilters(): void {
    this.selectedCategory.set('');
    this.selectedSubcategory.set('');
    this.searchQuery = '';
    this.onlyChefSpecials = false;
    this.selectedExcludedAllergens.set([]);
    this.fetchMenu();
  }
}
