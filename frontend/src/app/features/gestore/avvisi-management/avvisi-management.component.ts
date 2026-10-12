import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AvvisoService } from '../../../core/services/avviso.service';
import { Avviso, AvvisoSeverity } from '../../../core/models';
import { BoIconComponent } from '../shared/bo-icon.component';
import { BoSheetComponent } from '../shared/bo-sheet.component';
import { entityId, formatDateTimeLabel, toLocalDateTimeInput } from '../shared/bo-utils';

interface AvvisoForm {
  title: string;
  message: string;
  severity: AvvisoSeverity;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

type AvvisoState = 'live' | 'scheduled' | 'expired' | 'off';

const SEVERITY_LABEL: Record<AvvisoSeverity, string> = {
  info: 'Informazione',
  warning: 'Attenzione',
  danger: 'Importante',
};

@Component({
  selector: 'app-avvisi-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BoIconComponent, BoSheetComponent],
  template: `
    <div class="bo-page">
      <header class="bo-header">
        <div>
          <h1>Avvisi</h1>
          <p>Brevi comunicazioni per i clienti: chiusure, ferie, orari speciali. Compaiono in cima alla pagina Eventi finché sono attivi.</p>
        </div>
        <button type="button" class="bo-btn primary" (click)="openCreate()">
          <bo-icon name="plus"></bo-icon> Nuovo avviso
        </button>
      </header>

      <section class="bo-panel">
        <ul class="bo-list" *ngIf="notices().length > 0; else empty">
          <li class="bo-row" *ngFor="let a of notices()" [class.is-muted]="state(a) === 'expired' || state(a) === 'off'">
            <span class="sev-bar" [ngClass]="'sev-' + a.severity" aria-hidden="true"></span>
            <div class="bo-row-main">
              <div class="bo-row-title">{{ a.title }}</div>
              <div class="bo-row-sub">{{ a.message }}</div>
              <div class="status-line">
                <span class="bo-chip" [ngClass]="stateClass(a)">{{ stateLabel(a) }}</span>
                <span class="period">{{ period(a) }}</span>
              </div>
            </div>
            <div class="bo-row-actions">
              <label class="bo-switch" [attr.aria-label]="'Attiva o disattiva ' + a.title">
                <input type="checkbox" [checked]="a.isActive" (change)="toggle(a)" />
                <span class="track"></span>
              </label>
              <button type="button" class="bo-btn small" (click)="openEdit(a)">
                <bo-icon name="edit" [size]="16"></bo-icon> Modifica
              </button>
              <button type="button" class="bo-btn small danger-ghost" (click)="remove(a)" [attr.aria-label]="'Elimina ' + a.title">
                <bo-icon name="trash" [size]="16"></bo-icon>
              </button>
            </div>
          </li>
        </ul>
        <ng-template #empty>
          <div class="bo-empty">
            <strong>Nessun avviso</strong>
            <p>Ad esempio: «Chiusi per ferie dal 10 al 20 gennaio».</p>
            <button type="button" class="bo-btn primary" (click)="openCreate()">Scrivi un avviso</button>
          </div>
        </ng-template>
      </section>
    </div>

    <bo-sheet *ngIf="isEditorOpen()" [title]="editingId() ? 'Modifica avviso' : 'Nuovo avviso'" (closed)="closeEditor()">
      <form class="bo-form" id="avviso-form" (ngSubmit)="save()">
        <div class="bo-field">
          <label for="a-title">Titolo</label>
          <input id="a-title" name="title" [(ngModel)]="form.title" required placeholder="Es. Chiusura per ferie" />
        </div>

        <div class="bo-field">
          <label for="a-msg">Messaggio</label>
          <textarea id="a-msg" name="message" rows="3" [(ngModel)]="form.message" required
            placeholder="Es. Il ristorante resterà chiuso dal 10 al 20 gennaio. Vi aspettiamo dal 21!"></textarea>
        </div>

        <div class="bo-field">
          <span class="bo-label">Tipo</span>
          <div class="sev-choice">
            <label *ngFor="let s of severities" [class.selected]="form.severity === s" [ngClass]="'sev-' + s">
              <input type="radio" name="severity" [value]="s" [(ngModel)]="form.severity" />
              {{ severityLabel(s) }}
            </label>
          </div>
        </div>

        <div class="bo-grid-2">
          <div class="bo-field">
            <label for="a-start">Visibile dal</label>
            <input id="a-start" name="startDate" type="datetime-local" [(ngModel)]="form.startDate" />
          </div>
          <div class="bo-field">
            <label for="a-end">Fino al</label>
            <input id="a-end" name="endDate" type="datetime-local" [(ngModel)]="form.endDate" />
            <span class="hint">Lascia vuoto per tenerlo finché non lo spegni.</span>
          </div>
        </div>

        <label class="bo-switch">
          <input type="checkbox" name="isActive" [(ngModel)]="form.isActive" />
          <span class="track"></span>
          Attivo
        </label>
      </form>

      <ng-container sheet-footer>
        <button type="button" class="bo-btn" (click)="closeEditor()">Annulla</button>
        <button type="submit" form="avviso-form" class="bo-btn primary" [disabled]="isSaving() || !form.title.trim() || !form.message.trim()">
          {{ isSaving() ? 'Salvataggio…' : (editingId() ? 'Salva modifiche' : 'Pubblica avviso') }}
        </button>
      </ng-container>
    </bo-sheet>

    <div class="bo-toast" *ngIf="toast() as t" [class.error]="t.error">{{ t.text }}</div>
  `,
  styles: [`
    .sev-bar {
      align-self: stretch;
      width: 4px;
      border-radius: 4px;
      flex-shrink: 0;
      background: var(--color-accent);

      &.sev-warning { background: var(--status-warning); }
      &.sev-danger { background: var(--status-danger); }
    }

    .bo-row .bo-row-sub { white-space: normal; }

    .status-line {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.45rem;
    }

    .period { font-size: 0.8rem; color: var(--text-muted); }

    .bo-row-actions .bo-switch { margin-right: 0.35rem; }

    .sev-choice {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;

      label {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        border: 1px solid var(--border-subtle);
        border-radius: 6px;
        background: var(--bg-surface);
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-stone);
        cursor: pointer;

        input { position: absolute; opacity: 0; width: 1px; height: 1px; }

        &.selected { border-width: 2px; color: var(--text-primary); }
        &.selected.sev-info { border-color: var(--color-accent); }
        &.selected.sev-warning { border-color: var(--status-warning); }
        &.selected.sev-danger { border-color: var(--status-danger); }
      }
    }
  `],
})
export class AvvisiManagementComponent implements OnInit {
  private avvisoService = inject(AvvisoService);
  private route = inject(ActivatedRoute);

