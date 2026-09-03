import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PescatoService } from '../../../core/services/pescato.service';
import { PescatoItem } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-pescato-management',
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
            <h1>Gestione Pescato del Giorno</h1>
            <p>Registra il pesce fresco dell'asta mattutina di Chioggia e aggiorna le quantità disponibili.</p>
          </div>
          <button (click)="openCreateModal()" class="btn btn-gold">
            <i class="fa-solid fa-plus"></i> Nuovo Pescato
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
                  <th>Pescato</th>
                  <th>Data Asta</th>
                  <th>Provenienza</th>
                  <th>Prezzo / Porz.</th>
                  <th>Kg Disponibili</th>
                  <th>Disponibile</th>
                  <th style="text-align: right;">Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of catches()">
                  <td>
                    <strong>{{ item.title }}</strong>
                    <p class="sub-desc">{{ item.description }}</p>
                  </td>
                  <td>{{ item.catchDate | date:'dd/MM/yyyy' }}</td>
                  <td>{{ item.marketLocation || 'Chioggia' }}</td>
                  <td><strong>€ {{ item.price.toFixed(2) }}</strong></td>
                  <td>{{ item.kilogramsAvailable ? item.kilogramsAvailable + ' kg' : '—' }}</td>
                  <td>
                    <button
                      (click)="toggleAvailability(item)"
                      class="badge"
                      [ngClass]="item.isAvailable ? 'badge-success' : 'badge-danger'"
                      style="cursor: pointer; border: none;"
                    >
                      {{ item.isAvailable ? 'Disponibile' : 'Terminato' }}
                    </button>
                  </td>
                  <td style="text-align: right;">
                    <div class="action-btns">
                      <button (click)="openEditModal(item)" class="btn-action edit" title="Modifica">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button (click)="deleteCatch(item)" class="btn-action delete" title="Elimina">
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
        [title]="editingId() ? 'Modifica Voce Pescato' : 'Registra Pescato di Oggi'"
        (closed)="closeModal()"
      >
        <form (ngSubmit)="saveCatch()">
          <div class="form-group">
            <label>Titolo / Specie *</label>
            <input type="text" class="form-control" [(ngModel)]="formData.title" name="title" required placeholder="Orata Selvaggia di Paranza">
          </div>

          <div class="form-group">
            <label>Descrizione & Consigli di Cottura *</label>
            <textarea class="form-control" [(ngModel)]="formData.description" name="description" rows="3" required placeholder="Cottura al sale, ai ferri o in umido..."></textarea>
          </div>

          <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Prezzo (€) *</label>
              <input type="number" step="0.5" class="form-control" [(ngModel)]="formData.price" name="price" min="0" required>
            </div>
            <div class="form-group">
              <label>Chilogrammi Totali</label>
              <input type="number" step="0.1" class="form-control" [(ngModel)]="formData.kilogramsAvailable" name="kilogramsAvailable" min="0" placeholder="es. 4.5">
            </div>
          </div>

          <div class="form-group">
            <label>Luogo / Mercato di Acquisto</label>
            <input type="text" class="form-control" [(ngModel)]="formData.marketLocation" name="marketLocation" placeholder="Mercato Ittico di Chioggia">
          </div>

          <div class="form-group">
            <label>URL Foto</label>
            <input type="text" class="form-control" [(ngModel)]="formData.image" name="image" placeholder="/uploads/pescato/pesce.jpg">
          </div>

          <div class="form-group" style="margin: 1.5rem 0;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" [(ngModel)]="formData.isAvailable" name="isAvailable">
              <strong>Attualmente disponibile per i clienti</strong>
            </label>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" (click)="closeModal()" class="btn btn-outline btn-sm">Annulla</button>
            <button type="submit" class="btn btn-gold btn-sm" [disabled]="!formData.title || !formData.description || formData.price === undefined">
              {{ editingId() ? 'Salva Modifiche' : 'Aggiungi Pescato' }}
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
export class PescatoManagementComponent implements OnInit {
  private pescatoService = inject(PescatoService);

  public catches = signal<PescatoItem[]>([]);
  public isModalOpen = signal<boolean>(false);
  public editingId = signal<string | null>(null);
  public feedbackMsg = signal<string>('');
  public isError = signal<boolean>(false);

  public formData: Partial<PescatoItem> = {
    title: '',
    description: '',
    price: 0,
    marketLocation: 'Mercato Ittico di Chioggia',
    kilogramsAvailable: undefined,
    image: '',
    isAvailable: true,
  };

  ngOnInit(): void {
    this.loadCatches();
  }

  loadCatches(): void {
    this.pescatoService.getPescatoList({ all: true }).subscribe({
      next: (res) => { if (res.success) this.catches.set(res.data); },
    });
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.formData = {
      title: '',
      description: '',
      price: 25.0,
      marketLocation: 'Mercato Ittico di Chioggia',
      kilogramsAvailable: 5.0,
      image: '',
      isAvailable: true,
    };
    this.isModalOpen.set(true);
  }

  openEditModal(item: PescatoItem): void {
    this.editingId.set(item.id || item._id || null);
    this.formData = {
      title: item.title,
      description: item.description,
      price: item.price,
      marketLocation: item.marketLocation,
      kilogramsAvailable: item.kilogramsAvailable,
      image: item.image,
      isAvailable: item.isAvailable,
    };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveCatch(): void {
    const id = this.editingId();
    if (id) {
      this.pescatoService.updatePescato(id, this.formData).subscribe({
        next: () => {
          this.setFeedback('Pescato aggiornato con successo.');
          this.closeModal();
          this.loadCatches();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    } else {
      this.pescatoService.createPescato(this.formData).subscribe({
        next: () => {
          this.setFeedback('Nuova voce pescato registrata con successo.');
          this.closeModal();
          this.loadCatches();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    }
  }

  toggleAvailability(item: PescatoItem): void {
    const id = item.id || item._id;
    if (!id) return;
    this.pescatoService.updatePescato(id, { isAvailable: !item.isAvailable }).subscribe({
      next: () => this.loadCatches(),
    });
  }

  deleteCatch(item: PescatoItem): void {
    const id = item.id || item._id;
    if (!id) return;
    if (confirm(`Eliminare "${item.title}" dal registro pescato?`)) {
      this.pescatoService.deletePescato(id).subscribe({
        next: () => {
          this.setFeedback('Voce pescato eliminata.');
          this.loadCatches();
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
