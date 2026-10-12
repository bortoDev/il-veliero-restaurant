import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EventoService } from '../../../core/services/evento.service';
import { Evento } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-eventi-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalComponent],
  template: `
    <div class="management-page">
      <div class="container">
        <div class="page-top-nav">
          <a routerLink="/gestore/dashboard" class="back-link">
            <i class="fa-solid fa-arrow-left"></i> Torna alla Dashboard
          </a>
        </div>

        <div class="management-header">
          <div>
            <h1>Gestione Eventi Culinari</h1>
            <p>Pianifica serate a tema, degustazioni guidate e monitora le prenotazioni dei posti a sedere.</p>
          </div>
          <button (click)="openCreateModal()" class="btn btn-gold">
            <i class="fa-solid fa-plus"></i> Nuovo Evento
          </button>
        </div>

        <div *ngIf="feedbackMsg()" class="alert-box" [ngClass]="isError() ? 'alert-error' : 'alert-success'">
          <i class="fa-solid" [ngClass]="isError() ? 'fa-circle-xmark' : 'fa-circle-check'"></i>
          <span>{{ feedbackMsg() }}</span>
        </div>

        <div class="table-card card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Data & Ora</th>
                  <th>Prezzo / Ospite</th>
                  <th>Posti Occupati</th>
                  <th>Stato</th>
                  <th style="text-align: right;">Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ev of events()">
                  <td>
                    <strong>{{ ev.title }}</strong>
                    <p class="sub-desc">{{ ev.description }}</p>
                  </td>
                  <td>{{ ev.eventDate | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td><strong>€ {{ ev.price.toFixed(2) }}</strong></td>
                  <td>
                    <span *ngIf="ev.maxSeats">{{ ev.reservedSeats }} / {{ ev.maxSeats }}</span>
                    <span *ngIf="!ev.maxSeats">{{ ev.reservedSeats }} prenotati</span>
                  </td>
                  <td>
                    <button
                      (click)="toggleActive(ev)"
                      class="badge"
                      [ngClass]="ev.isActive ? 'badge-success' : 'badge-danger'"
                      style="cursor: pointer; border: none;"
                    >
                      {{ ev.isActive ? 'Attivo' : 'Chiuso' }}
                    </button>
                  </td>
                  <td style="text-align: right;">
                    <div class="action-btns">
                      <button (click)="openEditModal(ev)" class="btn-action edit" title="Modifica">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button (click)="deleteEvent(ev)" class="btn-action delete" title="Elimina">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Create / Edit Modal -->
      <app-modal
        *ngIf="isModalOpen()"
        [title]="editingId() ? 'Modifica Evento' : 'Programma Nuovo Evento'"
        (closed)="closeModal()"
      >
        <form (ngSubmit)="saveEvent()">
          <div class="form-group">
            <label>Titolo Evento *</label>
            <input type="text" class="form-control" [(ngModel)]="formData.title" name="title" required placeholder="Galà del Crudo Adriatico">
          </div>

          <div class="form-group">
            <label>Descrizione & Menu della Serata *</label>
            <textarea class="form-control" [(ngModel)]="formData.description" name="description" rows="3" required placeholder="Portate previste, abbinamento vini e dettagli..."></textarea>
          </div>

          <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Data & Ora Evento *</label>
              <input type="datetime-local" class="form-control" [(ngModel)]="dateString" name="eventDate" required>
            </div>
            <div class="form-group">
              <label>Prezzo a Persona (€) *</label>
              <input type="number" step="1" class="form-control" [(ngModel)]="formData.price" name="price" min="0" required>
            </div>
          </div>

          <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Posti Massimi (Capienza)</label>
              <input type="number" class="form-control" [(ngModel)]="formData.maxSeats" name="maxSeats" min="1" placeholder="es. 50">
            </div>
            <div class="form-group">
              <label>Posti Attualmente Riservati</label>
              <input type="number" class="form-control" [(ngModel)]="formData.reservedSeats" name="reservedSeats" min="0">
            </div>
          </div>

          <div class="form-group">
            <label>Foto dell'Evento (una o più immagini)</label>
            <textarea
              class="form-control"
              [(ngModel)]="imagesText"
              name="imagesText"
              rows="2"
              placeholder="/uploads/eventi/foto1.jpg&#10;/uploads/eventi/foto2.jpg"
            ></textarea>
            <small style="display: block; margin-top: 0.35rem; color: var(--color-text-muted); font-size: 0.78rem;">
              Inserisci uno o più URL (uno per riga o separati da virgola). Il banner si adatterà automaticamente mostrando un frame singolo, dittico o griglia.
            </small>
          </div>

          <div class="form-group" style="margin: 1.5rem 0;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" [(ngModel)]="formData.isActive" name="isActive">
              <strong>Evento visibile nel calendario pubblico</strong>
            </label>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" (click)="closeModal()" class="btn btn-outline btn-sm">Annulla</button>
            <button type="submit" class="btn btn-gold btn-sm" [disabled]="!formData.title || !formData.description || !dateString">
              {{ editingId() ? 'Salva Modifiche' : 'Crea Evento' }}
            </button>
          </div>
        </form>
      </app-modal>
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

    .table-card {
      padding: 1.5rem;
      .table-responsive { overflow-x: auto; }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.92rem;

        th {
          background: var(--color-seafoam);
          color: var(--color-navy-dark);
          font-weight: 700;
          padding: 0.85rem 1rem;
          border-bottom: 2px solid var(--color-border);
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid var(--color-border);
          vertical-align: middle;

          .sub-desc {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            margin-bottom: 0;
            max-width: 250px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .action-btns {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            .btn-action {
              background: transparent;
              border: 1px solid var(--color-border);
              border-radius: 4px;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              &.edit { color: var(--color-navy-medium); &:hover { background: var(--color-navy-medium); color: #fff; } }
              &.delete { color: var(--color-danger); &:hover { background: var(--color-danger); color: #fff; } }
            }
          }
        }
      }
    }
  `],
})
export class EventiManagementComponent implements OnInit {
  private eventoService = inject(EventoService);

