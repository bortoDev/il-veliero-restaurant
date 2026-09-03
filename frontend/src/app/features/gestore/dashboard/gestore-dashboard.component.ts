import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { PescatoService } from '../../../core/services/pescato.service';
import { AvvisoService } from '../../../core/services/avviso.service';
import { EventoService } from '../../../core/services/evento.service';

@Component({
  selector: 'app-gestore-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="gestore-dashboard-page">
      <div class="container dashboard-container">
        <div class="dashboard-header">
          <div>
            <span class="role-pill"><i class="fa-solid fa-utensils"></i> Area Gestore</span>
            <h1>Pannello di Controllo Ristorante</h1>
            <p>Benvenuto, <strong>{{ authService.currentUser()?.name }}</strong>. Gestisci il menù, il pescato, gli avvisi e le informazioni.</p>
          </div>
        </div>

        <!-- Quick Summary Stats -->
        <div class="metrics-grid">
          <div class="metric-card card">
            <div class="metric-icon icon-blue"><i class="fa-solid fa-book-open"></i></div>
            <div class="metric-data">
              <span class="metric-value">{{ totalDishes() }}</span>
              <span class="metric-label">Piatti in Menù</span>
            </div>
            <a routerLink="/gestore/menu" class="metric-link">Gestisci Menù <i class="fa-solid fa-arrow-right"></i></a>
          </div>

          <div class="metric-card card">
            <div class="metric-icon icon-teal"><i class="fa-solid fa-fish"></i></div>
            <div class="metric-data">
              <span class="metric-value">{{ activeCatches() }}</span>
              <span class="metric-label">Pescato del Giorno</span>
            </div>
            <a routerLink="/gestore/pescato" class="metric-link">Aggiorna Pescato <i class="fa-solid fa-arrow-right"></i></a>
          </div>

          <div class="metric-card card">
            <div class="metric-icon icon-amber"><i class="fa-solid fa-bell"></i></div>
            <div class="metric-data">
              <span class="metric-value">{{ activeNotices() }}</span>
              <span class="metric-label">Avvisi Attivi</span>
            </div>
            <a routerLink="/gestore/avvisi" class="metric-link">Gestisci Avvisi <i class="fa-solid fa-arrow-right"></i></a>
          </div>

          <div class="metric-card card">
            <div class="metric-icon icon-purple"><i class="fa-solid fa-calendar-check"></i></div>
            <div class="metric-data">
              <span class="metric-value">{{ upcomingEvents() }}</span>
              <span class="metric-label">Eventi in Programma</span>
            </div>
            <a routerLink="/gestore/eventi" class="metric-link">Gestisci Eventi <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>

        <!-- Fast Actions Hub -->
        <div class="actions-section">
          <h2>Azioni Rapide</h2>
          <div class="actions-grid">
            <a routerLink="/gestore/menu" class="action-tile card">
              <i class="fa-solid fa-circle-plus action-icon"></i>
              <div>
                <h3>Aggiungi o Modifica Piatti</h3>
                <p>Aggiorna prezzi, descrizioni, categorie, 14-EU allergeni e foto dei piatti.</p>
              </div>
            </a>

            <a routerLink="/gestore/pescato" class="action-tile card">
              <i class="fa-solid fa-scale-balanced action-icon"></i>
              <div>
                <h3>Registra Pescato Mattutino</h3>
                <p>Inserisci il pescato del giorno dal mercato di Chioggia e aggiorna i kg disponibili.</p>
              </div>
            </a>

            <a routerLink="/gestore/avvisi" class="action-tile card">
              <i class="fa-solid fa-triangle-exclamation action-icon"></i>
              <div>
                <h3>Pubblica Avviso o Chiusura</h3>
                <p>Crea banner dinamici per chiusure straordinarie, ferie o avvisi in home page.</p>
              </div>
            </a>

            <a routerLink="/gestore/info" class="action-tile card">
              <i class="fa-solid fa-clock action-icon"></i>
              <div>
                <h3>Orari & Recapiti Locale</h3>
                <p>Modifica gli orari di apertura, i recapiti telefonici e la storia del ristorante.</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gestore-dashboard-page {
      padding: 3.5rem 0 5rem;
      background: var(--color-bg-main);
      min-height: 80vh;
    }

    .dashboard-header {
      margin-bottom: 2.5rem;

      .role-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--color-navy-dark);
        background: rgba(19, 64, 116, 0.12);
        padding: 0.3rem 0.75rem;
        border-radius: 20px;
        margin-bottom: 0.75rem;
      }

      h1 {
        font-size: 2.3rem;
        color: var(--color-navy-dark);
        margin-bottom: 0.35rem;
      }

      p {
        color: var(--color-text-muted);
        font-size: 1.05rem;
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3.5rem;

      .metric-card {
        padding: 1.75rem;
        display: flex;
        flex-direction: column;

        .metric-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1.25rem;

          &.icon-blue { background: rgba(2, 132, 199, 0.15); color: #0284c7; }
          &.icon-teal { background: rgba(42, 157, 143, 0.15); color: #2a9d8f; }
          &.icon-amber { background: rgba(247, 127, 0, 0.15); color: #f77f00; }
          &.icon-purple { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
        }

        .metric-data {
          margin-bottom: 1.25rem;

          .metric-value {
            font-family: var(--font-heading);
            font-size: 2.2rem;
            font-weight: 700;
            color: var(--color-navy-dark);
            display: block;
            line-height: 1;
            margin-bottom: 0.35rem;
          }

          .metric-label {
            font-size: 0.85rem;
            color: var(--color-text-muted);
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
        }

        .metric-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-navy-medium);
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: auto;

          &:hover {
            color: var(--color-gold-dark);
            padding-left: 3px;
          }
        }
      }
    }

    .actions-section {
      h2 {
        font-size: 1.6rem;
        margin-bottom: 1.5rem;
        color: var(--color-navy-dark);
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;

        .action-tile {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          padding: 1.75rem;
          color: inherit;
          transition: transform var(--transition-fast), border-color var(--transition-fast);

          .action-icon {
            font-size: 2rem;
            color: var(--color-gold-dark);
            margin-top: 0.2rem;
          }

          h3 {
            font-size: 1.15rem;
            margin-bottom: 0.4rem;
            color: var(--color-navy-dark);
          }

          p {
            font-size: 0.88rem;
            color: var(--color-text-muted);
            margin-bottom: 0;
            line-height: 1.5;
          }

          &:hover {
            transform: translateY(-3px);
            border-color: var(--color-gold);
          }
        }
      }
    }
  `],
})
export class GestoreDashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private menuService = inject(MenuService);
  private pescatoService = inject(PescatoService);
  private avvisoService = inject(AvvisoService);
  private eventoService = inject(EventoService);

  public totalDishes = signal<number>(0);
  public activeCatches = signal<number>(0);
  public activeNotices = signal<number>(0);
  public upcomingEvents = signal<number>(0);

  ngOnInit(): void {
    this.menuService.getMenuItems().subscribe({
      next: (res) => { if (res.success) this.totalDishes.set(res.count); },
    });

    this.pescatoService.getPescatoList({ available: true }).subscribe({
      next: (res) => { if (res.success) this.activeCatches.set(res.count); },
    });

    this.avvisoService.getActiveAvvisi().subscribe({
      next: (res) => { if (res.success) this.activeNotices.set(res.count); },
    });

    this.eventoService.getUpcomingEventi().subscribe({
      next: (res) => { if (res.success) this.upcomingEvents.set(res.count); },
    });
  }
}
