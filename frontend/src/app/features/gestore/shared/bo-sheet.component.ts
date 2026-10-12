import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoIconComponent } from './bo-icon.component';

/**
 * Pannello di modifica del back-office: scorre da destra su desktop e occupa
 * tutto lo schermo su telefono, con i pulsanti di salvataggio sempre visibili in basso.
 */
@Component({
  selector: 'bo-sheet',
  standalone: true,
  imports: [CommonModule, BoIconComponent],
  template: `
    <div class="sheet-backdrop" (click)="closed.emit()"></div>
    <aside class="sheet" role="dialog" aria-modal="true" [attr.aria-label]="title">
      <header class="sheet-head">
        <h2>{{ title }}</h2>
        <button type="button" class="close-btn" (click)="closed.emit()" aria-label="Chiudi">
          <bo-icon name="close" [size]="22"></bo-icon>
        </button>
      </header>
      <div class="sheet-body">
        <ng-content></ng-content>
      </div>
      <footer class="sheet-foot">
        <ng-content select="[sheet-footer]"></ng-content>
      </footer>
    </aside>
  `,
  styles: [`
    .sheet-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(11, 28, 46, 0.45);
      z-index: 2000;
      animation: fade 0.2s ease;
    }

    .sheet {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(560px, 100vw);
      background: var(--bg-primary);
      z-index: 2001;
      display: flex;
      flex-direction: column;
      box-shadow: -12px 0 32px rgba(11, 28, 46, 0.18);
      animation: slide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .sheet-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);

      h2 {
        font-family: var(--font-heading);
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
      }
    }

    .close-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--text-stone);
      cursor: pointer;

      &:hover { background: var(--bg-surface-alt); }
    }

    .sheet-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem;
    }

    .sheet-foot {
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
      padding: 0.9rem 1.25rem calc(0.9rem + env(safe-area-inset-bottom));
      background: var(--bg-surface);
      border-top: 1px solid var(--border-subtle);

      &:empty { display: none; }
    }

    @keyframes slide { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  `],
})
export class BoSheetComponent {
  @Input() title = '';
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }
}
