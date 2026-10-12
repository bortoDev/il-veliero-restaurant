import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PescatoService } from '../../../core/services/pescato.service';
import { PescatoItem } from '../../../core/models';
import { BoIconComponent } from '../shared/bo-icon.component';
import { BoSheetComponent } from '../shared/bo-sheet.component';
import { PhotoPickerComponent } from '../shared/photo-picker.component';
import { entityId, formatDayLabel, isSameDay, toLocalDateInput } from '../shared/bo-utils';

interface PescatoForm {
  title: string;
  description: string;
  catchDate: string;
  images: string[];
}

@Component({
  selector: 'app-pescato-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BoIconComponent, BoSheetComponent, PhotoPickerComponent],
  template: `
    <div class="bo-page">
      <header class="bo-header">
        <div>
          <h1>Pescato del giorno</h1>
          <p>Ogni post appare nel Diario del Pescato del sito, dal più recente.</p>
        </div>
        <button type="button" class="bo-btn primary" (click)="openCreate()">
          <bo-icon name="plus"></bo-icon> Pubblica pescato
        </button>
      </header>

      <section class="bo-panel">
        <ul class="bo-list" *ngIf="catches().length > 0; else empty">
          <li class="bo-row" *ngFor="let item of catches()">
            <img class="bo-thumb" *ngIf="cover(item) as src; else noPhoto" [src]="src" [alt]="item.title" />
            <ng-template #noPhoto><span class="bo-thumb placeholder"><bo-icon name="fish"></bo-icon></span></ng-template>
            <div class="bo-row-main">
              <div class="bo-row-title">{{ item.title }}</div>
              <div class="bo-row-sub">
                <span class="bo-chip ok" *ngIf="isToday(item)">Oggi</span>
                <ng-container *ngIf="!isToday(item)">{{ dayLabel(item.catchDate) }}</ng-container>
                · {{ photoCount(item) }} foto
              </div>
            </div>
            <div class="bo-row-actions">
              <button type="button" class="bo-btn small" (click)="openEdit(item)">
                <bo-icon name="edit" [size]="16"></bo-icon> Modifica
              </button>
              <button type="button" class="bo-btn small danger-ghost" (click)="remove(item)" [attr.aria-label]="'Elimina ' + item.title">
                <bo-icon name="trash" [size]="16"></bo-icon>
              </button>
            </div>
          </li>
        </ul>
        <ng-template #empty>
          <div class="bo-empty">
            <strong>Nessun post nel diario</strong>
            <p>Fotografa gli arrivi del mattino e pubblicali: compariranno subito sul sito.</p>
            <button type="button" class="bo-btn primary" (click)="openCreate()">Pubblica il primo pescato</button>
          </div>
        </ng-template>
      </section>
    </div>

    <bo-sheet *ngIf="isEditorOpen()" [title]="editingId() ? 'Modifica pescato' : 'Pubblica pescato'" (closed)="closeEditor()">
      <form class="bo-form" id="pescato-form" (ngSubmit)="save()">
        <div class="bo-field">
          <span class="bo-label">Foto</span>
          <bo-photo-picker [(images)]="form.images"></bo-photo-picker>
          <span class="hint">La prima foto è la copertina. Puoi caricarne più di una.</span>
        </div>

        <div class="bo-field">
          <label for="p-title">Cosa è arrivato</label>
          <input id="p-title" name="title" [(ngModel)]="form.title" required placeholder="Es. Orata selvaggia dell'Adriatico" />
        </div>

        <div class="bo-field">
          <label for="p-desc">Descrizione</label>
          <textarea id="p-desc" name="description" rows="5" [(ngModel)]="form.description" required
            placeholder="Da dove arriva, com'è, come lo consiglia lo chef…"></textarea>
        </div>

        <div class="bo-field">
          <label for="p-date">Data</label>
          <input id="p-date" name="catchDate" type="date" [(ngModel)]="form.catchDate" required />
        </div>
      </form>

      <ng-container sheet-footer>
        <button type="button" class="bo-btn" (click)="closeEditor()">Annulla</button>
        <button type="submit" form="pescato-form" class="bo-btn primary" [disabled]="isSaving() || !form.title.trim() || !form.description.trim()">
          {{ isSaving() ? 'Salvataggio…' : (editingId() ? 'Salva modifiche' : 'Pubblica') }}
        </button>
      </ng-container>
    </bo-sheet>

    <div class="bo-toast" *ngIf="toast() as t" [class.error]="t.error">{{ t.text }}</div>
  `,
  styles: [`
    .placeholder {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--text-light);
    }
  `],
})
export class PescatoManagementComponent implements OnInit {
  private pescatoService = inject(PescatoService);
  private route = inject(ActivatedRoute);

  catches = signal<PescatoItem[]>([]);
  isEditorOpen = signal(false);
  editingId = signal<string | null>(null);
  isSaving = signal(false);
  toast = signal<{ text: string; error: boolean } | null>(null);

  form: PescatoForm = this.emptyForm();

  ngOnInit(): void {
    this.load();
    if (this.route.snapshot.queryParamMap.get('nuovo')) this.openCreate();
  }

  load(): void {
    this.pescatoService.getPescatoList({ all: true }).subscribe({
      next: (res) => {
        const sorted = [...(res.data || [])].sort((a, b) => +new Date(b.catchDate) - +new Date(a.catchDate));
        this.catches.set(sorted);
      },
    });
  }

  images(item: PescatoItem): string[] {
    const list = (item.images || []).filter((s) => !!s && s.trim());
    if (list.length) return list;
    return item.image ? [item.image] : [];
  }

  cover(item: PescatoItem): string | null {
    return this.images(item)[0] ?? null;
  }

  photoCount(item: PescatoItem): number {
    return this.images(item).length;
  }

  isToday(item: PescatoItem): boolean {
    return isSameDay(new Date(item.catchDate), new Date());
  }

  dayLabel(d: string): string {
    return formatDayLabel(d);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form = this.emptyForm();
    this.isEditorOpen.set(true);
  }

  openEdit(item: PescatoItem): void {
    this.editingId.set(entityId(item));
    this.form = {
      title: item.title,
      description: item.description,
      catchDate: toLocalDateInput(item.catchDate) || toLocalDateInput(new Date()),
      images: this.images(item),
    };
    this.isEditorOpen.set(true);
  }

  closeEditor(): void {
    this.isEditorOpen.set(false);
  }

  save(): void {
    const payload: Partial<PescatoItem> = {
      title: this.form.title.trim(),
      description: this.form.description.trim(),
      catchDate: this.form.catchDate,
      images: this.form.images,
      image: this.form.images[0] || '',
      isAvailable: true,
    };

    const id = this.editingId();
    const request = id ? this.pescatoService.updatePescato(id, payload) : this.pescatoService.createPescato(payload);
    this.isSaving.set(true);
    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeEditor();
        this.showToast(id ? 'Modifiche salvate.' : 'Pescato pubblicato sul sito.');
        this.load();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showToast(err.message || 'Salvataggio non riuscito.', true);
      },
    });
  }

  remove(item: PescatoItem): void {
    if (!confirm(`Eliminare «${item.title}» dal diario?`)) return;
    this.pescatoService.deletePescato(entityId(item)).subscribe({
      next: () => {
        this.showToast('Post eliminato.');
        this.load();
      },
      error: (err) => this.showToast(err.message || 'Eliminazione non riuscita.', true),
    });
  }

  private emptyForm(): PescatoForm {
    return { title: '', description: '', catchDate: toLocalDateInput(new Date()), images: [] };
  }

  private showToast(text: string, error = false): void {
    this.toast.set({ text, error });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
