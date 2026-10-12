import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoService } from '../../../core/services/info.service';
import { dayRows } from '../../../core/utils/opening-hours';
import { InfoLocale } from '../../../core/models';
import { VelieroShipComponent } from '../../../shared/components/svg-icons';

@Component({
  selector: 'app-dove-siamo',
  standalone: true,
  imports: [
    CommonModule,
    VelieroShipComponent,
  ],
  template: `
    <div class="dove-siamo-page">
      <!-- HERO HEADER -->
      <section class="dove-hero-section">
        <div class="container hero-inner">
          <h1 class="hero-title">Dove Siamo & Contatti</h1>
        </div>
      </section>

      <!-- CONTACT DETAILS & HOURS SECTION (FRAMELESS EDITORIAL) -->
      <section class="section contacts-content-section" id="orari">
        <div class="container">
          <div class="contacts-editorial-grid">
            <!-- Col 1: Recapiti & Indirizzo -->
            <div class="contact-col">
              <div class="col-header">
                <span class="block-kicker">I Nostri Recapiti</span>
                <h2 class="col-title">Ristorante & Pizzeria Il Veliero</h2>
              </div>

              <div class="info-items-list">
                <!-- Indirizzo -->
                <div class="info-row">
                  <i class="fa-solid fa-location-dot info-icon"></i>
                  <div class="info-content">
                    <span class="info-label">Indirizzo</span>
                    <p class="info-val-primary">Via G. Fattori, 7</p>
                    <span class="info-val-secondary">36061 Bassano del Grappa (VI) · Frazione San Michele</span>
                  </div>
                </div>

                <!-- Telefono -->
                <div class="info-row">
                  <i class="fa-solid fa-phone info-icon"></i>
                  <div class="info-content">
                    <span class="info-label">Prenotazioni Telefoniche</span>
                    <p class="info-val-primary">
                      <a href="tel:0424500200" class="phone-link">0424 500 200</a>
                    </p>
                    <span class="info-val-secondary">Consigliata la prenotazione per cena e fine settimana</span>
                  </div>
                </div>

                <!-- Email -->
                <div class="info-row">
                  <i class="fa-solid fa-envelope info-icon"></i>
                  <div class="info-content">
                    <span class="info-label">Email Ufficiale</span>
                    <p class="info-val-primary">
                      <a href="mailto:pizzadalcampione@gmail.com" class="email-link">pizzadalcampione&#64;gmail.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Col 2: Orari Cucina -->
            <div class="hours-col">
              <div class="col-header">
                <span class="block-kicker">Orari di Servizio</span>
                <h2 class="col-title">Apertura Cucina & Pizzeria</h2>
              </div>

              <div class="hours-table">
                <div class="hours-item" *ngFor="let row of hourRows()" [class.closed]="row.isClosed">
                  <span class="day-label">{{ row.label }}</span>
                  <span class="day-schedule" [class.day-closed]="row.isClosed">{{ row.isClosed ? 'Chiuso per riposo settimanale' : row.text }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- MAP SECTION (FRAMELESS) -->
          <div class="map-editorial-section" id="mappa">
            <div class="map-bar">
              <div class="map-meta">
                <span class="block-kicker">Come Raggiungerci</span>
                <h3 class="map-title">Posizione & Indicazioni Stradali</h3>
                <span class="map-sub">Via G. Fattori 7, 36061 Bassano del Grappa (VI) · Ampio parcheggio riservato</span>
              </div>
              <div class="map-action">
                <a
                  href="https://maps.google.com/?q=Via+G.+Fattori+7+36061+Bassano+del+Grappa+VI"
                  target="_blank"
                  rel="noopener"
                  class="btn btn-gold btn-sm"
                >
                  <i class="fa-solid fa-diamond-turn-right"></i> Apri in Google Maps
                </a>
              </div>
            </div>

            <div class="map-frame">
              <iframe
                title="Mappa Ristorante Il Veliero Bassano del Grappa"
                width="100%"
                height="440"
                style="border:0;"
                loading="lazy"
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=Via+G.+Fattori+7,+36061+Bassano+del+Grappa+VI&t=&z=16&ie=UTF8&iwloc=&output=embed"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dove-siamo-page {
      position: relative;
    }

    /* Hero Header */
    .dove-hero-section {
      background: var(--bg-navy-dark, #1E293B);
      color: #ffffff;
      margin-top: -82px;
      padding: calc(82px + 3rem) 0 3.8rem;
      text-align: center;
      position: relative;
      overflow: hidden;

      .hero-inner {
        position: relative;
        z-index: 2;
        max-width: 820px;
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
        color: var(--text-inverse-muted, #CBD5E1);
        font-size: 1.1rem;
        font-weight: 300;
        max-width: 650px;
        margin: 0 auto;
        line-height: 1.65;
        font-family: var(--font-serif-primary);
        font-style: italic;
      }
    }

    /* Contacts Content Section */
    .contacts-content-section {
      padding: 4rem 0 5.5rem;
    }

    /* Editorial Grid: Frameless, Clean, Open */
    .contacts-editorial-grid {
      display: grid;
      grid-template-columns: 1.05fr 1fr;
      gap: 4.5rem;
      align-items: start;
      margin-bottom: 4.5rem;
    }

    .col-header {
      margin-bottom: 2rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--border-subtle, #D4D4D8);

      .block-kicker {
        font-family: var(--font-sans);
        font-size: 0.72rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: var(--tracking-eyebrow, 0.16em);
        color: var(--color-accent-hover, #0284C7);
        display: block;
        margin-bottom: 0.35rem;
      }

      .col-title {
        font-family: var(--font-serif-primary);
        font-size: 1.85rem;
        font-weight: 500;
        color: var(--text-primary, #1E293B);
        letter-spacing: 0.01em;
        margin: 0;
        line-height: 1.2;
      }
    }

    /* Left Column: Info Items */
    .info-items-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;

      .info-icon {
        color: var(--color-accent-hover, #0284C7);
        font-size: 1.15rem;
        margin-top: 0.35rem;
        width: 20px;
        text-align: center;
        flex-shrink: 0;
      }

      .info-content {
        display: flex;
        flex-direction: column;

        .info-label {
          font-family: var(--font-sans);
          font-size: 0.72rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: var(--tracking-eyebrow, 0.16em);
          color: var(--text-muted, #64748B);
          margin-bottom: 0.2rem;
        }

        .info-val-primary {
          font-family: var(--font-serif-primary);
          font-size: 1.35rem;
          font-weight: 500;
          color: var(--text-primary, #1E293B);
          letter-spacing: 0.01em;
          margin: 0 0 0.2rem 0;
          line-height: 1.3;

          .phone-link {
            color: var(--text-primary, #1E293B);
            letter-spacing: 0.03em;
            transition: color var(--transition-fast, 0.2s ease);

            &:hover {
              color: var(--color-accent-hover, #0284C7);
            }
          }

          .email-link {
            font-family: var(--font-sans);
            font-size: 0.95rem;
            font-weight: 400;
            color: var(--color-accent-hover, #0284C7);
            transition: color var(--transition-fast, 0.2s ease);

            &:hover {
              color: var(--color-accent, #0EA5E9);
            }
          }
        }

        .info-val-secondary {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--text-stone, #475569);
          line-height: 1.4;
        }
      }
    }

    /* Right Column: Hours */
    .hours-table {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .hours-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding-bottom: 0.55rem;
      border-bottom: 1px solid rgba(212, 212, 216, 0.4);

      .day-label {
        font-family: var(--font-sans);
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-primary, #1E293B);
      }

      .day-schedule {
        font-family: var(--font-sans);
        font-size: 0.9rem;
        font-weight: 400;
        color: var(--text-secondary, #334155);

        &.day-closed {
          color: var(--status-danger, #DC2626);
          font-style: italic;
          font-weight: 400;
        }
      }

      &.closed {
        border-bottom-color: rgba(220, 38, 38, 0.15);
      }
    }

    /* Map Section: Frameless, Clean, Direct */
    .map-editorial-section {
      border-top: 1px solid var(--border-subtle, #D4D4D8);
      padding-top: 3.5rem;
    }

    .map-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1.5rem;

      .map-meta {
        .block-kicker {
          font-family: var(--font-sans);
          font-size: 0.72rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: var(--tracking-eyebrow, 0.16em);
          color: var(--color-accent-hover, #0284C7);
          display: block;
          margin-bottom: 0.35rem;
        }

        .map-title {
          font-family: var(--font-serif-primary);
          font-size: 1.85rem;
          font-weight: 500;
          color: var(--text-primary, #1E293B);
          letter-spacing: 0.01em;
          margin: 0 0 0.35rem 0;
          line-height: 1.2;
        }

        .map-sub {
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 400;
          color: var(--text-stone, #475569);
          display: block;
        }
      }

      .map-action {
        flex-shrink: 0;

        .btn {
          font-weight: 600;
          letter-spacing: 0.06em;
          font-size: 0.8rem;
          padding: 0.65rem 1.4rem;
        }
      }
    }

    .map-frame {
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid var(--border-subtle, #D4D4D8);
      line-height: 0;

      iframe {
        display: block;
      }
    }

    @media (max-width: 860px) {
      .contacts-editorial-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
        margin-bottom: 3.5rem;
      }

      .map-bar {
        align-items: flex-start;
        flex-direction: column;
        gap: 1rem;
      }
    }
  `],
})
export class DoveSiamoComponent implements OnInit {
  private infoService = inject(InfoService);
  public info = signal<InfoLocale | null>(null);
  /** Orari dal database (modificabili dall'area gestore), con gli orari reali come riserva. */
  public hourRows = computed(() => dayRows(this.info()?.openingHours));

  ngOnInit(): void {
    this.infoService.getInfoLocale().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.info.set(res.data);
        }
      },
    });
  }
}
