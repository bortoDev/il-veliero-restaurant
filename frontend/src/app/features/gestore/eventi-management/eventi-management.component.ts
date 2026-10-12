import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EventoService } from '../../../core/services/evento.service';
import { Evento } from '../../../core/models';
import { BoIconComponent } from '../shared/bo-icon.component';
import { BoSheetComponent } from '../shared/bo-sheet.component';
import { PhotoPickerComponent } from '../shared/photo-picker.component';
import { entityId, formatDateTimeLabel, toLocalDateTimeInput } from '../shared/bo-utils';

interface EventoForm {
  title: string;
  description: string;
  eventDate: string;
  price: number | null;
  maxSeats: number | null;
  reservedSeats: number;
  isActive: boolean;
  images: string[];
}

@Component({
  selector: 'app-eventi-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BoIconComponent, BoSheetComponent, PhotoPickerComponent],
  template: `
    <div class="bo-page">
      <header class="bo-header">
        <div>
          <h1>Eventi</h1>
          <p>Le serate visibili nella pagina Eventi del sito. Le prenotazioni arrivano per telefono o WhatsApp: segnale qui con + e −.</p>
        </div>
        <button type="button" class="bo-btn primary" (click)="openCreate()">
          <bo-icon name="plus"></bo-icon> Nuovo evento
        </button>
      </header>

      <h2 class="bo-section-label">In programma</h2>
      <section class="bo-panel">
        <ul class="bo-list" *ngIf="upcoming().length > 0; else noUpcoming">
          <li class="bo-row event-row" *ngFor="let ev of upcoming()" [class.is-muted]="!ev.isActive">
            <div class="date-box">
              <span class="d-day">{{ day(ev) }}</span>
              <span class="d-month">{{ month(ev) }}</span>
            </div>
            <div class="bo-row-main">
              <div class="bo-row-title">{{ ev.title }}</div>
              <div class="bo-row-sub">
                {{ when(ev) }}
                <ng-container *ngIf="ev.price"> · {{ ev.price | currency:'EUR':'symbol':'1.0-2':'it' }} a persona</ng-container>
              </div>
              <div class="status-line">
                <span class="bo-chip" [ngClass]="ev.isActive ? 'ok' : 'off'">{{ ev.isActive ? 'Visibile sul sito' : 'Nascosto' }}</span>
                <span class="bo-chip danger" *ngIf="ev.maxSeats && seatsLeft(ev) === 0">Esaurito</span>
              </div>
            </div>

            <div class="seat-counter" *ngIf="ev.maxSeats">
              <button type="button" (click)="changeSeats(ev, -1)" [disabled]="!ev.reservedSeats" aria-label="Togli un posto prenotato">
                <bo-icon name="minus" [size]="18"></bo-icon>
              </button>
              <div class="seat-value">
                <strong>{{ ev.reservedSeats || 0 }}</strong><span>/{{ ev.maxSeats }}</span>
                <small>prenotati</small>
              </div>
              <button type="button" (click)="changeSeats(ev, 1)" [disabled]="seatsLeft(ev) === 0" aria-label="Aggiungi un posto prenotato">
                <bo-icon name="plus" [size]="18"></bo-icon>
              </button>
            </div>

            <div class="bo-row-actions">
              <button type="button" class="bo-btn small" (click)="openEdit(ev)">
                <bo-icon name="edit" [size]="16"></bo-icon> Modifica
              </button>
              <button type="button" class="bo-btn small danger-ghost" (click)="remove(ev)" [attr.aria-label]="'Elimina ' + ev.title">
                <bo-icon name="trash" [size]="16"></bo-icon>
              </button>
            </div>
          </li>
        </ul>
        <ng-template #noUpcoming>
          <div class="bo-empty">
            <strong>Nessun evento in programma</strong>
            <p>Quando non ci sono eventi, la pagina del sito mostra la sezione per le cene private.</p>
            <button type="button" class="bo-btn primary" (click)="openCreate()">Crea un evento</button>
          </div>
        </ng-template>
      </section>

      <ng-container *ngIf="past().length > 0">
        <h2 class="bo-section-label">Passati</h2>
        <section class="bo-panel">
          <ul class="bo-list">
            <li class="bo-row is-muted" *ngFor="let ev of past()">
              <div class="date-box">
                <span class="d-day">{{ day(ev) }}</span>
                <span class="d-month">{{ month(ev) }}</span>
              </div>
              <div class="bo-row-main">
                <div class="bo-row-title">{{ ev.title }}</div>
                <div class="bo-row-sub">{{ when(ev) }}<ng-container *ngIf="ev.maxSeats"> · {{ ev.reservedSeats || 0 }} ospiti</ng-container></div>
              </div>
              <div class="bo-row-actions">
                <button type="button" class="bo-btn small" (click)="duplicate(ev)">Riproponi</button>
                <button type="button" class="bo-btn small danger-ghost" (click)="remove(ev)" [attr.aria-label]="'Elimina ' + ev.title">
                  <bo-icon name="trash" [size]="16"></bo-icon>
                </button>
              </div>
            </li>
          </ul>
        </section>
      </ng-container>
    </div>

    <bo-sheet *ngIf="isEditorOpen()" [title]="editingId() ? 'Modifica evento' : 'Nuovo evento'" (closed)="closeEditor()">
      <form class="bo-form" id="evento-form" (ngSubmit)="save()">
        <div class="bo-field">
          <label for="e-title">Nome della serata</label>
          <input id="e-title" name="title" [(ngModel)]="form.title" required placeholder="Es. Giovedì del crudo" />
        </div>

        <div class="bo-field">
          <label for="e-desc">Descrizione e menù</label>
          <textarea id="e-desc" name="description" rows="5" [(ngModel)]="form.description" required
            placeholder="Portate, vini in abbinamento, musica…"></textarea>
        </div>

        <div class="bo-field">
          <label for="e-date">Data e ora</label>
          <input id="e-date" name="eventDate" type="datetime-local" [(ngModel)]="form.eventDate" required />
        </div>

        <div class="bo-grid-3">
          <div class="bo-field">
            <label for="e-price">Prezzo (€)</label>
            <input id="e-price" name="price" type="number" min="0" step="1" inputmode="decimal" [(ngModel)]="form.price" placeholder="0 = libero" />
          </div>
          <div class="bo-field">
            <label for="e-seats">Posti totali</label>
            <input id="e-seats" name="maxSeats" type="number" min="0" inputmode="numeric" [(ngModel)]="form.maxSeats" placeholder="Nessun limite" />
          </div>
          <div class="bo-field">
            <label for="e-res">Già prenotati</label>
            <input id="e-res" name="reservedSeats" type="number" min="0" inputmode="numeric" [(ngModel)]="form.reservedSeats" />
          </div>
        </div>

        <div class="bo-field">
          <span class="bo-label">Foto (facoltativa)</span>
          <bo-photo-picker [(images)]="form.images"></bo-photo-picker>
          <span class="hint">Senza foto, il sito mostra la data in grande con il veliero.</span>
        </div>

        <label class="bo-switch">
          <input type="checkbox" name="isActive" [(ngModel)]="form.isActive" />
          <span class="track"></span>
          Visibile sul sito
        </label>
      </form>

      <ng-container sheet-footer>
        <button type="button" class="bo-btn" (click)="closeEditor()">Annulla</button>
        <button type="submit" form="evento-form" class="bo-btn primary"
          [disabled]="isSaving() || !form.title.trim() || !form.description.trim() || !form.eventDate">
          {{ isSaving() ? 'Salvataggio…' : (editingId() ? 'Salva modifiche' : 'Crea evento') }}
        </button>
      </ng-container>
    </bo-sheet>

    <div class="bo-toast" *ngIf="toast() as t" [class.error]="t.error">{{ t.text }}</div>
  `,
  styles: [`
    .date-box {
      width: 56px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.4rem 0;
      border-radius: 8px;
      background: var(--bg-surface-alt);

      .d-day {
        font-family: var(--font-heading);
        font-size: 1.6rem;
        font-weight: 600;
        line-height: 1;
        color: var(--color-accent);
      }

      .d-month {
        font-family: var(--font-sans);
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-muted);
      }
    }

    .status-line { margin-top: 0.4rem; display: flex; gap: 0.4rem; flex-wrap: wrap; }

    .seat-counter {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex-shrink: 0;

      button {
        width: 40px;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-subtle);
        border-radius: 50%;
        background: var(--bg-surface);
        color: var(--color-accent-hover);
        cursor: pointer;

        &:hover:not(:disabled) { border-color: var(--color-accent); }
        &:disabled { opacity: 0.35; cursor: not-allowed; }
      }
    }

    .seat-value {
      min-width: 64px;
      text-align: center;
      line-height: 1.1;

      strong { font-size: 1.15rem; color: var(--text-primary); }
      span { font-size: 0.85rem; color: var(--text-muted); }
      small { display: block; font-size: 0.7rem; color: var(--text-muted); }
    }

    @media (max-width: 760px) {
      .event-row .seat-counter { order: 3; }
      .event-row .bo-row-actions { order: 4; width: auto; margin-left: auto; }
    }
  `],
})
export class EventiManagementComponent implements OnInit {
  private eventoService = inject(EventoService);
  private route = inject(ActivatedRoute);

