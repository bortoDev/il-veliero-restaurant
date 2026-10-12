import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PescatoService } from '../../../core/services/pescato.service';
import { UploadService } from '../../../core/services/upload.service';
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
            <p>Registra il pesce fresco dell'asta mattutina e gestisci le fotografie d'autore e i racconti culinari.</p>
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
                  <th>Data Arrivo</th>
                  <th>Fotografie</th>
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
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <img
                        [src]="getPostImages(item)[0]"
                        [alt]="item.title"
                        style="width: 44px; height: 32px; object-fit: cover; border-radius: 2px;"
                        (error)="onImgFallback($event)"
                      />
                      <span style="font-size: 0.8rem; color: var(--color-text-muted);">
                        {{ getPostImages(item).length }} {{ getPostImages(item).length === 1 ? 'scatto' : 'scatti' }}
                      </span>
                    </div>
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
        [title]="editingId() ? 'Modifica Post Pescato' : 'Registra Pescato di Oggi'"
        (closed)="closeModal()"
      >
        <form (ngSubmit)="saveCatch()">
          <div class="form-group">
            <label>Titolo / Specie *</label>
            <input type="text" class="form-control" [(ngModel)]="formData.title" name="title" required placeholder="Dentice nostrano dell'Adriatico">
          </div>

          <div class="form-group">
            <label>Descrizione & Consigli di Cottura *</label>
            <textarea class="form-control" [(ngModel)]="formData.description" name="description" rows="4" required placeholder="Racconta la freschezza, le caratteristiche del pescato e le preparazioni consigliate dallo Chef..."></textarea>
          </div>

          <div class="form-group">
            <label>Data di Arrivo</label>
            <input type="date" class="form-control" [(ngModel)]="formCatchDate" name="catchDate">
          </div>

          <div class="form-group">
            <label>Fotografie Carosello (Standard Instagram 1080px)</label>
            <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap;">
              <label class="btn btn-outline btn-sm" style="cursor: pointer; margin: 0; display: inline-flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-cloud-arrow-up"></i> Carica Immagini (1080px)
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  style="display: none;"
                  (change)="onFilesSelected($event)"
                  [disabled]="isUploading()"
                />
              </label>
              <span *ngIf="isUploading()" style="font-size: 0.85rem; color: var(--color-gold); display: inline-flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-spinner fa-spin"></i> Ottimizzazione Instagram 1080px e upload...
              </span>
            </div>

            <!-- Preview thumbnails -->
            <div *ngIf="getParsedImagesList().length > 0" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
              <div
                *ngFor="let url of getParsedImagesList(); let imgIdx = index"
                style="position: relative; width: 64px; height: 64px; border-radius: 4px; overflow: hidden; border: 1px solid var(--color-border); background: #0f172a;"
              >
                <img [src]="url" style="width: 100%; height: 100%; object-fit: cover;" (error)="onImgFallback($event)" />
                <button
                  type="button"
                  (click)="removeImage(imgIdx)"
                  style="position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; background: rgba(0,0,0,0.65); color: #fff; border: none; border-radius: 50%; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;"
                  title="Rimuovi"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
                <span *ngIf="imgIdx === 0" style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(197, 168, 128, 0.9); color: #000; font-size: 9px; font-weight: 700; text-align: center; text-transform: uppercase;">
                  1° Slide
                </span>
              </div>
            </div>

            <textarea class="form-control" [(ngModel)]="formImagesText" name="imagesText" rows="2" placeholder="assets/images/cards/card-pescato.jpg&#10;/uploads/media-...jpg"></textarea>
            <small style="display: block; font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.35rem;">
              La prima foto definisce il rapporto d'aspetto dell'intero carosello. Tutte le successive si adatteranno con ritaglio centrato (Auto-crop).
            </small>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" (click)="closeModal()" class="btn btn-outline btn-sm">Annulla</button>
            <button type="submit" class="btn btn-gold btn-sm" [disabled]="!formData.title || !formData.description">
              {{ editingId() ? 'Salva Modifiche' : 'Pubblica Pescato' }}
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
  private uploadService = inject(UploadService);

  public catches = signal<PescatoItem[]>([]);
  public isModalOpen = signal<boolean>(false);
  public editingId = signal<string | null>(null);
  public feedbackMsg = signal<string>('');
  public isError = signal<boolean>(false);
  public isUploading = signal<boolean>(false);

  public formCatchDate = new Date().toISOString().split('T')[0];
  public formImagesText = 'assets/images/cards/card-pescato.jpg';

  public formData: Partial<PescatoItem> = {
    title: '',
    description: '',
    price: 0,
    isAvailable: true,
  };

  getParsedImagesList(): string[] {
    return this.formImagesText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  removeImage(indexToRemove: number): void {
    const list = this.getParsedImagesList();
    if (indexToRemove >= 0 && indexToRemove < list.length) {
      list.splice(indexToRemove, 1);
      this.formImagesText = list.join('\n');
    }
  }

  onFilesSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target?.files;
    if (!files || files.length === 0) return;

    this.isUploading.set(true);
    const fileList = Array.from(files);
    let completed = 0;
    const newUrls: string[] = [];

    fileList.forEach((file) => {
      this.uploadService.uploadInstagramPhoto(file).subscribe({
        next: (res) => {
          if (res.success && res.url) {
            newUrls.push(res.url);
          }
          completed++;
          if (completed === fileList.length) {
            this.isUploading.set(false);
            const currentList = this.getParsedImagesList().filter((u) => u !== 'assets/images/cards/card-pescato.jpg');
            this.formImagesText = [...currentList, ...newUrls].join('\n');
            this.setFeedback(`${newUrls.length} ${newUrls.length === 1 ? 'foto caricata' : 'foto caricate'} a standard 1080px.`);
            target.value = '';
          }
        },
        error: (err) => {
          completed++;
          if (completed === fileList.length) {
            this.isUploading.set(false);
            target.value = '';
          }
          this.setFeedback(`Errore nel caricamento di ${file.name}: ${err.message}`, true);
        },
      });
    });
  }

  ngOnInit(): void {
    this.loadCatches();
  }

  loadCatches(): void {
    this.pescatoService.getPescatoList({ all: true }).subscribe({
      next: (res) => { if (res.success) this.catches.set(res.data); },
    });
  }

  getPostImages(item: PescatoItem): string[] {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const valid = item.images
        .filter((img) => typeof img === 'string' && img.trim().length > 0)
        .map((img) => img.trim());
      if (valid.length > 0) return valid;
    }
    if (item.image && typeof item.image === 'string' && item.image.trim().length > 0) {
      const parts = item.image
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (parts.length > 0) return parts;
    }
    return ['assets/images/cards/card-pescato.jpg'];
  }

  onImgFallback(event: any): void {
    const target = event?.target as HTMLImageElement;
    if (target && !target.src.includes('card-pescato.jpg')) {
      target.src = 'assets/images/cards/card-pescato.jpg';
    }
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.formData = {
      title: '',
      description: '',
      price: 0,
      isAvailable: true,
    };
    this.formCatchDate = new Date().toISOString().split('T')[0];
    this.formImagesText = 'assets/images/cards/card-pescato.jpg';
    this.isModalOpen.set(true);
  }

  openEditModal(item: PescatoItem): void {
    this.editingId.set(item.id || item._id || null);
    this.formData = {
      title: item.title,
      description: item.description,
      price: 0,
      isAvailable: true,
    };
    this.formCatchDate = item.catchDate
      ? new Date(item.catchDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    const images = this.getPostImages(item);
    this.formImagesText = images.join('\n');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveCatch(): void {
    const parsedImages = this.formImagesText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload: any = {
      title: (this.formData.title || '').trim(),
      description: (this.formData.description || '').trim(),
      catchDate: this.formCatchDate,
      image: parsedImages[0] || 'assets/images/cards/card-pescato.jpg',
      images: parsedImages,
      price: 0,
      isAvailable: true,
      marketLocation: 'Mercato Ittico di Chioggia',
    };

    const id = this.editingId();
    if (id) {
      this.pescatoService.updatePescato(id, payload).subscribe({
        next: () => {
          this.setFeedback('Pescato aggiornato con successo.');
          this.closeModal();
          this.loadCatches();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    } else {
      this.pescatoService.createPescato(payload).subscribe({
        next: () => {
          this.setFeedback('Nuova voce pescato registrata con successo.');
          this.closeModal();
          this.loadCatches();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    }
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
