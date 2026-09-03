import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuditLog, BlacklistedToken } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-security-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalComponent],
  template: `
    <div class="security-hub-page">
      <div class="container">
        <!-- Header -->
        <div class="hub-header">
          <div class="header-titles">
            <div class="badges-row">
              <span class="badge badge-tech"><i class="fa-solid fa-server"></i> Centro Tecnico</span>
              <span class="badge badge-admin"><i class="fa-solid fa-shield-halved"></i> Solo Amministratori</span>
              <span *ngIf="authService.isMasterAdmin()" class="badge badge-crown">
                <i class="fa-solid fa-crown"></i> Master Admin
              </span>
            </div>
            <h1>Gestione Tecnica, Audit Log & Blacklist</h1>
            <p>Monitoraggio di sicurezza avanzato, tracciamento delle attività, blocco credenziali compromesse e cambio password.</p>
          </div>

          <div class="header-actions">
            <button (click)="openChangePasswordModal()" class="btn btn-gold btn-sm">
              <i class="fa-solid fa-key"></i> Cambia la Mia Password
            </button>
            <button (click)="triggerGlobalLogout()" class="btn btn-danger btn-sm" [disabled]="isLoggingOutAll()">
              <i class="fa-solid fa-power-off"></i> Disconnetti Tutti i Dispositivi
            </button>
          </div>
        </div>

        <!-- Alert messages -->
        <div *ngIf="successMessage()" class="alert alert-success">
          <i class="fa-solid fa-circle-check"></i> {{ successMessage() }}
        </div>
        <div *ngIf="errorMessage()" class="alert alert-danger">
          <i class="fa-solid fa-triangle-exclamation"></i> {{ errorMessage() }}
        </div>

        <!-- Navigation Tabs -->
        <div class="hub-tabs">
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'logs'"
            (click)="activeTab.set('logs')"
          >
            <i class="fa-solid fa-clipboard-list"></i>
            Registro Audit (Log Attività)
            <span class="tab-count">{{ totalLogs() }}</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'blacklist'"
            (click)="activeTab.set('blacklist')"
          >
            <i class="fa-solid fa-ban"></i>
            Blacklist & Blocco Credenziali
            <span class="tab-count">{{ blacklistedTokens().length }}</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'security-info'"
            (click)="activeTab.set('security-info')"
          >
            <i class="fa-solid fa-lock"></i>
            Architettura di Sicurezza & Master Key
          </button>
        </div>

        <!-- TAB 1: AUDIT LOGS -->
        <div *ngIf="activeTab() === 'logs'" class="tab-content">
          <div class="content-toolbar card">
            <div class="filters-grid">
              <div class="form-group">
                <label>Filtra per Azione:</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  [(ngModel)]="logActionFilter"
                  (keyup.enter)="loadAuditLogs()"
                  placeholder="es. LOGIN, CREATE, UPDATE, DELETE..."
                />
              </div>
              <div class="form-group">
                <label>Filtra per Operatore (Email o Username):</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  [(ngModel)]="logOperatorFilter"
                  (keyup.enter)="loadAuditLogs()"
                  placeholder="es. gestore, bortolato..."
                />
              </div>
              <div class="filter-actions">
                <button (click)="loadAuditLogs()" class="btn btn-gold btn-sm" [disabled]="isLoadingLogs()">
                  <i class="fa-solid fa-magnifying-glass"></i> Cerca
                </button>
                <button (click)="resetLogFilters()" class="btn btn-outline btn-sm">
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div class="table-card card">
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Data & Ora</th>
                    <th>Operatore</th>
                    <th>Ruolo</th>
                    <th>Azione</th>
                    <th>Stato</th>
                    <th>Indirizzo IP</th>
                    <th>Dettagli Operazione</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="isLoadingLogs()">
                    <td colspan="7" class="text-center py-4">
                      <i class="fa-solid fa-spinner fa-spin"></i> Caricamento registrazioni audit in corso...
                    </td>
                  </tr>
                  <tr *ngIf="!isLoadingLogs() && auditLogs().length === 0">
                    <td colspan="7" class="text-center py-4 text-muted">
                      Nessun log trovato con i criteri selezionati.
                    </td>
                  </tr>
                  <tr *ngFor="let log of auditLogs()">
                    <td class="text-nowrap font-mono text-sm">
                      {{ log.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}
                    </td>
                    <td>
                      <strong>{{ log.userEmail || log.username || log.user || 'Sistema / Anonimo' }}</strong>
                    </td>
                    <td>
                      <span class="role-pill" [ngClass]="log.role || 'system'">
                        {{ log.role || 'system' }}
                      </span>
                    </td>
                    <td>
                      <span class="action-tag" [ngClass]="getActionClass(log.action)">
                        {{ log.action }}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge" [class.success]="log.status === 'SUCCESS'" [class.failure]="log.status === 'FAILURE'">
                        {{ log.status === 'SUCCESS' ? 'Riuscito' : 'Fallito' }}
                      </span>
                    </td>
                    <td class="font-mono text-sm">{{ log.ipAddress || '-' }}</td>
                    <td class="details-cell">
                      <span class="details-summary">{{ log.resource || '-' }}</span>
                      <small *ngIf="log.details" class="details-raw font-mono">
                        {{ formatDetails(log.details) }}
                      </small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- TAB 2: BLACKLIST & BAN CREDENZIALI -->
        <div *ngIf="activeTab() === 'blacklist'" class="tab-content">
          <div class="blacklist-actions-bar card">
            <div>
              <h3>Banna o Revoca Token / Credenziali Compromesse</h3>
              <p>Se un dispositivo viene smarrito o sospetti che una credenziale sia stata rubata, puoi inserire il token in blacklist o forzare la disconnessione totale.</p>
            </div>
            <button (click)="openAddBlacklistModal()" class="btn btn-danger btn-sm">
              <i class="fa-solid fa-ban"></i> Banna un Token Manualmente
            </button>
          </div>

          <div class="table-card card">
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Token (Hash parziale)</th>
                    <th>Motivo del Blocco</th>
                    <th>Revocato Da</th>
                    <th>Data Revoca</th>
                    <th>Scadenza Automatica</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="isLoadingBlacklist()">
                    <td colspan="6" class="text-center py-4">
                      <i class="fa-solid fa-spinner fa-spin"></i> Caricamento blacklist...
                    </td>
                  </tr>
                  <tr *ngIf="!isLoadingBlacklist() && blacklistedTokens().length === 0">
                    <td colspan="6" class="text-center py-4 text-muted">
                      Nessun token attualmente bannato in blacklist. Tutte le sessioni attive sono regolari.
                    </td>
                  </tr>
                  <tr *ngFor="let item of blacklistedTokens()">
                    <td class="font-mono text-xs token-hash" [title]="item.token">
                      {{ item.token | slice:0:30 }}...{{ item.token | slice:-15 }}
                    </td>
                    <td>
                      <span class="reason-badge">{{ item.reason || 'Sessione revocata' }}</span>
                    </td>
                    <td>Amministratore</td>
                    <td class="text-nowrap">{{ item.revokedAt | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td class="text-nowrap">{{ item.expiresAt | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>
                      <button (click)="removeTokenFromBlacklist(item.token)" class="btn btn-outline btn-xs" title="Sblocca token">
                        <i class="fa-solid fa-unlock"></i> Sblocca
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- TAB 3: SICUREZZA & MASTER RECOVERY -->
        <div *ngIf="activeTab() === 'security-info'" class="tab-content">
          <div class="security-cards-grid">
            <div class="security-info-card card">
              <div class="card-icon icon-master"><i class="fa-solid fa-crown"></i></div>
              <h3>Protezione Master Admin Immutabile</h3>
              <p>Gli account Master Admin (<code>bortolatofilippo05&#64;gmail.com</code> e <code>pizzadalcampione&#64;gmail.com</code>) sono protetti a livello di database e middleware di sicurezza:</p>
              <ul>
                <li>Non possono essere eliminati da nessun altro utente o gestore.</li>
                <li>Il loro ruolo non può essere declassato.</li>
                <li>Nessun amministratore secondario può escludere o bloccare il proprietario del ristorante.</li>
              </ul>
            </div>

            <div class="security-info-card card">
              <div class="card-icon icon-key"><i class="fa-solid fa-key"></i></div>
              <h3>Chiave di Emergenza (Master Emergency Key)</h3>
              <p>In caso estremo di perdita totale delle credenziali o tentativi malevoli di lockout, è configurata la Master Emergency Key nell'ambiente di produzione:</p>
              <ul>
                <li>Accessibile dalla pagina di login tramite il pulsante <em>"Recupero Credenziali d'Emergenza"</em>.</li>
                <li>Permette di forzare istantaneamente una nuova password su qualsiasi account e disconnettere tutti gli accessi.</li>
              </ul>
            </div>

            <div class="security-info-card card">
              <div class="card-icon icon-password"><i class="fa-solid fa-lock-open"></i></div>
              <h3>Come Cambiare le Password</h3>
              <p>Puoi aggiornare le password in 3 modalità differenti:</p>
              <ol>
                <li><strong>La Tua Password Personale</strong>: Clicca sul pulsante in alto a destra <em>"Cambia la Mia Password"</em> per inserire la password attuale e la nuova.</li>
                <li><strong>Password di un Gestore</strong>: Dalla pagina <a routerLink="/admin/users">Gestione Utenti</a>, clicca sull'icona della chiave <i class="fa-solid fa-key"></i> accanto all'utente per impostare direttamente una nuova password.</li>
                <li><strong>In caso di Emergenza</strong>: Usa il pulsante nella schermata di login con la Chiave Master.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password Modal -->
      <app-modal *ngIf="isChangePasswordModalOpen()" title="Cambia la Tua Password" (closed)="closeModals()">
        <form (ngSubmit)="submitChangePassword()">
          <div class="form-group">
            <label>Password Attuale *</label>
            <input
              type="password"
              class="form-control"
              [(ngModel)]="currentPassword"
              name="currentPassword"
              required
              placeholder="Inserisci la password attuale"
            />
          </div>

          <div class="form-group">
            <label>Nuova Password (minimo 6 caratteri) *</label>
            <input
              type="password"
              class="form-control"
              [(ngModel)]="newPassword"
              name="newPassword"
              minlength="6"
              required
              placeholder="Inserisci la nuova password"
            />
          </div>

          <div class="form-group">
            <label>Conferma Nuova Password *</label>
            <input
              type="password"
              class="form-control"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              minlength="6"
              required
              placeholder="Ripeti la nuova password"
            />
          </div>

          <div *ngIf="newPassword && confirmPassword && newPassword !== confirmPassword" class="text-danger small mt-2">
            <i class="fa-solid fa-circle-exclamation"></i> Le due password non coincidono.
          </div>

          <div class="modal-footer mt-4" style="display: flex; justify-content: flex-end; gap: 1rem;">
            <button type="button" (click)="closeModals()" class="btn btn-outline btn-sm">Annulla</button>
            <button
              type="submit"
              class="btn btn-gold btn-sm"
              [disabled]="isSubmittingPassword() || !currentPassword || !newPassword || newPassword !== confirmPassword"
            >
              <i *ngIf="isSubmittingPassword()" class="fa-solid fa-spinner fa-spin"></i>
              <i *ngIf="!isSubmittingPassword()" class="fa-solid fa-check"></i>
              Salva Nuova Password
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Add Token to Blacklist Modal -->
      <app-modal *ngIf="isAddBlacklistModalOpen()" title="Banna un Token in Blacklist" (closed)="closeModals()">
        <form (ngSubmit)="submitBlacklistToken()">
          <div class="form-group">
            <label>Token JWT da Bannare *</label>
            <textarea
              class="form-control"
              rows="3"
              [(ngModel)]="blacklistTokenInput"
              name="token"
              required
              placeholder="Incolla il token JWT da revocare immediatamente..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Motivo del Blocco / Note</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="blacklistReasonInput"
              name="reason"
              placeholder="es. Credenziali rubate, furto dispositivo, revoca forzata"
            />
          </div>

          <div class="modal-footer mt-4" style="display: flex; justify-content: flex-end; gap: 1rem;">
            <button type="button" (click)="closeModals()" class="btn btn-outline btn-sm">Annulla</button>
            <button
              type="submit"
              class="btn btn-danger btn-sm"
              [disabled]="!blacklistTokenInput"
            >
              <i class="fa-solid fa-ban"></i> Banna Token
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
  styles: [`
    .security-hub-page {
      padding: 3rem 0 5rem;
      background: var(--color-bg-main);
      min-height: 80vh;
    }

    .hub-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2.5rem;
      gap: 2rem;
      flex-wrap: wrap;

      .badges-row {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
        flex-wrap: wrap;
      }

      .badge {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        padding: 0.25rem 0.65rem;
        border-radius: 20px;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;

        &.badge-tech {
          background: #334155;
          color: #f8fafc;
        }

        &.badge-admin {
          background: var(--color-navy-dark);
          color: #ffffff;
        }

        &.badge-crown {
          background: var(--color-gold);
          color: var(--color-navy-dark);
        }
      }

      .header-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
      }
    }

    .hub-tabs {
      display: flex;
      gap: 0.5rem;
      border-bottom: 2px solid var(--color-border);
      margin-bottom: 2rem;
      overflow-x: auto;

      .tab-btn {
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        font-size: 0.95rem;
        background: transparent;
        border: none;
        border-bottom: 3px solid transparent;
        color: var(--color-text-muted);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        transition: all 0.2s ease;
        white-space: nowrap;

        &:hover {
          color: var(--color-navy-dark);
        }

        &.active {
          color: var(--color-navy-dark);
          border-bottom-color: var(--color-gold);
        }

        .tab-count {
          background: #e2e8f0;
          font-size: 0.75rem;
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          color: #334155;
        }
      }
    }

    .content-toolbar {
      padding: 1.25rem;
      margin-bottom: 1.5rem;

      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) auto;
        gap: 1rem;
        align-items: flex-end;
      }

      .filter-actions {
        display: flex;
        gap: 0.5rem;
      }
    }

    .blacklist-actions-bar {
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;

      h3 {
        font-size: 1.1rem;
        margin-bottom: 0.25rem;
        color: var(--color-navy-dark);
      }

      p {
        color: var(--color-text-muted);
        font-size: 0.85rem;
        margin: 0;
      }
    }

    .table-card {
      padding: 0;
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;

      th {
        background: #f1f5f9;
        padding: 0.75rem 1rem;
        text-align: left;
        font-size: 0.8rem;
        text-transform: uppercase;
        color: #475569;
        font-weight: 700;
      }

      td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--color-border);
        font-size: 0.85rem;
      }
    }

    .role-pill {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;

      &.admin {
        background: #fee2e2;
        color: #991b1b;
      }
      &.gestore {
        background: #fef3c7;
        color: #92400e;
      }
      &.client {
        background: #e0f2fe;
        color: #0369a1;
      }
      &.system {
        background: #f1f5f9;
        color: #475569;
      }
    }

    .action-tag {
      font-size: 0.75rem;
      font-weight: 700;
      font-family: monospace;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;

      &.login {
        background: #ecfdf5;
        border-color: #a7f3d0;
        color: #065f46;
      }
      &.logout {
        background: #fff1f2;
        border-color: #fecdd3;
        color: #9f1239;
      }
      &.mutate {
        background: #eff6ff;
        border-color: #bfdbfe;
        color: #1e40af;
      }
    }

    .status-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;

      &.success {
        background: #dcfce7;
        color: #166534;
      }
      &.failure {
        background: #fee2e2;
        color: #991b1b;
      }
    }

    .token-hash {
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .reason-badge {
      background: #fee2e2;
      color: #991b1b;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .security-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .security-info-card {
      padding: 2rem;

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        margin-bottom: 1.25rem;

        &.icon-master {
          background: #fef3c7;
          color: #d97706;
        }
        &.icon-key {
          background: #fee2e2;
          color: #dc2626;
        }
        &.icon-password {
          background: #e0f2fe;
          color: #0284c7;
        }
      }

      h3 {
        font-size: 1.15rem;
        margin-bottom: 0.75rem;
        color: var(--color-navy-dark);
      }

      p {
        color: var(--color-text-light);
        font-size: 0.9rem;
        line-height: 1.5;
        margin-bottom: 1rem;
      }

      ul, ol {
        padding-left: 1.25rem;
        color: var(--color-text-main);
        font-size: 0.85rem;
        line-height: 1.6;

        li {
          margin-bottom: 0.5rem;
        }
      }
    }
  `],
})
export class SecurityHubComponent implements OnInit {
  public adminService = inject(AdminService);
  public authService = inject(AuthService);

  public activeTab = signal<'logs' | 'blacklist' | 'security-info'>('logs');

  // Logs state
  public auditLogs = signal<AuditLog[]>([]);
  public totalLogs = signal<number>(0);
  public isLoadingLogs = signal<boolean>(false);
  public logActionFilter = '';
  public logOperatorFilter = '';

  // Blacklist state
  public blacklistedTokens = signal<BlacklistedToken[]>([]);
  public isLoadingBlacklist = signal<boolean>(false);

  // Modals state
  public isChangePasswordModalOpen = signal<boolean>(false);
  public isAddBlacklistModalOpen = signal<boolean>(false);
  public isLoggingOutAll = signal<boolean>(false);
  public isSubmittingPassword = signal<boolean>(false);

  // Form bindings
  public currentPassword = '';
  public newPassword = '';
  public confirmPassword = '';
  public blacklistTokenInput = '';
  public blacklistReasonInput = '';

  // Feedback notifications
  public successMessage = signal<string>('');
  public errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadAuditLogs();
    this.loadBlacklist();
  }

  public loadAuditLogs(): void {
    this.isLoadingLogs.set(true);
    const params: any = { limit: 50 };
    if (this.logActionFilter) params.action = this.logActionFilter;
    if (this.logOperatorFilter) params.operator = this.logOperatorFilter;

    this.adminService.getAuditLogs(params).subscribe({
      next: (res) => {
        this.auditLogs.set(res.data || []);
        this.totalLogs.set(res.total || res.count || 0);
        this.isLoadingLogs.set(false);
      },
      error: () => {
        this.isLoadingLogs.set(false);
      },
    });
  }

  public resetLogFilters(): void {
    this.logActionFilter = '';
    this.logOperatorFilter = '';
    this.loadAuditLogs();
  }

  public loadBlacklist(): void {
    this.isLoadingBlacklist.set(true);
    this.adminService.getBlacklistedTokens().subscribe({
      next: (res) => {
        this.blacklistedTokens.set(res.data || []);
        this.isLoadingBlacklist.set(false);
      },
      error: () => {
        this.isLoadingBlacklist.set(false);
      },
    });
  }

  public openChangePasswordModal(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMessage.set('');
    this.isChangePasswordModalOpen.set(true);
  }

  public openAddBlacklistModal(): void {
    this.blacklistTokenInput = '';
    this.blacklistReasonInput = '';
    this.isAddBlacklistModalOpen.set(true);
  }

  public closeModals(): void {
    this.isChangePasswordModalOpen.set(false);
    this.isAddBlacklistModalOpen.set(false);
  }

  public submitChangePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Le due password non corrispondono');
      return;
    }

    this.isSubmittingPassword.set(true);
    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (res) => {
        this.isSubmittingPassword.set(false);
        this.closeModals();
        this.successMessage.set('Password modificata con successo!');
        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        this.isSubmittingPassword.set(false);
        this.errorMessage.set(err.error?.message || 'Errore durante la modifica della password');
      },
    });
  }

  public submitBlacklistToken(): void {
    if (!this.blacklistTokenInput) return;

    this.adminService
      .blacklistToken({
        token: this.blacklistTokenInput.trim(),
        reason: this.blacklistReasonInput || 'Revoca manuale da Centro Tecnico Admin',
      })
      .subscribe({
        next: () => {
          this.closeModals();
          this.loadBlacklist();
          this.successMessage.set('Token inserito correttamente in blacklist!');
          setTimeout(() => this.successMessage.set(''), 4000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Errore nel bannare il token');
        },
      });
  }

  public removeTokenFromBlacklist(token: string): void {
    if (!confirm('Sei sicuro di voler sbloccare questo token dalla blacklist?')) return;

    this.adminService.removeFromBlacklist(token).subscribe({
      next: () => {
        this.loadBlacklist();
        this.successMessage.set('Token sbloccato con successo');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Errore nello sblocco del token');
      },
    });
  }

  public triggerGlobalLogout(): void {
    if (
      !confirm(
        'Attenzione: questa operazione revocherà tutte le sessioni attive per il tuo account su tutti i telefoni, tablet e computer. Vuoi procedere?'
      )
    ) {
      return;
    }

    this.isLoggingOutAll.set(true);
    this.authService.logoutAll().subscribe({
      next: () => {
        this.isLoggingOutAll.set(false);
      },
      error: () => {
        this.isLoggingOutAll.set(false);
      },
    });
  }

  public getActionClass(action: string): string {
    if (!action) return '';
    const act = action.toUpperCase();
    if (act.includes('LOGIN')) return 'login';
    if (act.includes('LOGOUT') || act.includes('REVOKE') || act.includes('DELETE')) return 'logout';
    return 'mutate';
  }

  public formatDetails(details: any): string {
    if (!details) return '';
    try {
      return typeof details === 'object' ? JSON.stringify(details) : String(details);
    } catch {
      return String(details);
    }
  }
}
