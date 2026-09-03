import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AvvisoService } from '../../../core/services/avviso.service';
import { Avviso, AvvisoSeverity } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-avvisi-management',
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
            <h1>Gestione Avvisi & Chiusure</h1>
            <p>Configura i banner dinamici visibili in cima a tutte le pagine del sito (es. ferie, chiusure, avvisi).</p>
          </div>
          <button (click)="openCreateModal()" class="btn btn-gold">
            <i class="fa-solid fa-plus"></i> Nuovo Avviso
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
                  <th>Titolo & Messaggio</th>
                  <th>Livello Gravità</th>
                  <th>Inizio Validità</th>
                  <th>Fine Validità</th>
                  <th>Stato Attivo</th>
                  <th style="text-align: right;">Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let avviso of notices()">
                  <td>
                    <strong>{{ avviso.title }}</strong>
                    <p class="sub-desc">{{ avviso.message }}</p>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'badge-info': avviso.severity === 'info',
                      'badge-warning': avviso.severity === 'warning',
                      'badge-danger': avviso.severity === 'danger'
                    }">{{ avviso.severity }}</span>
                  </td>
                  <td>{{ avviso.startDate | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ avviso.endDate ? (avviso.endDate | date:'dd/MM/yyyy HH:mm') : 'Nessuna (Continuo)' }}</td>
                  <td>
                    <button
                      (click)="toggleActive(avviso)"
                      class="badge"
                      [ngClass]="avviso.isActive ? 'badge-success' : 'badge-danger'"
                      style="cursor: pointer; border: none;"
                    >
                      {{ avviso.isActive ? 'Attivo' : 'Disattivato' }}
                    </button>
                  </td>
                  <td style="text-align: right;">
                    <div class="action-btns">
                      <button (click)="openEditModal(avviso)" class="btn-action edit" title="Modifica">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button (click)="deleteNotice(avviso)" class="btn-action delete" title="Elimina">
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
        [title]="editingId() ? 'Modifica Avviso' : 'Crea Nuovo Banner Avviso'"
        (closed)="closeModal()"
      >
        <form (ngSubmit)="saveNotice()">
          <div class="form-group">
            <label>Titolo Avviso *</label>
            <input type="text" class="form-control" [(ngModel)]="formData.title" name="title" required placeholder="Chiusura Straordinaria">
          </div>

          <div class="form-group">
            <label>Messaggio del Banner *</label>
            <textarea class="form-control" [(ngModel)]="formData.message" name="message" rows="3" required placeholder="Testo visibile a tutti i visitatori..."></textarea>
          </div>

          <div class="form-group">
            <label>Livello Gravità *</label>
            <select class="form-control" [(ngModel)]="formData.severity" name="severity" required>
              <option value="info">Info (Azzurro — Notizie e aperture)</option>
              <option value="warning">Warning (Arancione — Consigli e posti limitati)</option>
              <option value="danger">Danger (Rosso — Chiusure straordinarie o allerta)</option>
            </select>
          </div>

          <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Data Inizio</label>
              <input type="datetime-local" class="form-control" [(ngModel)]="startDateString" name="startDate">
            </div>
            <div class="form-group">
              <label>Data Fine (opzionale)</label>
              <input type="datetime-local" class="form-control" [(ngModel)]="endDateString" name="endDate">
            </div>
          </div>

          <div class="form-group" style="margin: 1.5rem 0;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" [(ngModel)]="formData.isActive" name="isActive">
              <strong>Banner attivo e visibile immediatamente</strong>
            </label>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" (click)="closeModal()" class="btn btn-outline btn-sm">Annulla</button>
            <button type="submit" class="btn btn-gold btn-sm" [disabled]="!formData.title || !formData.message">
              {{ editingId() ? 'Salva Modifiche' : 'Pubblica Avviso' }}
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
            max-width: 300px;
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
export class AvvisiManagementComponent implements OnInit {
  private avvisoService = inject(AvvisoService);

  public notices = signal<Avviso[]>([]);
  public isModalOpen = signal<boolean>(false);
  public editingId = signal<string | null>(null);
  public feedbackMsg = signal<string>('');
  public isError = signal<boolean>(false);

  public startDateString: string = '';
  public endDateString: string = '';

  public formData: Partial<Avviso> = {
    title: '',
    message: '',
    severity: 'info',
    isActive: true,
  };

  ngOnInit(): void {
    this.loadNotices();
  }

  loadNotices(): void {
    this.avvisoService.getAllAvvisi().subscribe({
      next: (res) => { if (res.success) this.notices.set(res.data); },
    });
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.formData = {
      title: '',
      message: '',
      severity: 'info',
      isActive: true,
    };
    this.startDateString = '';
    this.endDateString = '';
    this.isModalOpen.set(true);
  }

  openEditModal(avviso: Avviso): void {
    this.editingId.set(avviso.id || avviso._id || null);
    this.formData = {
      title: avviso.title,
      message: avviso.message,
      severity: avviso.severity,
      isActive: avviso.isActive,
    };
    this.startDateString = avviso.startDate ? new Date(avviso.startDate).toISOString().slice(0, 16) : '';
    this.endDateString = avviso.endDate ? new Date(avviso.endDate).toISOString().slice(0, 16) : '';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveNotice(): void {
    const payload: any = { ...this.formData };
    if (this.startDateString) payload.startDate = new Date(this.startDateString).toISOString();
    if (this.endDateString) payload.endDate = new Date(this.endDateString).toISOString();
    else payload.endDate = null;

    const id = this.editingId();
    if (id) {
      this.avvisoService.updateAvviso(id, payload).subscribe({
        next: () => {
          this.setFeedback('Avviso aggiornato con successo.');
          this.closeModal();
          this.loadNotices();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    } else {
      this.avvisoService.createAvviso(payload).subscribe({
        next: () => {
          this.setFeedback('Avviso pubblicato con successo.');
          this.closeModal();
          this.loadNotices();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    }
  }

  toggleActive(avviso: Avviso): void {
    const id = avviso.id || avviso._id;
    if (!id) return;
    this.avvisoService.updateAvviso(id, { isActive: !avviso.isActive }).subscribe({
      next: () => this.loadNotices(),
    });
  }

  deleteNotice(avviso: Avviso): void {
    const id = avviso.id || avviso._id;
    if (!id) return;
    if (confirm(`Eliminare l'avviso "${avviso.title}"?`)) {
      this.avvisoService.deleteAvviso(id).subscribe({
        next: () => {
          this.setFeedback('Avviso eliminato.');
          this.loadNotices();
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
