import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InfoService } from '../../../core/services/info.service';
import { AuthService } from '../../../core/services/auth.service';
import { UploadService } from '../../../core/services/upload.service';
import { InfoLocale, HistoricalEra, MosaicItem } from '../../../core/models';
import { NauticalDecorComponent } from '../../../shared/components/nautical-decor/nautical-decor.component';
import {
  VelieroShipComponent,
  RosaDeiVentiComponent,
  NauticalStarComponent,
  TimoneComponent,
} from '../../../shared/components/svg-icons';

const DEFAULT_ERAS: HistoricalEra[] = [
  {
    year: '1998',
    title: "Le Origini & La Passione per il Mare",
    subtitle: "La Nascita dell'Idea",
    badge: 'Le Origini',
    narrative: [
      "Tutto ha inizio dalla profonda ammirazione per la tradizione marinara dell'Adriatico. L'idea fondante di Federico Bortolato e Sabina Mazzeracca è stata quella di portare l'autenticità del pescato fresco di paranza e la convivialità della trattoria di mare sulle tavole dell'entroterra veneto.",
      "Fin dai primi anni, la ricerca ossessiva della materia prima freschissima e il rispetto dei tempi naturali di cottura hanno caratterizzato l'identità del Veliero.",
    ],
    achievements: [
      'Apertura del primo locale con focus sul pescato fresco',
      'Creazione delle prime ricette di marinature a crudo e fritture',
      'Consolidamento della clientela locale a Bassano del Grappa',
    ],
    quote: 'Il mare non è solo una cucina: è un modo di vivere, ascoltare e rispettare la natura.',
    quoteAuthor: 'Sabina Mazzeracca',
    image: 'assets/videos/card-pescato-poster.jpg',
  },
  {
    year: '2014',
    title: "Il Titolo di Campione del Mondo della Pizza",
    subtitle: "Il Trionfo dell'Arte Bianca",
    badge: 'Il Titolo Mondiale',
    narrative: [
      'Dopo anni di studio meticoloso sugli impasti, sulle fermentazioni a temperatura controllata e sulle miscele di farine macinate a pietra, Federico Bortolato conquista il prestigioso titolo di Campione del Mondo della Pizza.',
      'Nasce così la formula unica de "Il Veliero — Ristorante & Pizzeria dal Campione del Mondo", dove il pesce fresco di giornata incontra la vera pizza napoletana cotta nel forno a legna.',
    ],
    achievements: [
      'Vittoria del Campionato Mondiale della Pizza con impasto speciale',
      'Installazione del forno a legna refrattario artigianale',
      'Nascita del connubio esclusivo "Cucina Marinara & Pizza d\'Autore"',
    ],
    quote: "L'impasto perfetto è come la navigazione: richiede pazienza, cura dei dettagli e passione costante.",
    quoteAuthor: 'Federico Bortolato, Campione del Mondo',
    image: 'assets/images/logos/LogoPizzeriaDalCampioneDelMondo.jpg',
  },
  {
    year: '2026',
    title: 'Il Veliero Oggi: Tradizione & Futuro',
    subtitle: 'La Nuova Dimensione Digitale',
    badge: 'Il Presente',
    narrative: [
      'Oggi Il Veliero in Via G. Fattori 7 a Bassano del Grappa (San Michele) rappresenta un punto di riferimento indiscusso. Con il nuovo Diario di Bordo digitale, i clienti possono scoprire in tempo reale gli arrivi del mercato ittico e prenotare le loro serate enogastronomiche.',
      'La passione di Federico e Sabina continua immutata, arricchita da una cantina con oltre 120 etichette e una continua innovazione nel rispetto della tradizione.',
    ],
    achievements: [
      'Lancio del Diario di Bordo interattivo con aggiornamenti quotidiani',
      'Menu arricchito con opzioni per tutti i regimi alimentari e allergeni',
      'Oltre 25 anni di eccellenza e accoglienza a Bassano del Grappa',
    ],
    quote: 'Ogni giorno a bordo del nostro Veliero è una nuova avventura gastronomica da condividere insieme.',
    quoteAuthor: 'Federico & Sabina',
    image: 'assets/videos/card-dove-siamo-poster.jpg',
  },
];

const DEFAULT_MOSAIC: MosaicItem[] = [
  {
    id: 'mosaic_1',
    tag: 'Arte Bianca',
    title: 'Il Forno a Legna del Campione',
    description: 'Cottura a 450°C, lievitazione naturale e farine italiane non raffinate per una pizza soffice e altamente digeribile.',
    image: 'assets/images/logos/LogoPizzeriaDalCampioneDelMondo.jpg',
    type: 'large',
  },
  {
    id: 'mosaic_2',
    tag: 'Selezione Quotidiana',
    title: "La Scelta all'Asta Ittica",
    description: 'Dentici, orate, branzini e calamaretti spillo scelti ogni alba per garantire freschezza assoluta.',
    icon: 'fa-solid fa-fish-fins',
  },
  {
    id: 'mosaic_3',
    tag: 'Accoglienza',
    title: 'Sabina Mazzeracca & lo Staff',
    description: 'Un servizio premuroso e caloroso in un ambiente nautico curato in ogni dettaglio.',
    icon: 'fa-solid fa-wine-glass',
  },
  {
    id: 'mosaic_4',
    tag: 'Il Nostro Porto',
    title: 'Radici Salde a Bassano del Grappa',
    description: 'In Via G. Fattori 7 (Località San Michele), accogliamo ogni giorno amanti del buon cibo, famiglie e intenditori con il calore della vera trattoria marinara veneta.',
    type: 'wide',
  },
];

