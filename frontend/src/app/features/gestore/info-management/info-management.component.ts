import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InfoService } from '../../../core/services/info.service';
import { DaySchedule, InfoLocale, OpeningHours } from '../../../core/models';
import { BoIconComponent } from '../shared/bo-icon.component';
import { DAY_KEYS, DAY_LABELS, DayKey, normalizeOpeningHours } from '../../../core/utils/opening-hours';

@Component({
  selector: 'app-info-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BoIconComponent],
  template: `
    <div class="bo-page">
      <header class="bo-header">
        <div>
          <h1>Orari e contatti</h1>
          <p>Quello che scrivi qui compare nella pagina Dove Siamo, nella home e in fondo a ogni pagina del sito.</p>
        </div>
      </header>

      <form *ngIf="info as d; else loading" (ngSubmit)="save()" id="info-form" class="info-form">
        <!-- ORARI -->
        <section class="bo-panel">
          <div class="bo-panel-head"><h2>Orari di apertura</h2></div>
          <div class="hours">
            <div class="hours-row hours-head" aria-hidden="true">
              <span>Giorno</span><span>Aperto</span><span>Pranzo</span><span>Cena</span>
            </div>
            <div class="hours-row" *ngFor="let key of days" [class.closed]="day(key).isClosed">
              <span class="day-name">{{ dayLabel(key) }}</span>
              <label class="bo-switch">
                <input type="checkbox" [checked]="!day(key).isClosed" (change)="toggleDay(key)" [attr.aria-label]="dayLabel(key) + ' aperto'" />
                <span class="track"></span>
              </label>
              <ng-container *ngIf="!day(key).isClosed; else closedTpl">
                <span class="slot" data-label="Pranzo">
                  <input type="time" [(ngModel)]="day(key).lunch!.open" [name]="key + '-lo'" aria-label="Pranzo dalle" />
                  <span>–</span>
                  <input type="time" [(ngModel)]="day(key).lunch!.close" [name]="key + '-lc'" aria-label="Pranzo alle" />
                </span>
                <span class="slot" data-label="Cena">
                  <input type="time" [(ngModel)]="day(key).dinner!.open" [name]="key + '-do'" aria-label="Cena dalle" />
                  <span>–</span>
                  <input type="time" [(ngModel)]="day(key).dinner!.close" [name]="key + '-dc'" aria-label="Cena alle" />
                </span>
              </ng-container>
              <ng-template #closedTpl><span class="closed-label">Chiuso</span></ng-template>
            </div>
          </div>
          <div class="bo-panel-body">
            <div class="bo-field">
              <label for="i-notes">Nota sugli orari (facoltativa)</label>
              <input id="i-notes" name="notes" [(ngModel)]="d.openingHours.notes" placeholder="Es. La pizzeria può aprire qualche minuto prima" />
            </div>
          </div>
        </section>

        <!-- CONTATTI -->
        <section class="bo-panel">
          <div class="bo-panel-head"><h2>Contatti</h2></div>
          <div class="bo-panel-body bo-form">
            <div class="bo-grid-2">
              <div class="bo-field">
                <label for="i-phone">Telefono per prenotare</label>
                <input id="i-phone" name="phone" type="tel" [(ngModel)]="d.phone" required />
              </div>
              <div class="bo-field">
                <label for="i-wa">Cellulare / WhatsApp</label>
                <input id="i-wa" name="whatsapp" type="tel" [(ngModel)]="d.whatsapp" />
              </div>
            </div>
            <div class="bo-grid-2">
              <div class="bo-field">
                <label for="i-email">Email</label>
                <input id="i-email" name="email" type="email" [(ngModel)]="d.email" required />
              </div>
              <div class="bo-field">
                <label for="i-email2">Seconda email</label>
                <input id="i-email2" name="secondaryEmail" type="email" [(ngModel)]="d.secondaryEmail" />
              </div>
            </div>
            <div class="bo-field">
              <label for="i-addr">Indirizzo</label>
              <input id="i-addr" name="address" [(ngModel)]="d.address" required />
            </div>
            <div class="bo-grid-3">
              <div class="bo-field">
                <label for="i-city">Città</label>
                <input id="i-city" name="city" [(ngModel)]="d.city" />
              </div>
              <div class="bo-field">
                <label for="i-cap">CAP</label>
                <input id="i-cap" name="postalCode" inputmode="numeric" [(ngModel)]="d.postalCode" />
              </div>
              <div class="bo-field">
                <label for="i-prov">Provincia</label>
                <input id="i-prov" name="province" [(ngModel)]="d.province" />
              </div>
            </div>
          </div>
        </section>

        <!-- SOCIAL -->
        <section class="bo-panel">
          <div class="bo-panel-head"><h2>Social</h2></div>
          <div class="bo-panel-body bo-form">
            <div class="bo-field">
              <label for="i-ig">Instagram</label>
              <input id="i-ig" name="instagram" type="url" [(ngModel)]="d.socialLinks!.instagram" placeholder="https://www.instagram.com/…" />
            </div>
            <div class="bo-field">
              <label for="i-fb">Facebook</label>
              <input id="i-fb" name="facebook" type="url" [(ngModel)]="d.socialLinks!.facebook" placeholder="https://facebook.com/…" />
            </div>
          </div>
        </section>

        <!-- DATI AZIENDALI -->
        <section class="bo-panel">
          <div class="bo-panel-head"><h2>Dati aziendali</h2></div>
          <div class="bo-panel-body bo-form">
            <div class="bo-field">
              <label for="i-name">Nome del locale</label>
              <input id="i-name" name="name" [(ngModel)]="d.name" required />
            </div>
            <div class="bo-field">
              <label for="i-legal">Ragione sociale</label>
              <input id="i-legal" name="legalName" [(ngModel)]="d.legalName" />
            </div>
            <div class="bo-grid-2">
              <div class="bo-field">
                <label for="i-piva">Partita IVA</label>
                <input id="i-piva" name="pIva" [(ngModel)]="d.pIva" />
              </div>
              <div class="bo-field">
                <label for="i-sdi">Codice SDI</label>
                <input id="i-sdi" name="sdi" [(ngModel)]="d.sdi" />
              </div>
            </div>
          </div>
        </section>
      </form>

      <ng-template #loading>
        <div class="bo-empty"><p>Caricamento…</p></div>
      </ng-template>
    </div>

    <!-- Barra di salvataggio sempre visibile -->
    <div class="save-bar" *ngIf="info">
      <span class="save-hint">{{ isDirty() ? 'Ci sono modifiche non salvate' : 'Tutto salvato' }}</span>
      <button type="submit" form="info-form" class="bo-btn primary" [disabled]="isSaving()">
        <bo-icon name="check" [size]="18"></bo-icon> {{ isSaving() ? 'Salvataggio…' : 'Salva' }}
      </button>
    </div>

    <div class="bo-toast" *ngIf="toast() as t" [class.error]="t.error">{{ t.text }}</div>
  `,
  styles: [`
    .info-form { display: block; }

    .hours { padding: 0.25rem 0; }

    .hours-row {
      display: grid;
      grid-template-columns: 120px 64px 1fr 1fr;
      align-items: center;
      gap: 1rem;
      padding: 0.6rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);

      &.hours-head {
        padding-top: 0.75rem;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      &.closed { background: var(--bg-sand-light); }

      .day-name { font-weight: 600; color: var(--text-primary); }

      .slot {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--text-muted);

        input {
          min-height: 40px;
          padding: 0 0.5rem;
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          font-family: var(--font-sans);
          font-size: 0.92rem;
          background: var(--bg-surface);
          width: 100%;
          max-width: 112px;
        }
      }

      .closed-label {
        grid-column: span 2;
        font-size: 0.9rem;
        font-style: italic;
        color: var(--status-danger);
      }
    }

    .save-bar {
      position: fixed;
      left: 248px;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
      padding: 0.8rem 2rem;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-subtle);
      z-index: 50;

      .save-hint { font-size: 0.85rem; color: var(--text-muted); }
    }

    @media (max-width: 900px) {
      .save-bar { left: 0; bottom: 60px; padding: 0.6rem 1rem; }
    }

    @media (max-width: 640px) {
      .hours-row {
        grid-template-columns: 1fr auto;
        row-gap: 0.5rem;

        &.hours-head { display: none; }

        .slot { grid-column: span 2; }
        .slot::before {
          content: attr(data-label);
          width: 56px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-stone);
        }
        .closed-label { grid-column: span 2; }
      }
    }
  `],
})
export class InfoManagementComponent implements OnInit {
  private infoService = inject(InfoService);

