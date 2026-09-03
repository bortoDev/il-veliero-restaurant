import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InfoService } from '../../../core/services/info.service';
import { InfoLocale, OpeningHours, DaySchedule } from '../../../core/models';

@Component({
  selector: 'app-info-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="management-page">
      <div class="container">
        <div class="page-top-nav">
          <a routerLink="/gestore/dashboard" class="back-link">
            <i class="fa-solid fa-arrow-left"></i> Torna alla Dashboard Gestore
          </a>
        </div>

        <div class="management-header">
          <div>
            <h1>Informazioni & Orari Locale</h1>
            <p>Modifica recapiti telefonici, email, indirizzo, orari settimanali e storia del ristorante a Bassano del Grappa.</p>
          </div>
          <button (click)="saveInfo()" class="btn btn-gold" [disabled]="isLoading()">
            <i class="fa-solid" [ngClass]="isLoading() ? 'fa-spinner fa-spin' : 'fa-floppy-disk'"></i>
            {{ isLoading() ? 'Salvataggio...' : 'Salva Modifiche' }}
          </button>
        </div>

        <div *ngIf="feedbackMsg()" class="alert-box" [ngClass]="isError() ? 'alert-error' : 'alert-success'">
          <i class="fa-solid" [ngClass]="isError() ? 'fa-circle-xmark' : 'fa-circle-check'"></i>
          <span>{{ feedbackMsg() }}</span>
        </div>

        <form (ngSubmit)="saveInfo()" *ngIf="infoData">
          <div class="editor-grid">
            <!-- Left Column: Business & Contacts -->
            <div class="editor-col">
              <div class="card editor-card">
                <h2><i class="fa-solid fa-building"></i> Dati Principali & Fiscali</h2>
                
                <div class="form-group">
                  <label>Nome Insegna / Brand *</label>
                  <input type="text" class="form-control" [(ngModel)]="infoData.name" name="name" required placeholder="Il Veliero — Ristorante & Pizzeria dal Campione del Mondo">
                </div>

                <div class="form-group">
                  <label>Ragione Sociale</label>
                  <input type="text" class="form-control" [(ngModel)]="infoData.legalName" name="legalName" placeholder="Pizza dal Campione del Mondo s.n.c. di Bortolato Federico e Mazzeracca Sabina">
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Partita IVA</label>
                    <input type="text" class="form-control" [(ngModel)]="infoData.pIva" name="pIva" placeholder="03450720242">
                  </div>
                  <div class="form-group">
                    <label>Codice SDI</label>
                    <input type="text" class="form-control" [(ngModel)]="infoData.sdi" name="sdi" placeholder="P62QHVQ">
                  </div>
                </div>
              </div>

              <div class="card editor-card">
                <h2><i class="fa-solid fa-address-book"></i> Recapiti & Sede</h2>

                <div class="form-group">
                  <label>Indirizzo *</label>
                  <input type="text" class="form-control" [(ngModel)]="infoData.address" name="address" required placeholder="Via G. Fattori 7 - Località San Michele">
                </div>

                <div class="form-row form-row-3">
                  <div class="form-group">
                    <label>Città</label>
                    <input type="text" class="form-control" [(ngModel)]="infoData.city" name="city" placeholder="Bassano del Grappa">
                  </div>
                  <div class="form-group">
                    <label>CAP</label>
                    <input type="text" class="form-control" [(ngModel)]="infoData.postalCode" name="postalCode" placeholder="36061">
                  </div>
                  <div class="form-group">
                    <label>Provincia</label>
                    <input type="text" class="form-control" [(ngModel)]="infoData.province" name="province" placeholder="VI">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Telefono Fisso *</label>
                    <div class="input-icon-wrap">
                      <i class="fa-solid fa-phone"></i>
                      <input type="tel" class="form-control" [(ngModel)]="infoData.phone" name="phone" required placeholder="0424 500 200">
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Cellulare / WhatsApp</label>
                    <div class="input-icon-wrap">
                      <i class="fa-brands fa-whatsapp"></i>
                      <input type="tel" class="form-control" [(ngModel)]="infoData.whatsapp" name="whatsapp" placeholder="334 623 2941">
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Email Principale *</label>
                    <div class="input-icon-wrap">
                      <i class="fa-solid fa-envelope"></i>
                      <input type="email" class="form-control" [(ngModel)]="infoData.email" name="email" required placeholder="pizzadalcampione@gmail.com">
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Email Secondaria</label>
                    <div class="input-icon-wrap">
                      <i class="fa-solid fa-envelope-open"></i>
                      <input type="email" class="form-control" [(ngModel)]="infoData.secondaryEmail" name="secondaryEmail" placeholder="pizzadalcampione@gmail.com">
                    </div>
                  </div>
                </div>

                <div class="form-row" *ngIf="infoData.coordinates">
                  <div class="form-group">
                    <label>Latitudine GPS</label>
                    <input type="number" step="0.0001" class="form-control" [(ngModel)]="infoData.coordinates.lat" name="lat">
                  </div>
                  <div class="form-group">
                    <label>Longitudine GPS</label>
                    <input type="number" step="0.0001" class="form-control" [(ngModel)]="infoData.coordinates.lng" name="lng">
                  </div>
                </div>
              </div>

              <!-- Social Links -->
              <div class="card editor-card" *ngIf="infoData.socialLinks">
                <h2><i class="fa-solid fa-share-nodes"></i> Social Links</h2>
                <div class="form-group">
                  <label>Instagram URL</label>
                  <div class="input-icon-wrap">
                    <i class="fa-brands fa-instagram"></i>
                    <input type="url" class="form-control" [(ngModel)]="infoData.socialLinks.instagram" name="instagram" placeholder="https://www.instagram.com/ilvelierotrattoria">
                  </div>
                </div>
                <div class="form-group">
                  <label>Facebook URL</label>
                  <div class="input-icon-wrap">
                    <i class="fa-brands fa-facebook"></i>
                    <input type="url" class="form-control" [(ngModel)]="infoData.socialLinks.facebook" name="facebook" placeholder="https://facebook.com/ilvelierobassano">
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Opening Hours & Story -->
            <div class="editor-col">
              <div class="card editor-card" *ngIf="infoData.openingHours">
                <h2><i class="fa-solid fa-clock"></i> Orari di Apertura Settimanali</h2>
                <p class="section-desc">Imposta le fasce orarie per pranzo e cena (Mercoledì chiuso per turno di riposo).</p>

                <div class="days-schedule-table">
                  <div *ngFor="let day of daysList" class="day-row" [ngClass]="{'is-closed': getSchedule(day.key).isClosed}">
                    <div class="day-name">
                      <strong>{{ day.label }}</strong>
                    </div>

                    <div class="day-closed-toggle">
                      <label>
                        <input type="checkbox" [(ngModel)]="getSchedule(day.key).isClosed" [name]="day.key + '_closed'">
                        Chiuso
                      </label>
                    </div>

                    <div class="day-shifts" *ngIf="!getSchedule(day.key).isClosed">
                      <div class="shift-group">
                        <span class="shift-label">Pranzo:</span>
                        <input type="time" class="form-control time-input" [(ngModel)]="getSchedule(day.key).lunch!.open" [name]="day.key + '_lunch_open'">
                        <span>-</span>
                        <input type="time" class="form-control time-input" [(ngModel)]="getSchedule(day.key).lunch!.close" [name]="day.key + '_lunch_close'">
                      </div>

                      <div class="shift-group">
                        <span class="shift-label">Cena:</span>
                        <input type="time" class="form-control time-input" [(ngModel)]="getSchedule(day.key).dinner!.open" [name]="day.key + '_dinner_open'">
                        <span>-</span>
                        <input type="time" class="form-control time-input" [(ngModel)]="getSchedule(day.key).dinner!.close" [name]="day.key + '_dinner_close'">
                      </div>
                    </div>

                    <div class="day-closed-msg" *ngIf="getSchedule(day.key).isClosed">
                      <span class="badge badge-danger">Chiuso per Riposo Settimanale</span>
                    </div>
                  </div>
                </div>

                <div class="form-group" style="margin-top: 1.5rem;">
                  <label>Note sugli Orari</label>
                  <input type="text" class="form-control" [(ngModel)]="infoData.openingHours.notes" name="notes" placeholder="es. Pranzo 12:00-14:00 | Cena 19:00-22:00. Chiuso il Mercoledì per riposo settimanale.">
                </div>
              </div>

              <div class="card editor-card">
                <h2><i class="fa-solid fa-book-open"></i> Storia del Ristorante</h2>
                <p class="section-desc">Testo narrativo visualizzato nella pagina "La Nostra Storia" e nelle sezioni informative.</p>
                <div class="form-group">
                  <textarea class="form-control" [(ngModel)]="infoData.historyStory" name="historyStory" rows="8" required placeholder="Inserisci il testo narrativo della storia..."></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions-bottom card">
            <button type="submit" class="btn btn-gold btn-lg" [disabled]="isLoading()">
              <i class="fa-solid" [ngClass]="isLoading() ? 'fa-spinner fa-spin' : 'fa-floppy-disk'"></i>
              Salva Tutte le Modifiche
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .management-page {
      padding: 2.5rem 0 5rem;
      background: var(--color-bg-main);
      min-height: 80vh;
    }

    .page-top-nav {
      margin-bottom: 1.5rem;
      .back-link {
        color: var(--color-navy-medium);
        font-weight: 600;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        &:hover { color: var(--color-gold-dark); }
      }
    }

    .management-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 2rem;
      h1 { font-size: 2.2rem; color: var(--color-navy-dark); margin-bottom: 0.25rem; }
      p { color: var(--color-text-muted); margin-bottom: 0; }
    }

    .alert-box {
      padding: 0.85rem 1.25rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.92rem;
      &.alert-success { background: rgba(42, 157, 143, 0.15); color: var(--color-success); }
      &.alert-error { background: rgba(217, 4, 41, 0.15); color: var(--color-danger); }
    }

    .editor-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: start;

      .editor-col {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .editor-card {
        padding: 2rem;

        h2 {
          font-size: 1.25rem;
          color: var(--color-navy-dark);
          margin-bottom: 1.25rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--color-seafoam);
          display: flex;
          align-items: center;
          gap: 0.5rem;

          i {
            color: var(--color-gold-dark);
            font-size: 1.1rem;
          }
        }

        .section-desc {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          margin-bottom: 1.25rem;
          line-height: 1.45;
        }
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      &.form-row-3 {
        grid-template-columns: 2fr 1fr 1fr;
      }
    }

    .input-icon-wrap {
      position: relative;
      i {
        position: absolute;
        left: 0.9rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-light);
      }
      .form-control {
        padding-left: 2.5rem;
      }
    }

    .days-schedule-table {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .day-row {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        background: var(--color-seafoam);
        border-radius: 6px;
        gap: 1rem;
        flex-wrap: wrap;

        &.is-closed {
          background: #f8fafc;
          opacity: 0.85;
        }

        .day-name {
          width: 100px;
          color: var(--color-navy-dark);
        }

        .day-closed-toggle {
          display: flex;
          align-items: center;
          font-size: 0.85rem;
          margin-right: 0.5rem;

          label {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            cursor: pointer;
            margin-bottom: 0;
          }
        }

        .day-shifts {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          flex-wrap: wrap;

          .shift-group {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.82rem;

            .shift-label {
              font-weight: 600;
              color: var(--color-navy-medium);
            }

            .time-input {
              width: 85px;
              padding: 0.25rem 0.4rem;
              font-size: 0.82rem;
            }
          }
        }

        .day-closed-msg {
          flex: 1;
        }
      }
    }

    .form-actions-bottom {
      margin-top: 2.5rem;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: flex-end;
    }

    @media (max-width: 992px) {
      .editor-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class InfoManagementComponent implements OnInit {
  private infoService = inject(InfoService);

  public infoData: Partial<InfoLocale> | null = null;
  public feedbackMsg = signal<string>('');
  public isError = signal<boolean>(false);
  public isLoading = signal<boolean>(false);

  public daysList: Array<{ key: keyof OpeningHours; label: string }> = [
    { key: 'monday', label: 'Lunedì' },
    { key: 'tuesday', label: 'Martedì' },
    { key: 'wednesday', label: 'Mercoledì' },
    { key: 'thursday', label: 'Giovedì' },
    { key: 'friday', label: 'Venerdì' },
    { key: 'saturday', label: 'Sabato' },
    { key: 'sunday', label: 'Domenica' },
  ];

  ngOnInit(): void {
    this.infoService.getInfoLocale().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const raw = res.data;
          this.infoData = {
            ...raw,
            coordinates: raw.coordinates || { lat: 45.7667, lng: 11.7333 },
            socialLinks: {
              facebook: 'https://facebook.com/ilvelierobassano',
              instagram: 'https://www.instagram.com/ilvelierotrattoria',
              whatsapp: 'https://wa.me/393346232941',
              ...(raw.socialLinks || {}),
            },
            openingHours: this.normalizeOpeningHours(raw.openingHours),
          };
        }
      },
    });
  }

  private normalizeOpeningHours(hours?: OpeningHours): OpeningHours {
    const defaultSchedule = (lunchOpen = '12:00', lunchClose = '14:00', dinnerOpen = '19:00', dinnerClose = '22:00', isClosed = false): DaySchedule => ({
      lunch: { open: lunchOpen, close: lunchClose },
      dinner: { open: dinnerOpen, close: dinnerClose },
      isClosed,
    });

    return {
      monday: hours?.monday || defaultSchedule(),
      tuesday: hours?.tuesday || defaultSchedule(),
      wednesday: hours?.wednesday || defaultSchedule('', '', '', '', true),
      thursday: hours?.thursday || defaultSchedule(),
      friday: hours?.friday || defaultSchedule(),
      saturday: hours?.saturday || defaultSchedule(),
      sunday: hours?.sunday || defaultSchedule(),
      notes: hours?.notes || 'Pranzo 12:00-14:00 | Cena 19:00-22:00. Chiuso il Mercoledì per riposo settimanale.',
    };
  }

  getSchedule(dayKey: keyof OpeningHours): DaySchedule {
    if (!this.infoData || !this.infoData.openingHours) {
      return { lunch: { open: '', close: '' }, dinner: { open: '', close: '' }, isClosed: false };
    }
    const schedule = this.infoData.openingHours[dayKey];
    if (typeof schedule === 'object' && schedule !== null && 'isClosed' in schedule) {
      const s = schedule as DaySchedule;
      s.lunch = s.lunch || { open: '12:00', close: '14:00' };
      s.dinner = s.dinner || { open: '19:00', close: '22:00' };
      return s;
    }
    return { lunch: { open: '', close: '' }, dinner: { open: '', close: '' }, isClosed: false };
  }

  saveInfo(): void {
    if (!this.infoData) return;
    this.isLoading.set(true);

    this.infoService.updateInfoLocale(this.infoData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.setFeedback('Informazioni del locale e orari salvati con successo.');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.setFeedback(err.message || 'Errore durante il salvataggio dei dati.', true);
      },
    });
  }

  private setFeedback(msg: string, isErr = false): void {
    this.feedbackMsg.set(msg);
    this.isError.set(isErr);
    setTimeout(() => this.feedbackMsg.set(''), 4000);
  }
}