  public events = signal<Evento[]>([]);
  public isModalOpen = signal<boolean>(false);
  public editingId = signal<string | null>(null);
  public feedbackMsg = signal<string>('');
  public isError = signal<boolean>(false);
  public dateString: string = '';
  public imagesText: string = '';

  public formData: Partial<Evento> = {
    title: '',
    description: '',
    price: 50,
    maxSeats: 40,
    reservedSeats: 0,
    image: '',
    isActive: true,
  };

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventoService.getAllEventi().subscribe({
      next: (res) => { if (res.success) this.events.set(res.data); },
    });
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.formData = {
      title: '',
      description: '',
      price: 60,
      maxSeats: 45,
      reservedSeats: 0,
      image: '',
      isActive: true,
    };
    this.imagesText = '';
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    this.dateString = nextWeek.toISOString().slice(0, 16);
    this.isModalOpen.set(true);
  }

  openEditModal(ev: Evento): void {
    this.editingId.set(ev.id || ev._id || null);
    this.formData = {
      title: ev.title,
      description: ev.description,
      price: ev.price,
      maxSeats: ev.maxSeats,
      reservedSeats: ev.reservedSeats,
      image: ev.image,
      isActive: ev.isActive,
    };
    if (ev.images && ev.images.length > 0) {
      this.imagesText = ev.images.join('\n');
    } else if (ev.image) {
      this.imagesText = ev.image;
    } else {
      this.imagesText = '';
    }
    this.dateString = ev.eventDate ? new Date(ev.eventDate).toISOString().slice(0, 16) : '';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveEvent(): void {
    const payload: any = { ...this.formData };
    if (this.dateString) payload.eventDate = new Date(this.dateString).toISOString();

    const parsedImages = this.imagesText
      ? this.imagesText.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
      : [];
    payload.images = parsedImages;
    if (parsedImages.length > 0) {
      payload.image = parsedImages[0];
    }

    const id = this.editingId();
    if (id) {
      this.eventoService.updateEvento(id, payload).subscribe({
        next: () => {
          this.setFeedback('Evento aggiornato con successo.');
          this.closeModal();
          this.loadEvents();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    } else {
      this.eventoService.createEvento(payload).subscribe({
        next: () => {
          this.setFeedback('Nuovo evento creato con successo.');
          this.closeModal();
          this.loadEvents();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    }
  }

  toggleActive(ev: Evento): void {
    const id = ev.id || ev._id;
    if (!id) return;
    this.eventoService.updateEvento(id, { isActive: !ev.isActive }).subscribe({
      next: () => this.loadEvents(),
    });
  }

  deleteEvent(ev: Evento): void {
    const id = ev.id || ev._id;
    if (!id) return;
    if (confirm(`Eliminare l'evento "${ev.title}"?`)) {
      this.eventoService.deleteEvento(id).subscribe({
        next: () => {
          this.setFeedback('Evento eliminato.');
          this.loadEvents();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    }
  }

  private setFeedback(msg: string, isErr = false): void {
    this.feedbackMsg.set(msg);
    this.isError.set(isErr);
    setTimeout(() => this.feedbackMsg.set(''), 4000);
  }
}