@Component({
  selector: 'app-storia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NauticalDecorComponent,
    VelieroShipComponent,
    RosaDeiVentiComponent,
    NauticalStarComponent,
    TimoneComponent,
  ],
  template: `
    <div class="storia-page">
      <!-- FLOATING ADMIN / GESTORE LIVE EDITOR TOOLBAR (Dishoom Class Style) -->
      <aside *ngIf="canEdit()" class="live-admin-toolbar">
        <div class="container toolbar-inner">
          <div class="toolbar-info">
            <span class="role-badge">
              <i class="fa-solid fa-crown text-gold"></i> {{ authService.isAdmin() ? 'PANNELLO ADMIN' : 'PANNELLO GESTORE' }}
            </span>
            <div class="toolbar-status">
              <span class="status-indicator" [class.status-active]="isEditingMode()"></span>
              <span class="toolbar-title">{{ isEditingMode() ? 'Modalità Modifica Attiva' : 'Visualizzazione Anteprima' }}</span>
            </div>
          </div>

          <div class="toolbar-actions">
            <!-- Mode Switcher -->
            <button
              type="button"
              class="toolbar-btn btn-mode-toggle"
              [class.active-mode]="isEditingMode()"
              (click)="toggleEditMode()"
            >
              <i class="fa-solid" [ngClass]="isEditingMode() ? 'fa-eye' : 'fa-pen-ruler'"></i>
              <span>{{ isEditingMode() ? 'Anteprima Pubblica' : 'Abilita Modifica Live' }}</span>
            </button>

            <!-- Save Button -->
            <button
              *ngIf="isEditingMode()"
              type="button"
              class="toolbar-btn btn-save-gold"
              (click)="saveLiveChanges()"
              [disabled]="isSaving()"
            >
              <i class="fa-solid" [ngClass]="isSaving() ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'"></i>
              <span>{{ isSaving() ? 'Salvataggio in corso...' : 'Salva Modifiche nel Database' }}</span>
            </button>

            <!-- Cancel Button -->
            <button
              *ngIf="isEditingMode()"
              type="button"
              class="toolbar-btn btn-cancel-outline"
              (click)="cancelLiveChanges()"
              [disabled]="isSaving()"
            >
              <i class="fa-solid fa-arrow-rotate-left"></i>
              <span>Annulla</span>
            </button>
          </div>
        </div>

        <!-- Toast Feedback Notification -->
        <div *ngIf="feedbackMsg()" class="toolbar-feedback-toast" [ngClass]="isFeedbackError() ? 'feedback-toast-error' : 'feedback-toast-success'">
          <i class="fa-solid" [ngClass]="isFeedbackError() ? 'fa-triangle-exclamation' : 'fa-circle-check'"></i>
          <span>{{ feedbackMsg() }}</span>
        </div>
      </aside>

      <!-- HERO HEADER -->
      <section class="storia-hero-section">
        <app-nautical-decor></app-nautical-decor>
        <div class="container hero-inner">
          <div class="hero-badge">
            <app-nautical-star size="26px"></app-nautical-star>
            <span>Passione Marinara & Arte della Pizza</span>
            <app-nautical-star size="26px"></app-nautical-star>
          </div>
          <h1 class="hero-title">LA NOSTRA STORIA</h1>
          <p class="hero-subtitle">
            Un viaggio che parte dal profumo del mare e approda al trionfo mondiale della vera pizza napoletana a Bassano del Grappa.
          </p>
        </div>
      </section>

      <!-- DYNAMIC NARRATIVE SECTION (From Gestore/Admin InfoLocale) -->
      <section class="section dynamic-story-section">
        <div class="container">
          <div class="story-narrative-card card" [class.editing-card-highlight]="isEditingMode()">
            <!-- Edit Mode Header Banner -->
            <div *ngIf="isEditingMode()" class="card-edit-badge-bar">
              <span class="badge-edit-label">
                <i class="fa-solid fa-feather-pointed"></i> Modifica Racconto dei Fondatori & Filosofia
              </span>
            </div>

            <div class="story-card-header">
              <span class="subtitle">La Nostra Filosofia & Tradizione</span>
              <h2>Il Racconto de Il Veliero</h2>
              <div class="story-divider-decor">
                <span class="decor-line"></span>
                <i class="fa-solid fa-anchor"></i>
                <span class="decor-line"></span>
              </div>
            </div>

            <!-- Read Mode -->
            <div class="story-narrative-body" *ngIf="!isEditingMode()">
              <p class="story-lead-text" style="white-space: pre-line;">{{ currentHistoryStory }}</p>
            </div>

            <!-- Edit Mode -->
            <div class="story-edit-body" *ngIf="isEditingMode()">
              <div class="edit-control-group">
                <label class="edit-label">
                  <i class="fa-solid fa-align-left text-gold"></i> Testo Narrativo dei Fondatori:
                </label>
                <textarea
                  class="dishoom-textarea"
                  rows="7"
                  [(ngModel)]="currentHistoryStory"
                  placeholder="Inserisci qui il racconto introduttivo di Federico Bortolato e Sabina Mazzeracca..."
                ></textarea>
                <div class="edit-field-hint">
                  <i class="fa-solid fa-circle-info"></i> Suggerimento: usa i ritorni a capo per dividere comodamente i paragrafi della narrazione.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- INTERACTIVE STAGE TIMELINE -->
      <section class="section timeline-stage-section">
        <div class="container">
          <div class="section-header">
            <span class="subtitle">Evoluzione & Tappe Fondamentali</span>
            <h2>Le Ere del Veliero</h2>
            <p class="description">
              Seleziona una tappa cronologica per rivivere i momenti chiave che hanno reso unico il nostro locale.
            </p>
          </div>

          <!-- Timeline Milestone Selector Bar -->
          <div class="timeline-nav-bar">
            <div class="timeline-line" aria-hidden="true"></div>
            <div class="timeline-nodes">
              <button
                *ngFor="let era of erasList"
                type="button"
                class="timeline-node-btn"
                [class.active]="selectedYear() === era.year"
                (click)="selectEra(era.year)"
                [attr.aria-pressed]="selectedYear() === era.year"
              >
                <div class="node-icon-circle">
                  <i
                    class="fa-solid"
                    [ngClass]="{
                      'fa-ship': era.year === '1998',
                      'fa-trophy': era.year === '2014',
                      'fa-compass': era.year === '2026'
                    }"
                  ></i>
                </div>
                <span class="node-year">{{ era.year }}</span>
                <span class="node-label">{{ era.badge }}</span>
              </button>
            </div>
          </div>

          <!-- Dynamic Active Stage Card Display -->
          <div class="active-era-card card" *ngIf="currentEra as era" [class.editing-card-highlight]="isEditingMode()">
            <!-- Edit Mode Header Banner -->
            <div *ngIf="isEditingMode()" class="card-edit-badge-bar">
              <span class="badge-edit-label">
                <i class="fa-solid fa-clock-rotate-left"></i> Modifica Tappa Storica: <strong>{{ era.year }} ({{ era.badge }})</strong>
              </span>
            </div>

            <!-- READ MODE -->
            <div class="era-grid-layout" *ngIf="!isEditingMode()">
              <!-- Left: Image & Quote Frame -->
              <div class="era-visual-column">
                <div class="era-photo-frame">
                  <img
                    [src]="era.image"
                    [alt]="era.title"
                    class="era-img"
                    (error)="onEraImgError($event)"
                  />
                  <div class="era-year-badge">
                    <span>{{ era.year }}</span>
                  </div>
                </div>

                <div class="era-quote-box">
                  <i class="fa-solid fa-quote-left quote-icon"></i>
                  <blockquote>
                    "{{ era.quote }}"
                  </blockquote>
                  <span class="quote-author">— {{ era.quoteAuthor }}</span>
                </div>
              </div>

              <!-- Right: Story Narrative & Achievements -->
              <div class="era-text-column">
                <span class="era-kicker">{{ era.subtitle }}</span>
                <h3 class="era-title">{{ era.title }}</h3>

                <div class="era-paragraphs">
                  <p *ngFor="let p of era.narrative">{{ p }}</p>
                </div>

                <div class="era-achievements-block">
                  <h4>Traguardi dell'Epoca</h4>
                  <ul class="achievements-list">
                    <li *ngFor="let item of era.achievements">
                      <i class="fa-solid fa-circle-check text-gold"></i>
                      <span>{{ item }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- EDIT MODE (Dishoom Refined Editor Layout) -->
            <div class="era-edit-layout" *ngIf="isEditingMode()">
              <div class="era-edit-grid">
                <!-- Left Visual & Image Picker Column -->
                <div class="edit-media-column">
                  <div class="image-uploader-card">
                    <label class="edit-label">
                      <i class="fa-solid fa-image text-gold"></i> Immagine della Tappa:
                    </label>

                    <!-- Image Preview Container -->
                    <div class="image-preview-box">
                      <img
                        [src]="era.image"
                        [alt]="era.title"
                        class="preview-img"
                        (error)="onEraImgError($event)"
                      />
                      <div class="preview-overlay" *ngIf="isUploadingEraImage()">
                        <div class="spinner-wrapper">
                          <i class="fa-solid fa-spinner fa-spin fa-2x text-gold"></i>
                          <span>Caricamento foto in corso...</span>
                        </div>
                      </div>
                    </div>

                    <!-- Native Device File Picker Button -->
                    <div class="upload-actions-wrapper">
                      <input
                        type="file"
                        #eraFileInput
                        accept="image/*"
                        (change)="onEraFileSelected($event, era)"
                        style="display: none;"
                      />
                      <button
                        type="button"
                        class="btn-device-upload"
                        (click)="eraFileInput.click()"
                        [disabled]="isUploadingEraImage()"
                      >
                        <i class="fa-solid fa-camera"></i>
                        <span>Scegli Foto dal Dispositivo</span>
                      </button>
                      <small class="upload-hint">Foto da Smartphone, Tablet, Galleria o Fotocamera (ottimizzazione automatica)</small>
                    </div>

                    <!-- Manual URL Fallback (collapsible) -->
                    <div class="manual-url-box">
                      <label class="edit-sublabel">Oppure inserisci percorso/URL:</label>
                      <input
                        type="text"
                        class="dishoom-input dishoom-input-sm"
                        [(ngModel)]="era.image"
                        placeholder="assets/images/... o https://..."
                      />
                    </div>
                  </div>

                  <!-- Quote & Author Box -->
                  <div class="quote-editor-card">
                    <label class="edit-label">
                      <i class="fa-solid fa-quote-left text-gold"></i> Citazione d'Autore:
                    </label>
                    <textarea
                      class="dishoom-textarea"
                      rows="3"
                      [(ngModel)]="era.quote"
                      placeholder="Una citazione memorabile per quest'epoca..."
                    ></textarea>

                    <label class="edit-label" style="margin-top: 0.75rem;">
                      <i class="fa-solid fa-user-pen text-gold"></i> Autore della Citazione:
                    </label>
                    <input
                      type="text"
                      class="dishoom-input"
                      [(ngModel)]="era.quoteAuthor"
                      placeholder="Es. Federico Bortolato, Campione del Mondo"
                    />
                  </div>
                </div>

                <!-- Right Narrative & Attributes Column -->
                <div class="edit-content-column">
                  <div class="edit-row-2col">
                    <div class="edit-control-group">
                      <label class="edit-label">Titolo Tappa:</label>
                      <input
                        type="text"
                        class="dishoom-input"
                        [(ngModel)]="era.title"
                        placeholder="Es. Il Titolo di Campione del Mondo"
                      />
                    </div>
                    <div class="edit-control-group">
                      <label class="edit-label">Sottotitolo / Kicker:</label>
                      <input
                        type="text"
                        class="dishoom-input"
                        [(ngModel)]="era.subtitle"
                        placeholder="Es. Il Trionfo dell'Arte Bianca"
                      />
                    </div>
                  </div>

                  <div class="edit-row-2col">
                    <div class="edit-control-group">
                      <label class="edit-label">Etichetta Badge (visibile nei nodi):</label>
                      <input
                        type="text"
                        class="dishoom-input"
                        [(ngModel)]="era.badge"
                        placeholder="Es. Il Titolo Mondiale"
                      />
                    </div>
                    <div class="edit-control-group">
                      <label class="edit-label">Anno della Tappa:</label>
                      <input
                        type="text"
                        class="dishoom-input"
                        [(ngModel)]="era.year"
                        placeholder="Es. 2014"
                      />
                    </div>
                  </div>

                  <!-- Narrative Paragraphs Editor -->
                  <div class="edit-control-group">
                    <label class="edit-label">
                      <i class="fa-solid fa-book-open text-gold"></i> Racconto dell'Epoca (un paragrafo per riga):
                    </label>
                    <textarea
                      class="dishoom-textarea"
                      rows="6"
                      [ngModel]="eraNarrativeText"
                      (ngModelChange)="onNarrativeTextChange($event)"
                      placeholder="Scrivi qui i paragrafi che raccontano questa tappa storica..."
                    ></textarea>
                  </div>

                  <!-- Achievements Manager -->
                  <div class="achievements-editor-card">
                    <div class="achievements-card-header">
                      <label class="edit-label mb-0">
                        <i class="fa-solid fa-award text-gold"></i> Traguardi Raggiunti in Quest'Epoca:
                      </label>
                      <button type="button" class="btn-add-item" (click)="addAchievement()">
                        <i class="fa-solid fa-circle-plus"></i>
                        <span>Aggiungi Traguardo</span>
                      </button>
                    </div>

                    <div class="achievements-inputs-list">
                      <div
                        class="achievement-input-row"
                        *ngFor="let ach of era.achievements; let i = index; trackBy: trackByIndex"
                      >
                        <span class="item-number-pin">{{ i + 1 }}</span>
                        <input
                          type="text"
                          class="dishoom-input"
                          [(ngModel)]="era.achievements[i]"
                          placeholder="Descrizione del traguardo o successo..."
                        />
                        <button
                          type="button"
                          class="btn-remove-item"
                          (click)="removeAchievement(i)"
                          title="Rimuovi questo traguardo"
                        >
                          <i class="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- MOSAIC PHOTO ARCHIVE -->
      <section class="section mosaic-archive-section">
        <div class="container">
          <div class="section-header">
            <span class="subtitle">Archivio Fotografico & Tradizione</span>
            <h2>Il Mosaico della Nostra Passione</h2>
            <p class="description">
              Scorci di vita tra le paranze del mattino, la cura minuziosa per gli impasti ad alta idratazione e l'atmosfera calda della nostra sala a Bassano del Grappa.
            </p>
          </div>

          <div class="mosaic-gallery-grid" [class.editing-mosaic]="isEditingMode()">
            <div
              *ngFor="let tile of mosaicList"
              class="mosaic-tile card"
              [ngClass]="{
                'tile-large': tile.type === 'large',
                'tile-wide': tile.type === 'wide'
              }"
              [class.editing-tile-highlight]="isEditingMode()"
            >
              <!-- READ MODE -->
              <ng-container *ngIf="!isEditingMode()">
                <!-- Large Tile Image Banner -->
                <div *ngIf="tile.type === 'large'" class="tile-bg-image tile-bg-pizza">
                  <img
                    [src]="tile.image || 'assets/images/logos/LogoPizzeriaDalCampioneDelMondo.jpg'"
                    [alt]="tile.title"
                    class="mosaic-embedded-logo"
                    (error)="onLogoFallback($event)"
                  />
                </div>

                <!-- Icon for Standard Tiles -->
                <div *ngIf="tile.icon && tile.type !== 'large' && tile.type !== 'wide'" class="tile-icon-decor">
                  <i [class]="tile.icon"></i>
                </div>

                <div [class]="tile.type === 'wide' ? 'tile-caption-wide' : 'tile-caption'">
                  <span class="tile-tag">{{ tile.tag }}</span>
                  <h3>{{ tile.title }}</h3>
                  <p>{{ tile.description }}</p>

                  <div *ngIf="tile.type === 'wide'" class="tile-actions">
                    <a routerLink="/dove-siamo" class="btn btn-gold btn-sm">
                      <i class="fa-solid fa-location-dot"></i> Vieni a Trovarci
                    </a>
                    <a routerLink="/menu" class="btn btn-outline btn-sm">
                      <i class="fa-solid fa-book-open"></i> Consulta il Menù
                    </a>
                  </div>
                </div>
              </ng-container>

              <!-- EDIT MODE (Dishoom Style Tile Form) -->
              <div class="tile-edit-form" *ngIf="isEditingMode()">
                <div class="tile-edit-header">
                  <span class="tile-edit-badge">{{ tile.tag || 'Scheda Mosaico' }}</span>
                </div>

                <!-- Thumbnail & Device Upload for Tile -->
                <div class="tile-image-picker-box" *ngIf="tile.type === 'large' || tile.image">
                  <div class="tile-thumb-preview">
                    <img
                      [src]="tile.image || 'assets/images/logos/LogoPizzeriaDalCampioneDelMondo.jpg'"
                      alt="Thumbnail"
                      (error)="onLogoFallback($event)"
                    />
                    <div class="thumb-uploading" *ngIf="uploadingMosaicId() === tile.id">
                      <i class="fa-solid fa-spinner fa-spin text-gold"></i>
                    </div>
                  </div>
                  <div class="tile-upload-actions">
                    <input
                      type="file"
                      #mosaicFileInput
                      accept="image/*"
                      (change)="onMosaicFileSelected($event, tile)"
                      style="display: none;"
                    />
                    <button
                      type="button"
                      class="btn-tile-upload"
                      (click)="mosaicFileInput.click()"
                      [disabled]="uploadingMosaicId() === tile.id"
                    >
                      <i class="fa-solid fa-camera"></i> Carica dal Dispositivo
                    </button>
                    <input
                      type="text"
                      class="dishoom-input dishoom-input-sm"
                      [(ngModel)]="tile.image"
                      placeholder="Oppure URL foto..."
                    />
                  </div>
                </div>

                <div class="edit-control-group">
                  <label class="edit-sublabel">Tag / Categoria</label>
                  <input type="text" class="dishoom-input" [(ngModel)]="tile.tag" placeholder="Es. Arte Bianca" />
                </div>

                <div class="edit-control-group">
                  <label class="edit-sublabel">Titolo Scheda</label>
                  <input type="text" class="dishoom-input" [(ngModel)]="tile.title" placeholder="Titolo scheda..." />
                </div>

                <div class="edit-control-group">
                  <label class="edit-sublabel">Descrizione</label>
                  <textarea class="dishoom-textarea" rows="3" [(ngModel)]="tile.description" placeholder="Descrizione scheda..."></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .storia-page {
      position: relative;
    }

    /* Floating Admin Live Toolbar (Dishoom Luxury Brass & Charcoal) */
    .live-admin-toolbar {
      position: sticky;
      top: 0;
      z-index: 1100;
      background: rgba(20, 20, 20, 0.98);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #FFFFFF;
      border-bottom: 2px solid #C58A3E;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
      padding: 0.65rem 0;

      .toolbar-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.85rem;

        .toolbar-info {
          display: flex;
          align-items: center;
          gap: 1rem;

          .role-badge {
            background: #2A241C;
            border: 1px solid #C58A3E;
            color: #FAF3E8;
            font-size: 0.74rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            padding: 0.35rem 0.75rem;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            text-transform: uppercase;
          }

          .toolbar-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .status-indicator {
              width: 9px;
              height: 9px;
              border-radius: 50%;
              background: #94A3B8;

              &.status-active {
                background: #10B981;
                box-shadow: 0 0 10px #10B981;
              }
            }

            .toolbar-title {
              font-size: 0.9rem;
              color: #E5DDD0;
              font-weight: 500;
            }
          }
        }

        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;

          .toolbar-btn {
            padding: 0.45rem 1rem;
            font-size: 0.84rem;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.25s ease;

            &.btn-mode-toggle {
              background: #2D271F;
              border: 1px solid #C58A3E;
              color: #FAF3E8;

              &:hover {
                background: #C58A3E;
                color: #FFFFFF;
                transform: translateY(-1px);
              }

              &.active-mode {
                background: #3B2E1D;
                border-color: #E8B878;
                color: #FFE5B8;
              }
            }

            &.btn-save-gold {
              background: linear-gradient(135deg, #D49E51 0%, #B87C2E 100%);
              border: 1px solid #E8B878;
              color: #FFFFFF;
              box-shadow: 0 4px 15px rgba(197, 138, 62, 0.35);

              &:hover:not(:disabled) {
                background: linear-gradient(135deg, #E2AC5F 0%, #C78B3D 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(197, 138, 62, 0.5);
              }

              &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
              }
            }

            &.btn-cancel-outline {
              background: transparent;
              border: 1px solid rgba(255, 255, 255, 0.3);
              color: #D1D5DB;

              &:hover:not(:disabled) {
                background: rgba(255, 255, 255, 0.1);
                color: #FFFFFF;
              }
            }
          }
        }
      }

      .toolbar-feedback-toast {
        margin-top: 0.5rem;
        padding: 0.5rem 1.25rem;
        text-align: center;
        font-size: 0.88rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;

        &.feedback-toast-success {
          background: #064E3B;
          color: #A7F3D0;
          border-top: 1px solid #10B981;
        }

        &.feedback-toast-error {
          background: #7F1D1D;
          color: #FECACA;
          border-top: 1px solid #EF4444;
        }
      }
    }

    /* Hero Header */
    .storia-hero-section {
      background: linear-gradient(135deg, var(--color-navy-dark, #07192f) 0%, var(--color-navy-primary, #0b2545) 100%);
      color: #ffffff;
      padding: 5.5rem 0 4.5rem;
      text-align: center;
      position: relative;
      overflow: hidden;

      .hero-inner {
        position: relative;
        z-index: 2;
      }

      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--color-gold, #dda15e);
        font-family: var(--font-heading, 'Cinzel', serif);
        font-size: 0.92rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 0.75rem;
      }

      .hero-title {
        font-size: 3.5rem;
        letter-spacing: 3px;
        color: #ffffff;
        margin-bottom: 1rem;
        font-family: var(--font-heading, 'Cinzel', serif);
      }

      .hero-subtitle {
        color: var(--color-seafoam, #eef4f8);
        font-size: 1.15rem;
        max-width: 680px;
        margin: 0 auto;
        line-height: 1.7;
      }
    }

    /* Common Edit Highlight Styling */
    .card-edit-badge-bar {
      margin: -1.5rem -1.5rem 1.5rem;
      padding: 0.6rem 1.25rem;
      background: #2D271F;
      border-bottom: 1px solid #C58A3E;
      border-radius: 14px 14px 0 0;
      text-align: left;

      .badge-edit-label {
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #E8B878;
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
      }
    }

    .editing-card-highlight {
      border: 1.5px solid #C58A3E !important;
      background: #FFFCF7 !important;
      box-shadow: 0 12px 35px rgba(197, 138, 62, 0.12) !important;
      position: relative;
    }

    /* Dishoom Form Elements */
    .edit-label {
      display: block;
      font-weight: 700;
      font-size: 0.86rem;
      color: #292524;
      margin-bottom: 0.4rem;
      letter-spacing: 0.02em;
    }

    .edit-sublabel {
      display: block;
      font-weight: 600;
      font-size: 0.8rem;
      color: #57534E;
      margin-bottom: 0.25rem;
    }

    .dishoom-input {
      width: 100%;
      padding: 0.65rem 0.9rem;
      border: 1.5px solid #D8CEBE;
      border-radius: 8px;
      font-size: 0.94rem;
      background: #FFFFFF;
      color: #1C1917;
      transition: all 0.25s ease;

      &:focus {
        outline: none;
        border-color: #C58A3E;
        box-shadow: 0 0 0 3px rgba(197, 138, 62, 0.18);
      }

      &.dishoom-input-sm {
        padding: 0.45rem 0.7rem;
        font-size: 0.85rem;
      }
    }

    .dishoom-textarea {
      width: 100%;
      padding: 0.85rem 1rem;
      border: 1.5px solid #D8CEBE;
      border-radius: 8px;
      font-size: 0.96rem;
      line-height: 1.7;
      background: #FFFFFF;
      color: #1C1917;
      font-family: inherit;
      resize: vertical;
      transition: all 0.25s ease;

      &:focus {
        outline: none;
        border-color: #C58A3E;
        box-shadow: 0 0 0 3px rgba(197, 138, 62, 0.18);
      }
    }

    .edit-field-hint {
      margin-top: 0.4rem;
      font-size: 0.8rem;
      color: #78716C;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    /* Dynamic Narrative Section (InfoLocale Story) */
    .dynamic-story-section {
      padding: 4rem 0 1rem;
      background: var(--color-bg-main, #f8f9fa);

      .story-narrative-card {
        max-width: 900px;
        margin: 0 auto;
        padding: 3rem 3.5rem;
        background: #ffffff;
        border-radius: 16px;
        border: 1px solid var(--color-border, #e2e8f0);
        box-shadow: 0 10px 30px rgba(11, 37, 69, 0.06);
        text-align: center;
        transition: all 0.3s ease;

        .story-card-header {
          margin-bottom: 2rem;

          .subtitle {
            font-size: 0.82rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--color-gold-dark, #bc6c25);
            font-weight: 700;
            display: block;
            margin-bottom: 0.4rem;
          }

          h2 {
            font-family: var(--font-heading, 'Cinzel', serif);
            font-size: 2rem;
            color: var(--color-navy-dark, #07192f);
            margin-bottom: 1rem;
          }

          .story-divider-decor {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            max-width: 280px;
            margin: 0 auto;

            .decor-line {
              flex: 1;
              height: 1px;
              background: var(--color-gold, #dda15e);
            }

            i {
              color: var(--color-gold-dark, #bc6c25);
              font-size: 1.1rem;
            }
          }
        }

        .story-narrative-body {
          .story-lead-text {
            font-size: 1.08rem;
            line-height: 1.9;
            color: var(--color-navy-dark, #07192f);
            font-family: var(--font-heading-editorial, 'Cormorant Garamond', Georgia, serif);
            text-align: justify;
            text-align-last: center;
          }
        }

        .story-edit-body {
          text-align: left;
        }
      }
    }

    /* Interactive Timeline Stage Section */
    .timeline-stage-section {
      padding: 5rem 0;

      .timeline-nav-bar {
        position: relative;
        max-width: 820px;
        margin: 0 auto 3.5rem;

        .timeline-line {
          position: absolute;
          top: 32px;
          left: 50px;
          right: 50px;
          height: 3px;
          background: var(--color-border, #e2e8f0);
          z-index: 1;
        }

        .timeline-nodes {
          display: flex;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }

        .timeline-node-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.25s ease;

          &:hover {
            transform: translateY(-3px);
          }

          .node-icon-circle {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #ffffff;
            border: 3px solid var(--color-border, #e2e8f0);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.35rem;
            color: var(--color-navy-medium, #1b3b6f);
            box-shadow: 0 4px 15px rgba(11, 37, 69, 0.08);
            transition: all 0.3s ease;
          }

          .node-year {
            font-family: var(--font-heading, 'Cinzel', serif);
            font-weight: 700;
            font-size: 1.15rem;
            color: var(--color-navy-dark, #07192f);
          }

          .node-label {
            font-size: 0.8rem;
            color: var(--color-text-muted, #64748b);
            font-weight: 600;
          }

          &.active {
            .node-icon-circle {
              background: var(--color-gold-dark, #bc6c25);
              border-color: var(--color-gold, #dda15e);
              color: #ffffff;
              transform: scale(1.12);
              box-shadow: 0 6px 20px rgba(188, 108, 37, 0.35);
            }

            .node-year {
              color: var(--color-gold-dark, #bc6c25);
            }
          }
        }
      }

      .active-era-card {
        max-width: 1050px;
        margin: 0 auto;
        padding: 3.5rem;
        border-radius: 20px;
        box-shadow: var(--shadow-card, 0 10px 30px rgba(11, 37, 69, 0.08));
        background: #ffffff;
        transition: all 0.3s ease;

        .era-grid-layout {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 3.5rem;
          align-items: center;
        }

        .era-visual-column {
          .era-photo-frame {
            position: relative;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            margin-bottom: 1.5rem;

            .era-img {
              width: 100%;
              height: 320px;
              object-fit: cover;
              display: block;
              transition: transform 0.5s ease;
            }

            .era-year-badge {
              position: absolute;
              bottom: 15px;
              right: 15px;
              background: var(--color-navy-dark, #07192f);
              color: var(--color-gold, #dda15e);
              font-family: var(--font-heading, 'Cinzel', serif);
              font-weight: 700;
              font-size: 1.25rem;
              padding: 0.35rem 1rem;
              border-radius: 8px;
              border: 1px solid var(--color-gold, #dda15e);
            }
          }

          .era-quote-box {
            background: var(--color-seafoam, #eef4f8);
            border-left: 4px solid var(--color-gold, #dda15e);
            padding: 1.25rem 1.5rem;
            border-radius: 0 12px 12px 0;
            position: relative;

            .quote-icon {
              color: var(--color-gold, #dda15e);
              font-size: 1.2rem;
              margin-bottom: 0.5rem;
            }

            blockquote {
              font-style: italic;
              color: var(--color-navy-dark, #07192f);
              font-size: 0.95rem;
              line-height: 1.6;
              margin: 0 0 0.5rem 0;
            }

            .quote-author {
              display: block;
              font-weight: 600;
              font-size: 0.82rem;
              color: var(--color-gold-dark, #bc6c25);
              text-align: right;
            }
          }
        }

        .era-text-column {
          .era-kicker {
            font-size: 0.82rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--color-gold-dark, #bc6c25);
            font-weight: 700;
            display: block;
            margin-bottom: 0.5rem;
          }

          .era-title {
            font-size: 2.1rem;
            color: var(--color-navy-dark, #07192f);
            margin-bottom: 1.5rem;
            line-height: 1.25;
          }

          .era-paragraphs {
            p {
              color: var(--color-text-main, #334155);
              font-size: 1.02rem;
              line-height: 1.75;
              margin-bottom: 1rem;
            }
          }

          .era-achievements-block {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--color-border, #e2e8f0);

            h4 {
              font-size: 1.05rem;
              color: var(--color-navy-dark, #07192f);
              margin-bottom: 1rem;
            }

            .achievements-list {
              list-style: none;
              padding: 0;
              margin: 0;
              display: flex;
              flex-direction: column;
              gap: 0.75rem;

              li {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-size: 0.95rem;
                color: var(--color-navy-dark, #07192f);

                .text-gold {
                  color: var(--color-gold-dark, #bc6c25);
                  font-size: 1rem;
                }
              }
            }
          }
        }

        /* Era Edit Mode Layout */
        .era-edit-layout {
          .era-edit-grid {
            display: grid;
            grid-template-columns: 1fr 1.35fr;
            gap: 2.5rem;

            @media (max-width: 900px) {
              grid-template-columns: 1fr;
            }
          }

          .edit-media-column {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;

            .image-uploader-card {
              background: #FAF7F2;
              border: 1px solid #E5DDD0;
              border-radius: 12px;
              padding: 1.25rem;

              .image-preview-box {
                position: relative;
                width: 100%;
                height: 220px;
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid #D8CEBE;
                margin-bottom: 1rem;

                .preview-img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  display: block;
                }

                .preview-overlay {
                  position: absolute;
                  inset: 0;
                  background: rgba(20, 20, 20, 0.75);
                  display: flex;
                  align-items: center;
                  justify-content: center;

                  .spinner-wrapper {
                    text-align: center;
                    color: #FFFFFF;
                    font-size: 0.85rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                  }
                }
              }

              .upload-actions-wrapper {
                text-align: center;
                margin-bottom: 1rem;

                .btn-device-upload {
                  width: 100%;
                  padding: 0.75rem 1rem;
                  background: linear-gradient(135deg, #2D271F 0%, #1A1713 100%);
                  color: #FAF3E8;
                  border: 1.5px solid #C58A3E;
                  border-radius: 8px;
                  font-weight: 700;
                  font-size: 0.88rem;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 0.6rem;
                  transition: all 0.25s ease;

                  &:hover:not(:disabled) {
                    background: #C58A3E;
                    color: #FFFFFF;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(197, 138, 62, 0.3);
                  }

                  &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                  }
                }

                .upload-hint {
                  display: block;
                  margin-top: 0.4rem;
                  font-size: 0.76rem;
                  color: #78716C;
                }
              }

              .manual-url-box {
                padding-top: 0.75rem;
                border-top: 1px dashed #D8CEBE;
              }
            }

            .quote-editor-card {
              background: #FAF7F2;
              border: 1px solid #E5DDD0;
              border-radius: 12px;
              padding: 1.25rem;
            }
          }

          .edit-content-column {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;

            .edit-row-2col {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1rem;

              @media (max-width: 600px) {
                grid-template-columns: 1fr;
              }
            }

            .achievements-editor-card {
              background: #FAF7F2;
              border: 1px solid #E5DDD0;
              border-radius: 12px;
              padding: 1.25rem;

              .achievements-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;

                .btn-add-item {
                  background: #FAF3E8;
                  border: 1px solid #C58A3E;
                  color: #945C22;
                  padding: 0.35rem 0.75rem;
                  border-radius: 6px;
                  font-size: 0.8rem;
                  font-weight: 700;
                  cursor: pointer;
                  display: inline-flex;
                  align-items: center;
                  gap: 0.4rem;
                  transition: all 0.2s ease;

                  &:hover {
                    background: #C58A3E;
                    color: #FFFFFF;
                  }
                }
              }

              .achievements-inputs-list {
                display: flex;
                flex-direction: column;
                gap: 0.65rem;

                .achievement-input-row {
                  display: flex;
                  align-items: center;
                  gap: 0.65rem;

                  .item-number-pin {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #E5DDD0;
                    color: #57534E;
                    font-size: 0.75rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                  }

                  .btn-remove-item {
                    background: transparent;
                    border: none;
                    color: #B91C1C;
                    cursor: pointer;
                    padding: 0.45rem;
                    font-size: 0.95rem;
                    transition: transform 0.2s ease;

                    &:hover {
                      color: #7F1D1D;
                      transform: scale(1.15);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    /* Mosaic Photo Archive Section */
    .mosaic-archive-section {
      background: var(--color-seafoam, #eef4f8);
      padding: 5.5rem 0;

      .mosaic-gallery-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;

        .mosaic-tile {
          display: flex;
          flex-direction: column;
          padding: 2rem;
          border-radius: 16px;
          background: #ffffff;
          transition: transform 0.3s ease, box-shadow 0.3s ease;

          &.editing-tile-highlight {
            border: 1.5px solid #C58A3E !important;
            background: #FFFCF7 !important;
            box-shadow: 0 10px 25px rgba(197, 138, 62, 0.15) !important;
          }

          &:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-hover, 0 15px 35px rgba(11, 37, 69, 0.18));
          }

          .tile-tag {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: var(--color-gold-dark, #bc6c25);
            font-weight: 700;
            display: block;
            margin-bottom: 0.35rem;
          }

          h3 {
            font-size: 1.35rem;
            color: var(--color-navy-dark, #07192f);
            margin-bottom: 0.75rem;
          }

          p {
            font-size: 0.95rem;
            color: var(--color-text-muted, #64748b);
            line-height: 1.6;
            margin-bottom: 0;
          }

          .tile-icon-decor {
            font-size: 2.2rem;
            color: var(--color-navy-primary, #0b2545);
            margin-bottom: 1.25rem;
          }

          &.tile-large {
            grid-column: span 2;

            .tile-bg-pizza {
              background: var(--color-navy-dark, #07192f);
              border-radius: 12px;
              padding: 1.5rem;
              text-align: center;
              margin-bottom: 1.5rem;

              .mosaic-embedded-logo {
                max-width: 220px;
                margin: 0 auto;
                border-radius: 8px;
              }
            }
          }

          &.tile-wide {
            grid-column: span 3;
            background: linear-gradient(135deg, var(--color-navy-dark, #07192f) 0%, var(--color-navy-primary, #0b2545) 100%);
            color: #ffffff;

            h3 { color: #ffffff; }
            p { color: var(--color-seafoam, #eef4f8); font-size: 1.05rem; }

            .tile-actions {
              display: flex;
              gap: 1.25rem;
              margin-top: 1.5rem;

              .btn-outline {
                color: #ffffff;
                border-color: rgba(255, 255, 255, 0.8);
                &:hover { background: #ffffff; color: var(--color-navy-dark, #07192f); }
              }
            }
          }

          /* Tile Edit Form */
          .tile-edit-form {
            .tile-edit-header {
              margin-bottom: 0.75rem;

              .tile-edit-badge {
                font-size: 0.72rem;
                font-weight: 700;
                text-transform: uppercase;
                background: #FAF3E8;
                border: 1px solid #C58A3E;
                color: #945C22;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
              }
            }

            .tile-image-picker-box {
              display: flex;
              gap: 0.75rem;
              margin-bottom: 0.85rem;
              align-items: center;

              .tile-thumb-preview {
                width: 60px;
                height: 60px;
                border-radius: 6px;
                overflow: hidden;
                border: 1px solid #D8CEBE;
                flex-shrink: 0;
                position: relative;

                img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }

                .thumb-uploading {
                  position: absolute;
                  inset: 0;
                  background: rgba(0,0,0,0.7);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
              }

              .tile-upload-actions {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 0.35rem;

                .btn-tile-upload {
                  padding: 0.35rem 0.65rem;
                  background: #2D271F;
                  border: 1px solid #C58A3E;
                  color: #FAF3E8;
                  border-radius: 6px;
                  font-size: 0.78rem;
                  font-weight: 600;
                  cursor: pointer;
                  display: inline-flex;
                  align-items: center;
                  gap: 0.35rem;

                  &:hover:not(:disabled) {
                    background: #C58A3E;
                    color: #FFFFFF;
                  }
                }
              }
            }

            .edit-control-group {
              margin-bottom: 0.75rem;
            }
          }
        }
      }
    }

    @media (max-width: 1024px) {
      .timeline-stage-section .active-era-card .era-grid-layout {
        grid-template-columns: 1fr;
      }

      .mosaic-archive-section .mosaic-gallery-grid {
        grid-template-columns: 1fr;

        .mosaic-tile.tile-large, .mosaic-tile.tile-wide {
          grid-column: span 1;
        }
      }
    }
  `],
})
export class StoriaComponent implements OnInit {
  public authService = inject(AuthService);
  private infoService = inject(InfoService);
  private uploadService = inject(UploadService);

