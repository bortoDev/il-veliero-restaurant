import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { PescatoService } from '../../../core/services/pescato.service';
import { AvvisoService } from '../../../core/services/avviso.service';
import { EventoService } from '../../../core/services/evento.service';
import { Avviso, Evento, MenuItem, PescatoItem } from '../../../core/models';
import { BoIconComponent } from '../shared/bo-icon.component';
import { formatDateTimeLabel, isSameDay } from '../shared/bo-utils';

const EMPTY = { success: false, count: 0, data: [] as any[] };

@Component({
  selector: 'app-gestore-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BoIconComponent],
  template: `
    <div class="bo-page">
      <header class="bo-header">
        <div>
          <h1>{{ greeting }}{{ firstName() ? ', ' + firstName() : '' }}</h1>
          <p class="today">{{ todayLabel }}</p>
        </div>
      </header>

      <!-- Azioni rapide: le tre cose che si fanno più spesso -->
      <section class="quick">
        <a routerLink="/gestore/pescato" [queryParams]="{ nuovo: 1 }" class="quick-card primary">
          <bo-icon name="camera" [size]="26"></bo-icon>
          <span class="q-title">Pubblica il pescato</span>
          <span class="q-sub">Foto e descrizione degli arrivi di oggi</span>
        </a>
        <a routerLink="/gestore/eventi" [queryParams]="{ nuovo: 1 }" class="quick-card">
          <bo-icon name="calendar" [size]="26"></bo-icon>
          <span class="q-title">Nuovo evento</span>
          <span class="q-sub">Serata a tema o degustazione</span>
        </a>
        <a routerLink="/gestore/avvisi" [queryParams]="{ nuovo: 1 }" class="quick-card">
          <bo-icon name="bell" [size]="26"></bo-icon>
          <span class="q-title">Nuovo avviso</span>
          <span class="q-sub">Chiusure, ferie, comunicazioni</span>
        </a>
      </section>

      <div class="status-grid" *ngIf="!isLoading()">
        <!-- Pescato -->
        <section class="bo-panel">
          <div class="bo-panel-head">
            <h2>Pescato del giorno</h2>
            <a routerLink="/gestore/pescato" class="bo-btn ghost small">Gestisci</a>
          </div>
          <div class="bo-panel-body">
            <ng-container *ngIf="todayCatches().length > 0; else noCatch">
              <span class="bo-chip ok">Pubblicato oggi</span>
              <ul class="mini-list">
                <li *ngFor="let c of todayCatches()">{{ c.title }}</li>
              </ul>
            </ng-container>
            <ng-template #noCatch>
              <span class="bo-chip warn">Non ancora pubblicato oggi</span>
              <p class="panel-note" *ngIf="lastCatch() as last">Ultimo: «{{ last.title }}», {{ dayLabel(last.catchDate) }}</p>
            </ng-template>
          </div>
        </section>

        <!-- Prossimo evento -->
        <section class="bo-panel">
          <div class="bo-panel-head">
            <h2>Prossimo evento</h2>
            <a routerLink="/gestore/eventi" class="bo-btn ghost small">Gestisci</a>
          </div>
          <div class="bo-panel-body">
            <ng-container *ngIf="nextEvent() as ev; else noEvent">
              <p class="big-title">{{ ev.title }}</p>
              <p class="panel-note">{{ dateTimeLabel(ev.eventDate) }}</p>
              <div class="seats" *ngIf="ev.maxSeats">
                <div class="seats-bar"><span [style.width.%]="seatPercent(ev)"></span></div>
                <span class="seats-text">{{ ev.reservedSeats || 0 }} prenotati su {{ ev.maxSeats }}</span>
              </div>
            </ng-container>
            <ng-template #noEvent>
              <span class="bo-chip off">Nessun evento in programma</span>
            </ng-template>
          </div>
        </section>

        <!-- Avvisi -->
        <section class="bo-panel">
          <div class="bo-panel-head">
            <h2>Avvisi visibili sul sito</h2>
            <a routerLink="/gestore/avvisi" class="bo-btn ghost small">Gestisci</a>
          </div>
          <div class="bo-panel-body">
            <ul class="mini-list" *ngIf="activeNotices().length > 0; else noNotice">
              <li *ngFor="let a of activeNotices()">{{ a.title }}</li>
            </ul>
            <ng-template #noNotice>
              <span class="bo-chip off">Nessun avviso attivo</span>
            </ng-template>
          </div>
        </section>

        <!-- Menù -->
        <section class="bo-panel">
          <div class="bo-panel-head">
            <h2>Menù</h2>
            <a routerLink="/gestore/menu" class="bo-btn ghost small">Gestisci</a>
          </div>
          <div class="bo-panel-body">
            <p class="big-title">{{ dishes().length }} voci in carta</p>
            <span class="bo-chip" [ngClass]="unavailableCount() ? 'warn' : 'ok'">
              {{ unavailableCount() ? unavailableCount() + ' segnate come non disponibili' : 'Tutto disponibile' }}
            </span>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .today { text-transform: capitalize; }

    .quick {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .quick-card {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      padding: 1.25rem;
      border-radius: 10px;
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      color: var(--color-accent-hover);
      text-decoration: none;
      transition: border-color var(--transition-fast), transform var(--transition-fast);

      &:hover { border-color: var(--color-accent); transform: translateY(-1px); }

      .q-title {
        margin-top: 0.4rem;
        font-family: var(--font-sans);
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .q-sub { font-size: 0.85rem; color: var(--text-muted); }

      &.primary {
        background: var(--bg-navy-dark);
        border-color: var(--bg-navy-dark);
        color: var(--color-accent-on-dark);

        .q-title { color: #FFFFFF; }
        .q-sub { color: var(--text-inverse-muted); }
      }
    }

    .status-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      .bo-panel + .bo-panel { margin-top: 0; }
    }

    .mini-list {
      list-style: none;
      margin: 0.75rem 0 0;
      padding: 0;

      li {
        padding: 0.4rem 0;
        border-bottom: 1px solid var(--border-subtle);
        font-size: 0.92rem;
        color: var(--text-secondary);

        &:last-child { border-bottom: none; }
      }
    }

    .big-title {
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.25rem;
      line-height: 1.25;
    }

    .panel-note { font-size: 0.88rem; color: var(--text-muted); margin: 0.5rem 0 0; text-transform: none; }

    .seats { margin-top: 0.9rem; }

    .seats-bar {
      height: 8px;
      border-radius: 999px;
      background: var(--bg-surface-alt);
      overflow: hidden;

      span { display: block; height: 100%; background: var(--color-accent); border-radius: 999px; }
    }

    .seats-text { display: block; margin-top: 0.35rem; font-size: 0.85rem; color: var(--text-stone); }

    @media (max-width: 760px) {
      .quick { grid-template-columns: 1fr; gap: 0.6rem; }

      .quick-card {
        display: grid;
        grid-template-columns: auto 1fr;
        column-gap: 0.9rem;
        align-items: center;

        bo-icon { grid-row: span 2; }
        .q-title { margin-top: 0; }
      }

      .status-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class GestoreDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private menuService = inject(MenuService);
  private pescatoService = inject(PescatoService);
  private avvisoService = inject(AvvisoService);
  private eventoService = inject(EventoService);

  readonly greeting = new Date().getHours() < 13 ? 'Buongiorno' : new Date().getHours() < 18 ? 'Buon pomeriggio' : 'Buonasera';
  readonly todayLabel = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  isLoading = signal(true);
  dishes = signal<MenuItem[]>([]);
  catches = signal<PescatoItem[]>([]);
  events = signal<Evento[]>([]);
  activeNotices = signal<Avviso[]>([]);

  firstName = computed(() => (this.auth.currentUser()?.name || '').split(/\s|—/)[0]);
  unavailableCount = computed(() => this.dishes().filter((d) => !d.isAvailable).length);
  todayCatches = computed(() => this.catches().filter((c) => isSameDay(new Date(c.catchDate), new Date())));
  lastCatch = computed(() =>
    [...this.catches()].sort((a, b) => +new Date(b.catchDate) - +new Date(a.catchDate))[0] ?? null
  );
  nextEvent = computed(() =>
    this.events()
      .filter((e) => e.isActive && +new Date(e.eventDate) >= Date.now())
      .sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate))[0] ?? null
  );

  ngOnInit(): void {
    forkJoin({
      menu: this.menuService.getMenuItems().pipe(catchError(() => of(EMPTY))),
      pescato: this.pescatoService.getPescatoList({ all: true }).pipe(catchError(() => of(EMPTY))),
      eventi: this.eventoService.getAllEventi().pipe(catchError(() => of(EMPTY))),
      avvisi: this.avvisoService.getActiveAvvisi().pipe(catchError(() => of(EMPTY))),
    }).subscribe(({ menu, pescato, eventi, avvisi }) => {
      this.dishes.set(menu.data || []);
      this.catches.set(pescato.data || []);
      this.events.set(eventi.data || []);
      this.activeNotices.set(avvisi.data || []);
      this.isLoading.set(false);
    });
  }

  seatPercent(ev: Evento): number {
    return ev.maxSeats ? Math.min(100, ((ev.reservedSeats || 0) / ev.maxSeats) * 100) : 0;
  }

  dayLabel(d: string): string {
    return new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(d));
  }

  dateTimeLabel(d: string): string {
    return formatDateTimeLabel(d);
  }
}
