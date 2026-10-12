import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EventoService } from '../../../core/services/evento.service';
import { AvvisoService } from '../../../core/services/avviso.service';
import { Evento, Avviso } from '../../../core/models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { VelieroShipComponent } from '../../../shared/components/svg-icons';

const PHONE = '0424500200';
const WHATSAPP = '393346232941';

interface EventoView {
  id: string;
  title: string;
  description: string;
  image?: string;
  day: string;
  month: string;
  weekday: string;
  time: string;
  monthKey: string;
  price: number;
  seatsLeft?: number;
  maxSeats?: number;
  isLastSeats: boolean;
  isSoldOut: boolean;
  whatsappUrl: string;
}

interface MonthGroup {
  label: string;
  events: EventoView[];
}

@Component({
  selector: 'app-eventi',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonLoaderComponent, VelieroShipComponent],
  template: `
    <div class="eventi-page">
      <!-- HERO: porto di notte, titolo editoriale -->
      <section class="eventi-hero">
        <div class="hero-photo" aria-hidden="true"></div>
        <div class="container hero-content">
          <span class="hero-kicker">Eventi & serate</span>
          <h1>Le serate del Veliero</h1>
          <p>Cene a tema, degustazioni e musica. I posti sono limitati: si prenota per telefono o su WhatsApp.</p>
        </div>
      </section>

      <!-- COMUNICAZIONI DEL GESTORE (AVVISI ATTIVI) -->
      <section class="notices" *ngIf="avvisi().length > 0">
        <div class="container">
          <div *ngFor="let a of avvisi()" class="notice-row" [ngClass]="'sev-' + a.severity">
            <span class="notice-label">{{ a.severity === 'danger' ? 'Importante' : 'Avviso' }}</span>
            <p><strong>{{ a.title }}.</strong> {{ a.message }}</p>
          </div>
        </div>
      </section>

      <section class="section" *ngIf="isLoading()">
        <div class="container">
          <app-skeleton-loader type="event-card" [count]="1"></app-skeleton-loader>
        </div>
      </section>

      <ng-container *ngIf="!isLoading()">
        <!-- 1. PROSSIMO EVENTO IN EVIDENZA -->
        <section class="section featured-section" *ngIf="featured() as ev">
          <div class="container">
            <span class="section-kicker">Il prossimo appuntamento</span>
            <article class="featured-card">
              <div class="featured-media">
                <img *ngIf="ev.image && !brokenImages().has(ev.id)" [src]="ev.image" [alt]="ev.title" (error)="markBroken(ev.id)" />
                <div *ngIf="!ev.image || brokenImages().has(ev.id)" class="media-fallback">
                  <span class="fallback-day">{{ ev.day }}</span>
                  <span class="fallback-month">{{ ev.month }}</span>
                  <app-veliero-ship size="72px" mode="ivory" alt=""></app-veliero-ship>
                </div>
              </div>

              <div class="featured-body">
                <div class="date-stamp">
                  <span class="stamp-day">{{ ev.day }}</span>
                  <span class="stamp-meta">
                    <span class="stamp-month">{{ ev.month }}</span>
                    <span class="stamp-weekday">{{ ev.weekday }} · ore {{ ev.time }}</span>
                  </span>
                </div>

                <h2>{{ ev.title }}</h2>
                <p class="featured-desc">{{ ev.description }}</p>

                <dl class="facts">
                  <div>
                    <dt>Quota</dt>
                    <dd>{{ ev.price > 0 ? (ev.price | currency:'EUR':'symbol':'1.0-2':'it') + ' a persona' : 'Ingresso libero' }}</dd>
                  </div>
                  <div *ngIf="ev.maxSeats">
                    <dt>Posti</dt>
                    <dd [class.warn]="ev.isLastSeats || ev.isSoldOut">
                      {{ ev.isSoldOut ? 'Tutto esaurito' : (ev.isLastSeats ? 'Ultimi ' + ev.seatsLeft : ev.seatsLeft + ' disponibili') }}
                    </dd>
                  </div>
                </dl>

                <div class="actions" *ngIf="!ev.isSoldOut">
                  <a [href]="'tel:' + phone" class="btn btn-accent">Prenota al {{ phoneLabel }}</a>
                  <a [href]="ev.whatsappUrl" target="_blank" rel="noopener" class="btn btn-outline">Scrivi su WhatsApp</a>
                </div>
                <p class="soldout-note" *ngIf="ev.isSoldOut">Posti esauriti. Chiamaci per entrare in lista d'attesa.</p>
              </div>
            </article>
          </div>
        </section>

        <!-- 2. CALENDARIO: gli altri appuntamenti, raggruppati per mese -->
        <section class="section calendar-section" *ngIf="calendar().length > 0">
          <div class="container narrow">
            <span class="section-kicker">In calendario</span>
            <h2 class="section-title">Le prossime date</h2>

            <div class="month-group" *ngFor="let group of calendar()">
              <h3 class="month-label">{{ group.label }}</h3>
              <ol class="event-list">
                <li class="event-row" *ngFor="let ev of group.events">
                  <div class="row-date">
                    <span class="row-day">{{ ev.day }}</span>
                    <span class="row-weekday">{{ ev.weekday }}</span>
                  </div>
                  <div class="row-main">
                    <h4>{{ ev.title }}</h4>
                    <p>{{ ev.description }}</p>
                    <span class="row-meta">
                      ore {{ ev.time }}
                      <ng-container *ngIf="ev.price > 0"> · {{ ev.price | currency:'EUR':'symbol':'1.0-2':'it' }} a persona</ng-container>
                      <ng-container *ngIf="ev.isLastSeats"> · <em>ultimi {{ ev.seatsLeft }} posti</em></ng-container>
                      <ng-container *ngIf="ev.isSoldOut"> · <em>esaurito</em></ng-container>
                    </span>
                  </div>
                  <a *ngIf="!ev.isSoldOut" [href]="ev.whatsappUrl" target="_blank" rel="noopener" class="row-cta">Prenota</a>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <!-- NESSUN EVENTO IN PROGRAMMA -->
        <section class="section empty-section" *ngIf="!featured()">
          <div class="container narrow empty-inner">
            <app-veliero-ship size="64px" alt=""></app-veliero-ship>
            <h2>Il nuovo calendario è in preparazione</h2>
            <p>Stiamo organizzando le prossime serate. Seguici su Instagram per scoprire per primo date e menù.</p>
            <a href="https://www.instagram.com/ilvelierotrattoria" target="_blank" rel="noopener" class="btn btn-outline">Seguici su Instagram</a>
          </div>
        </section>
      </ng-container>

      <!-- 3. CENE PRIVATE & RICORRENZE -->
      <section class="private-section">
        <div class="container private-grid">
          <div class="private-photo">
            <img src="assets/images/locale/tavolata-evento.jpg" alt="Una tavolata apparecchiata per un evento privato al Veliero" loading="lazy" />
          </div>
          <div class="private-text">
            <span class="section-kicker on-dark">Su prenotazione</span>
            <h2>Il tuo evento, il nostro menù</h2>
            <p class="private-lead">
              Compleanni, comunioni, lauree e cene aziendali: concordiamo insieme il menù, dal crudo di mare alle pizze del Campione, e prepariamo la sala per voi.
            </p>
            <ul class="occasions">
              <li>Menù su misura, di pesce o di pizza</li>
              <li>Sala riservata per gruppi</li>
              <li>Terrazza estiva per aperitivi</li>
            </ul>
            <div class="actions">
              <a [href]="'tel:' + phone" class="btn btn-light">Chiama il {{ phoneLabel }}</a>
              <a [href]="privateWhatsappUrl" target="_blank" rel="noopener" class="btn btn-outline-white">Chiedi un preventivo</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .eventi-page {
      background: var(--bg-primary);
      min-height: 100vh;
    }

    .section-kicker {
      display: block;
      font-family: var(--font-sans);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: var(--tracking-eyebrow);
      text-transform: uppercase;
      color: var(--color-accent-hover);
      margin-bottom: 0.75rem;

      &.on-dark { color: var(--color-accent-on-dark); }
    }

    .container.narrow { max-width: 920px; }

    /* ---------- HERO ---------- */
    .eventi-hero {
      position: relative;
      margin-top: -82px;
      padding: calc(82px + 5rem) 0 4.5rem;
      background: var(--bg-navy-dark);
      color: var(--text-inverse);
      overflow: hidden;

      .hero-photo {
        position: absolute;
        inset: 0;
        background: url('/assets/images/locale/porto-notte.jpg') center 60% / cover no-repeat;
        opacity: 0.4;
      }

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(11, 28, 46, 0.15) 0%, var(--bg-navy-dark) 100%);
      }

      .hero-content {
        position: relative;
        z-index: 1;
      }

      .hero-kicker {
        font-family: var(--font-sans);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: var(--tracking-eyebrow);
        text-transform: uppercase;
        color: var(--color-accent-on-dark);
      }

      h1 {
        font-family: var(--font-heading);
        font-weight: 500;
        font-size: clamp(2.4rem, 5vw, 3.6rem);
        letter-spacing: 0.02em;
        color: #FFFFFF;
        margin: 0.5rem 0 1rem;
      }

      p {
        font-family: var(--font-serif-primary);
        font-style: italic;
        font-size: 1.2rem;
        line-height: 1.6;
        color: var(--text-inverse-muted);
        max-width: 560px;
        margin: 0;
      }
    }

    /* ---------- AVVISI ---------- */
    .notices {
      padding: 1.5rem 0 0;

      .notice-row {
        display: flex;
        align-items: baseline;
        gap: 1rem;
        padding: 0.9rem 1.1rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-left: 3px solid var(--color-accent);
        border-radius: 3px;
        margin-bottom: 0.6rem;

        &.sev-warning { border-left-color: var(--status-warning); }
        &.sev-danger { border-left-color: var(--status-danger); }

        .notice-label {
          flex-shrink: 0;
          font-family: var(--font-sans);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        p {
          margin: 0;
          font-size: 0.92rem;
          color: var(--text-secondary);
        }
      }
    }

    /* ---------- PROSSIMO EVENTO ---------- */
    .featured-section { padding-bottom: 2rem; }

    .featured-card {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 4px;
      box-shadow: var(--shadow-card);
      overflow: hidden;
    }

    .featured-media {
      position: relative;
      min-height: 420px;
      background: var(--bg-navy-dark);

      img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .media-fallback {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      color: var(--text-inverse);
      background:
        radial-gradient(circle at 50% 40%, rgba(125, 211, 252, 0.10), transparent 60%),
        var(--bg-navy-dark);

      .fallback-day {
        font-family: var(--font-heading);
        font-size: 7rem;
        line-height: 1;
        font-weight: 500;
      }

      .fallback-month {
        font-family: var(--font-sans);
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: var(--color-accent-on-dark);
        margin-bottom: 1.5rem;
      }
    }

    .featured-body {
      padding: 2.75rem 2.5rem;
      display: flex;
      flex-direction: column;

      h2 {
        font-family: var(--font-heading);
        font-size: clamp(1.7rem, 2.6vw, 2.2rem);
        font-weight: 600;
        letter-spacing: 0.01em;
        line-height: 1.2;
        margin: 1.25rem 0 0.85rem;
      }
    }

    .date-stamp {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-subtle);

      .stamp-day {
        font-family: var(--font-heading);
        font-size: 3.4rem;
        line-height: 1;
        font-weight: 600;
        color: var(--color-accent);
      }

      .stamp-meta {
        display: flex;
        flex-direction: column;
        font-family: var(--font-sans);
      }

      .stamp-month {
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--text-primary);
      }

      .stamp-weekday {
        font-size: 0.88rem;
        color: var(--text-muted);
        text-transform: capitalize;
      }
    }

    .featured-desc {
      font-size: 1rem;
      line-height: 1.7;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .facts {
      display: flex;
      gap: 2.5rem;
      margin: 0 0 1.75rem;

      dt {
        font-family: var(--font-sans);
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 0.2rem;
      }

      dd {
        margin: 0;
        font-family: var(--font-heading);
        font-size: 1.35rem;
        font-weight: 600;
        color: var(--text-primary);

        &.warn { color: var(--status-warning); }
      }
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: auto;
    }

    .soldout-note {
      margin-top: auto;
      font-style: italic;
      color: var(--text-muted);
    }

    /* ---------- CALENDARIO ---------- */
    .calendar-section {
      padding-top: 2.5rem;

      .section-title {
        font-family: var(--font-heading);
        font-size: clamp(1.8rem, 3vw, 2.3rem);
        margin-bottom: 2rem;
      }
    }

    .month-group + .month-group { margin-top: 2.5rem; }

    .month-label {
      font-family: var(--font-sans);
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--text-muted);
      padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--border-medium);
      margin: 0;
    }

    .event-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .event-row {
      display: grid;
      grid-template-columns: 72px 1fr auto;
      gap: 1.5rem;
      align-items: center;
      padding: 1.4rem 0;
      border-bottom: 1px solid var(--border-subtle);

      .row-date {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .row-day {
        font-family: var(--font-heading);
        font-size: 2.4rem;
        font-weight: 600;
        line-height: 1;
        color: var(--color-accent);
      }

      .row-weekday {
        font-family: var(--font-sans);
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-top: 0.3rem;
      }

      h4 {
        font-family: var(--font-heading);
        font-size: 1.35rem;
        font-weight: 600;
        margin: 0 0 0.25rem;
      }

      p {
        font-size: 0.92rem;
        color: var(--text-stone);
        margin: 0 0 0.35rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .row-meta {
        font-family: var(--font-sans);
        font-size: 0.8rem;
        color: var(--text-muted);

        em { font-style: normal; color: var(--status-warning); font-weight: 600; }
      }

      .row-cta {
        font-family: var(--font-sans);
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-accent);
        border: 1px solid var(--border-accent);
        border-radius: 3px;
        padding: 0.55rem 1rem;
        white-space: nowrap;
        transition: all var(--transition-fast);

        &:hover {
          background: var(--color-accent);
          border-color: var(--color-accent);
          color: #FFFFFF;
        }
      }
    }

    /* ---------- NESSUN EVENTO ---------- */
    .empty-inner {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem 0;

      h2 {
        font-family: var(--font-heading);
        font-size: 2rem;
        margin-top: 1rem;
      }

      p {
        max-width: 480px;
        color: var(--text-stone);
        margin-bottom: 1.25rem;
      }
    }

    /* ---------- CENE PRIVATE ---------- */
    .private-section {
      background: var(--bg-navy-dark);
      color: var(--text-inverse);
      padding: 5rem 0;
      margin-top: 3rem;
    }

    .private-grid {
      display: grid;
      grid-template-columns: 0.8fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .private-photo img {
      width: 100%;
      aspect-ratio: 4 / 5;
      object-fit: cover;
      border-radius: 4px;
    }

    .private-text {
      h2 {
        font-family: var(--font-heading);
        font-size: clamp(2rem, 3.4vw, 2.8rem);
        font-weight: 500;
        color: #FFFFFF;
        margin-bottom: 1rem;
      }

      .private-lead {
        font-family: var(--font-serif-primary);
        font-size: 1.25rem;
        line-height: 1.65;
        color: var(--text-inverse-muted);
        margin-bottom: 1.5rem;
      }
    }

    .occasions {
      list-style: none;
      margin: 0 0 2rem;
      padding: 0;

      li {
        position: relative;
        padding: 0.65rem 0 0.65rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 0.95rem;
        color: var(--text-inverse);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 8px;
          height: 1px;
          background: var(--color-accent-on-dark);
        }
      }
    }

    .btn.btn-light {
      background: #FFFFFF;
      color: var(--bg-navy-dark);
      border-color: #FFFFFF;

      &:hover { background: var(--color-accent-light); border-color: var(--color-accent-light); }
    }

    /* ---------- RESPONSIVE ---------- */
    @media (max-width: 900px) {
      .featured-card { grid-template-columns: 1fr; }
      .featured-media { min-height: 260px; }
      .featured-body { padding: 2rem 1.5rem; }
      .private-grid { grid-template-columns: 1fr; gap: 2rem; }
      .private-photo img { aspect-ratio: 16 / 10; }
    }

    @media (max-width: 560px) {
      .event-row {
        grid-template-columns: 56px 1fr;

        .row-cta {
          grid-column: 2;
          justify-self: start;
        }
      }

      .facts { gap: 1.5rem; }
      .actions .btn { width: 100%; }
      .notices .notice-row { flex-direction: column; gap: 0.25rem; }
    }
  `],
})
export class EventiComponent implements OnInit {
  private eventoService = inject(EventoService);
  private avvisoService = inject(AvvisoService);

