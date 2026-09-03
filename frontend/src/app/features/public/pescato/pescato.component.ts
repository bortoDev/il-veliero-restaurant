import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PescatoService } from '../../../core/services/pescato.service';
import { AuthService } from '../../../core/services/auth.service';
import { PescatoItem } from '../../../core/models';
import { NauticalDecorComponent } from '../../../shared/components/nautical-decor/nautical-decor.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import {
  RosaDeiVentiComponent,
  VelieroShipComponent,
  NauticalStarComponent,
  TimoneComponent,
} from '../../../shared/components/svg-icons';

@Component({
  selector: 'app-pescato',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NauticalDecorComponent,
    ModalComponent,
    RosaDeiVentiComponent,
    VelieroShipComponent,
    NauticalStarComponent,
    TimoneComponent,
  ],
  template: `
    <div class="diario-di-bordo-page">
      <!-- EMBLEM HEADER: "Diario Di Bordo" with Central Rosa dei Venti (Mockup Page 8) -->
      <section class="diario-hero-section">
        <app-nautical-decor></app-nautical-decor>
        <div class="container hero-inner">
          <div class="rosa-emblem-wrap">
            <app-rosa-dei-venti size="160px" [isSpinning]="false"></app-rosa-dei-venti>
          </div>

          <span class="hero-kicker">Cronache dal Mercato Ittico</span>
          <h1 class="hero-diario-title">DIARIO DI BORDO</h1>
          <p class="hero-diario-sub">
            Le registrazioni quotidiane del pescato fresco selezionato all'asta all'alba, con foto, dettagli e disponibilità in tempo reale.
          </p>

          <div class="hero-links-row">
            <a routerLink="/menu" class="btn btn-outline-white btn-sm">
              <i class="fa-solid fa-utensils"></i> Vai al Menù Completo
            </a>
            <a href="tel:0424500200" class="btn btn-gold btn-sm">
              <i class="fa-solid fa-phone"></i> Chiama il Ristorante: 0424 500 200
            </a>
          </div>
        </div>
      </section>

      <!-- MAIN DIARY CONTENT (Mockup Pages 8 & 9) -->
      <section class="section diario-feed-section">
        <div class="container">
          <!-- INLINE MANAGER CONTROLS: Add Post Bar (Mockup Page 9) -->
          <div *ngIf="isManager()" class="manager-action-banner card">
            <div class="manager-banner-text">
              <i class="fa-solid fa-user-shield text-gold"></i>
              <div>
                <strong>Pannello Gestione Diario di Bordo:</strong>
                <span>Hai i permessi di gestione. Puoi pubblicare nuovi arrivi o modificare i post esistenti.</span>
              </div>
            </div>
            <button (click)="openAddModal()" class="btn btn-success">
              <i class="fa-solid fa-circle-plus"></i> + Aggiungi Post al Diario
            </button>
          </div>

          <!-- Share / Toast Feedback -->
          <div *ngIf="shareToastMessage()" class="share-toast-notification">
            <i class="fa-solid fa-circle-check"></i>
            <span>{{ shareToastMessage() }}</span>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading()" class="loading-state">
            <i class="fa-solid fa-spinner fa-spin"></i> Consultazione del registro di bordo...
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading() && catches().length === 0" class="empty-state card">
            <app-timone size="80px"></app-timone>
            <h3>Nessun post registrato nel Diario di Bordo</h3>
            <p>Il comandante e lo chef aggiorneranno presto il bollettino con i nuovi arrivi dell'asta mattutina.</p>
            <button *ngIf="isManager()" (click)="openAddModal()" class="btn btn-gold btn-sm mt-3">
              <i class="fa-solid fa-plus"></i> Pubblica il Primo Post
            </button>
          </div>

          <!-- CHRONOLOGICAL DIARY FEED (Mockup Pages 8 & 9) -->
          <div *ngIf="!isLoading() && catches().length > 0" class="diario-timeline-feed">
            <article
              *ngFor="let item of catches(); let i = index"
              class="diario-post-card card"
              [class.sold-out]="!item.isAvailable"
            >
              <!-- Date Flag Header (e.g. "Sab 25 - Lug - 2026") -->
              <div class="post-date-header">
                <div class="date-flag">
                  <i class="fa-solid fa-anchor"></i>
                  <span>{{ formatDiaryDate(item.catchDate || item.createdAt) }}</span>
                </div>

                <!-- Inline Context Menu for Managers (...) -->
                <div *ngIf="isManager()" class="manager-inline-menu">
                  <button
                    class="btn-context-trigger"
                    (click)="toggleContextMenu(item.id || item._id || '')"
                    title="Opzioni Gestore"
                  >
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>

                  <div
                    class="context-dropdown-menu"
                    *ngIf="activeContextMenuId() === (item.id || item._id)"
                  >
                    <button (click)="openEditModal(item)">
                      <i class="fa-solid fa-pen-to-square"></i> Modifica Post
                    </button>
                    <button (click)="toggleAvailability(item)">
                      <i class="fa-solid" [ngClass]="item.isAvailable ? 'fa-eye-slash' : 'fa-eye'"></i>
                      {{ item.isAvailable ? 'Segna come Terminato' : 'Segna come Disponibile' }}
                    </button>
                    <button class="delete-action" (click)="deletePost(item)">
                      <i class="fa-solid fa-trash-can"></i> Elimina Post
                    </button>
                  </div>
                </div>
              </div>

              <!-- Post Body: Photo on Left, Details on Right -->
              <div class="post-layout-grid">
                <!-- Left: Media Frame -->
                <div class="post-media-frame">
                  <img
                    [src]="item.image || 'assets/videos/card-pescato-poster.jpg'"
                    [alt]="item.title"
                    class="post-img"
                    (error)="onImgFallback($event)"
                  />
                  <div class="status-overlay-badge" [class.available]="item.isAvailable" [class.unavailable]="!item.isAvailable">
                    {{ item.isAvailable ? 'Disponibile Oggi' : 'Terminato' }}
                  </div>
                </div>

                <!-- Right: Content Narrative & Actions -->
                <div class="post-content-column">
                  <div class="post-meta-row">
                    <span class="meta-origin">
                      <i class="fa-solid fa-location-dot"></i> {{ item.marketLocation || 'Mercato Ittico Chioggia' }}
                    </span>
                    <span *ngIf="item.kilogramsAvailable" class="meta-kg">
                      <i class="fa-solid fa-scale-balanced"></i> Disp: <strong>{{ item.kilogramsAvailable }} kg</strong>
                    </span>
                  </div>

                  <h2 class="post-title">{{ item.title }}</h2>
                  <p class="post-desc">{{ item.description }}</p>

                  <div class="post-price-bar">
                    <span class="price-label">Prezzo consigliato:</span>
                    <strong class="price-val">€ {{ item.price ? item.price.toFixed(2) : '0.00' }}</strong>
                  </div>

                  <!-- Direct Actions: Chiamaci / Condividi (Mockup Page 9) -->
                  <div class="post-actions-toolbar">
                    <a
                      [href]="'https://wa.me/393346232941?text=' + getWhatsAppPrefillText(item)"
                      target="_blank"
                      rel="noopener"
                      class="btn btn-whatsapp-action"
                    >
                      <i class="fa-brands fa-whatsapp"></i> Chiamaci / WhatsApp
                    </a>

                    <a
                      href="tel:0424500200"
                      class="btn btn-call-action"
                    >
                      <i class="fa-solid fa-phone"></i> 0424 500 200
                    </a>

                    <button
                      (click)="sharePost(item)"
                      class="btn btn-share-action"
                      title="Condividi questo pescato"
                    >
                      <i class="fa-solid fa-share-nodes"></i> Condividi
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- INLINE MANAGER MODAL: Add / Edit Post (Mockup Page 9) -->
      <app-modal
        *ngIf="isModalOpen()"
        [title]="editingItem() ? 'Modifica Post Diario' : 'Nuovo Post Diario di Bordo'"
        (closed)="closeModal()"
      >
        <form (ngSubmit)="savePost()" class="manager-form">
          <div class="form-group">
            <label>Titolo del Pescato *</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="formTitle"
              name="title"
              required
              placeholder="es. Dentice nostrano da 3.5 kg"
            />
          </div>

          <div class="form-group">
            <label>Descrizione & Consigli di Cottura *</label>
            <textarea
              class="form-control"
              [(ngModel)]="formDescription"
              name="description"
              rows="4"
              required
              placeholder="Descrivi la freschezza, la pezzatura e le preparazioni consigliate dallo Chef..."
            ></textarea>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label>Prezzo (€) *</label>
              <input
                type="number"
                step="0.5"
                class="form-control"
                [(ngModel)]="formPrice"
                name="price"
                required
              />
            </div>
            <div class="form-group">
              <label>Quantità Disponibile (kg)</label>
              <input
                type="number"
                step="0.5"
                class="form-control"
                [(ngModel)]="formKilograms"
                name="kilograms"
              />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label>Data Pescato</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="formCatchDate"
                name="catchDate"
              />
            </div>
            <div class="form-group">
              <label>Mercato di Provenienza</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="formMarketLocation"
                name="marketLocation"
                placeholder="es. Mercato Ittico Chioggia"
              />
            </div>
          </div>

          <div class="form-group">
            <label>URL Immagine</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="formImage"
              name="image"
              placeholder="assets/videos/card-pescato-poster.jpg"
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="formIsAvailable"
                name="isAvailable"
              />
              <span>Disponibile al Ristorante Oggi</span>
            </label>
          </div>

          <div class="modal-footer-actions">
            <button type="button" (click)="closeModal()" class="btn btn-outline btn-sm">Annulla</button>
            <button type="submit" class="btn btn-gold btn-sm" [disabled]="!formTitle || !formDescription">
              {{ editingItem() ? 'Aggiorna Post' : 'Pubblica Post' }}
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
  styles: [`
    .diario-di-bordo-page {
      position: relative;
    }

    /* Emblem Header: "Diario Di Bordo" */
    .diario-hero-section {
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

      .rosa-emblem-wrap {
        display: flex;
        justify-content: center;
        margin-bottom: 1.5rem;
      }

      .hero-kicker {
        font-family: var(--font-body, 'Montserrat', sans-serif);
        font-size: 0.88rem;
        text-transform: uppercase;
        letter-spacing: 2.5px;
        color: var(--color-gold, #dda15e);
        font-weight: 700;
        display: block;
        margin-bottom: 0.5rem;
      }

      .hero-diario-title {
        font-size: 3.5rem;
        letter-spacing: 4px;
        color: #ffffff;
        margin-bottom: 1rem;
        font-family: var(--font-heading, 'Cinzel', serif);
      }

      .hero-diario-sub {
        color: var(--color-seafoam, #eef4f8);
        font-size: 1.15rem;
        max-width: 680px;
        margin: 0 auto 2rem;
        line-height: 1.7;
      }

      .hero-links-row {
        display: flex;
        justify-content: center;
        gap: 1.25rem;
        flex-wrap: wrap;

        .btn-outline-white {
          background: transparent;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.8);

          &:hover {
            background: #ffffff;
            color: var(--color-navy-dark, #07192f);
          }
        }
      }
    }

    /* Manager Control Bar */
    .manager-action-banner {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 1.25rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 3rem;
      border-radius: 12px;

      .manager-banner-text {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 0.92rem;
        color: #166534;

        i { font-size: 1.5rem; color: var(--color-gold-dark, #bc6c25); }
        strong { display: block; color: #14532d; font-size: 1rem; }
      }
    }

    .share-toast-notification {
      background: var(--color-navy-primary, #0b2545);
      color: #ffffff;
      padding: 0.75rem 1.5rem;
      border-radius: 30px;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
      border: 1px solid var(--color-gold, #dda15e);
      margin-bottom: 2rem;
      animation: fadeIn 0.3s ease;

      i { color: #4ade80; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Chronological Diary Feed */
    .diario-timeline-feed {
      display: flex;
      flex-direction: column;
      gap: 3rem;
      max-width: 980px;
      margin: 0 auto;

      .diario-post-card {
        padding: 0;
        overflow: hidden;
        border-radius: 16px;
        border: 1px solid var(--color-border, #e2e8f0);
        box-shadow: var(--shadow-md, 0 4px 12px rgba(11, 37, 69, 0.08));
        transition: transform 0.3s ease, box-shadow 0.3s ease;

        &:hover {
          box-shadow: var(--shadow-hover, 0 15px 35px rgba(11, 37, 69, 0.18));
        }

        &.sold-out {
          opacity: 0.75;
        }

        .post-date-header {
          background: var(--color-navy-dark, #07192f);
          color: #ffffff;
          padding: 0.85rem 1.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid var(--color-gold, #dda15e);

          .date-flag {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            font-family: var(--font-heading, 'Cinzel', serif);
            font-size: 1.15rem;
            font-weight: 700;
            letter-spacing: 1.5px;
            color: var(--color-gold, #dda15e);

            i { font-size: 1rem; }
          }

          .manager-inline-menu {
            position: relative;

            .btn-context-trigger {
              background: rgba(255, 255, 255, 0.1);
              border: none;
              color: #ffffff;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;

              &:hover {
                background: var(--color-gold, #dda15e);
                color: var(--color-navy-dark, #07192f);
              }
            }

            .context-dropdown-menu {
              position: absolute;
              right: 0;
              top: 100%;
              margin-top: 0.5rem;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
              padding: 0.5rem 0;
              min-width: 200px;
              z-index: 50;
              border: 1px solid var(--color-border, #e2e8f0);

              button {
                width: 100%;
                padding: 0.65rem 1rem;
                background: transparent;
                border: none;
                text-align: left;
                font-size: 0.85rem;
                font-weight: 600;
                color: var(--color-text-main, #1d2d44);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.6rem;

                &:hover {
                  background: var(--color-seafoam, #eef4f8);
                  color: var(--color-navy-dark, #07192f);
                }

                &.delete-action {
                  color: var(--color-danger, #d90429);
                  &:hover { background: #fef2f2; }
                }
              }
            }
          }
        }

        .post-layout-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 2rem;
          padding: 2rem;

          .post-media-frame {
            position: relative;
            height: 260px;
            border-radius: 12px;
            overflow: hidden;
            background: var(--color-navy-dark, #07192f);

            .post-img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .status-overlay-badge {
              position: absolute;
              top: 12px;
              left: 12px;
              padding: 0.35rem 0.85rem;
              border-radius: 20px;
              font-size: 0.75rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

              &.available {
                background: #16a34a;
                color: #ffffff;
              }

              &.unavailable {
                background: #dc2626;
                color: #ffffff;
              }
            }
          }

          .post-content-column {
            display: flex;
            flex-direction: column;

            .post-meta-row {
              display: flex;
              gap: 1.25rem;
              font-size: 0.82rem;
              color: var(--color-text-light, #94a3b8);
              margin-bottom: 0.5rem;

              span {
                display: inline-flex;
                align-items: center;
                gap: 0.35rem;
              }
            }

            .post-title {
              font-size: 1.65rem;
              color: var(--color-navy-dark, #07192f);
              margin-bottom: 0.75rem;
              font-family: var(--font-heading, 'Cinzel', serif);
            }

            .post-desc {
              font-size: 0.98rem;
              color: var(--color-text-main, #1d2d44);
              line-height: 1.7;
              margin-bottom: 1.5rem;
              flex: 1;
            }

            .post-price-bar {
              display: flex;
              align-items: baseline;
              gap: 0.75rem;
              margin-bottom: 1.5rem;
              padding-top: 0.75rem;
              border-top: 1px dashed var(--color-border, #e2e8f0);

              .price-label {
                font-size: 0.85rem;
                color: var(--color-text-muted, #64748b);
              }

              .price-val {
                font-family: var(--font-heading, 'Cinzel', serif);
                font-size: 1.6rem;
                font-weight: 700;
                color: var(--color-navy-dark, #07192f);
              }
            }

            .post-actions-toolbar {
              display: flex;
              gap: 0.75rem;
              flex-wrap: wrap;

              .btn-whatsapp-action {
                background: #25d366;
                color: #ffffff;
                padding: 0.55rem 1.15rem;
                border-radius: 6px;
                font-weight: 700;
                font-size: 0.88rem;
                display: inline-flex;
                align-items: center;
                gap: 0.45rem;
                text-decoration: none;
                transition: background 0.2s ease;

                &:hover {
                  background: #1eb954;
                }
              }

              .btn-call-action {
                background: var(--color-navy-primary, #0b2545);
                color: #ffffff;
                padding: 0.55rem 1.15rem;
                border-radius: 6px;
                font-weight: 700;
                font-size: 0.88rem;
                display: inline-flex;
                align-items: center;
                gap: 0.45rem;
                text-decoration: none;
                transition: background 0.2s ease;

                &:hover {
                  background: var(--color-navy-medium, #134074);
                }
              }

              .btn-share-action {
                background: var(--color-seafoam, #eef4f8);
                color: var(--color-navy-dark, #07192f);
                border: 1px solid var(--color-border, #e2e8f0);
                padding: 0.55rem 1rem;
                border-radius: 6px;
                font-weight: 600;
                font-size: 0.88rem;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 0.45rem;
                transition: all 0.2s ease;

                &:hover {
                  background: var(--color-gold, #dda15e);
                  color: #ffffff;
                  border-color: var(--color-gold, #dda15e);
                }
              }
            }
          }
        }
      }
    }

    /* Modal Form */
    .manager-form {
      .form-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .checkbox-label {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        font-weight: 600;
        cursor: pointer;
      }

      .modal-footer-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
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
    }

    @media (max-width: 900px) {
      .diario-timeline-feed .diario-post-card .post-layout-grid {
        grid-template-columns: 1fr;

        .post-media-frame {
          height: 220px;
        }
      }
    }
  `],
})
export class PescatoComponent implements OnInit {
  private pescatoService = inject(PescatoService);
  public authService = inject(AuthService);

  public catches = signal<PescatoItem[]>([]);
  public isLoading = signal<boolean>(true);
  public shareToastMessage = signal<string>('');

  // Manager Inline Controls
  public isModalOpen = signal<boolean>(false);
  public editingItem = signal<PescatoItem | null>(null);
  public activeContextMenuId = signal<string>('');

  // Form Fields
  public formTitle = '';
  public formDescription = '';
  public formPrice = 0;
  public formKilograms = 0;
  public formCatchDate = new Date().toISOString().split('T')[0];
  public formMarketLocation = 'Mercato Ittico Chioggia';
  public formImage = 'assets/videos/card-pescato-poster.jpg';
  public formIsAvailable = true;

  ngOnInit(): void {
    this.fetchCatches();
  }

  isManager(): boolean {
    const user = this.authService.currentUser();
    return user !== null && (user.role === 'admin' || user.role === 'gestore');
  }

  fetchCatches(): void {
    this.isLoading.set(true);
    this.pescatoService.getPescatoList({ all: true }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.catches.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  formatDiaryDate(rawDate?: string): string {
    if (!rawDate) return 'Oggi';
    try {
      const d = new Date(rawDate);
      const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
      const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
      const dayName = days[d.getDay()];
      const dayNum = d.getDate();
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      return `${dayName} ${dayNum} - ${monthName} - ${year}`;
    } catch {
      return 'Data del Giorno';
    }
  }

  getWhatsAppPrefillText(item: PescatoItem): string {
    return encodeURIComponent(
      `Salve Ristorante Il Veliero, vorrei prenotare o avere informazioni sul pescato "${item.title}".`
    );
  }

  sharePost(item: PescatoItem): void {
    const shareData = {
      title: `Il Veliero Diario di Bordo: ${item.title}`,
      text: `${item.title} — ${item.description}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.shareToastMessage.set('Link del pescato copiato negli appunti!');
        setTimeout(() => this.shareToastMessage.set(''), 3500);
      });
    }
  }

  toggleContextMenu(id: string): void {
    if (this.activeContextMenuId() === id) {
      this.activeContextMenuId.set('');
    } else {
      this.activeContextMenuId.set(id);
    }
  }

  openAddModal(): void {
    this.editingItem.set(null);
    this.formTitle = '';
    this.formDescription = '';
    this.formPrice = 12;
    this.formKilograms = 5;
    this.formCatchDate = new Date().toISOString().split('T')[0];
    this.formMarketLocation = 'Mercato Ittico Chioggia';
    this.formImage = 'assets/videos/card-pescato-poster.jpg';
    this.formIsAvailable = true;
    this.isModalOpen.set(true);
    this.activeContextMenuId.set('');
  }

  openEditModal(item: PescatoItem): void {
    this.editingItem.set(item);
    this.formTitle = item.title;
    this.formDescription = item.description;
    this.formPrice = item.price;
    this.formKilograms = item.kilogramsAvailable || 0;
    this.formCatchDate = item.catchDate
      ? new Date(item.catchDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    this.formMarketLocation = item.marketLocation || 'Mercato Ittico Chioggia';
    this.formImage = item.image || 'assets/videos/card-pescato-poster.jpg';
    this.formIsAvailable = item.isAvailable;
    this.isModalOpen.set(true);
    this.activeContextMenuId.set('');
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingItem.set(null);
  }

  savePost(): void {
    const payload: Partial<PescatoItem> = {
      title: this.formTitle,
      description: this.formDescription,
      price: this.formPrice,
      kilogramsAvailable: this.formKilograms,
      catchDate: this.formCatchDate,
      marketLocation: this.formMarketLocation,
      image: this.formImage,
      isAvailable: this.formIsAvailable,
    };

    const current = this.editingItem();
    if (current && (current.id || current._id)) {
      const id = (current.id || current._id)!;
      this.pescatoService.updatePescato(id, payload).subscribe({
        next: () => {
          this.closeModal();
          this.fetchCatches();
        },
      });
    } else {
      this.pescatoService.createPescato(payload).subscribe({
        next: () => {
          this.closeModal();
          this.fetchCatches();
        },
      });
    }
  }

  toggleAvailability(item: PescatoItem): void {
    const id = item.id || item._id;
    if (!id) return;
    this.pescatoService
      .updatePescato(id, { isAvailable: !item.isAvailable })
      .subscribe({
        next: () => {
          this.activeContextMenuId.set('');
          this.fetchCatches();
        },
      });
  }

  deletePost(item: PescatoItem): void {
    const id = item.id || item._id;
    if (!id) return;
    if (confirm(`Sei sicuro di voler eliminare "${item.title}" dal Diario di Bordo?`)) {
      this.pescatoService.deletePescato(id).subscribe({
        next: () => {
          this.activeContextMenuId.set('');
          this.fetchCatches();
        },
      });
    }
  }

  onImgFallback(event: any): void {
    event.target.src = 'assets/videos/card-pescato-poster.svg';
  }
}