  readonly severities: AvvisoSeverity[] = ['info', 'warning', 'danger'];

  notices = signal<Avviso[]>([]);
  isEditorOpen = signal(false);
  editingId = signal<string | null>(null);
  isSaving = signal(false);
  toast = signal<{ text: string; error: boolean } | null>(null);

  form: AvvisoForm = this.emptyForm();

  ngOnInit(): void {
    this.load();
    if (this.route.snapshot.queryParamMap.get('nuovo')) this.openCreate();
  }

  load(): void {
    this.avvisoService.getAllAvvisi().subscribe({
      next: (res) => {
        const order: Record<AvvisoState, number> = { live: 0, scheduled: 1, off: 2, expired: 3 };
        this.notices.set([...(res.data || [])].sort((a, b) => order[this.state(a)] - order[this.state(b)]));
      },
    });
  }

  severityLabel(s: AvvisoSeverity): string {
    return SEVERITY_LABEL[s];
  }

  state(a: Avviso): AvvisoState {
    if (!a.isActive) return 'off';
    const now = Date.now();
    if (a.endDate && +new Date(a.endDate) < now) return 'expired';
    if (a.startDate && +new Date(a.startDate) > now) return 'scheduled';
    return 'live';
  }

  stateLabel(a: Avviso): string {
    return { live: 'Visibile ora', scheduled: 'Programmato', expired: 'Scaduto', off: 'Spento' }[this.state(a)];
  }

  stateClass(a: Avviso): string {
    return { live: 'ok', scheduled: 'info', expired: 'off', off: 'off' }[this.state(a)];
  }

  period(a: Avviso): string {
    const from = a.startDate ? `dal ${formatDateTimeLabel(a.startDate)}` : '';
    const to = a.endDate ? ` al ${formatDateTimeLabel(a.endDate)}` : ' · senza scadenza';
    return from + to;
  }

  toggle(a: Avviso): void {
    const id = entityId(a);
    this.notices.update((list) => list.map((n) => (entityId(n) === id ? { ...n, isActive: !a.isActive } : n)));
    this.avvisoService.updateAvviso(id, { isActive: !a.isActive }).subscribe({
      next: () => this.showToast(a.isActive ? 'Avviso spento.' : 'Avviso attivato.'),
      error: (err) => {
        this.showToast(err.message || 'Aggiornamento non riuscito.', true);
        this.load();
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form = this.emptyForm();
    this.isEditorOpen.set(true);
  }

  openEdit(a: Avviso): void {
    this.editingId.set(entityId(a));
    this.form = {
      title: a.title,
      message: a.message,
      severity: a.severity,
      startDate: toLocalDateTimeInput(a.startDate),
      endDate: toLocalDateTimeInput(a.endDate),
      isActive: a.isActive,
    };
    this.isEditorOpen.set(true);
  }

  closeEditor(): void {
    this.isEditorOpen.set(false);
  }

  save(): void {
    const payload: any = {
      title: this.form.title.trim(),
      message: this.form.message.trim(),
      severity: this.form.severity,
      isActive: this.form.isActive,
      startDate: this.form.startDate ? new Date(this.form.startDate).toISOString() : new Date().toISOString(),
      endDate: this.form.endDate ? new Date(this.form.endDate).toISOString() : null,
    };

    const id = this.editingId();
    const request = id ? this.avvisoService.updateAvviso(id, payload) : this.avvisoService.createAvviso(payload);
    this.isSaving.set(true);
    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeEditor();
        this.showToast(id ? 'Modifiche salvate.' : 'Avviso pubblicato.');
        this.load();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showToast(err.message || 'Salvataggio non riuscito.', true);
      },
    });
  }

  remove(a: Avviso): void {
    if (!confirm(`Eliminare l'avviso «${a.title}»?`)) return;
    this.avvisoService.deleteAvviso(entityId(a)).subscribe({
      next: () => {
        this.showToast('Avviso eliminato.');
        this.load();
      },
      error: (err) => this.showToast(err.message || 'Eliminazione non riuscita.', true),
    });
  }

  private emptyForm(): AvvisoForm {
    return {
      title: '',
      message: '',
      severity: 'info',
      startDate: toLocalDateTimeInput(new Date()),
      endDate: '',
      isActive: true,
    };
  }

  private showToast(text: string, error = false): void {
    this.toast.set({ text, error });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