  readonly phone = PHONE;
  readonly phoneLabel = '0424 500 200';
  readonly privateWhatsappUrl = this.whatsapp('Buongiorno, vorrei informazioni per organizzare un evento privato al Veliero.');

  public isLoading = signal(true);
  public events = signal<EventoView[]>([]);
  public avvisi = signal<Avviso[]>([]);
  public brokenImages = signal<Set<string>>(new Set());

  /** Il primo evento in ordine di data è quello in evidenza; gli altri vanno nel calendario. */
  public featured = computed(() => this.events()[0] ?? null);

  public calendar = computed<MonthGroup[]>(() => {
    const groups: MonthGroup[] = [];
    for (const ev of this.events().slice(1)) {
      let group = groups.find((g) => g.label === ev.monthKey);
      if (!group) {
        group = { label: ev.monthKey, events: [] };
        groups.push(group);
      }
      group.events.push(ev);
    }
    return groups;
  });

  ngOnInit(): void {
    forkJoin({
      eventi: this.eventoService.getUpcomingEventi().pipe(catchError(() => of({ success: false, count: 0, data: [] as Evento[] }))),
      avvisi: this.avvisoService.getActiveAvvisi().pipe(catchError(() => of({ success: false, count: 0, data: [] as Avviso[] }))),
    }).subscribe(({ eventi, avvisi }) => {
      const now = Date.now();
      const views = (eventi.data || [])
        .filter((e) => e.isActive !== false && new Date(e.eventDate).getTime() >= now)
        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        .map((e) => this.toView(e));
      this.events.set(views);
      this.avvisi.set(avvisi.data || []);
      this.isLoading.set(false);
    });
  }