  readonly days = DAY_KEYS;

  info: (Partial<InfoLocale> & { openingHours: OpeningHours }) | null = null;
  private savedSnapshot = '';

  isSaving = signal(false);
  toast = signal<{ text: string; error: boolean } | null>(null);

  ngOnInit(): void {
    this.infoService.getInfoLocale().subscribe({
      next: (res) => {
        const raw = res.data;
        this.info = {
          ...raw,
          socialLinks: { instagram: '', facebook: '', ...(raw?.socialLinks || {}) },
          openingHours: normalizeOpeningHours(raw?.openingHours),
        };
        this.savedSnapshot = JSON.stringify(this.info);
      },
      error: () => this.showToast('Impossibile caricare i dati del locale.', true),
    });
  }

  dayLabel(key: DayKey): string {
    return DAY_LABELS[key];
  }

  day(key: DayKey): DaySchedule {
    return this.info!.openingHours[key] as DaySchedule;
  }

  toggleDay(key: DayKey): void {
    const d = this.day(key);
    d.isClosed = !d.isClosed;
    if (!d.isClosed) {
      if (!d.lunch?.open) d.lunch = { open: '12:00', close: '14:00' };
      if (!d.dinner?.open) d.dinner = { open: '19:00', close: '22:00' };
    }
  }

  isDirty(): boolean {
    return !!this.info && JSON.stringify(this.info) !== this.savedSnapshot;
  }

  save(): void {
    if (!this.info) return;
    this.isSaving.set(true);
    this.infoService.updateInfoLocale(this.info).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.savedSnapshot = JSON.stringify(this.info);
        this.showToast('Salvato. Il sito è già aggiornato.');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showToast(err.message || 'Salvataggio non riuscito.', true);
      },
    });
  }

  private showToast(text: string, error = false): void {
    this.toast.set({ text, error });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
