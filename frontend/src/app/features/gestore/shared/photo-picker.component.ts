import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../../core/services/upload.service';
import { BoIconComponent } from './bo-icon.component';

/**
 * Selettore foto del back-office: scatta o sceglie le foto dal telefono,
 * le ottimizza e carica, mostra le anteprime. La prima foto è la copertina.
 */
@Component({
  selector: 'bo-photo-picker',
  standalone: true,
  imports: [CommonModule, BoIconComponent],
  template: `
    <div class="picker">
      <div class="thumbs" *ngIf="images.length > 0">
        <figure *ngFor="let url of images; let i = index" class="thumb">
          <img *ngIf="!broken.has(url); else missing" [src]="url" [alt]="'Foto ' + (i + 1)" (error)="broken.add(url)" />
          <ng-template #missing><span class="missing">Foto non trovata</span></ng-template>
          <span class="cover-tag" *ngIf="i === 0 && multiple">Copertina</span>
          <button type="button" class="remove" (click)="remove(i)" [attr.aria-label]="'Rimuovi foto ' + (i + 1)">
            <bo-icon name="close" [size]="16"></bo-icon>
          </button>
        </figure>
      </div>

      <label class="add" *ngIf="multiple || images.length === 0" [class.busy]="isUploading()">
        <input type="file" accept="image/*" [multiple]="multiple" (change)="onFiles($event)" [disabled]="isUploading()" />
        <bo-icon name="camera" [size]="22"></bo-icon>
        <span>{{ isUploading() ? 'Caricamento in corso…' : (images.length ? 'Aggiungi altre foto' : 'Scatta o scegli una foto') }}</span>
      </label>
      <p class="error" *ngIf="error()">{{ error() }}</p>
    </div>
  `,
  styles: [`
    .thumbs {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
      gap: 0.6rem;
      margin-bottom: 0.6rem;
    }

    .thumb {
      position: relative;
      margin: 0;
      aspect-ratio: 1;
      border-radius: 6px;
      overflow: hidden;
      background: var(--bg-surface-alt);

      img { width: 100%; height: 100%; object-fit: cover; }

      .missing {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 0.5rem;
        text-align: center;
        font-size: 0.72rem;
        color: var(--text-muted);
      }
    }

    .cover-tag {
      position: absolute;
      left: 4px;
      bottom: 4px;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      background: rgba(11, 28, 46, 0.75);
      color: #FFFFFF;
      font-size: 0.68rem;
      font-weight: 600;
    }

    .remove {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.92);
      color: var(--text-primary);
      cursor: pointer;
    }

    .add {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      min-height: 64px;
      border: 1.5px dashed var(--border-medium);
      border-radius: 8px;
      background: var(--bg-surface);
      color: var(--color-accent-hover);
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;

      input { display: none; }
      &:hover { border-color: var(--color-accent); background: var(--color-accent-subtle); }
      &.busy { opacity: 0.6; cursor: progress; }
    }

    .error { color: var(--status-danger); font-size: 0.85rem; margin: 0.5rem 0 0; }
  `],
})
export class PhotoPickerComponent {
  private uploadService = inject(UploadService);

  @Input() images: string[] = [];
  @Input() multiple = true;
  @Output() imagesChange = new EventEmitter<string[]>();

  /** Foto salvate che non si caricano più (file rimosso dal server). */
  broken = new Set<string>();
  isUploading = signal(false);
  error = signal('');

  remove(index: number): void {
    this.imagesChange.emit(this.images.filter((_, i) => i !== index));
  }

  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length === 0) return;

    this.isUploading.set(true);
    this.error.set('');
    const uploaded: string[] = [];
    let pending = files.length;

    const finish = () => {
      if (--pending > 0) return;
      this.isUploading.set(false);
      input.value = '';
      const base = this.multiple ? this.images : [];
      this.imagesChange.emit([...base, ...uploaded]);
    };

    for (const file of files) {
      this.uploadService.uploadImage(file, 1600, 0.85).subscribe({
        next: (res) => {
          if (res.success && res.url) uploaded.push(res.url);
          finish();
        },
        error: (err) => {
          this.error.set(`Non è stato possibile caricare ${file.name}: ${err.message || 'errore di rete'}.`);
          finish();
        },
      });
    }
  }
}
