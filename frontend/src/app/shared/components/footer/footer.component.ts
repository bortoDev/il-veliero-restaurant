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
  AnchorChainComponent,
  VelieroShipComponent,
  NauticalStarComponent,
} from '../svg-icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AnchorChainComponent,
    VelieroShipComponent,
    NauticalStarComponent,
  ],
  template: `
    <footer class="site-footer" #footerSection>
      <!-- Top Architectural Brass Hairline Divider -->
      <div class="footer-top-rule" aria-hidden="true">
        <div class="rule-line"></div>
        <div class="rule-center-ornament">
          <app-nautical-star size="22px"></app-nautical-star>
        </div>
        <div class="rule-line"></div>
      </div>

      <!-- Animated Nautical Anchor & Chain Column on Background (GSAP ScrollTrigger) -->
      <div class="anchor-drop-container" #chainContainer aria-hidden="true">
        <div class="floating-surface-ship">
          <app-veliero-ship mode="gold" size="90px"></app-veliero-ship>
        </div>
        <div class="chain-assembly" #anchorEl>
          <app-anchor-chain width="105px" height="420px"></app-anchor-chain>
        </div>
      </div>

      <div class="container footer-content">
        <div class="footer-grid">
          <!-- Col 1: Identity, Authentic Engraving & Corporate Brand -->
          <div class="footer-col col-identity">
            <div class="footer-brand">
              <div class="brand-ship-wrap">
                <app-veliero-ship
                  mode="ivory"
                  size="105px"
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
              <a
                href="https://wa.me/393346232941"
                target="_blank"
                rel="noopener"
                aria-label="WhatsApp Il Veliero"
                class="social-btn whatsapp"
                title="Scrivici su WhatsApp"
              >
                <i class="fa-brands fa-whatsapp"></i>
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
                  <i class="fa-solid fa-angle-right"></i> Diario di Bordo (Pescato)
                </a>
              </li>
              <li>
                <a routerLink="/storia">
                  <i class="fa-solid fa-angle-right"></i> La Nostra Storia
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
                <strong>Orari Cucina:</strong> Pranzo 12:00–14:00 · Cena 19:00–22:00. Chiuso il Mercoledì.
                La cucina osserva rigorosamente questi orari; la pizzeria può effettuare aperture dedicate.
              </span>
            </p>
          </div>

          <!-- Col 4: Real Contacts & Direct Reservations -->
          <div class="footer-col col-contacts">
            <h4 class="col-title">Contatti & Prenotazioni</h4>
            <ul class="contact-list">
              <li>
                <i class="fa-solid fa-location-dot"></i>
                <div class="contact-text-wrap">
                  <span class="street-line">Via G. Fattori, 7</span>
                  <span class="city-line">36061 Bassano del Grappa (VI)</span>
                  <small class="locality-badge">Località San Michele</small>
                </div>
              </li>
              <li>
                <i class="fa-solid fa-phone"></i>
                <div class="contact-text-wrap">
                  <a href="tel:0424500200" class="contact-val">0424 500 200</a>
                  <small class="contact-sub">Telefono Fisso Locale</small>
                </div>
              </li>
              <li>
                <i class="fa-brands fa-whatsapp whatsapp-icon"></i>
                <div class="contact-text-wrap">
                  <a
                    href="https://wa.me/393346232941"
                    target="_blank"
                    rel="noopener"
                    class="contact-val whatsapp-val"
                  >
                    334 623 2941
                  </a>
                  <small class="contact-sub">Cellulare & WhatsApp</small>
                </div>
              </li>
              <li>
                <i class="fa-solid fa-envelope"></i>
                <div class="contact-text-wrap emails-wrap">
                  <a href="mailto:pizzadalcampione@gmail.com" class="email-link">
                    pizzadalcampione&#64;gmail.com
                  </a>
                  <a href="mailto:info@ristorante-ilveliero.it" class="email-link secondary-email">
                    info&#64;ristorante-ilveliero.it
                  </a>
                </div>
              </li>
            </ul>

            <div class="footer-cta-wrap">
              <a href="tel:0424500200" class="btn-footer-call">
                <i class="fa-solid fa-phone"></i> Chiama per Prenotare
              </a>
            </div>
          </div>
        </div>

        <!-- Footer Bottom Bar: Legal Copyright & Editorial Signature -->
        <div class="footer-bottom">
          <div class="bottom-copy">
            <p>
              &copy; {{ currentYear }} <strong>Pizza dal Campione del Mondo s.n.c.</strong> — P.IVA 03450720242 — Cod. SDI P62QHVQ. Tutti i diritti riservati.
            </p>
            <p class="legal-address">
              Via G. Fattori 7 - Località San Michele, 36061 Bassano del Grappa (VI)
            </p>
          </div>
          <div class="bottom-signature">
            <app-nautical-star size="18px"></app-nautical-star>
            <span class="signature-text">Cucina di Mare & Pizzeria dal Campione del Mondo</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: linear-gradient(180deg, var(--dishoom-bg-navy-dark, #07192F) 0%, var(--dishoom-bg-navy-deep, #0D2033) 100%);
      color: var(--dishoom-ink-inverse, #FAF7F2);
      position: relative;
      padding-bottom: 2.5rem;
      overflow: hidden;
      border-top: 1px solid var(--dishoom-border-navy-brass, rgba(197, 138, 62, 0.35));

      /* Top Architectural Brass Divider */
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
          background: linear-gradient(90deg, transparent, rgba(197, 138, 62, 0.45), transparent);
        }

        .rule-center-ornament {
          color: var(--dishoom-brass, #C58A3E);
          opacity: 0.85;
          display: flex;
          align-items: center;
        }
      }

      /* GSAP Anchor & Chain Drop Component */
      .anchor-drop-container {
        position: absolute;
        top: 40px;
        right: 4%;
        width: 120px;
        pointer-events: none;
        z-index: 2;
        opacity: 0.55;

        .floating-surface-ship {
          margin-bottom: -15px;
          margin-left: 10px;
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
          color: var(--dishoom-brass, #C58A3E);
          font-family: var(--font-heading-editorial, 'Cormorant Garamond', serif);
          font-size: 1.25rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: var(--tracking-small-caps, 0.12em);
          margin-bottom: 1.35rem;
          position: relative;
          padding-bottom: 0.5rem;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 36px;
            height: 1.5px;
            background: var(--dishoom-brass, #C58A3E);
          }
        }

        /* Col 1 Brand Header */
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;

          .brand-ship-wrap {
            flex-shrink: 0;
            line-height: 0;
          }

          .brand-title-wrap {
            display: flex;
            flex-direction: column;
          }

          .footer-brand-title {
            color: var(--dishoom-ink-inverse, #FAF7F2);
            font-family: var(--font-heading-editorial, 'Cormorant Garamond', serif);
            font-size: 1.55rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            margin-bottom: 0.2rem;
            line-height: 1.15;
          }

          .footer-brand-tag {
            font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
            font-size: 0.68rem;
            text-transform: uppercase;
            color: var(--dishoom-brass, #C58A3E);
            letter-spacing: 0.12em;
            font-weight: 600;
            line-height: 1.3;
          }
        }

        .corporate-name {
          font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
          font-size: 0.86rem;
          color: var(--dishoom-ink-inverse-muted, #DDD3C4);
          line-height: 1.55;
          margin-bottom: 0.85rem;

          strong {
            color: #FFFFFF;
            font-weight: 600;
          }
        }

        .corporate-fiscal {
          display: flex;
          gap: 1.25rem;
          font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
          font-size: 0.82rem;
          color: var(--dishoom-ink-inverse-muted, #DDD3C4);
          margin-bottom: 1.5rem;
          padding: 0.45rem 0;
          border-top: 1px dashed rgba(197, 138, 62, 0.25);
          border-bottom: 1px dashed rgba(197, 138, 62, 0.25);

          strong {
            color: var(--dishoom-brass, #C58A3E);
          }
        }

        .social-links {
          display: flex;
          gap: 0.75rem;

          .social-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.06);
            color: var(--dishoom-ink-inverse, #FAF7F2);
            font-size: 1.05rem;
            transition: all var(--transition-fast, 0.2s ease);
            border: 1px solid rgba(197, 138, 62, 0.3);

            &:hover {
              background: var(--dishoom-brass, #C58A3E);
              color: var(--dishoom-bg-navy-dark, #07192F);
              border-color: var(--dishoom-brass, #C58A3E);
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(197, 138, 62, 0.35);
            }

            &.whatsapp:hover {
              background: #25d366;
              color: #FFFFFF;
              border-color: #25d366;
            }
          }
        }

        /* Nav links */
        .footer-links {
          list-style: none;
          font-size: 0.9rem;
          font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);

          li {
            margin-bottom: 0.75rem;
          }

          a {
            color: var(--dishoom-ink-inverse, #FAF7F2);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all var(--transition-fast, 0.2s ease);

            i {
              font-size: 0.7rem;
              color: var(--dishoom-brass, #C58A3E);
              transition: transform var(--transition-fast, 0.2s ease);
            }

            &:hover {
              color: var(--dishoom-brass, #C58A3E);
              transform: translateX(4px);

              i {
                transform: translateX(2px);
              }
            }

            &.reserved-link {
              color: var(--dishoom-brass-light, #EBD8B8);
              font-weight: 500;
            }
          }
        }

        /* Hours List */
        .hours-list {
          list-style: none;
          font-size: 0.88rem;
          font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);

          li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
            padding-bottom: 0.4rem;
            margin-bottom: 0.55rem;

            .day-label {
              color: var(--dishoom-ink-inverse-muted, #DDD3C4);
            }

            .day-val {
              color: #FFFFFF;
              font-weight: 500;
              font-feature-settings: 'lnum' 1;
            }

            &.closed-day {
              .closed-tag {
                color: #f87171;
                font-weight: 700;
                letter-spacing: 0.08em;
              }
            }
          }
        }

        .hours-notes {
          font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
          font-style: italic;
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--dishoom-brass-light, #EBD8B8);
          margin-top: 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;

          i {
            margin-top: 0.2rem;
            font-size: 0.85rem;
            color: var(--dishoom-brass, #C58A3E);
          }
        }

        /* Contacts List */
        .contact-list {
          list-style: none;
          font-size: 0.88rem;
          font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);

          li {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 0.85rem;
            color: var(--dishoom-ink-inverse, #FAF7F2);

            i {
              color: var(--dishoom-brass, #C58A3E);
              margin-top: 0.25rem;
              font-size: 0.95rem;
              min-width: 18px;
            }

            .whatsapp-icon {
              color: #4ade80;
            }

            .contact-text-wrap {
              display: flex;
              flex-direction: column;
              gap: 0.15rem;

              .street-line {
                font-weight: 600;
                color: #FFFFFF;
              }

              .city-line {
                color: var(--dishoom-ink-inverse-muted, #DDD3C4);
                font-size: 0.82rem;
              }

              .locality-badge {
                color: var(--dishoom-brass, #C58A3E);
                font-size: 0.75rem;
                letter-spacing: 0.04em;
              }

              .contact-val {
                color: #FFFFFF;
                font-weight: 600;
                font-size: 0.96rem;
                letter-spacing: 0.04em;
                transition: color var(--transition-fast, 0.2s ease);

                &:hover {
                  color: var(--dishoom-brass, #C58A3E);
                }

                &.whatsapp-val {
                  color: #4ade80;
                  &:hover {
                    color: #86efac;
                  }
                }
              }

              .contact-sub {
                font-size: 0.75rem;
                color: var(--dishoom-ink-inverse-muted, #DDD3C4);
              }

              &.emails-wrap {
                gap: 0.25rem;

                .email-link {
                  color: var(--dishoom-ink-inverse, #FAF7F2);
                  font-size: 0.84rem;
                  transition: color var(--transition-fast, 0.2s ease);

                  &:hover {
                    color: var(--dishoom-brass, #C58A3E);
                  }

                  &.secondary-email {
                    color: var(--dishoom-ink-inverse-muted, #DDD3C4);
                    font-size: 0.8rem;
                  }
                }
              }
            }
          }
        }

        .footer-cta-wrap {
          margin-top: 1.25rem;

          .btn-footer-call {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            padding: 0.6rem 1rem;
            background: transparent;
            color: var(--dishoom-brass, #C58A3E);
            border: 1px solid var(--dishoom-brass, #C58A3E);
            border-radius: 3px;
            font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
            font-size: 0.82rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: var(--tracking-small-caps, 0.12em);
            text-decoration: none;
            transition: all var(--transition-smooth, 0.35s ease);

            &:hover {
              background: var(--dishoom-brass, #C58A3E);
              color: var(--dishoom-bg-navy-dark, #07192F);
              box-shadow: 0 4px 14px rgba(197, 138, 62, 0.25);
              transform: translateY(-1px);
            }
          }
        }
      }

      /* Bottom bar */
      .footer-bottom {
        border-top: 1px solid rgba(197, 138, 62, 0.2);
        padding-top: 1.75rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
        font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
        font-size: 0.82rem;
        color: var(--dishoom-ink-inverse-muted, #DDD3C4);

        .bottom-copy {
          p {
            margin-bottom: 0.2rem;
          }

          strong {
            color: #FFFFFF;
          }

          .legal-address {
            color: var(--dishoom-brass-light, #EBD8B8);
            font-size: 0.78rem;
          }
        }

        .bottom-signature {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: var(--dishoom-brass, #C58A3E);
          font-family: var(--font-heading-editorial, 'Cormorant Garamond', serif);
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.08em;
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
export class FooterComponent implements OnInit, AfterViewInit, OnDestroy {
  private infoService = inject(InfoService);
  private animService = inject(AnimationService);

  public info = signal<InfoLocale | null>(null);
  public currentYear = new Date().getFullYear();

  @ViewChild('footerSection') footerSectionRef!: ElementRef;
  @ViewChild('chainContainer') chainContainerRef!: ElementRef;
  @ViewChild('anchorEl') anchorRef!: ElementRef;

  private anchorTimeline: gsap.core.Timeline | null = null;

  ngOnInit(): void {
    this.infoService.getInfoLocale().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.info.set(res.data);
        }
      },
    });
  }

  ngAfterViewInit(): void {
    if (
      this.footerSectionRef?.nativeElement &&
      this.chainContainerRef?.nativeElement
    ) {
      this.anchorTimeline = this.animService.initFooterAnchorDrop(
        this.chainContainerRef.nativeElement,
        this.anchorRef?.nativeElement,
        this.footerSectionRef.nativeElement
      );
    }
  }

  ngOnDestroy(): void {
    if (this.anchorTimeline) {
      this.anchorTimeline.scrollTrigger?.kill();
      this.anchorTimeline.kill();
      this.anchorTimeline = null;
    }
  }
}
