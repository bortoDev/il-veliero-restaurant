import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AuditLog } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-audit-log-viewer',
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
            <h1>Registro Audit delle Operazioni</h1>
            <p>Tracciamento granulare di ogni operazione: login, recuperi d'emergenza, mutazioni dati e revoche token con identificativo operatore.</p>
          </div>
          <div class="header-actions">
            <button (click)="resetFilters()" class="btn btn-outline btn-sm">
              <i class="fa-solid fa-filter-circle-xmark"></i> Reimposta Filtri
            </button>
            <button (click)="loadLogs()" class="btn btn-gold btn-sm">
              <i class="fa-solid fa-arrows-rotate"></i> Aggiorna
            </button>
          </div>
        </div>

        <!-- Filter Card -->
        <div class="filters-card card">
          <div class="filters-grid">
            <div class="form-group">
              <label>Operatore (Username o Email)</label>
              <div class="input-icon-wrap">
                <i class="fa-solid fa-user-tag"></i>
                <input
                  type="text"
                  class="form-control"
                  placeholder="es. gestore o bortolatofilippo05@gmail.com"
                  [(ngModel)]="operatorFilter"
                  (ngModelChange)="loadLogs()"
                >
              </div>
            </div>

            <div class="form-group">
              <label>Tipo di Azione</label>
              <input
                type="text"
                class="form-control"
                placeholder="es. AUTH_LOGIN, GLOBAL_LOGOUT, CREATE_USER..."
                [(ngModel)]="actionFilter"
                (ngModelChange)="loadLogs()"
              >
            </div>

            <div class="form-group">
              <label>Stato Esito</label>
              <select class="form-control" [(ngModel)]="statusFilter" (ngModelChange)="loadLogs()">
                <option value="">Tutti gli Esiti</option>
                <option value="SUCCESS">SUCCESS (Successo)</option>
                <option value="FAILURE">FAILURE (Fallimento / Bloccato)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Ruolo Operatore</label>
              <select class="form-control" [(ngModel)]="roleFilter" (ngModelChange)="loadLogs()">
                <option value="">Tutti i Ruoli</option>
                <option value="admin">Admin</option>
                <option value="gestore">Gestore</option>
                <option value="client">Client</option>
                <option value="anonymous">Anonimo</option>
              </select>
            </div>

            <div class="form-group">
              <label>Da Data (Inizio)</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="startDateFilter"
                (ngModelChange)="loadLogs()"
              >
            </div>

            <div class="form-group">
              <label>A Data (Fine)</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="endDateFilter"
                (ngModelChange)="loadLogs()"
              >
            </div>
          </div>

          <!-- Quick Action Badges -->
          <div class="quick-action-tags">
            <span class="quick-title">Filtro Rapido Azioni:</span>
            <button
              type="button"
              class="tag-btn"
              [ngClass]="{'active': !actionFilter}"
              (click)="setActionFilter('')"
            >Tutte</button>
            <button
              type="button"
              class="tag-btn"
              [ngClass]="{'active': actionFilter === 'AUTH_LOGIN'}"
              (click)="setActionFilter('AUTH_LOGIN')"
            >AUTH_LOGIN</button>
            <button
              type="button"
              class="tag-btn"
              [ngClass]="{'active': actionFilter === 'GLOBAL_LOGOUT'}"
              (click)="setActionFilter('GLOBAL_LOGOUT')"
            >GLOBAL_LOGOUT</button>
            <button
              type="button"
              class="tag-btn"
              [ngClass]="{'active': actionFilter === 'EMERGENCY_RECOVERY'}"
              (click)="setActionFilter('EMERGENCY_RECOVERY')"
            >EMERGENCY_RECOVERY</button>
            <button
              type="button"
              class="tag-btn"
              [ngClass]="{'active': actionFilter === 'CREATE_USER'}"
              (click)="setActionFilter('CREATE_USER')"
            >CREATE_USER</button>
          </div>
        </div>

        <!-- Audit Table Card -->
        <div class="table-card card mt-4" style="margin-top: 1.5rem;">
          <div *ngIf="isLoading()" class="loading-state">
            <i class="fa-solid fa-spinner fa-spin"></i> Caricamento registri audit...
          </div>

          <div *ngIf="!isLoading() && logs().length === 0" class="empty-state">
            <i class="fa-solid fa-clipboard-check"></i>
            <p>Nessun evento audit corrisponde ai filtri selezionati.</p>
          </div>

          <div *ngIf="!isLoading() && logs().length > 0" class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Data & Ora</th>
                  <th>Azione</th>
                  <th>Risorsa</th>
                  <th>Operatore (Username / Email)</th>
                  <th>Ruolo</th>
                  <th>IP Client</th>
                  <th>Esito</th>
                  <th style="text-align: right;">Dettagli</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of logs()">
                  <td style="white-space: nowrap;">{{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                  <td>
                    <strong class="action-tag" [ngClass]="{
                      'tag-auth': log.action.includes('AUTH') || log.action.includes('LOGIN'),
                      'tag-emergency': log.action.includes('EMERGENCY') || log.action.includes('LOGOUT'),
                      'tag-user': log.action.includes('USER')
                    }">
                      {{ log.action }}
                    </strong>
                  </td>
                  <td>{{ log.resource }}</td>
                  <td>
                    <div class="operator-wrap">
                      <i class="fa-solid" [ngClass]="log.username ? 'fa-at' : (log.userEmail ? 'fa-envelope' : 'fa-user-secret')"></i>
                      <span>{{ getOperatorLabel(log) }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'badge-gold': log.role === 'admin',
                      'badge-info': log.role === 'gestore',
                      'badge-secondary': log.role === 'client' || log.role === 'anonymous'
                    }">{{ log.role }}</span>
                  </td>
                  <td><code>{{ log.ipAddress }}</code></td>
                  <td>
                    <span class="badge" [ngClass]="log.status === 'SUCCESS' ? 'badge-success' : 'badge-danger'">
                      {{ log.status }}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button (click)="inspectLog(log)" class="btn-inspect" title="Esamina Payload Completo">
                      <i class="fa-solid fa-magnifying-glass-plus"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Detail Modal -->
      <app-modal
        *ngIf="selectedLog() as log"
        [title]="'Dettagli Evento: ' + log.action"
        (closed)="closeModal()"
      >
        <div class="log-details-modal">
          <div class="log-meta-grid">
            <div><strong>ID Evento:</strong> <code>{{ log.id }}</code></div>
            <div><strong>Data & Ora:</strong> {{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</div>
            <div><strong>Operatore:</strong> {{ getOperatorLabel(log) }}</div>
            <div><strong>Ruolo Operatore:</strong> {{ log.role }}</div>
            <div><strong>Risorsa Coinvolta:</strong> {{ log.resource }} <span *ngIf="log.resourceId">({{ log.resourceId }})</span></div>
            <div><strong>IP Origine:</strong> <code>{{ log.ipAddress }}</code></div>
            <div>
              <strong>Esito:</strong>
              <span class="badge" [ngClass]="log.status === 'SUCCESS' ? 'badge-success' : 'badge-danger'" style="margin-left: 0.5rem;">
                {{ log.status }}
              </span>
            </div>
            <div style="grid-column: 1 / -1;">
              <strong>User-Agent:</strong> <span class="ua-text">{{ log.userAgent || '—' }}</span>
            </div>
          </div>

          <h4 style="margin-top: 1.5rem; margin-bottom: 0.5rem; color: var(--color-navy-dark);">
            <i class="fa-solid fa-code"></i> Dati Payload & Parametri (JSON)
          </h4>
          <pre class="json-viewer"><code>{{ formatDetails(log.details) }}</code></pre>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
            <button (click)="closeModal()" class="btn btn-gold btn-sm">Chiudi</button>
          </div>
        </div>
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
      margin-bottom: 1.5rem;
      h1 { font-size: 2.2rem; color: var(--color-navy-dark); margin-bottom: 0.25rem; }
      p { color: var(--color-text-muted); margin-bottom: 0; }

      .header-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }
    }

    .filters-card {
      padding: 1.5rem;

      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 1rem;
        .form-group { margin-bottom: 0; }
      }

      .input-icon-wrap {
        position: relative;
        i {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-light);
        }
        .form-control {
          padding-left: 2.4rem;
        }
      }

      .quick-action-tags {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 1.25rem;
        padding-top: 1rem;
        border-top: 1px solid var(--color-border);

        .quick-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }

        .tag-btn {
          background: var(--color-seafoam);
          border: 1px solid var(--color-border);
          color: var(--color-navy-dark);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.25rem 0.65rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all var(--transition-fast);

          &:hover {
            background: var(--color-gold);
            color: var(--color-navy-dark);
          }

          &.active {
            background: var(--color-navy-dark);
            color: #ffffff;
            border-color: var(--color-navy-dark);
          }
        }
      }
    }

    .table-card {
      padding: 1.5rem;
      .table-responsive { overflow-x: auto; }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.88rem;

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

          .action-tag {
            font-family: monospace;
            font-size: 0.82rem;
            color: var(--color-navy-dark);
            background: #f1f5f9;
            padding: 0.2rem 0.45rem;
            border-radius: 4px;

            &.tag-auth { background: #e0f2fe; color: #0369a1; }
            &.tag-emergency { background: #fee2e2; color: #b91c1c; }
            &.tag-user { background: #fef3c7; color: #b45309; }
          }

          .operator-wrap {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.85rem;
            color: var(--color-navy-dark);

            i {
              color: var(--color-navy-medium);
              font-size: 0.8rem;
            }
          }

          .badge-secondary {
            background: #e2e8f0;
            color: #475569;
          }

          code {
            background: #f1f5f9;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-size: 0.8rem;
          }

          .btn-inspect {
            background: transparent;
            border: 1px solid var(--color-border);
            border-radius: 4px;
            width: 32px;
            height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--color-navy-medium);

            &:hover { background: var(--color-navy-medium); color: #fff; }
          }
        }
      }
    }

    .log-details-modal {
      .log-meta-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        font-size: 0.88rem;
        background: var(--color-seafoam);
        padding: 1.25rem;
        border-radius: 8px;

        .ua-text {
          font-size: 0.78rem;
          word-break: break-all;
          color: var(--color-text-muted);
        }
      }

      .json-viewer {
        background: #0b2545;
        color: #8da9c4;
        padding: 1.25rem;
        border-radius: 8px;
        font-family: monospace;
        font-size: 0.82rem;
        max-height: 280px;
        overflow-y: auto;
        white-space: pre-wrap;
      }
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--color-text-muted);
    }
  `],
})
export class AuditLogViewerComponent implements OnInit {
  private adminService = inject(AdminService);

  public logs = signal<AuditLog[]>([]);
  public isLoading = signal<boolean>(false);
  public selectedLog = signal<AuditLog | null>(null);

  public operatorFilter: string = '';
  public actionFilter: string = '';
  public statusFilter: string = '';
  public roleFilter: string = '';
  public startDateFilter: string = '';
  public endDateFilter: string = '';

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading.set(true);

    const params: any = {};
    if (this.operatorFilter.trim()) params.operator = this.operatorFilter.trim();
    if (this.actionFilter.trim()) params.action = this.actionFilter.trim();
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.roleFilter) params.role = this.roleFilter;
    if (this.startDateFilter) params.startDate = this.startDateFilter;
    if (this.endDateFilter) params.endDate = this.endDateFilter;

    this.adminService.getAuditLogs(params).subscribe({
      next: (res) => {
        if (res.success) this.logs.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setActionFilter(action: string): void {
    this.actionFilter = action;
    this.loadLogs();
  }

  resetFilters(): void {
    this.operatorFilter = '';
    this.actionFilter = '';
    this.statusFilter = '';
    this.roleFilter = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.loadLogs();
  }

  getOperatorLabel(log: AuditLog): string {
    return log.operator || log.username || log.userEmail || (log.user ? `ID:${log.user.slice(-6)}` : 'Anonimo');
  }

  inspectLog(log: AuditLog): void {
    this.selectedLog.set(log);
  }

  closeModal(): void {
    this.selectedLog.set(null);
  }

  formatDetails(details: any): string {
    return JSON.stringify(details || {}, null, 2);
  }
}
