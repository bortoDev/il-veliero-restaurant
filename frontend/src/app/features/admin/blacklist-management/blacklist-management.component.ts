import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { BlacklistedToken } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-blacklist-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalComponent],
  template: `
    <div class="management-page">
      <div class="container">
        <div class="page-top-nav">
          <a routerLink="/admin/dashboard" class="back-link">
            <i class="fa-solid fa-arrow-left"></i> Torna alla Dashboard Admin
          </a>
        </div>

        <div class="management-header">
          <div>
            <h1>Gestione Blacklist Token JWT</h1>
            <p>Monitoraggio dei token di sessione revocati con indice automatico TTL e revoca manuale credenziali.</p>
          </div>
          <button (click)="openRevokeModal()" class="btn btn-danger">
            <i class="fa-solid fa-ban"></i> Revoca Nuovo Token
          </button>
        </div>

        <div *ngIf="feedbackMsg()" class="alert-box" [ngClass]="isError() ? 'alert-error' : 'alert-success'">
          <i class="fa-solid" [ngClass]="isError() ? 'fa-circle-xmark' : 'fa-circle-check'"></i>
          <span>{{ feedbackMsg() }}</span>
        </div>

        <div class="table-card card">
          <div class="table-filters">
            <input
              type="text"
              class="form-control table-search"
              placeholder="Cerca token o motivo revoca..."
              [(ngModel)]="searchFilter"
              (ngModelChange)="loadTokens()"
            >
            <label class="filter-check">
              <input type="checkbox" [(ngModel)]="activeOnly" (ngModelChange)="loadTokens()">
              <span>Mostra solo token ancora non scaduti</span>
            </label>
          </div>

          <div *ngIf="isLoading()" class="loading-state">
            <i class="fa-solid fa-spinner fa-spin"></i> Caricamento blacklist...
          </div>

          <div *ngIf="!isLoading() && tokens().length === 0" class="empty-state">
            <i class="fa-solid fa-shield-check"></i>
            <p>Nessun token attualmente presente nella blacklist.</p>
          </div>

          <div *ngIf="!isLoading() && tokens().length > 0" class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Snippet Token</th>
                  <th>Motivo Revoca</th>
                  <th>Data Revoca</th>
                  <th>Scadenza TTL</th>
                  <th>Tempo Residuo</th>
                  <th style="text-align: right;">Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of tokens()">
                  <td><code>{{ t.tokenSnippet || t.token }}</code></td>
                  <td><strong>{{ t.reason }}</strong></td>
                  <td>{{ t.revokedAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ t.expiresAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <span class="badge" [ngClass]="t.isExpired ? 'badge-secondary' : 'badge-warning'">
                      {{ t.isExpired ? 'Scaduto (in attesa TTL)' : formatTTL(t.ttlRemainingSeconds) }}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button
                      (click)="removeToken(t)"
                      class="btn-action delete"
                      title="Rimuovi dalla Blacklist"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Revoke Token Modal -->
      <app-modal
        *ngIf="isModalOpen()"
        title="Revoca Manuale Token JWT"
        (closed)="closeModal()"
      >
        <form (ngSubmit)="submitRevocation()">
          <div class="form-group">
            <label>Stringa Token JWT *</label>
            <textarea class="form-control" [(ngModel)]="tokenToRevoke" name="token" rows="4" required placeholder="Incolla qui la stringa del token Bearer..."></textarea>
          </div>

          <div class="form-group">
            <label>Motivo della Revoca *</label>
            <input type="text" class="form-control" [(ngModel)]="revokeReason" name="reason" required placeholder="es. Sessione compromessa da audit di sicurezza">
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" (click)="closeModal()" class="btn btn-outline btn-sm">Annulla</button>
            <button type="submit" class="btn btn-danger btn-sm" [disabled]="!tokenToRevoke">
              Conferma Revoca
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

      .table-filters {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1.5rem;

        .table-search { max-width: 320px; }

        .filter-check {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
        }
      }

      .table-responsive { overflow-x: auto; }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.9rem;

        th {
          background: var(--color-seafoam);
          color: var(--color-navy-dark);
          font-weight: 700;
          padding: 0.85rem 1rem;
          border-bottom: 2px solid var(--color-border);
        }

        td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--color-border);
          vertical-align: middle;

          code {
            background: #f1f5f9;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-size: 0.8rem;
            color: var(--color-navy-dark);
          }

          .badge-secondary { background: #e2e8f0; color: #475569; }

          .btn-action {
            background: transparent;
            border: 1px solid var(--color-border);
            border-radius: 4px;
            width: 32px;
            height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;

            &.delete { color: var(--color-danger); &:hover { background: var(--color-danger); color: #fff; } }
          }
        }
      }
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--color-text-muted);
    }
  `],
})
export class BlacklistManagementComponent implements OnInit {
  private adminService = inject(AdminService);

  public tokens = signal<BlacklistedToken[]>([]);
  public isLoading = signal<boolean>(false);
  public isModalOpen = signal<boolean>(false);
  public feedbackMsg = signal<string>('');
  public isError = signal<boolean>(false);

  public searchFilter: string = '';
  public activeOnly: boolean = false;

  public tokenToRevoke: string = '';
  public revokeReason: string = 'Revoca manuale amministrativa';

  ngOnInit(): void {
    this.loadTokens();
  }

  loadTokens(): void {
    this.isLoading.set(true);

    const params: any = {};
    if (this.searchFilter.trim()) params.search = this.searchFilter.trim();
    if (this.activeOnly) params.activeOnly = true;

    this.adminService.getBlacklistedTokens(params).subscribe({
      next: (res) => {
        if (res.success) this.tokens.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openRevokeModal(): void {
    this.tokenToRevoke = '';
    this.revokeReason = 'Revoca manuale amministrativa';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  submitRevocation(): void {
    if (!this.tokenToRevoke.trim()) return;

    this.adminService.blacklistToken({
      token: this.tokenToRevoke.trim(),
      reason: this.revokeReason,
    }).subscribe({
      next: () => {
        this.setFeedback('Token aggiunto alla blacklist con successo.');
        this.closeModal();
        this.loadTokens();
      },
      error: (err) => this.setFeedback(err.message, true),
    });
  }

  removeToken(item: BlacklistedToken): void {
    if (confirm('Sei sicuro di voler rimuovere questo token dalla blacklist?')) {
      this.adminService.removeFromBlacklist(item.token).subscribe({
        next: () => {
          this.setFeedback('Token rimosso dalla blacklist.');
          this.loadTokens();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    }
  }

  formatTTL(seconds?: number): string {
    if (!seconds || seconds <= 0) return 'Scaduto';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds % 60}s`;
  }

  private setFeedback(msg: string, isErr = false): void {
    this.feedbackMsg.set(msg);
    this.isError.set(isErr);
    setTimeout(() => this.feedbackMsg.set(''), 4000);
  }
}
