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
      "Fin dai primi anni, la ricerca rigorosa della materia prima freschissima e il rispetto dei tempi naturali di cottura hanno caratterizzato l'identità del Veliero.",
    ],
    achievements: [
      'Apertura del locale con focus sul pescato fresco',
      'Creazione delle ricette di marinature e fritture d’autore',
      'Punto di riferimento per la cucina di mare a Bassano del Grappa',
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
      'Nasce così la formula esclusiva de "Il Veliero: Ristorante & Pizzeria dal Campione del Mondo", dove il pesce fresco di giornata incontra la vera pizza cotta nel forno a legna.',
    ],
    achievements: [
      'Vittoria del Campionato Mondiale della Pizza con impasto speciale',
      'Installazione del forno a legna refrattario artigianale',
      'Connubio esclusivo tra cucina marinara e pizza d’autore',
    ],
    quote: "L'impasto perfetto è come la navigazione: richiede pazienza, cura dei dettagli e passione costante.",
    quoteAuthor: 'Federico Bortolato, Campione del Mondo',
    image: 'assets/images/logos/LogoPizzeriaDalCampioneDelMondo.jpg',
  },
  {
    year: 'Oggi',
    title: 'Tradizione Viva & Territorio',
    subtitle: 'Oltre Venticinque Anni di Cucina',
    badge: 'Oggi',
    narrative: [
      'Oggi Il Veliero in Via G. Fattori 7 a Bassano del Grappa rappresenta un punto di riferimento indiscusso per la cucina di mare e la vera pizza a legna.',
      'La dedizione di Federico e Sabina continua ogni giorno: dall\'acquisto del pescato dell\'Adriatico alla cura meticolosa degli impasti, affiancati da una cantina selezionata di oltre 120 etichette italiane e internazionali.',
    ],
    achievements: [
      'Selezione quotidiana del miglior pescato dei mercati adriatici',
      'Cantina con oltre 120 etichette di vini e distillati di Bassano',
      'Oltre 25 anni di passione, accoglienza e maestria a Bassano del Grappa',
    ],
    quote: 'Il nostro impegno quotidiano è far sentire ogni ospite come a casa, tra il profumo del mare e il calore del forno a legna.',
    quoteAuthor: 'Federico Bortolato & Sabina Mazzeracca',
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
    description: 'In Via G. Fattori 7 (Località San Michele), accogliamo ogni giorno amanti del buon cibo e famiglie con il calore della vera trattoria marinara veneta.',
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
      <!-- FLOATING ADMIN / GESTORE TOOLBAR -->
      <aside *ngIf="canEdit()" class="live-admin-toolbar">
        <div class="container toolbar-inner">
          <div class="toolbar-info">
            <span class="role-badge">
              <i class="fa-solid fa-crown text-accent"></i> {{ authService.isAdmin() ? 'PANNELLO ADMIN' : 'PANNELLO GESTORE' }}
            </span>
            <div class="toolbar-status">
              <span class="status-indicator" [class.status-active]="isEditingMode()"></span>
              <span class="toolbar-title">{{ isEditingMode() ? 'Modalità Modifica Attiva' : 'Visualizzazione Anteprima' }}</span>
            </div>
          </div>

          <div class="toolbar-actions">
            <button
              type="button"
              class="toolbar-btn btn-mode-toggle"
              [class.active-mode]="isEditingMode()"
              (click)="toggleEditMode()"
            >
              <i class="fa-solid" [ngClass]="isEditingMode() ? 'fa-eye' : 'fa-pen-ruler'"></i>
              <span>{{ isEditingMode() ? 'Anteprima Pubblica' : 'Abilita Modifica Live' }}</span>
            </button>

            <button
              *ngIf="isEditingMode()"
              type="button"
              class="toolbar-btn btn-save-accent"
              (click)="saveLiveChanges()"
              [disabled]="isSaving()"
            >
              <i class="fa-solid" [ngClass]="isSaving() ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'"></i>
              <span>{{ isSaving() ? 'Salvataggio...' : 'Salva Modifiche' }}</span>
            </button>

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

        <div *ngIf="feedbackMsg()" class="toolbar-feedback-toast" [ngClass]="isFeedbackError() ? 'feedback-toast-error' : 'feedback-toast-success'">
          <i class="fa-solid" [ngClass]="isFeedbackError() ? 'fa-triangle-exclamation' : 'fa-circle-check'"></i>
          <span>{{ feedbackMsg() }}</span>
        </div>
      </aside>

      <!-- HERO HEADER -->
      <section class="storia-hero-section">
        <div class="container hero-inner">
          <h1 class="hero-title">La Nostra Storia</h1>
        </div>
      </section>

      <!-- DYNAMIC NARRATIVE SECTION -->
      <section class="section dynamic-story-section">
        <div class="container">
          <div class="story-narrative-card card" [class.editing-card-highlight]="isEditingMode()">
            <div *ngIf="isEditingMode()" class="card-edit-badge-bar">
              <span class="badge-edit-label">
                <i class="fa-solid fa-feather-pointed"></i> Modifica Racconto dei Fondatori & Filosofia
              </span>
            </div>

            <div class="story-card-header">
              <span class="subtitle">La Nostra Tradizione</span>
              <h2>Il Racconto de Il Veliero</h2>
            </div>

            <!-- Read Mode -->
            <div class="story-narrative-body" *ngIf="!isEditingMode()">
              <p class="story-lead-text" style="white-space: pre-line;">{{ currentHistoryStory }}</p>
            </div>

            <!-- Edit Mode -->
            <div class="story-edit-body" *ngIf="isEditingMode()">
              <div class="edit-control-group">
                <label class="edit-label">
                  <i class="fa-solid fa-align-left text-accent"></i> Testo Narrativo dei Fondatori:
                </label>
                <textarea
                  class="form-control"
                  rows="7"
                  [(ngModel)]="currentHistoryStory"
                  placeholder="Inserisci qui il racconto introduttivo di Federico Bortolato e Sabina Mazzeracca..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- INTERACTIVE STAGE TIMELINE -->
      <section class="section timeline-stage-section">
        <div class="container">
          <div class="section-header">
            <span class="subtitle">La Tradizione nel Tempo</span>
            <h2>Le Tappe del Nostro Viaggio</h2>
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
            <div *ngIf="isEditingMode()" class="card-edit-badge-bar">
              <span class="badge-edit-label">
                <i class="fa-solid fa-clock-rotate-left"></i> Modifica Tappa Storica: <strong>{{ era.year }} ({{ era.badge }})</strong>
              </span>
            </div>

            <!-- READ MODE -->
            <div class="era-grid-layout" *ngIf="!isEditingMode()">
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
                  <span class="quote-author">Autore: {{ era.quoteAuthor }}</span>
                </div>
              </div>

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
                      <i class="fa-solid fa-circle-check text-accent"></i>
                      <span>{{ item }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- EDIT MODE -->
            <div class="era-edit-layout" *ngIf="isEditingMode()">
              <div class="era-edit-grid">
                <div class="edit-media-column">
                  <div class="image-uploader-card">
                    <label class="edit-label">
                      <i class="fa-solid fa-image text-accent"></i> Immagine della Tappa:
                    </label>

                    <div class="image-preview-box">
                      <img
                        [src]="era.image"
                        [alt]="era.title"
                        class="preview-img"
                        (error)="onEraImgError($event)"
                      />
                    </div>

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
                        class="btn btn-outline btn-sm"
                        (click)="eraFileInput.click()"
                        [disabled]="isUploadingEraImage()"
                      >
                        <i class="fa-solid fa-camera"></i>
                        <span>Scegli Foto dal Dispositivo</span>
                      </button>
                    </div>

                    <div class="manual-url-box">
                      <label class="edit-sublabel">Oppure percorso/URL:</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="era.image"
                        placeholder="assets/images/... o https://..."
                      />
                    </div>
                  </div>

                  <div class="quote-editor-card">
                    <label class="edit-label">
                      <i class="fa-solid fa-quote-left text-accent"></i> Citazione d'Autore:
                    </label>
                    <textarea
                      class="form-control"
                      rows="3"
                      [(ngModel)]="era.quote"
                      placeholder="Una citazione per quest'epoca..."
                    ></textarea>

                    <label class="edit-label" style="margin-top: 0.75rem;">
                      <i class="fa-solid fa-user-pen text-accent"></i> Autore:
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="era.quoteAuthor"
                      placeholder="Es. Federico Bortolato"
                    />
                  </div>
                </div>

                <div class="edit-content-column">
                  <div class="edit-row-2col">
                    <div class="form-group">
                      <label>Titolo Tappa:</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="era.title"
                      />
                    </div>
                    <div class="form-group">
                      <label>Sottotitolo:</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="era.subtitle"
                      />
                    </div>
                  </div>

                  <div class="edit-row-2col">
                    <div class="form-group">
                      <label>Etichetta Badge:</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="era.badge"
                      />
                    </div>
                    <div class="form-group">
                      <label>Anno:</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="era.year"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>
                      <i class="fa-solid fa-book-open text-accent"></i> Racconto dell'Epoca (un paragrafo per riga):
                    </label>
                    <textarea
                      class="form-control"
                      rows="6"
                      [ngModel]="eraNarrativeText"
                      (ngModelChange)="onNarrativeTextChange($event)"
                    ></textarea>
                  </div>

                  <div class="achievements-editor-card">
                    <div class="achievements-card-header">
                      <label class="mb-0 font-weight-bold">
                        <i class="fa-solid fa-award text-accent"></i> Traguardi Raggiunti:
                      </label>
                      <button type="button" class="btn btn-outline btn-sm" (click)="addAchievement()">
                        <i class="fa-solid fa-circle-plus"></i> Aggiungi Traguardo
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
                          class="form-control"
                          [(ngModel)]="era.achievements[i]"
                        />
                        <button
                          type="button"
                          class="btn-remove-item"
                          (click)="removeAchievement(i)"
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
            <span class="subtitle">Archivio Fotografico</span>
            <h2>Il Mosaico della Nostra Passione</h2>
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
                <div *ngIf="tile.type === 'large'" class="tile-bg-image tile-bg-pizza">
                  <img
                    [src]="tile.image || 'assets/images/logos/LogoPizzeriaDalCampioneDelMondo.jpg'"
                    [alt]="tile.title"
                    class="mosaic-embedded-logo"
                    (error)="onLogoFallback($event)"
                  />
                </div>

                <div *ngIf="tile.icon && tile.type !== 'large' && tile.type !== 'wide'" class="tile-icon-decor">
                  <i [class]="tile.icon"></i>
                </div>

                <div [class]="tile.type === 'wide' ? 'tile-caption-wide' : 'tile-caption'">
                  <span class="tile-tag">{{ tile.tag }}</span>
                  <h3>{{ tile.title }}</h3>
                  <p>{{ tile.description }}</p>

                  <div *ngIf="tile.type === 'wide'" class="tile-actions">
                    <a routerLink="/dove-siamo" class="btn btn-gold btn-sm">
                      <i class="fa-solid fa-location-dot"></i> Dove Siamo
                    </a>
                    <a routerLink="/menu" class="btn btn-outline btn-sm">
                      <i class="fa-solid fa-book-open"></i> Menù
                    </a>
                  </div>
                </div>
              </ng-container>

              <!-- EDIT MODE -->
              <div class="tile-edit-form" *ngIf="isEditingMode()">
                <div class="tile-edit-header">
                  <span class="badge badge-accent">{{ tile.tag || 'Scheda Mosaico' }}</span>
                </div>

                <div class="tile-image-picker-box" *ngIf="tile.type === 'large' || tile.image">
                  <div class="tile-thumb-preview">
                    <img
                      [src]="tile.image || 'assets/images/logos/LogoPizzeriaDalCampioneDelMondo.jpg'"
                      alt="Thumbnail"
                      (error)="onLogoFallback($event)"
                    />
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
                      class="btn btn-outline btn-sm"
                      (click)="mosaicFileInput.click()"
                      [disabled]="uploadingMosaicId() === tile.id"
                    >
                      <i class="fa-solid fa-camera"></i> Carica Foto
                    </button>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="tile.image"
                      placeholder="URL foto..."
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>Tag</label>
                  <input type="text" class="form-control" [(ngModel)]="tile.tag" />
                </div>

                <div class="form-group">
                  <label>Titolo</label>
                  <input type="text" class="form-control" [(ngModel)]="tile.title" />
                </div>

                <div class="form-group">
                  <label>Descrizione</label>
                  <textarea class="form-control" rows="3" [(ngModel)]="tile.description"></textarea>
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

    /* Floating Toolbar */
    .live-admin-toolbar {
      position: sticky;
      top: 0;
      z-index: 1100;
      background: rgba(11, 37, 69, 0.98);
      backdrop-filter: blur(10px);
      color: #FFFFFF;
      border-bottom: 2px solid var(--color-accent, #0096C7);
      padding: 0.6rem 0;

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
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid var(--border-accent, rgba(0, 150, 199, 0.4));
            color: #FFFFFF;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: var(--tracking-small-caps);
            padding: 0.3rem 0.65rem;
            border-radius: 3px;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
          }

          .toolbar-status {
            display: flex;
            align-items: center;
            gap: 0.45rem;

            .status-indicator {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #94A3B8;

              &.status-active {
                background: #10B981;
                box-shadow: 0 0 8px #10B981;
              }
            }

            .toolbar-title {
              font-size: 0.86rem;
              color: var(--text-inverse-muted, #DDD3C4);
            }
          }
        }

        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .toolbar-btn {
            padding: 0.4rem 0.85rem;
            font-size: 0.8rem;
            font-weight: 700;
            border-radius: 3px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            transition: all var(--transition-fast);

            &.btn-mode-toggle {
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid var(--border-accent, rgba(0, 150, 199, 0.4));
              color: #FFFFFF;

              &:hover {
                background: var(--color-accent, #0096C7);
              }

              &.active-mode {
                background: var(--color-accent, #0096C7);
                border-color: var(--color-accent-light, #BDE0FE);
              }
            }

            &.btn-save-accent {
              background: var(--status-success, #2A7B4C);
              border: 1px solid #34D399;
              color: #FFFFFF;

              &:hover:not(:disabled) {
                background: #15803D;
              }

              &:disabled { opacity: 0.6; cursor: not-allowed; }
            }

            &.btn-cancel-outline {
              background: transparent;
              border: 1px solid rgba(255, 255, 255, 0.3);
              color: #D1D5DB;

              &:hover:not(:disabled) {
                background: rgba(255, 255, 255, 0.1);
              }
            }
          }
        }
      }

      .toolbar-feedback-toast {
        margin-top: 0.5rem;
        padding: 0.4rem 1rem;
        text-align: center;
        font-size: 0.84rem;
        font-weight: 600;

        &.feedback-toast-success {
          background: #064E3B;
          color: #A7F3D0;
        }

        &.feedback-toast-error {
          background: #7F1D1D;
          color: #FECACA;
        }
      }
    }

    /* Hero Header */
    .storia-hero-section {
      background: var(--bg-navy-dark, #0B2545);
      color: #ffffff;
      margin-top: -82px;
      padding: calc(82px + 2.75rem) 0 3.5rem;
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
        gap: 0.65rem;
        color: var(--color-accent-light, #BDE0FE);
        font-family: var(--font-sans);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: var(--tracking-eyebrow);
        margin-bottom: 0.75rem;
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
        color: var(--text-inverse-muted, #DDD3C4);
        font-size: 1.12rem;
        max-width: 680px;
        margin: 0 auto;
        line-height: 1.65;
        font-family: var(--font-serif-primary);
        font-style: italic;
      }
    }

    /* Narrative Card */
    .dynamic-story-section {
      padding: 4.5rem 0 3.5rem;

      .story-narrative-card {
        max-width: 960px;
        margin: 0 auto;
        background: #FFFFFF;
        padding: 3rem;
        border-radius: 4px;

        .story-card-header {
          text-align: center;
          margin-bottom: 2rem;

          .subtitle {
            font-size: 0.76rem;
            text-transform: uppercase;
            letter-spacing: var(--tracking-eyebrow);
            color: var(--color-accent-hover, #0077B6);
            font-weight: 700;
            display: block;
            margin-bottom: 0.4rem;
          }

          h2 {
            font-size: 2.1rem;
            color: var(--text-primary, #1C1917);
            margin: 0 0 1rem 0;
          }

          .story-divider-decor {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            color: var(--color-accent, #0096C7);

            .decor-line {
              width: 50px;
              height: 1px;
              background: var(--border-subtle, #E5DDD0);
            }
          }
        }

        .story-narrative-body {
          .story-lead-text {
            font-family: var(--font-serif-primary);
            font-size: 1.25rem;
            line-height: 1.85;
            color: var(--text-secondary, #292524);
          }
        }
      }
    }

    /* Timeline Stage */
    .timeline-stage-section {
      padding: 3.5rem 0 4.5rem;
      background-color: var(--bg-surface, #F5EFEB);
      border-top: none;
      border-bottom: none;

      .timeline-nav-bar {
        position: relative;
        max-width: 780px;
        margin: 0 auto 3rem;

        .timeline-line {
          position: absolute;
          top: 32px;
          left: 10%;
          right: 10%;
          height: 2px;
          background: var(--border-subtle, #E5DDD0);
          z-index: 1;
        }

        .timeline-nodes {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;

          .timeline-node-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.35rem;

            .node-icon-circle {
              width: 54px;
              height: 54px;
              border-radius: 4px;
              background: #FFFFFF;
              border: 2px solid var(--border-subtle, #E5DDD0);
              color: var(--text-muted, #78716C);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.2rem;
              transition: all var(--transition-fast);
            }

            .node-year {
              font-family: var(--font-serif-display);
              font-size: 1.1rem;
              font-weight: 700;
              color: var(--text-primary, #1C1917);
            }

            .node-label {
              font-family: var(--font-sans);
              font-size: 0.72rem;
              text-transform: uppercase;
              letter-spacing: var(--tracking-small-caps);
              color: var(--text-muted, #78716C);
              font-weight: 600;
            }

            &.active .node-icon-circle {
              background: var(--bg-navy-dark, #0B2545);
              border-color: var(--color-accent, #0096C7);
              color: #FFFFFF;
              box-shadow: var(--shadow-card);
            }

            &.active .node-year {
              color: var(--color-accent-hover, #0077B6);
            }
          }
        }
      }

      .active-era-card {
        max-width: 960px;
        margin: 0 auto;
        background: #FFFFFF;
        padding: 2.75rem;

        .era-grid-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 2.5rem;

          .era-visual-column {
            .era-photo-frame {
              position: relative;
              height: 230px;
              border-radius: 3px;
              overflow: hidden;
              background: var(--bg-navy-dark, #0B2545);
              margin-bottom: 1.25rem;

              .era-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }

              .era-year-badge {
                position: absolute;
                bottom: 10px;
                right: 10px;
                background: var(--bg-navy-dark, #0B2545);
                color: #FFFFFF;
                padding: 0.25rem 0.65rem;
                border-radius: 2px;
                font-size: 0.85rem;
                font-weight: 700;
              }
            }

            .era-quote-box {
              background: var(--bg-surface, #F5EFEB);
              border-left: 3px solid var(--color-accent, #0096C7);
              padding: 1rem;
              border-radius: 2px;

              .quote-icon {
                color: var(--color-accent-hover, #0077B6);
                font-size: 0.9rem;
                margin-bottom: 0.35rem;
              }

              blockquote {
                font-family: var(--font-serif-primary);
                font-style: italic;
                font-size: 0.95rem;
                line-height: 1.5;
                color: var(--text-secondary, #292524);
                margin-bottom: 0.35rem;
              }

              .quote-author {
                font-size: 0.76rem;
                color: var(--text-muted, #78716C);
                font-weight: 600;
              }
            }
          }

          .era-text-column {
            .era-kicker {
              font-family: var(--font-sans);
              font-size: 0.76rem;
              text-transform: uppercase;
              letter-spacing: var(--tracking-eyebrow);
              color: var(--color-accent-hover, #0077B6);
              font-weight: 700;
              display: block;
              margin-bottom: 0.35rem;
            }

            .era-title {
              font-family: var(--font-serif-primary);
              font-size: 1.7rem;
              font-weight: 700;
              color: var(--text-primary, #1C1917);
              margin-bottom: 1rem;
            }

            .era-paragraphs {
              p {
                font-family: var(--font-serif-primary);
                font-size: 1.1rem;
                line-height: 1.75;
                color: var(--text-secondary, #292524);
                margin-bottom: 0.85rem;
              }
            }

            .era-achievements-block {
              margin-top: 1.25rem;
              padding-top: 1rem;
              border-top: 1px solid var(--border-subtle, #E5DDD0);

              h4 {
                font-size: 1rem;
                color: var(--text-primary, #1C1917);
                margin-bottom: 0.65rem;
              }

              .achievements-list {
                list-style: none;
                display: flex;
                flex-direction: column;
                gap: 0.4rem;

                li {
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                  font-size: 0.9rem;
                  color: var(--text-secondary, #292524);

                  .text-accent {
                    color: var(--color-accent-hover, #0077B6);
                  }
                }
              }
            }
          }
        }
      }
    }

    /* Mosaic */
    .mosaic-archive-section {
      padding: 4.5rem 0 5.5rem;

      .mosaic-gallery-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;

        .mosaic-tile {
          background: #FFFFFF;
          border-radius: 4px;

          &.tile-large {
            grid-column: span 2;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            align-items: center;

            .tile-bg-image {
              height: 220px;
              border-radius: 3px;
              overflow: hidden;

              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }
          }

          &.tile-wide {
            grid-column: span 3;
            background: var(--bg-surface, #F5EFEB);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2.25rem;
          }

          .tile-icon-decor {
            font-size: 1.75rem;
            color: var(--color-accent-hover, #0077B6);
            margin-bottom: 0.75rem;
          }

          .tile-tag {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: var(--tracking-small-caps);
            color: var(--color-accent-hover, #0077B6);
            display: block;
            margin-bottom: 0.35rem;
          }

          h3 {
            font-size: 1.25rem;
            color: var(--text-primary, #1C1917);
            margin-bottom: 0.5rem;
          }

          p {
            font-size: 0.92rem;
            color: var(--text-stone, #44403C);
            line-height: 1.55;
            margin-bottom: 0;
          }

          .tile-actions {
            display: flex;
            gap: 0.75rem;
            margin-top: 1rem;
          }
        }
      }
    }

    @media (max-width: 900px) {
      .timeline-stage-section .active-era-card .era-grid-layout {
        grid-template-columns: 1fr;
      }

      .mosaic-archive-section .mosaic-gallery-grid {
        grid-template-columns: 1fr;

        .mosaic-tile.tile-large,
        .mosaic-tile.tile-wide {
          grid-column: span 1;
          display: block;
        }
      }
    }
  `],
})
export class StoriaComponent implements OnInit {
  private infoService = inject(InfoService);
  public authService = inject(AuthService);
  private uploadService = inject(UploadService);

  public info = signal<InfoLocale | null>(null);
  public isEditingMode = signal<boolean>(false);
  public isSaving = signal<boolean>(false);
  public isUploadingEraImage = signal<boolean>(false);
  public uploadingMosaicId = signal<string>('');
  public feedbackMsg = signal<string>('');
  public isFeedbackError = signal<boolean>(false);

  public selectedYear = signal<string>('2014');
  public erasList: HistoricalEra[] = DEFAULT_ERAS;
  public mosaicList: MosaicItem[] = DEFAULT_MOSAIC;
  public currentHistoryStory: string = '';
  public eraNarrativeText: string = '';

  ngOnInit(): void {
    this.fetchInfo();
  }

  canEdit(): boolean {
    const user = this.authService.currentUser();
    return user !== null && (user.role === 'admin' || user.role === 'gestore');
  }

  fetchInfo(): void {
    this.infoService.getInfoLocale().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.info.set(res.data);
          if (res.data.historyStory) {
            this.currentHistoryStory = res.data.historyStory;
          }
          if (res.data.historicalEras && res.data.historicalEras.length > 0) {
            this.erasList = res.data.historicalEras;
          } else if ((res.data as any).eras && (res.data as any).eras.length > 0) {
            this.erasList = (res.data as any).eras;
          }
          if (res.data.mosaicItems && res.data.mosaicItems.length > 0) {
            this.mosaicList = res.data.mosaicItems;
          } else if ((res.data as any).mosaic && (res.data as any).mosaic.length > 0) {
            this.mosaicList = (res.data as any).mosaic;
          }
          this.selectEra(this.selectedYear());
        }
      },
    });
  }

  selectEra(year: string): void {
    this.selectedYear.set(year);
    const found = this.erasList.find((e) => e.year === year);
    if (found) {
      this.eraNarrativeText = found.narrative ? found.narrative.join('\n\n') : '';
    }
  }

  get currentEra(): HistoricalEra | undefined {
    return this.erasList.find((e) => e.year === this.selectedYear()) || this.erasList[0];
  }

  toggleEditMode(): void {
    this.isEditingMode.update((v) => !v);
  }

  onNarrativeTextChange(val: string): void {
    this.eraNarrativeText = val;
    const era = this.currentEra;
    if (era) {
      era.narrative = val.split('\n\n').filter((p) => p.trim().length > 0);
    }
  }

  addAchievement(): void {
    const era = this.currentEra;
    if (era) {
      if (!era.achievements) era.achievements = [];
      era.achievements.push('Nuovo traguardo storico');
    }
  }

  removeAchievement(index: number): void {
    const era = this.currentEra;
    if (era && era.achievements) {
      era.achievements.splice(index, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  onEraFileSelected(event: any, era: HistoricalEra): void {
    const file = event.target.files?.[0];
    if (!file) return;
    this.isUploadingEraImage.set(true);
    this.uploadService.uploadImage(file).subscribe({
      next: (res) => {
        if (res.success && res.url) {
          era.image = res.url;
        }
        this.isUploadingEraImage.set(false);
      },
      error: () => this.isUploadingEraImage.set(false),
    });
  }

  onMosaicFileSelected(event: any, tile: MosaicItem): void {
    const file = event.target.files?.[0];
    if (!file) return;
    this.uploadingMosaicId.set(tile.id);
    this.uploadService.uploadImage(file).subscribe({
      next: (res) => {
        if (res.success && res.url) {
          tile.image = res.url;
        }
        this.uploadingMosaicId.set('');
      },
      error: () => this.uploadingMosaicId.set(''),
    });
  }

  saveLiveChanges(): void {
    this.isSaving.set(true);
    const payload: Partial<InfoLocale> = {
      historyStory: this.currentHistoryStory,
      historicalEras: this.erasList,
      mosaicItems: this.mosaicList,
    };

    this.infoService.updateInfoLocale(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.feedbackMsg.set('Modifiche salvate con successo!');
          this.isFeedbackError.set(false);
          this.isEditingMode.set(false);
          setTimeout(() => this.feedbackMsg.set(''), 4000);
        }
        this.isSaving.set(false);
      },
      error: () => {
        this.feedbackMsg.set('Errore durante il salvataggio.');
        this.isFeedbackError.set(true);
        this.isSaving.set(false);
      },
    });
  }

  cancelLiveChanges(): void {
    this.fetchInfo();
    this.isEditingMode.set(false);
  }

  onEraImgError(event: any): void {
    event.target.src = 'assets/videos/card-pescato-poster.jpg';
  }

  onLogoFallback(event: any): void {
    event.target.src = 'assets/images/logos/LogoPizzeriaDalCampioneDelMondo.svg';
  }
}
