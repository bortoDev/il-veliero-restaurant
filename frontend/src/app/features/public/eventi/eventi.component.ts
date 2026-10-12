import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EventoService } from '../../../core/services/evento.service';
import { AvvisoService } from '../../../core/services/avviso.service';
import { Evento, Avviso } from '../../../core/models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { VelieroShipComponent } from '../../../shared/components/svg-icons';

export interface EditorialBannerItem {
  id: string;
  type: 'evento' | 'avviso';
  title: string;
  description: string;
  badge: string;
  dateLabel?: string;
  images: string[];
}

@Component({
  selector: 'app-eventi',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SkeletonLoaderComponent,
    VelieroShipComponent,
  ],
  template: `
    <div class="eventi-page">
      <!-- HERO HEADER CLASSICO -->
      <section class="eventi-hero-section">
        <div class="container hero-inner">
          <h1 class="hero-title">Eventi & Serate a Tema</h1>
        </div>
      </section>

      <!-- INVITO ELEGANTE: MENÙ SU MISURA (SFONDO LINO CALDO DEDICATO, NESSUN RIQUADRO) -->
      <section class="invitation-section">
        <div class="container">
          <div class="invitation-inner">
            <div class="invitation-ship-mark">
              <app-veliero-ship
                size="52px"
                mode="gold"
                [withWaves]="false"
                alt="Emblema Il Veliero"
              ></app-veliero-ship>
            </div>
            <span class="invitation-kicker">Cene Private & Ricorrenze</span>
            <h2 class="invitation-title">Menù su Misura</h2>
            <p class="invitation-lead">
              «Ogni ricorrenza ha la sua storia. Concordiamo insieme ogni portata per dare vita alla vostra serata ideale.»
            </p>
            <div class="invitation-actions">
              <a href="tel:0424500200" class="btn btn-gold btn-sm">
                Chiama 0424 500 200
              </a>
              <a [routerLink]="['/dove-siamo']" [fragment]="'mappa'" class="btn btn-outline-warm btn-sm">
                Dove Siamo & Mappa
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- SEZIONE BANNER EDITORIALI (EVENTI E AVVISI FULL-WIDTH ALTERNATI DINAMICAMENTE) -->
      <section class="section banner-stream-section">
        <div class="container banner-stream-container">
          <!-- SKELETON LOADER STATE -->
          <app-skeleton-loader *ngIf="isLoading()" type="event-card" [count]="2"></app-skeleton-loader>

          <!-- EMPTY STATE DISCRETO -->
          <div *ngIf="!isLoading() && bannerItems().length === 0" class="empty-banner-note">
            <p>Il calendario delle prossime serate gastronomiche e gli avvisi speciali verranno pubblicati a breve.</p>
          </div>

          <!-- BANNERS STREAM -->
          <div *ngIf="!isLoading() && bannerItems().length > 0" class="banner-stream-list">
            <article
              *ngFor="let item of bannerItems(); trackBy: trackById"
              class="banner-full-row"
            >
              <!-- COLONNA TESTO (A SINISTRA, ALTERNATA A DESTRA NEI PARI) -->
              <div class="banner-text-column">
                <div class="banner-text-inner">
                  <div class="banner-meta">
                    <span class="banner-kicker">{{ item.badge }}</span>
                    <span class="banner-date" *ngIf="item.dateLabel">{{ item.dateLabel }}</span>
                  </div>

                  <h2 class="banner-heading">{{ item.title }}</h2>

                  <p class="banner-description">{{ item.description }}</p>

                  <div class="banner-actions">
                    <a href="tel:0424500200" class="btn btn-gold btn-sm">
                      Chiama 0424 500 200
                    </a>
                    <a
                      [routerLink]="['/dove-siamo']"
                      [fragment]="'mappa'"
                      class="btn btn-outline-warm btn-sm"
                    >
                      Vieni a Trovarci
                    </a>
                  </div>
                </div>
              </div>

              <!-- COLONNA FOTO (A DESTRA, ALTERNATA A SINISTRA NEI PARI) -->
              <div class="banner-media-column">
                <!-- 0 Foto Fallback -->
                <div *ngIf="item.images.length === 0" class="banner-media-fallback">
                  <app-veliero-ship size="64px" mode="gold" [withWaves]="false" alt="Il Veliero"></app-veliero-ship>
                  <span class="fallback-subtitle">Trattoria Il Veliero</span>
                </div>

                <!-- 1 Foto: Copertura Piena -->
                <div *ngIf="item.images.length === 1" class="media-layout-single">
                  <img [src]="item.images[0]" [alt]="item.title" (error)="onImageError($event)">
                </div>

                <!-- 2 Foto: Dittico Affiancato -->
                <div *ngIf="item.images.length === 2" class="media-layout-diptych">
                  <div class="media-cell">
                    <img [src]="item.images[0]" [alt]="item.title + ' 1'" (error)="onImageError($event)">
                  </div>
                  <div class="media-cell">
                    <img [src]="item.images[1]" [alt]="item.title + ' 2'" (error)="onImageError($event)">
                  </div>
                </div>

                <!-- 3 Foto: Trittico Asimmetrico (1 Grande + 2 Sovrapposte) -->
                <div *ngIf="item.images.length === 3" class="media-layout-triptych">
                  <div class="media-cell cell-hero">
                    <img [src]="item.images[0]" [alt]="item.title + ' 1'" (error)="onImageError($event)">
                  </div>
                  <div class="media-cell-stack">
                    <div class="media-cell">
                      <img [src]="item.images[1]" [alt]="item.title + ' 2'" (error)="onImageError($event)">
                    </div>
                    <div class="media-cell">
                      <img [src]="item.images[2]" [alt]="item.title + ' 3'" (error)="onImageError($event)">
                    </div>
                  </div>
                </div>

                <!-- 4+ Foto: Griglia 2x2 -->
                <div *ngIf="item.images.length >= 4" class="media-layout-grid">
                  <div class="media-cell" *ngFor="let img of item.images.slice(0, 4); let i = index">
                    <img [src]="img" [alt]="item.title + ' ' + (i + 1)" (error)="onImageError($event)">
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .eventi-page {
      position: relative;
      background: var(--bg-primary, #F1F5F9);
      min-height: 100vh;
    }

    .eventi-hero-section {
      background: var(--bg-navy-dark, #1E293B);
      color: #ffffff;
      margin-top: -82px;
      padding: calc(82px + 2.75rem) 0 3.5rem;
      text-align: center;
      position: relative;
      overflow: hidden;

      .hero-inner {
        position: relative;
        z-index: 2;
        max-width: 820px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }

      .hero-title {
        font-family: var(--font-heading, 'Cinzel', serif);
        font-size: clamp(2.4rem, 4.5vw, 3.4rem);
        letter-spacing: 3px;
        color: #ffffff;
        margin-bottom: 0;
        line-height: 1.15;
      }
    }

    /* SEZIONE INVITO: MENÙ SU MISURA (SFONDO LINO CALDO DEDICATO) */
    .invitation-section {
      background: #FAF7F2;
      border-top: 1px solid rgba(188, 108, 37, 0.22);
      border-bottom: 1px solid rgba(188, 108, 37, 0.22);
      padding: 4.5rem 0 4.25rem;

      .invitation-inner {
        max-width: 780px;
        margin: 0 auto;
        text-align: center;
        padding: 0 1.5rem;
      }

      .invitation-ship-mark {
        margin: 0 auto 1.35rem;
        display: flex;
        justify-content: center;
        opacity: 0.95;
      }

      .invitation-kicker {
        display: block;
        font-family: var(--font-sans);
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: var(--color-gold-dark, #CA8A04);
        font-weight: 600;
        margin-bottom: 0.65rem;
      }

      .invitation-title {
        font-family: var(--font-heading, 'Cinzel', serif);
        font-size: clamp(2.1rem, 4vw, 2.75rem);
        color: var(--text-primary, #1E293B);
        font-weight: 500;
        line-height: 1.25;
        letter-spacing: 1.5px;
        margin-bottom: 1.25rem;
      }

      .invitation-lead {
        font-family: var(--font-serif-primary, 'Cormorant Garamond', Georgia, serif);
        font-size: clamp(1.28rem, 2.4vw, 1.55rem);
        font-style: italic;
        color: #2D3748;
        line-height: 1.75;
        max-width: 680px;
        margin: 0 auto 2.25rem;
        font-weight: 400;
      }

      .invitation-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        flex-wrap: wrap;

        .btn {
          padding: 0.7rem 1.6rem;
          font-family: var(--font-sans);
          font-size: 0.94rem;
          border-radius: 3px;
          text-decoration: none;
        }

        .btn-outline-warm {
          background: transparent;
          border: 1px solid rgba(30, 41, 59, 0.35);
          color: var(--text-primary, #1E293B);
          transition: border-color 0.2s, background 0.2s, color 0.2s;

          &:hover {
            border-color: var(--text-primary, #1E293B);
            background: rgba(30, 41, 59, 0.05);
          }
        }
      }

      @media (max-width: 600px) {
        padding: 3.25rem 0 3rem;

        .invitation-actions {
          flex-direction: column;
          gap: 0.85rem;

          .btn {
            width: 100%;
            text-align: center;
          }
        }
      }
    }

    /* SEZIONE BANNER EDITORIALI (EVENTI E AVVISI FULL-WIDTH ALTERNATI) */
    .banner-stream-section {
      padding: 4.5rem 0 6rem;

      .banner-stream-container {
        max-width: 1220px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }
    }

    .empty-banner-note {
      text-align: center;
      padding: 3.5rem 1rem;
      color: var(--text-muted, #64748B);
      font-size: 1.15rem;
      font-family: var(--font-serif-primary, 'Cormorant Garamond', Georgia, serif);
      font-style: italic;

      p {
        margin: 0;
      }
    }

    .banner-stream-list {
      display: flex;
      flex-direction: column;
      gap: 4rem;
      width: 100%;
    }

    /* BANNER ROW DI BASE */
    .banner-full-row {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      background: #FFFFFF;
      border: 1px solid rgba(212, 175, 55, 0.22);
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 4px 24px -4px rgba(30, 41, 59, 0.07);
      width: 100%;
      min-height: 440px;
      transition: transform 0.25s ease, box-shadow 0.25s ease;

      &:hover {
        box-shadow: 0 8px 32px -4px rgba(30, 41, 59, 0.12);
      }
    }

    /* ALTERNANZA DINAMICA AUTOMATICA: SI ADATTA DA SOLA ALL'AGGIUNTA O ELIMINAZIONE DI QUALSIASI ELEMENTO */
    .banner-full-row:nth-child(even) {
      flex-direction: row-reverse;
      background: #FAF8F5; /* Tono lino alternato discreto */
    }

    /* COLONNA TESTO */
    .banner-text-column {
      flex: 1 1 50%;
      display: flex;
      align-items: center;
      padding: 3.5rem 4rem;
      box-sizing: border-box;

      .banner-text-inner {
        max-width: 520px;
        width: 100%;
      }

      .banner-meta {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        margin-bottom: 0.85rem;
        flex-wrap: wrap;
      }

      .banner-kicker {
        font-family: var(--font-sans);
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: var(--color-gold-dark, #CA8A04);
        font-weight: 600;
      }

      .banner-date {
        font-family: var(--font-sans);
        font-size: 0.82rem;
        color: var(--text-muted, #64748B);
        font-weight: 500;
        display: inline-flex;
        align-items: center;

        &::before {
          content: "•";
          color: rgba(30, 41, 59, 0.35);
          margin-right: 0.75rem;
        }
      }

      .banner-heading {
        font-family: var(--font-heading, 'Cinzel', serif);
        font-size: clamp(1.65rem, 2.5vw, 2.25rem);
        color: var(--text-primary, #1E293B);
        font-weight: 500;
        line-height: 1.25;
        letter-spacing: 0.5px;
        margin-bottom: 1.25rem;
      }

      .banner-description {
        font-family: var(--font-serif-primary, 'Cormorant Garamond', Georgia, serif);
        font-size: clamp(1.15rem, 1.8vw, 1.32rem);
        line-height: 1.75;
        color: #334155;
        font-weight: 400;
        margin-bottom: 2.25rem;
        white-space: pre-line;
      }

      .banner-actions {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        flex-wrap: wrap;

        .btn {
          padding: 0.75rem 1.65rem;
          font-family: var(--font-sans);
          font-size: 0.92rem;
          border-radius: 3px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }

        .btn-outline-warm {
          background: transparent;
          border: 1px solid rgba(30, 41, 59, 0.35);
          color: var(--text-primary, #1E293B);

          &:hover {
            border-color: var(--text-primary, #1E293B);
            background: rgba(30, 41, 59, 0.05);
          }
        }
      }
    }

    /* COLONNA FOTO MULTIPLE O SINGOLE */
    .banner-media-column {
      flex: 1 1 50%;
      position: relative;
      min-height: 420px;
      background: #1E293B;
      overflow: hidden;
      box-sizing: border-box;
    }

    /* 0 Foto Fallback */
    .banner-media-fallback {
      width: 100%;
      height: 100%;
      min-height: 420px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at center, #1E293B 0%, #0F172A 100%);
      gap: 1.25rem;
      padding: 2rem;
      text-align: center;

      .fallback-subtitle {
        font-family: var(--font-heading, 'Cinzel', serif);
        font-size: 0.85rem;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: rgba(212, 175, 55, 0.7);
      }
    }

    /* 1 Foto Singola */
    .media-layout-single {
      width: 100%;
      height: 100%;
      min-height: 420px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    }

    /* 2 Foto: Dittico */
    .media-layout-diptych {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
      width: 100%;
      height: 100%;
      min-height: 420px;

      .media-cell {
        width: 100%;
        height: 100%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      }
    }

    /* 3 Foto: Trittico (1 Hero + 2 Stacked) */
    .media-layout-triptych {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 4px;
      width: 100%;
      height: 100%;
      min-height: 420px;

      .cell-hero {
        width: 100%;
        height: 100%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      }

      .media-cell-stack {
        display: grid;
        grid-template-rows: 1fr 1fr;
        gap: 4px;
        height: 100%;

        .media-cell {
          width: 100%;
          height: 100%;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
        }
      }
    }

    /* 4+ Foto: Griglia 2x2 */
    .media-layout-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 4px;
      width: 100%;
      height: 100%;
      min-height: 420px;

      .media-cell {
        width: 100%;
        height: 100%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      }
    }

    /* RESPONSIVE PER TABLET E SMARTPHONE */
    @media (max-width: 960px) {
      .banner-stream-section {
        padding: 3.5rem 0 4.5rem;
      }

      .banner-stream-list {
        gap: 2.75rem;
      }

      .banner-full-row,
      .banner-full-row:nth-child(even) {
        flex-direction: column;
        min-height: auto;
      }

      .banner-media-column {
        min-height: 280px;
        height: 320px;
        order: -1; /* Foto sempre in alto su schermi piccoli */
      }

      .media-layout-single,
      .media-layout-diptych,
      .media-layout-triptych,
      .media-layout-grid,
      .banner-media-fallback {
        min-height: 280px;
        height: 320px;
      }

      .banner-text-column {
        padding: 2.25rem 1.75rem;

        .banner-text-inner {
          max-width: 100%;
        }

        .banner-actions {
          flex-direction: column;
          width: 100%;
          gap: 0.85rem;

          .btn {
            width: 100%;
            text-align: center;
            justify-content: center;
          }
        }
      }
    }
  `],
})
export class EventiComponent implements OnInit {
  private eventoService = inject(EventoService);
  private avvisoService = inject(AvvisoService);