  events = signal<Evento[]>([]);
  isEditorOpen = signal(false);
  editingId = signal<string | null>(null);
  isSaving = signal(false);
  toast = signal<{ text: string; error: boolean } | null>(null);

  form: EventoForm = this.emptyForm();

  upcoming = computed(() =>
    this.events()
      .filter((e) => +new Date(e.eventDate) >= Date.now())
      .sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate))
  );

  past = computed(() =>
    this.events()
      .filter((e) => +new Date(e.eventDate) < Date.now())
      .sort((a, b) => +new Date(b.eventDate) - +new Date(a.eventDate))
  );

  ngOnInit(): void {
    this.load();
    if (this.route.snapshot.queryParamMap.get('nuovo')) this.openCreate();
  }

  load(): void {
    this.eventoService.getAllEventi().subscribe({ next: (res) => this.events.set(res.data || []) });
  }

  day(ev: Evento): string {
    return new Intl.DateTimeFormat('it-IT', { day: 'numeric' }).format(new Date(ev.eventDate));
  }

  month(ev: Evento): string {
    return new Intl.DateTimeFormat('it-IT', { month: 'short' }).format(new Date(ev.eventDate)).replace('.', '');
  }

  when(ev: Evento): string {
    return formatDateTimeLabel(ev.eventDate);
  }

  seatsLeft(ev: Evento): number {
    return Math.max((ev.maxSeats || 0) - (ev.reservedSeats || 0), 0);
  }

  /** Aggiorna subito la lista e salva in background: il gestore registra le prenotazioni mentre è al telefono. */
  changeSeats(ev: Evento, delta: number): void {
    const next = Math.min(Math.max((ev.reservedSeats || 0) + delta, 0), ev.maxSeats || Infinity);
    const id = entityId(ev);
    this.events.update((list) => list.map((e) => (entityId(e) === id ? { ...e, reservedSeats: next } : e)));
    this.eventoService.updateEvento(id, { reservedSeats: next }).subscribe({
      error: (err) => {
        this.showToast(err.message || 'Aggiornamento posti non riuscito.', true);
        this.load();
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form = this.emptyForm();
    this.isEditorOpen.set(true);
  }

  openEdit(ev: Evento): void {
    this.editingId.set(entityId(ev));
    this.form = {
      title: ev.title,
      description: ev.description,
      eventDate: toLocalDateTimeInput(ev.eventDate),
      price: ev.price ?? null,
      maxSeats: ev.maxSeats ?? null,
      reservedSeats: ev.reservedSeats || 0,
      isActive: ev.isActive,
      images: ev.images?.length ? [...ev.images] : ev.image ? [ev.image] : [],
    };
    this.isEditorOpen.set(true);
  }

  /** Crea un nuovo evento partendo da uno passato: stessi testi, data da scegliere. */
  duplicate(ev: Evento): void {
    this.openEdit(ev);
    this.editingId.set(null);
    this.form.eventDate = '';
    this.form.reservedSeats = 0;
    this.form.isActive = true;
  }

  closeEditor(): void {
    this.isEditorOpen.set(false);
  }

  save(): void {
    const payload: Partial<Evento> = {
      title: this.form.title.trim(),
      description: this.form.description.trim(),
      eventDate: new Date(this.form.eventDate).toISOString(),
      price: Number(this.form.price) || 0,
      reservedSeats: Number(this.form.reservedSeats) || 0,
      isActive: this.form.isActive,
      images: this.form.images,
      image: this.form.images[0] || '',
    };
    if (this.form.maxSeats) payload.maxSeats = Number(this.form.maxSeats);

    const id = this.editingId();
    const request = id ? this.eventoService.updateEvento(id, payload) : this.eventoService.createEvento(payload);
    this.isSaving.set(true);
    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeEditor();
        this.showToast(id ? 'Modifiche salvate.' : 'Evento creato.');
        this.load();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showToast(err.message || 'Salvataggio non riuscito.', true);
      },
    });
  }

  remove(ev: Evento): void {
    if (!confirm(`Eliminare l'evento «${ev.title}»?`)) return;
    this.eventoService.deleteEvento(entityId(ev)).subscribe({
      next: () => {
        this.showToast('Evento eliminato.');
        this.load();
      },
      error: (err) => this.showToast(err.message || 'Eliminazione non riuscita.', true),
    });
  }

  private emptyForm(): EventoForm {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(20, 0, 0, 0);
    return {
      title: '',
      description: '',
      eventDate: toLocalDateTimeInput(nextWeek),
      price: null,
      maxSeats: null,
      reservedSeats: 0,
      isActive: true,
      images: [],
    };
  }

  private showToast(text: string, error = false): void {
    this.toast.set({ text, error });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
