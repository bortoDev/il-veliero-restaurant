import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NauticalDecorComponent } from '../../../shared/components/nautical-decor/nautical-decor.component';
import {
  RosaDeiVentiComponent,
  VelieroShipComponent,
  NauticalStarComponent,
} from '../../../shared/components/svg-icons';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NauticalDecorComponent,
    RosaDeiVentiComponent,
    VelieroShipComponent,
    NauticalStarComponent,
  ],
  template: `
    <div class="not-found-page">
      <!-- HERO HEADER -->
      <section class="not-found-hero">
        <app-nautical-decor></app-nautical-decor>
        <div class="container hero-inner">
          <div class="hero-badge">
            <app-nautical-star size="14px"></app-nautical-star>
            <span>Coordinate non trovate</span>
            <app-nautical-star size="14px"></app-nautical-star>
          </div>

          <div class="error-code-wrapper">
            <span class="error-code">404</span>
            <div class="compass-symbol">
              <app-rosa-dei-venti size="120px" [isSpinning]="false"></app-rosa-dei-venti>
            </div>
          </div>

          <h1 class="hero-title">Rotta Fuori Mare</h1>
          <p class="hero-subtitle">
            La pagina richiesta non corrisponde ad alcuna rotta del nostro diario di bordo.
          </p>
        </div>
      </section>

      <!-- NAVIGATION RECOVERY SECTION -->
      <section class="recovery-section">
        <div class="container recovery-container">
          <div class="recovery-card">
            <div class="card-header-decor">
              <span class="decor-line"></span>
              <span class="decor-text">RIPRENDI LA NAVIGAZIONE</span>
              <span class="decor-line"></span>
            </div>

            <p class="recovery-lead">
              Nessun timore: il porto è vicino. Scegli una delle seguenti destinazioni per ritrovare la rotta:
            </p>

            <div class="recovery-grid">
              <a routerLink="/" class="dest-card">
                <div class="dest-icon">
                  <i class="fa-solid fa-house"></i>
                </div>
                <div class="dest-info">
                  <h3>Pagina Iniziale</h3>
                  <p>Torna all'approdo principale del locale</p>
                </div>
                <div class="dest-arrow">
                  <i class="fa-solid fa-arrow-right"></i>
                </div>
              </a>

              <a routerLink="/menu" class="dest-card">
                <div class="dest-icon">
                  <i class="fa-solid fa-utensils"></i>
                </div>
                <div class="dest-info">
                  <h3>Il Menù</h3>
                  <p>Esplora portate, pizza Campione del Mondo e cantina</p>
                </div>
                <div class="dest-arrow">
                  <i class="fa-solid fa-arrow-right"></i>
                </div>
              </a>

              <a routerLink="/pescato" class="dest-card">
                <div class="dest-icon">
                  <i class="fa-solid fa-fish"></i>
                </div>
                <div class="dest-info">
                  <h3>Pescato del Giorno</h3>
                  <p>Scopri il diario del pesce fresco d'Adriatico</p>
                </div>
                <div class="dest-arrow">
                  <i class="fa-solid fa-arrow-right"></i>
                </div>
              </a>

              <a routerLink="/dove-siamo" class="dest-card">
                <div class="dest-icon">
                  <i class="fa-solid fa-location-dot"></i>
                </div>
                <div class="dest-info">
                  <h3>Dove Siamo</h3>
                  <p>Orari di servizio, mappa e recapiti per la prenotazione</p>
                </div>
                <div class="dest-arrow">
                  <i class="fa-solid fa-arrow-right"></i>
                </div>
              </a>
            </div>

            <div class="action-bar">
              <button type="button" (click)="goBack()" class="btn btn-outline">
                <i class="fa-solid fa-arrow-left"></i>
                <span>Torna alla Pagina Precedente</span>
              </button>
              <a routerLink="/" class="btn btn-accent">
                <i class="fa-solid fa-compass"></i>
                <span>Vai alla Homepage</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: calc(100vh - 82px);
      background-color: var(--bg-primary);
      display: flex;
      flex-direction: column;
    }

    .not-found-hero {
      background: linear-gradient(135deg, var(--bg-navy-dark) 0%, var(--bg-navy-deep) 100%);
      color: #FFFFFF;
      margin-top: -82px;
      padding: calc(82px + 2.5rem) 0 3rem;
      text-align: center;
      position: relative;
      overflow: hidden;

      .hero-inner {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 820px;
        margin: 0 auto;
      }

      .hero-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.65rem;
        color: var(--color-accent-light);
        font-family: var(--font-sans);
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: var(--tracking-eyebrow);
        margin-bottom: 1.25rem;
        padding: 0.35rem 1rem;
        border-radius: 3px;
        background: rgba(0, 150, 199, 0.15);
        border: 1px solid var(--border-accent);
      }

      .error-code-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        margin-bottom: 1rem;

        .error-code {
          font-family: var(--font-display);
          font-size: clamp(4.5rem, 10vw, 7.5rem);
          font-weight: 800;
          letter-spacing: 0.06em;
          line-height: 1;
          color: #FFFFFF;
          text-shadow: 0 6px 30px rgba(0, 0, 0, 0.45);
          background: linear-gradient(180deg, #FFFFFF 30%, var(--color-accent-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .compass-symbol {
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.35));
        }
      }

      .hero-title {
        font-family: var(--font-display);
        font-size: clamp(2rem, 4.5vw, 3rem);
        letter-spacing: 0.03em;
        color: #FFFFFF;
        margin-bottom: 0.75rem;
      }

      .hero-subtitle {
        color: var(--text-inverse-muted);
        font-family: var(--font-serif-primary);
        font-style: italic;
        font-size: 1.15rem;
        max-width: 620px;
        margin: 0 auto;
        line-height: 1.6;
      }
    }

    .recovery-section {
      padding: 3.5rem 0 5rem;
      flex: 1;
      display: flex;
      align-items: center;

      .recovery-container {
        max-width: 860px;
      }

      .recovery-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: 4px;
        box-shadow: var(--shadow-card);
        padding: 2.75rem 2.25rem;
        text-align: center;
      }

      .card-header-decor {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        margin-bottom: 1.25rem;

        .decor-line {
          height: 1px;
          flex: 1;
          background: var(--border-medium);
          max-width: 100px;
        }

        .decor-text {
          font-family: var(--font-sans);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: var(--tracking-eyebrow);
          color: var(--color-accent-hover);
        }
      }

      .recovery-lead {
        font-family: var(--font-serif-primary);
        font-size: 1.12rem;
        color: var(--text-secondary);
        max-width: 580px;
        margin: 0 auto 2.25rem;
        line-height: 1.6;
      }

      .recovery-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem;
        margin-bottom: 2.5rem;
        text-align: left;

        @media (max-width: 640px) {
          grid-template-columns: 1fr;
        }
      }

      .dest-card {
        display: flex;
        align-items: center;
        gap: 1.1rem;
        padding: 1.25rem 1.4rem;
        background: var(--bg-primary);
        border: 1px solid var(--border-subtle);
        border-radius: 3px;
        text-decoration: none;
        color: var(--text-primary);
        transition: transform var(--transition-smooth), box-shadow var(--transition-smooth), border-color var(--transition-fast);

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover);
          border-color: var(--color-accent);

          .dest-icon {
            background-color: var(--color-accent);
            color: #FFFFFF;
          }

          .dest-arrow {
            transform: translateX(3px);
            color: var(--color-accent-hover);
          }

          .dest-info h3 {
            color: var(--color-accent-hover);
          }
        }

        .dest-icon {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 3px;
          background-color: var(--color-accent-subtle);
          color: var(--color-accent-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          transition: all var(--transition-fast);
        }

        .dest-info {
          flex: 1;

          h3 {
            font-family: var(--font-sans);
            font-size: 0.95rem;
            font-weight: 700;
            margin-bottom: 0.2rem;
            color: var(--text-primary);
            transition: color var(--transition-fast);
          }

          p {
            font-size: 0.82rem;
            color: var(--text-muted);
            margin: 0;
            line-height: 1.4;
          }
        }

        .dest-arrow {
          font-size: 0.85rem;
          color: var(--text-light);
          transition: transform var(--transition-fast), color var(--transition-fast);
        }
      }

      .action-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-subtle);
      }
    }
  `],
})
export class NotFoundComponent {
  private location = inject(Location);

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
    } else {
      window.location.href = '/';
    }
  }
}