  markBroken(id: string): void {
    this.brokenImages.update((set) => new Set(set).add(id));
  }

  private toView(e: Evento): EventoView {
    const date = new Date(e.eventDate);
    const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('it-IT', opts).format(date);
    const seatsLeft = e.maxSeats ? Math.max(e.maxSeats - (e.reservedSeats || 0), 0) : undefined;
    const isSoldOut = seatsLeft === 0;
    const isLastSeats = !isSoldOut && seatsLeft !== undefined && seatsLeft <= Math.max(5, (e.maxSeats || 0) * 0.2);
    const dateLabel = fmt({ weekday: 'long', day: 'numeric', month: 'long' });

    return {
      id: (e._id || e.id) as string,
      title: e.title,
      description: e.description,
      image: e.image || e.images?.[0] || undefined,
      day: fmt({ day: 'numeric' }),
      month: fmt({ month: 'long' }),
      weekday: fmt({ weekday: 'short' }).replace('.', ''),
      time: fmt({ hour: '2-digit', minute: '2-digit' }),
      monthKey: fmt({ month: 'long', year: 'numeric' }),
      price: e.price || 0,
      seatsLeft,
      maxSeats: e.maxSeats,
      isSoldOut,
      isLastSeats,
      whatsappUrl: this.whatsapp(`Buongiorno, vorrei prenotare per "${e.title}" di ${dateLabel}.`),
    };
  }

  private whatsapp(text: string): string {
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  }
}