  public canEdit = computed(() => this.authService.isGestore());
  public isEditingMode = signal<boolean>(false);
  public isSaving = signal<boolean>(false);

  public isUploadingEraImage = signal<boolean>(false);
  public uploadingMosaicId = signal<string | null>(null);

  public feedbackMsg = signal<string | null>(null);
  public isFeedbackError = signal<boolean>(false);

  public info = signal<InfoLocale | null>(null);
  public currentHistoryStory: string = '';

  public eras: HistoricalEra[] = JSON.parse(JSON.stringify(DEFAULT_ERAS));
  public mosaic: MosaicItem[] = JSON.parse(JSON.stringify(DEFAULT_MOSAIC));

  public selectedYear = signal<string>('2014');

  get erasList(): HistoricalEra[] {
    return this.eras;
  }

  get mosaicList(): MosaicItem[] {
    return this.mosaic;
  }

  get currentEra(): HistoricalEra {
    const found = this.eras.find((e) => e.year === this.selectedYear());
    return found || this.eras[0];
  }

  get eraNarrativeText(): string {
    return (this.currentEra.narrative || []).join('\n\n');
  }

  ngOnInit(): void {
    this.loadInfoLocale();
  }

  loadInfoLocale(): void {
    this.infoService.getInfoLocale().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.info.set(res.data);
          this.currentHistoryStory = res.data.historyStory || '';

          if (res.data.historicalEras && res.data.historicalEras.length > 0) {
            this.eras = JSON.parse(JSON.stringify(res.data.historicalEras));
          }

          if (res.data.mosaicItems && res.data.mosaicItems.length > 0) {
            this.mosaic = JSON.parse(JSON.stringify(res.data.mosaicItems));
          }
        }
      },
    });
  }

  selectEra(year: string): void {
    this.selectedYear.set(year);
  }

  toggleEditMode(): void {
    this.isEditingMode.update((v) => !v);
  }

  onNarrativeTextChange(newText: string): void {
    if (this.currentEra) {
      this.currentEra.narrative = newText
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
    }
  }

  addAchievement(): void {
    if (this.currentEra) {
      if (!this.currentEra.achievements) {
        this.currentEra.achievements = [];
      }
      this.currentEra.achievements.push('Nuovo traguardo raggiunto...');
    }
  }

  removeAchievement(index: number): void {
    if (this.currentEra && this.currentEra.achievements) {
      this.currentEra.achievements.splice(index, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  /**
   * Device File Picker Handler for Era Image (Mobile Gallery / Desktop Explorer)
   */
  onEraFileSelected(event: Event, era: HistoricalEra): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.isUploadingEraImage.set(true);
    this.feedbackMsg.set(null);

    this.uploadService.uploadImage(file).subscribe({
      next: (res) => {
        this.isUploadingEraImage.set(false);
        if (res.success && res.url) {
          era.image = res.url;
          this.isFeedbackError.set(false);
          this.feedbackMsg.set('✓ Foto caricata con successo dal dispositivo!');
          setTimeout(() => this.feedbackMsg.set(null), 3000);
        }
      },
      error: (err) => {
        this.isUploadingEraImage.set(false);
        this.isFeedbackError.set(true);
        this.feedbackMsg.set(err?.error?.message || 'Errore durante il caricamento della foto.');
      },
    });
  }

  /**
   * Device File Picker Handler for Mosaic Card Image
   */
  onMosaicFileSelected(event: Event, tile: MosaicItem): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploadingMosaicId.set(tile.id);
    this.feedbackMsg.set(null);

    this.uploadService.uploadImage(file).subscribe({
      next: (res) => {
        this.uploadingMosaicId.set(null);
        if (res.success && res.url) {
          tile.image = res.url;
          this.isFeedbackError.set(false);
          this.feedbackMsg.set('✓ Immagine mosaico caricata con successo!');
          setTimeout(() => this.feedbackMsg.set(null), 3000);
        }
      },
      error: (err) => {
        this.uploadingMosaicId.set(null);
        this.isFeedbackError.set(true);
        this.feedbackMsg.set(err?.error?.message || 'Errore durante il caricamento della foto.');
      },
    });
  }

  saveLiveChanges(): void {
    this.isSaving.set(true);
    this.feedbackMsg.set(null);

    const payload: Partial<InfoLocale> = {
      historyStory: this.currentHistoryStory,
      historicalEras: this.eras,
      mosaicItems: this.mosaic,
    };

    this.infoService.updateInfoLocale(payload).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (res.success) {
          this.isFeedbackError.set(false);
          this.feedbackMsg.set('✓ Contenuti della pagina Storia salvati con successo nel database!');
          if (res.data) {
            this.info.set(res.data);
          }
          setTimeout(() => {
            this.feedbackMsg.set(null);
          }, 4000);
        } else {
          this.isFeedbackError.set(true);
          this.feedbackMsg.set('Errore durante il salvataggio dei contenuti.');
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.isFeedbackError.set(true);
        this.feedbackMsg.set(err?.error?.message || 'Errore di comunicazione con il server.');
      },
    });
  }

  cancelLiveChanges(): void {
    this.loadInfoLocale();
    this.isEditingMode.set(false);
    this.feedbackMsg.set('Modifiche annullate.');
    setTimeout(() => this.feedbackMsg.set(null), 2500);
  }

  onEraImgError(event: any): void {
    event.target.src = 'assets/videos/hero-poster.svg';
  }

  onLogoFallback(event: any): void {
    event.target.src = 'assets/images/logos/LogoPizzeriaDalCampioneDelMondo.svg';
  }
}

