import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfoService } from '../../../core/services/info.service';
import { InfoLocale } from '../../../core/models';
import { NauticalDecorComponent } from '../../../shared/components/nautical-decor/nautical-decor.component';
import {
  VelieroShipComponent,
  RosaDeiVentiComponent,
  NauticalStarComponent,
} from '../../../shared/components/svg-icons';

@Component({
  selector: 'app-dove-siamo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NauticalDecorComponent,
    VelieroShipComponent,
    RosaDeiVentiComponent,
    NauticalStarComponent,
  ],
  template: `
    <div class="dove-siamo-page">
      <!-- HERO HEADER -->
      <section class="dove-hero-section">
        <app-nautical-decor></app-nautical-decor>
        <div class="container hero-inner">
          <div class="hero-badge">
            <app-nautical-star size="24px"></app-nautical-star>
            <span>Bassano del Grappa — Località San Michele</span>
            <app-nautical-star size="24px"></app-nautical-star>
          </div>
          <h1 class="hero-title">DOVE SIAMO & CONTATTI</h1>
          <p class="hero-subtitle">
            Ti aspettiamo a Bassano del Grappa per farti vivere un'esperienza indimenticabile tra il pescato fresco dell'Adriatico e la pizza del Campione del Mondo.
          </p>
        </div>
      </section>

      <!-- CONTACT DETAILS & HOURS SECTION -->
      <section class="section contacts-content-section" id="orari">
        <div class="container">
          <div class="contacts-grid-layout">
            <!-- Left: Restaurant Contact & Hours Card -->
            <div class="contact-details-col">
              <div class="contact-card card">
                <div class="card-brand-header">
                  <app-veliero-ship size="50px"></app-veliero-ship>
                  <div>
                    <h2>Ristorante Il Veliero</h2>
                    <span class="card-brand-sub">Pizza dal Campione del Mondo</span>
                  </div>
                </div>

                <!-- Address Item -->
                <div class="info-block">
                  <div class="info-icon-circle">
                    <i class="fa-solid fa-location-dot"></i>
                  </div>
                  <div class="info-text">
                    <strong>Indirizzo:</strong>
                    <p class="info-main-val">Via G. Fattori, 7</p>
                    <span class="info-sub-val">36061 Bassano del Grappa (VI) — Località San Michele</span>
                  </div>
                </div>

                <!-- Landline Phone -->
                <div class="info-block">
                  <div class="info-icon-circle">
                    <i class="fa-solid fa-phone"></i>
                  </div>
                  <div class="info-text">
                    <strong>Telefono Fisso (Prenotazioni):</strong>
                    <p class="info-main-val">
                      <a href="tel:0424500200" class="phone-highlight">0424 500 200</a>
                    </p>
                    <span class="info-sub-val">Clicca per avviare la chiamata telefonica</span>
                  </div>
                </div>

                <!-- Mobile & WhatsApp -->
                <div class="info-block">
                  <div class="info-icon-circle whatsapp-circle">
                    <i class="fa-brands fa-whatsapp"></i>
                  </div>
                  <div class="info-text">
                    <strong>Cellulare & WhatsApp:</strong>
                    <p class="info-main-val">
                      <a href="https://wa.me/393346232941" target="_blank" rel="noopener" class="whatsapp-highlight">
                        334 623 2941
                      </a>
                    </p>
                    <span class="info-sub-val">Scrivici direttamente per informazioni o prenotazioni rapide</span>
                  </div>
                </div>

                <!-- Emails -->
                <div class="info-block">
                  <div class="info-icon-circle">
                    <i class="fa-solid fa-envelope"></i>
                  </div>
                  <div class="info-text">
                    <strong>Email Ufficiale:</strong>
                    <div class="emails-list">
                      <a href="mailto:pizzadalcampione@gmail.com">pizzadalcampione&#64;gmail.com</a>
                    </div>
                  </div>
                </div>

                <hr class="card-divider">

                <!-- Real Opening Hours Table -->
                <div class="hours-section-box">
                  <div class="hours-header-tag">
                    <i class="fa-solid fa-clock"></i>
                    <h3>Orari di Apertura Cucina</h3>
                  </div>

                  <div class="hours-rows-list">
                    <div class="hours-row">
                      <span class="day-name">Lunedì:</span>
                      <span class="day-time">12:00 – 14:00 / 19:00 – 22:00</span>
                    </div>
                    <div class="hours-row">
                      <span class="day-name">Martedì:</span>
                      <span class="day-time">12:00 – 14:00 / 19:00 – 22:00</span>
                    </div>
                    <div class="hours-row closed-row">
                      <span class="day-name">Mercoledì:</span>
                      <span class="day-time"><strong>CHIUSO (Riposo Settimanale)</strong></span>
                    </div>
                    <div class="hours-row">
                      <span class="day-name">Giovedì:</span>
                      <span class="day-time">12:00 – 14:00 / 19:00 – 22:00</span>
                    </div>
                    <div class="hours-row">
                      <span class="day-name">Venerdì:</span>
                      <span class="day-time">12:00 – 14:00 / 19:00 – 22:00</span>
                    </div>
                    <div class="hours-row">
                      <span class="day-name">Sabato:</span>
                      <span class="day-time">12:00 – 14:00 / 19:00 – 22:00</span>
                    </div>
                    <div class="hours-row">
                      <span class="day-name">Domenica:</span>
                      <span class="day-time">12:00 – 14:00 / 19:00 – 22:00</span>
                    </div>
                  </div>

                  <p class="hours-note-text">
                    <i class="fa-solid fa-circle-info"></i> Orari Cucina: Pranzo 12:00-14:00 | Cena 19:00-22:00 (la cucina non fa pasti fuori da questi orari; la pizzeria può aprire leggermente prima o chiudere dopo). Chiuso il Mercoledì.
                  </p>
                </div>
              </div>
            </div>

            <!-- Right: Contact / Booking Request Form -->
            <div class="contact-form-col">
              <div class="form-container-card card">
                <div class="form-header-side">
                  <span class="form-kicker">Scrivici un Messaggio</span>
                  <h2>Richiedi Informazioni o Prenota</h2>
                  <p class="form-sub">
                    Compila il modulo per richieste speciali, serate private, intolleranze o richieste di tavoli numerosi.
                  </p>
                </div>

                <div *ngIf="messageSent()" class="success-message-alert">
                  <i class="fa-solid fa-circle-check"></i>
                  <div>
                    <h4>Messaggio Inviato con Successo!</h4>
                    <p>Grazie {{ name }}. Ti risponderemo al più presto tramite telefono o email.</p>
                    <button (click)="resetForm()" class="btn btn-primary btn-sm mt-2">Invia un altro messaggio</button>
                  </div>
                </div>

                <form *ngIf="!messageSent()" (ngSubmit)="submitMessage()" class="contact-form-inner">
                  <div class="form-group">
                    <label>Nome e Cognome *</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="name"
                      name="name"
                      required
                      placeholder="es. Mario Rossi"
                    />
                  </div>

                  <div class="form-row-2">
                    <div class="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        class="form-control"
                        [(ngModel)]="email"
                        name="email"
                        required
                        placeholder="mario@example.com"
                      />
                    </div>
                    <div class="form-group">
                      <label>Telefono / WhatsApp *</label>
                      <input
                        type="tel"
                        class="form-control"
                        [(ngModel)]="phone"
                        name="phone"
                        required
                        placeholder="333 1234567"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Oggetto</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="subject"
                      name="subject"
                      placeholder="es. Prenotazione tavolo per cena di famiglia"
                    />
                  </div>

                  <div class="form-group">
                    <label>Messaggio *</label>
                    <textarea
                      class="form-control"
                      [(ngModel)]="message"
                      name="message"
                      rows="5"
                      required
                      placeholder="Scrivi qui la tua richiesta..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    class="btn btn-gold btn-lg w-100"
                    [disabled]="!name || !email || !phone || !message"
                  >
                    <i class="fa-solid fa-paper-plane"></i> Invia Richiesta
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- GOOGLE MAPS INTEGRATION: Focused on Bassano del Grappa -->
          <div class="map-container-card card">
            <div class="map-header-bar">
              <div class="map-title-wrap">
                <i class="fa-solid fa-map-location-dot"></i>
                <div>
                  <h3>Mappa & Indicazioni Stradali</h3>
                  <span>Via G. Fattori 7, 36061 Bassano del Grappa (VI) — Ampio parcheggio disponibile</span>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=Via+G.+Fattori+7+36061+Bassano+del+Grappa+VI"
                target="_blank"
                rel="noopener"
                class="btn btn-gold btn-sm"
              >
                <i class="fa-solid fa-diamond-turn-right"></i> Apri in Google Maps
              </a>
            </div>

            <div class="map-iframe-wrapper">
              <iframe
                title="Mappa Ristorante Il Veliero Bassano del Grappa"
                width="100%"
                height="450"
                style="border:0; border-radius: 12px;"
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

    /* Contacts Grid */
    .contacts-content-section {
      padding: 5rem 0;

      .contacts-grid-layout {
        display: grid;
        grid-template-columns: 1.15fr 1fr;
        gap: 3rem;
        margin-bottom: 4rem;

        .contact-card, .form-container-card {
          padding: 2.75rem;
          border-radius: 20px;
          box-shadow: var(--shadow-lg, 0 10px 25px rgba(11, 37, 69, 0.12));
        }

        .contact-card {
          .card-brand-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
            padding-bottom: 1.25rem;
            border-bottom: 2px solid var(--color-seafoam, #eef4f8);

            h2 {
              font-family: var(--font-heading, 'Cinzel', serif);
              font-size: 1.75rem;
              color: var(--color-navy-dark, #07192f);
              margin-bottom: 0.35rem;
              line-height: 1.15;
            }

            .card-brand-sub {
              font-family: var(--font-sans);
              font-size: 0.78rem;
              color: var(--color-gold-dark, #bc6c25);
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              display: block;
            }
          }

          .info-block {
            display: flex;
            gap: 1.25rem;
            margin-bottom: 1.75rem;

            .info-icon-circle {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: var(--color-seafoam, #eef4f8);
              color: var(--color-navy-primary, #0b2545);
              font-size: 1.25rem;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              border: 1px solid var(--color-border, #e2e8f0);

              &.whatsapp-circle {
                background: #f0fdf4;
                color: #16a34a;
                border-color: #bbf7d0;
              }
            }

            .info-text {
              strong {
                display: block;
                font-size: 0.85rem;
                color: var(--color-text-muted, #64748b);
                margin-bottom: 0.2rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }

              .info-main-val {
                font-size: 1.2rem;
                font-weight: 700;
                color: var(--color-navy-dark, #07192f);
                margin-bottom: 0.2rem;
              }

              .info-sub-val {
                font-size: 0.82rem;
                color: var(--color-text-light, #94a3b8);
              }

              .phone-highlight {
                color: var(--color-navy-dark, #07192f);
                transition: color 0.2s ease;

                &:hover {
                  color: var(--color-gold-dark, #bc6c25);
                }
              }

              .whatsapp-highlight {
                color: #16a34a;
                transition: color 0.2s ease;

                &:hover {
                  color: #15803d;
                }
              }

              .emails-list {
                display: flex;
                flex-direction: column;
                gap: 0.3rem;
                margin-top: 0.25rem;

                a {
                  color: var(--color-navy-medium, #134074);
                  font-weight: 600;
                  font-size: 0.95rem;

                  &:hover {
                    color: var(--color-gold-dark, #bc6c25);
                  }
                }
              }
            }
          }

          .card-divider {
            border: 0;
            height: 1px;
            background: var(--color-border, #e2e8f0);
            margin: 2rem 0;
          }

          .hours-section-box {
            .hours-header-tag {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              color: var(--color-gold-dark, #bc6c25);
              margin-bottom: 1.25rem;

              i { font-size: 1.2rem; }
              h3 { font-size: 1.3rem; color: var(--color-navy-dark, #07192f); margin-bottom: 0; }
            }

            .hours-rows-list {
              display: flex;
              flex-direction: column;
              gap: 0.6rem;

              .hours-row {
                display: flex;
                justify-content: space-between;
                font-size: 0.92rem;
                padding-bottom: 0.4rem;
                border-bottom: 1px dashed var(--color-border, #e2e8f0);

                .day-name { font-weight: 600; color: var(--color-navy-dark, #07192f); }
                .day-time { color: var(--color-text-main, #1d2d44); }

                &.closed-row {
                  background: #fef2f2;
                  padding: 0.4rem 0.6rem;
                  border-radius: 6px;
                  border-bottom: none;

                  .day-name, .day-time { color: #dc2626; }
                }
              }
            }

            .hours-note-text {
              font-size: 0.84rem;
              color: var(--color-gold-dark, #bc6c25);
              margin-top: 1rem;
              display: flex;
              align-items: center;
              gap: 0.4rem;
              margin-bottom: 0;
            }
          }
        }

        .form-container-card {
          .form-header-side {
            margin-bottom: 2rem;

            .form-kicker {
              font-size: 0.85rem;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: var(--color-gold-dark, #bc6c25);
              font-weight: 700;
              display: block;
              margin-bottom: 0.35rem;
            }

            h2 {
              font-size: 2rem;
              color: var(--color-navy-dark, #07192f);
              margin-bottom: 0.5rem;
            }

            .form-sub {
              font-size: 0.95rem;
              color: var(--color-text-muted, #64748b);
              margin-bottom: 0;
            }
          }

          .form-row-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .success-message-alert {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 2rem;
            border-radius: 12px;
            display: flex;
            gap: 1.25rem;
            align-items: flex-start;
            color: #166534;

            i { font-size: 2.5rem; color: #16a34a; }

            h4 {
              color: #14532d;
              font-size: 1.25rem;
              margin-bottom: 0.5rem;
            }

            p {
              font-size: 0.95rem;
              margin-bottom: 1rem;
            }
          }
        }
      }

      .map-container-card {
        padding: 2rem;
        border-radius: 20px;
        box-shadow: var(--shadow-md, 0 4px 12px rgba(11, 37, 69, 0.08));

        .map-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;

          .map-title-wrap {
            display: flex;
            align-items: center;
            gap: 1rem;

            i { font-size: 2rem; color: var(--color-gold-dark, #bc6c25); }

            h3 {
              font-size: 1.45rem;
              color: var(--color-navy-dark, #07192f);
              margin-bottom: 0.15rem;
            }

            span {
              font-size: 0.88rem;
              color: var(--color-text-muted, #64748b);
            }
          }
        }

        .map-iframe-wrapper {
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
      }
    }

    @media (max-width: 1024px) {
      .contacts-content-section .contacts-grid-layout {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class DoveSiamoComponent implements OnInit {
  private infoService = inject(InfoService);
  public info = signal<InfoLocale | null>(null);

  public name: string = '';
  public email: string = '';
  public phone: string = '';
  public subject: string = '';
  public message: string = '';
  public messageSent = signal<boolean>(false);

  ngOnInit(): void {
    this.infoService.getInfoLocale().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.info.set(res.data);
        }
      },
    });
  }

  submitMessage(): void {
    if (!this.name || !this.email || !this.phone || !this.message) return;
    this.messageSent.set(true);
  }

  resetForm(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.subject = '';
    this.message = '';
    this.messageSent.set(false);
  }
}
