import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventoService } from '../../../core/services/evento.service';
import { Evento } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { NauticalDecorComponent } from '../../../shared/components/nautical-decor/nautical-decor.component';
import { NauticalStarComponent } from '../../../shared/components/svg-icons';

@Component({
  selector: 'app-eventi',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, NauticalDecorComponent, NauticalStarComponent],
  template: `
    <div class="eventi-page">
      <section class="eventi-hero-section">
        <app-nautical-decor></app-nautical-decor>
        <div class="container hero-inner">
          <div class="hero-badge">
            <app-nautical-star size="24px"></app-nautical-star>
            <span>Esperienze Enogastronomiche</span>
            <app-nautical-star size="24px"></app-nautical-star>
          </div>
          <h1 class="hero-title">EVENTI & SERATE A TEMA</h1>
          <p class="hero-subtitle">Degustazioni guidate, percorsi marinari esclusivi e serate musicali sulla nostra terrazza a Bassano del Grappa.</p>
        </div>
      </section>

      <section class="section eventi-content">
        <div class="container">
          <div *ngIf="isLoading()" class="loading-state">
            <i class="fa-solid fa-spinner fa-spin"></i> Caricamento calendario eventi...
          </div>

          <div *ngIf="!isLoading() && events().length === 0" class="empty-state card">
            <i class="fa-solid fa-calendar-xmark"></i>
            <h3>Nessun evento in programma al momento</h3>
            <p>Stiamo definendo il nuovo calendario di degustazioni. Torna presto a trovarci!</p>
          </div>

          <div *ngIf="!isLoading() && events().length > 0" class="eventi-grid">
            <div class="event-card card" *ngFor="let event of events()">
              <div class="event-media" *ngIf="event.image">
                <img [src]="event.image" [alt]="event.title" (error)="onImageError($event)">
                <div class="event-date-badge">
                  <span class="date-day">{{ event.eventDate | date:'dd' }}</span>
                  <span class="date-month">{{ event.eventDate | date:'MMM' }}</span>
                </div>
              </div>

              <div class="event-body">
                <div class="event-date-line">
                  <i class="fa-solid fa-clock"></i> {{ event.eventDate | date:'EEEE d MMMM, ore HH:mm' }}
                </div>
                <h3 class="event-title">{{ event.title }}</h3>
                <p class="event-desc">{{ event.description }}</p>

                <div class="event-seats-bar" *ngIf="event.maxSeats">
                  <div class="seats-info">
                    <span>Posti Disponibili:</span>
                    <strong>{{ event.maxSeats - event.reservedSeats }} su {{ event.maxSeats }}</strong>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      [style.width.%]="(event.reservedSeats / event.maxSeats) * 100"
                    ></div>
                  </div>
                </div>

                <div class="event-footer">
                  <div class="event-price-tag">
                    <span>Prezzo a persona</span>
                    <strong>€ {{ event.price.toFixed(2) }}</strong>
                  </div>
                  <button (click)="openBookingModal(event)" class="btn btn-gold btn-sm">
                    <i class="fa-solid fa-ticket"></i> Prenota Posto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Reservation Modal -->
      <app-modal
        *ngIf="selectedEvent() as ev"
        [title]="'Prenotazione: ' + ev.title"
        (closed)="closeBookingModal()"
      >
        <div class="booking-modal-form" *ngIf="!bookingSuccess(); else successTpl">
          <p class="modal-summary">
            Serata del <strong>{{ ev.eventDate | date:'dd/MM/yyyy HH:mm' }}</strong> — Quota: <strong>€ {{ ev.price.toFixed(2) }}</strong> a persona.
          </p>

          <form (ngSubmit)="submitReservation()">
            <div class="form-group">
              <label>Nome e Cognome *</label>
              <input type="text" class="form-control" [(ngModel)]="bookingName" name="name" required placeholder="Mario Rossi">
            </div>

            <div class="form-group">
              <label>Recapito Telefonico *</label>
              <input type="tel" class="form-control" [(ngModel)]="bookingPhone" name="phone" required placeholder="+39 333 1234567">
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input type="email" class="form-control" [(ngModel)]="bookingEmail" name="email" required placeholder="mario@example.com">
            </div>

            <div class="form-group">
              <label>Numero Ospiti *</label>
              <input type="number" class="form-control" [(ngModel)]="bookingSeats" name="seats" min="1" max="10" required>
            </div>

            <div class="form-group">
              <label>Note o Intolleranze Alimentari</label>
              <textarea class="form-control" [(ngModel)]="bookingNotes" name="notes" placeholder="Segnala eventuali allergie o richieste particolari..."></textarea>
            </div>

            <div class="modal-actions" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
              <button type="button" (click)="closeBookingModal()" class="btn btn-outline btn-sm">Annulla</button>
              <button type="submit" class="btn btn-gold btn-sm" [disabled]="!bookingName || !bookingPhone || !bookingEmail">Conferma Prenotazione</button>
            </div>
          </form>
        </div>

        <ng-template #successTpl>
          <div class="success-booking-message" style="text-align: center; padding: 2rem 1rem;">
            <i class="fa-solid fa-circle-check" style="font-size: 3.5rem; color: var(--color-success); margin-bottom: 1rem;"></i>
            <h3>Richiesta di Prenotazione Inviata!</h3>
            <p>Grazie {{ bookingName }}. Abbiamo ricevuto la tua richiesta per {{ bookingSeats }} persone. Il nostro staff ti contatterà al {{ bookingPhone }} per la conferma definitiva.</p>
            <button (click)="closeBookingModal()" class="btn btn-primary btn-sm" style="margin-top: 1.5rem;">Chiudi</button>
          </div>
        </ng-template>
      </app-modal>
    </div>
  `,
  styles: [`
    .page-hero {
      background: linear-gradient(135deg, var(--color-navy-dark) 0%, var(--color-navy-primary) 100%);
      color: #ffffff;
      padding: 5rem 0 4rem;
      text-align: center;
      position: relative;
      overflow: hidden;

      .hero-inner {
        position: relative;
        z-index: 2;
      }

      .hero-sub {
        font-size: 0.9rem;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--color-gold);
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: block;
      }

      h1 {
        font-size: 3rem;
        letter-spacing: 3px;
        color: #ffffff;
        margin-bottom: 1rem;
      }

      p {
        color: var(--color-seafoam);
        font-size: 1.1rem;
        max-width: 600px;
        margin: 0 auto;
      }
    }

    .eventi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 2.5rem;

      .event-card {
        padding: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .event-media {
          position: relative;
          height: 210px;
          background: var(--color-navy-dark);

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .event-date-badge {
            position: absolute;
            top: 15px;
            left: 15px;
            background: var(--color-navy-dark);
            color: #ffffff;
            border-radius: 8px;
            padding: 0.4rem 0.8rem;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 1px solid var(--color-gold);

            .date-day {
              font-family: var(--font-heading);
              font-size: 1.5rem;
              font-weight: 700;
              line-height: 1;
              color: var(--color-gold);
              display: block;
            }

            .date-month {
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-weight: 600;
            }
          }
        }

        .event-body {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          flex: 1;

          .event-date-line {
            font-size: 0.85rem;
            color: var(--color-gold-dark);
            font-weight: 600;
            margin-bottom: 0.6rem;
            text-transform: capitalize;
          }

          .event-title {
            font-size: 1.3rem;
            color: var(--color-navy-dark);
            margin-bottom: 0.75rem;
          }

          .event-desc {
            font-size: 0.92rem;
            color: var(--color-text-muted);
            line-height: 1.5;
            margin-bottom: 1.25rem;
            flex: 1;
          }

          .event-seats-bar {
            background: var(--color-seafoam);
            padding: 0.75rem 1rem;
            border-radius: 6px;
            margin-bottom: 1.25rem;

            .seats-info {
              display: flex;
              justify-content: space-between;
              font-size: 0.8rem;
              margin-bottom: 0.35rem;
            }

            .progress-bar {
              height: 6px;
              background: #e2e8f0;
              border-radius: 3px;
              overflow: hidden;

              .progress-fill {
                height: 100%;
                background: var(--color-gold-dark);
                border-radius: 3px;
              }
            }
          }

          .event-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid var(--color-border);
            padding-top: 1rem;

            .event-price-tag {
              display: flex;
              flex-direction: column;

              span {
                font-size: 0.7rem;
                color: var(--color-text-light);
                text-transform: uppercase;
              }

              strong {
                font-family: var(--font-heading);
                font-size: 1.3rem;
                color: var(--color-navy-dark);
              }
            }
          }
        }
      }
    }

    .modal-summary {
      font-size: 0.95rem;
      color: var(--color-navy-medium);
      background: var(--color-seafoam);
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1.25rem;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--color-text-muted);

      i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: var(--color-gold-dark);
      }
    }
  `],
})
export class EventiComponent implements OnInit {
  private eventoService = inject(EventoService);
  public events = signal<Evento[]>([]);
  public isLoading = signal<boolean>(true);

  public selectedEvent = signal<Evento | null>(null);
  public bookingName: string = '';
  public bookingPhone: string = '';
  public bookingEmail: string = '';
  public bookingSeats: number = 2;
  public bookingNotes: string = '';
  public bookingSuccess = signal<boolean>(false);

  ngOnInit(): void {
    this.eventoService.getUpcomingEventi().subscribe({
      next: (res) => {
        if (res.success) {
          this.events.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openBookingModal(event: Evento): void {
    this.selectedEvent.set(event);
    this.bookingSuccess.set(false);
  }

  closeBookingModal(): void {
    this.selectedEvent.set(null);
    this.bookingName = '';
    this.bookingPhone = '';
    this.bookingEmail = '';
    this.bookingSeats = 2;
    this.bookingNotes = '';
  }

  submitReservation(): void {
    if (!this.bookingName || !this.bookingPhone || !this.bookingEmail) return;
    this.bookingSuccess.set(true);
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }
}