  public bannerItems = signal<EditorialBannerItem[]>([]);
  public isLoading = signal<boolean>(true);

  ngOnInit(): void {
    forkJoin({
      eventi: this.eventoService.getAllEventi({ isActive: true }).pipe(
        catchError(() => of({ success: true, count: 0, data: [] }))
      ),
      avvisi: this.avvisoService.getActiveAvvisi().pipe(
        catchError(() => of({ success: true, count: 0, data: [] }))
      ),
    }).subscribe({
      next: ({ eventi, avvisi }) => {
        const items: EditorialBannerItem[] = [];

        // Includi avvisi attivi come banner editoriali
        if (avvisi && avvisi.data) {
          for (const a of avvisi.data) {
            items.push({
              id: a.id || a._id || `avviso-${Math.random()}`,
              type: 'avviso',
              title: a.title,
              description: a.message,
              badge: this.getAvvisoBadge(a.severity),
              dateLabel: this.formatDate(a.startDate),
              images: this.extractImages(a),
            });
          }
        }

        // Includi eventi culinari attivi
        if (eventi && eventi.data) {
          for (const ev of eventi.data) {
            items.push({
              id: ev.id || ev._id || `evento-${Math.random()}`,
              type: 'evento',
              title: ev.title,
              description: ev.description,
              badge: 'Serata a Tema',
              dateLabel: this.formatDate(ev.eventDate),
              images: this.extractImages(ev),
            });
          }
        }

        this.bannerItems.set(items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  trackById(_index: number, item: EditorialBannerItem): string {
    return item.id;
  }

  private extractImages(source: any): string[] {
    const list: string[] = [];
    if (source.images && Array.isArray(source.images)) {
      for (const img of source.images) {
        if (typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      }
    }
    if (source.image && typeof source.image === 'string' && source.image.trim()) {
      const trimmed = source.image.trim();
      if (!list.includes(trimmed)) {
        list.unshift(trimmed);
      }
    }
    return list;
  }

  private getAvvisoBadge(severity: string): string {
    switch (severity) {
      case 'danger':
        return 'Comunicazione';
      case 'warning':
        return 'Avviso';
      default:
        return 'Novità';
    }
  }

  private formatDate(dateStr?: string | Date): string | undefined {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  }

  onImageError(event: any): void {
    if (event && event.target) {
      event.target.style.display = 'none';
    }
  }
}
