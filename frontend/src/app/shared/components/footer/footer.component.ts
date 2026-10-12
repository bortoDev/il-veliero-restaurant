import {
  Component,
  inject,
  OnInit,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InfoService } from '../../../core/services/info.service';
import { AnimationService } from '../../../core/services/animation.service';
import { InfoLocale } from '../../../core/models';
import {
  VelieroShipComponent,
  NauticalStarComponent,
} from '../svg-icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    VelieroShipComponent,
    NauticalStarComponent,
  ],
  template: `
    <footer class="site-footer" #footerSection>
      <div class="container footer-content">
        <div class="footer-grid">
          <!-- Col 1: Identity & Corporate Brand -->
          <div class="footer-col col-identity">
            <div class="footer-brand">
              <div class="brand-ship-wrap">
                <app-veliero-ship
                  mode="ivory"
                  size="90px"
                  alt="Incisione autentica del galeone Il Veliero"
                ></app-veliero-ship>
              </div>
              <div class="brand-title-wrap">
                <h3 class="footer-brand-title">IL VELIERO</h3>
                <span class="footer-brand-tag">Ristorante & Pizzeria dal Campione del Mondo</span>
              </div>
            </div>

            <p class="corporate-name">
              <strong>Pizza dal Campione del Mondo s.n.c.</strong><br />
              di Bortolato Federico e Mazzeracca Sabina
            </p>

            <div class="corporate-fiscal">
              <span><strong>P.IVA:</strong> {{ info()?.pIva || '03450720242' }}</span>
              <span><strong>Cod. SDI:</strong> {{ info()?.sdi || 'P62QHVQ' }}</span>
            </div>

            <div class="social-links">
              <a
                href="https://www.instagram.com/ilvelierotrattoria"
                target="_blank"
                rel="noopener"
                aria-label="Instagram Ristorante Il Veliero"
                class="social-btn"
                title="Seguici su Instagram"
              >
                <i class="fa-brands fa-instagram"></i>
              </a>
              <a
                href="https://facebook.com/ilvelierobassano"
                target="_blank"
                rel="noopener"
                aria-label="Facebook Ristorante Il Veliero"
                class="social-btn"
                title="Seguici su Facebook"
              >
                <i class="fa-brands fa-facebook-f"></i>
              </a>
            </div>
          </div>

          <!-- Col 2: Navigation Links -->
          <div class="footer-col col-nav">
            <h4 class="col-title">Navigazione</h4>
            <ul class="footer-links">
              <li>
                <a routerLink="/menu">
                  <i class="fa-solid fa-angle-right"></i> Menù alla Carta
                </a>
              </li>
              <li>
                <a routerLink="/pescato">
                  <i class="fa-solid fa-angle-right"></i> Diario di Bordo
                </a>
              </li>
              <li>
                <a routerLink="/eventi">
                  <i class="fa-solid fa-angle-right"></i> Eventi & Degustazioni
                </a>
              </li>
              <li>
                <a routerLink="/dove-siamo">
                  <i class="fa-solid fa-angle-right"></i> Dove Siamo & Orari
                </a>
              </li>
              <li>
                <a routerLink="/login" class="reserved-link">
                  <i class="fa-solid fa-lock"></i> Area Riservata
                </a>
              </li>
            </ul>
          </div>

          <!-- Col 3: Accurate Kitchen Opening Hours -->
          <div class="footer-col col-hours">
            <h4 class="col-title">Orari di Apertura</h4>
            <ul class="hours-list">
              <li>
                <span class="day-label">Lunedì:</span>
                <strong class="day-val">12:00–14:00 / 19:00–22:00</strong>
              </li>
              <li>
                <span class="day-label">Martedì:</span>
                <strong class="day-val">12:00–14:00 / 19:00–22:00</strong>
              </li>
              <li class="closed-day">
                <span class="day-label">Mercoledì:</span>
                <strong class="closed-tag">CHIUSO</strong>
              </li>
              <li>
                <span class="day-label">Giovedì:</span>
                <strong class="day-val">12:00–14:00 / 19:00–22:00</strong>
              </li>
              <li>
                <span class="day-label">Venerdì:</span>
                <strong class="day-val">12:00–14:00 / 19:00–22:00</strong>
              </li>
              <li>
                <span class="day-label">Sabato:</span>
                <strong class="day-val">12:00–14:00 / 19:00–22:00</strong>
              </li>
              <li>
                <span class="day-label">Domenica:</span>
                <strong class="day-val">12:00–14:00 / 19:00–22:00</strong>
              </li>
            </ul>
            <p class="hours-notes">
              <i class="fa-solid fa-circle-info"></i>
              <span>
                Pranzo 12:00–14:00, Cena 19:00–22:00. Chiuso il Mercoledì.
              </span>
            </p>
          </div>

          <!-- Col 4: Contacts & Reservations -->
          <div class="footer-col col-contacts">
            <h4 class="col-title">Contatti & Prenotazioni</h4>
            <ul class="contact-list">
              <li>
                <i class="fa-solid fa-location-dot"></i>
                <div class="contact-text-wrap">
                  <span class="street-line">Via G. Fattori, 7</span>
                  <span class="city-line">36061 Bassano del Grappa (VI), San Michele</span>
                </div>
              </li>
              <li>
                <i class="fa-solid fa-phone"></i>
                <div class="contact-text-wrap">
                  <a href="tel:0424500200" class="contact-val">0424 500 200</a>
                  <small class="contact-sub">Telefono Fisso</small>
                </div>
              </li>
              <li>
                <i class="fa-solid fa-envelope"></i>
                <div class="contact-text-wrap emails-wrap">
                  <a href="mailto:pizzadalcampione@gmail.com" class="email-link">
                    pizzadalcampione&#64;gmail.com
                  </a>
                </div>
              </li>
            </ul>

            <div class="footer-cta-wrap">
              <a href="tel:0424500200" class="btn btn-accent btn-sm w-100" style="width: 100%;">
                <i class="fa-solid fa-phone"></i> Chiama per Prenotare
              </a>
            </div>
          </div>
        </div>

        <!-- Footer Bottom Bar -->
        <div class="footer-bottom">
          <div class="bottom-copy">
            <p>
              &copy; {{ currentYear }} <strong>Pizza dal Campione del Mondo s.n.c.</strong>, P.IVA 03450720242, Cod. SDI P62QHVQ. Tutti i diritti riservati.
            </p>
            <p class="legal-address">
              Via G. Fattori 7, Località San Michele, 36061 Bassano del Grappa (VI)
            </p>
          </div>

          <div class="bottom-center-access">
            <a routerLink="/login" class="footer-staff-login" title="Accesso Riservato Gestione & Staff">
              <i class="fa-solid fa-shield-halved"></i> Area Riservata
            </a>
          </div>

          <div class="bottom-signature">
            <app-nautical-star size="16px"></app-nautical-star>
            <span class="signature-text">Cucina di Mare & Pizzeria dal Campione del Mondo</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: linear-gradient(180deg, var(--bg-navy-dark, #1E293B) 0%, var(--bg-navy-deep, #0F172A) 100%);
      color: var(--text-inverse, #F1F5F9);
      position: relative;
      padding-bottom: 2.5rem;
      overflow: hidden;
      border-top: 1px solid var(--border-accent, rgba(14, 165, 233, 0.35));

      .footer-top-rule {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        padding: 0 2rem;
        transform: translateY(-1px);

        .rule-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-accent, rgba(14, 165, 233, 0.35)), transparent);
        }

        .rule-center-ornament {
          color: var(--color-accent-light, #BAE6FD);
          opacity: 0.85;
          display: flex;
          align-items: center;
        }
      }

      .anchor-drop-container {
        position: absolute;
        top: 35px;
        right: 4%;
        width: 110px;
        pointer-events: none;
        z-index: 2;
        opacity: 0.45;

        .floating-surface-ship {
          margin-bottom: -15px;
          margin-left: 8px;
        }

        .chain-assembly {
          transform-origin: top center;
        }
      }

      .footer-content {
        padding-top: 3.5rem;
        position: relative;
        z-index: 3;
      }

      .footer-grid {
        display: grid;
        grid-template-columns: 1.35fr 1fr 1.15fr 1.2fr;
        gap: 2.75rem;
        margin-bottom: 3.5rem;
      }

      .footer-col {
        .col-title {
          color: var(--color-accent-light, #BAE6FD);
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: var(--tracking-small-caps);
          margin-bottom: 1.25rem;
          position: relative;
          padding-bottom: 0.45rem;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 32px;
            height: 1.5px;
            background: var(--color-accent, #0369A1);
          }
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1rem;

          .brand-ship-wrap {
            flex-shrink: 0;
            line-height: 0;
          }

          .brand-title-wrap {
            display: flex;
            flex-direction: column;
          }

          .footer-brand-title {
            color: var(--text-inverse, #F1F5F9);
            font-family: var(--font-heading);
            font-size: 1.45rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            margin-bottom: 0.15rem;
            line-height: 1.15;
          }

          .footer-brand-tag {
            font-family: var(--font-sans);
            font-size: 0.68rem;
            text-transform: uppercase;
            color: var(--color-accent-light, #BDE0FE);
            letter-spacing: 0.1em;
            font-weight: 600;
            line-height: 1.3;
          }
        }

        .corporate-name {
          font-family: var(--font-sans);
          font-size: 0.84rem;
          color: var(--text-inverse-muted, #DDD3C4);
          line-height: 1.5;
          margin-bottom: 0.75rem;

          strong {
            color: #FFFFFF;
            font-weight: 600;
          }
        }

        .corporate-fiscal {
          display: flex;
          gap: 1rem;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          color: var(--text-inverse-muted, #DDD3C4);
          margin-bottom: 1.25rem;
          padding: 0.4rem 0;
          border-top: 1px dashed rgba(255, 255, 255, 0.12);
          border-bottom: 1px dashed rgba(255, 255, 255, 0.12);

          strong {
            color: var(--color-accent-light, #BDE0FE);
          }
        }

        .social-links {
          display: flex;
          gap: 0.65rem;

          .social-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 3px;
            background: rgba(255, 255, 255, 0.06);
            color: var(--text-inverse, #F1F5F9);
            font-size: 1rem;
            transition: all var(--transition-fast);
            border: 1px solid var(--border-accent, rgba(3, 105, 161, 0.35));

            &:hover {
              background: var(--color-accent, #0369A1);
              color: #FFFFFF;
              border-color: var(--color-accent, #0369A1);
              transform: translateY(-1px);
            }
          }
        }

        .footer-links {
          list-style: none;
          font-size: 0.88rem;
          font-family: var(--font-sans);

          li {
            margin-bottom: 0.65rem;
          }

          a {
            color: var(--text-inverse, #F1F5F9);
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            transition: all var(--transition-fast);

            i {
              font-size: 0.65rem;
              color: var(--color-accent, #0369A1);
            }

            &:hover {
              color: var(--color-accent-light, #BAE6FD);
              transform: translateX(3px);
            }

            &.reserved-link {
              color: var(--color-accent-light, #BAE6FD);
            }
          }
        }

        .hours-list {
          list-style: none;
          font-size: 0.86rem;
          font-family: var(--font-sans);

          li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
            padding-bottom: 0.35rem;
            margin-bottom: 0.5rem;

            .day-label {
              color: var(--text-inverse-muted, #CBD5E1);
            }

            .day-val {
              color: #FFFFFF;
              font-weight: 500;
            }

            &.closed-day {
              .closed-tag {
                color: #f87171;
                font-weight: 700;
              }
            }
          }
        }

        .hours-notes {
          font-family: var(--font-serif-primary);
          font-style: italic;
          font-size: 0.85rem;
          line-height: 1.45;
          color: var(--color-accent-light, #BAE6FD);
          margin-top: 0.85rem;
          display: flex;
          align-items: flex-start;
          gap: 0.45rem;

          i {
            margin-top: 0.15rem;
            font-size: 0.8rem;
            color: var(--color-accent, #0369A1);
          }
        }

        .contact-list {
          list-style: none;
          font-size: 0.86rem;
          font-family: var(--font-sans);

          li {
            display: flex;
            align-items: flex-start;
            gap: 0.65rem;
            margin-bottom: 0.75rem;
            color: var(--text-inverse, #F1F5F9);

            i {
              color: var(--color-accent, #0369A1);
              margin-top: 0.2rem;
              font-size: 0.9rem;
              min-width: 16px;
            }

            .contact-text-wrap {
              display: flex;
              flex-direction: column;
              gap: 0.1rem;

              .street-line {
                font-weight: 600;
                color: #FFFFFF;
              }

              .city-line {
                color: var(--text-inverse-muted, #CBD5E1);
                font-size: 0.8rem;
              }

              .contact-val {
                color: #FFFFFF;
                font-weight: 600;
                font-size: 0.92rem;
                transition: color var(--transition-fast);

                &:hover {
                  color: var(--color-accent-light, #BAE6FD);
                }
              }

              .contact-sub {
                font-size: 0.72rem;
                color: var(--text-inverse-muted, #CBD5E1);
              }

              &.emails-wrap {
                .email-link {
                  color: var(--text-inverse, #F1F5F9);
                  font-size: 0.82rem;
                  transition: color var(--transition-fast);

                  &:hover {
                    color: var(--color-accent-light, #BAE6FD);
                  }
                }
              }
            }
          }
        }

        .footer-cta-wrap {
          margin-top: 1rem;
        }
      }

      .footer-bottom {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
        font-family: var(--font-sans);
        font-size: 0.8rem;
        color: var(--text-inverse-muted, #CBD5E1);

        .bottom-copy {
          p { margin-bottom: 0.15rem; }
          strong { color: #FFFFFF; }
          .legal-address { color: var(--color-accent-light, #BAE6FD); font-size: 0.76rem; }
        }

        .bottom-center-access {
          .footer-staff-login {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            color: var(--color-accent-light, #BAE6FD);
            font-size: 0.76rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            text-decoration: none;
            padding: 0.3rem 0.75rem;
            border-radius: 3px;
            border: 1px solid var(--border-accent, rgba(3, 105, 161, 0.35));
            background: rgba(3, 105, 161, 0.08);
            transition: all var(--transition-fast);

            i { font-size: 0.75rem; }

            &:hover {
              color: #FFFFFF;
              background: var(--color-accent, #0369A1);
            }
          }
        }

        .bottom-signature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-accent-light, #BAE6FD);
          font-family: var(--font-serif-primary);
          font-size: 0.92rem;
          font-weight: 600;
        }
      }
    }

    @media (max-width: 1024px) {
      .site-footer {
        .footer-grid {
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
        }

        .anchor-drop-container {
          display: none;
        }
      }
    }

    @media (max-width: 640px) {
      .site-footer {
        .footer-grid {
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .footer-bottom {
          flex-direction: column;
          text-align: center;
          gap: 0.75rem;
        }
      }
    }
  `],
})
export class FooterComponent implements OnInit {
  private infoService = inject(InfoService);

  public info = signal<InfoLocale | null>(null);
  public currentYear = new Date().getFullYear();

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
