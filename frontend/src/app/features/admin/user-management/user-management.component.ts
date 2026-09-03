import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-user-management',
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
            <h1>Gestione Utenti, Gestori & Sicurezza</h1>
            <p>Amministrazione account, creazione gestori con Username, protezione Master Admin e revoca globale sessioni.</p>
          </div>
          <div class="header-actions">
            <button (click)="openGlobalLogoutModal()" class="btn btn-outline-danger" title="Invalida tutti i token attivi su ogni dispositivo">
              <i class="fa-solid fa-power-off"></i> Logout Globale (Tutti i Dispositivi)
            </button>
            <button (click)="openCreateModal()" class="btn btn-gold">
              <i class="fa-solid fa-user-plus"></i> Nuovo Utente / Gestore
            </button>
          </div>
        </div>

        <div *ngIf="feedbackMsg()" class="alert-box" [ngClass]="isError() ? 'alert-error' : 'alert-success'">
          <i class="fa-solid" [ngClass]="isError() ? 'fa-circle-xmark' : 'fa-circle-check'"></i>
          <span>{{ feedbackMsg() }}</span>
        </div>

        <!-- Master Admin Protection Notice Card -->
        <div class="master-admin-notice card">
          <div class="notice-icon"><i class="fa-solid fa-shield-halved"></i></div>
          <div class="notice-content">
            <h3>Protezione Immutabile Master Admin Attiva</h3>
            <p>
              Gli account proprietari di <strong>Federico Bortolato & Sabina Mazzeracca</strong> sono designati come
              <strong>Master Admin</strong> immutabili: sono permanentemente protetti contro eliminazione, declassamento o disattivazione accidentale da parte di altri amministratori.
            </p>
          </div>
        </div>

        <div class="table-card card">
          <div class="table-filters">
            <input
              type="text"
              class="form-control table-search"
              placeholder="Cerca nome, email o username..."
              [(ngModel)]="searchFilter"
              (ngModelChange)="loadUsers()"
            >
            <select class="form-control table-role-select" [(ngModel)]="roleFilter" (ngModelChange)="loadUsers()">
              <option value="">Tutti i Ruoli</option>
              <option value="admin">Amministratori</option>
              <option value="gestore">Gestori</option>
              <option value="client">Clienti</option>
            </select>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Utente</th>
                  <th>Credenziale / Identificativo</th>
                  <th>Ruolo</th>
                  <th>Stato</th>
                  <th>Ultimo Accesso</th>
                  <th>Registrazione</th>
                  <th style="text-align: right;">Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users()" [ngClass]="{'master-admin-row': isMasterAdmin(user)}">
                  <td>
                    <div class="user-name-wrap">
                      <strong>{{ user.name }}</strong>
                      <span *ngIf="isMasterAdmin(user)" class="badge-master-admin" title="Master Admin Immutabile: Federico Bortolato & Sabina Mazzeracca">
                        <i class="fa-solid fa-crown"></i> MASTER ADMIN
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="user-identifiers">
                      <span *ngIf="user.email" class="identifier-tag email-tag">
                        <i class="fa-solid fa-envelope"></i> {{ user.email }}
                      </span>
                      <span *ngIf="user.username" class="identifier-tag username-tag">
                        <i class="fa-solid fa-at"></i> {{ user.username }}
                      </span>
                      <span *ngIf="!user.email && !user.username" class="text-muted">—</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'badge-gold': user.role === 'admin',
                      'badge-info': user.role === 'gestore',
                      'badge-secondary': user.role === 'client'
                    }">{{ user.role }}</span>
                  </td>
                  <td>
                    <button
                      (click)="toggleUserStatus(user)"
                      class="badge"
                      [ngClass]="user.isActive ? 'badge-success' : 'badge-danger'"
                      [disabled]="isMasterAdmin(user) || isCurrentUser(user)"
                      style="cursor: pointer; border: none;"
                      [title]="isMasterAdmin(user) ? 'I Master Admin non possono essere disattivati' : (isCurrentUser(user) ? 'Non puoi disattivare il tuo stesso account' : 'Clicca per modificare stato')"
                    >
                      {{ user.isActive ? 'Attivo' : 'Disattivato' }}
                      <i *ngIf="isMasterAdmin(user)" class="fa-solid fa-lock ml-1"></i>
                    </button>
                  </td>
                  <td>{{ user.lastLogin ? (user.lastLogin | date:'dd/MM/yyyy HH:mm') : 'Mai effettuato' }}</td>
                  <td>{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td style="text-align: right;">
                    <div class="action-btns">
                      <button
                        (click)="openResetPasswordModal(user)"
                        class="btn-action edit"
                        title="Reimposta Password"
                      >
                        <i class="fa-solid fa-key"></i>
                      </button>
                      <button
                        (click)="openRoleModal(user)"
                        class="btn-action edit"
                        [disabled]="isMasterAdmin(user)"
                        [title]="isMasterAdmin(user) ? 'Ruolo Master Admin permanente e protetto' : 'Modifica Ruolo'"
                      >
                        <i class="fa-solid fa-user-shield"></i>
                      </button>
                      <button
                        (click)="deleteUser(user)"
                        class="btn-action delete"
                        [disabled]="isMasterAdmin(user) || isCurrentUser(user)"
                        [title]="isMasterAdmin(user) ? 'I Master Admin non possono essere eliminati' : (isCurrentUser(user) ? 'Non puoi eliminare il tuo stesso account' : 'Elimina Account')"
                      >
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

      <!-- Create User Modal -->
      <app-modal
        *ngIf="isCreateModalOpen()"
        title="Crea Nuovo Account Utente o Gestore"
        (closed)="closeModals()"
      >
        <form (ngSubmit)="saveNewUser()">
          <div class="form-group">
            <label>Tipo di Account / Ruolo *</label>
            <select class="form-control" [(ngModel)]="createFormData.role" name="role" required (ngModelChange)="onRoleTypeChange()">
              <option value="gestore">Gestore (Accesso con Username e Password - Nessuna email obbligatoria)</option>
              <option value="admin">Amministratore (Accesso con Email e Password - Sicurezza avanzata)</option>
              <option value="client">Cliente</option>
            </select>
          </div>

          <div class="form-group">
            <label>Nome Completo *</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="createFormData.name"
              name="name"
              required
              [placeholder]="createFormData.role === 'gestore' ? 'es. Gestore Sala' : 'es. Mario Rossi'"
            >
          </div>

          <!-- Gestori: Username field (Primary) -->
          <div class="form-group" *ngIf="createFormData.role === 'gestore'">
            <label>Username Univoco Gestore *</label>
            <div class="input-icon-wrap">
              <i class="fa-solid fa-at"></i>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="createFormData.username"
                name="username"
                required
                minlength="3"
                placeholder="es. gestore_sala o gestore"
              >
            </div>
            <small class="text-muted">Il gestore utilizzerà questo username per accedere al pannello.</small>
          </div>

          <!-- Admin or Client: Email field (Primary) -->
          <div class="form-group" *ngIf="createFormData.role !== 'gestore'">
            <label>Email Aziendale *</label>
            <div class="input-icon-wrap">
              <i class="fa-solid fa-envelope"></i>
              <input
                type="email"
                class="form-control"
                [(ngModel)]="createFormData.email"
                name="email"
                required
                placeholder="es. bortolatofilippo05@gmail.com"
              >
            </div>
          </div>

          <!-- Gestori: Optional Email -->
          <div class="form-group" *ngIf="createFormData.role === 'gestore'">
            <label>Email (Opzionale)</label>
            <div class="input-icon-wrap">
              <i class="fa-solid fa-envelope"></i>
              <input
                type="email"
                class="form-control"
                [(ngModel)]="createFormData.email"
                name="email"
                placeholder="es. sala@ilveliero.it (non obbligatoria per gestori)"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Password Iniziale (min. 6 caratteri) *</label>
            <div class="input-icon-wrap">
              <i class="fa-solid fa-lock"></i>
              <input
                type="password"
                class="form-control"
                [(ngModel)]="createFormData.password"
                name="password"
                minlength="6"
                required
                placeholder="••••••••"
              >
            </div>
          </div>

          <div class="form-group" style="margin: 1.5rem 0;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" [(ngModel)]="createFormData.isActive" name="isActive">
              <strong>Account attivo immediatamente</strong>
            </label>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" (click)="closeModals()" class="btn btn-outline btn-sm">Annulla</button>
            <button
              type="submit"
              class="btn btn-gold btn-sm"
              [disabled]="isSaveDisabled()"
            >
              <i class="fa-solid fa-check"></i> Crea Account
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Edit Role Modal -->
      <app-modal
        *ngIf="isRoleModalOpen() && targetUser()"
        [title]="'Modifica Ruolo per ' + targetUser()?.name"
        (closed)="closeModals()"
      >
        <form (ngSubmit)="saveUserRole()">
          <p style="margin-bottom: 1.5rem; font-size: 0.92rem; color: var(--color-text-muted);">
            Seleziona il nuovo livello di privilegi per l'utente
            <strong>{{ targetUser()?.email || targetUser()?.username }}</strong>:
          </p>

          <div class="form-group">
            <label>Nuovo Ruolo *</label>
            <select class="form-control" [(ngModel)]="selectedNewRole" name="newRole" required>
              <option value="client">Client (Senza permessi gestionali)</option>
              <option value="gestore">Gestore (CRUD Menù, Pescato, Avvisi, Eventi, Orari)</option>
              <option value="admin">Admin (Tutti i permessi + Audit, Blacklist e Utenti)</option>
            </select>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" (click)="closeModals()" class="btn btn-outline btn-sm">Annulla</button>
            <button type="submit" class="btn btn-gold btn-sm">Aggiorna Ruolo</button>
          </div>
        </form>
      </app-modal>

      <!-- Reset Password Modal -->
      <app-modal
        *ngIf="isResetPasswordModalOpen() && targetUser()"
        [title]="'Reimposta Password per ' + (targetUser()?.name || targetUser()?.username || 'Utente')"
        (closed)="closeModals()"
      >
        <form (ngSubmit)="saveResetPassword()">
          <p style="margin-bottom: 1.5rem; font-size: 0.92rem; color: var(--color-text-muted);">
            Inserisci la nuova password per l'account
            <strong>{{ targetUser()?.email || targetUser()?.username }}</strong>. Le sessioni attive dell'utente verranno invalidate per sicurezza.
          </p>

          <div class="form-group">
            <label>Nuova Password (minimo 6 caratteri) *</label>
            <input
              type="password"
              class="form-control"
              [(ngModel)]="resetPasswordInput"
              name="newPassword"
              minlength="6"
              required
              placeholder="••••••••"
            />
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" (click)="closeModals()" class="btn btn-outline btn-sm">Annulla</button>
            <button
              type="submit"
              class="btn btn-gold btn-sm"
              [disabled]="!resetPasswordInput || resetPasswordInput.length < 6"
            >
              <i class="fa-solid fa-check"></i> Reimposta Password
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Global Logout Confirmation Modal -->
      <app-modal
        *ngIf="isGlobalLogoutModalOpen()"
        title="Revoca Globale Sessioni (Logout da Tutti i Dispositivi)"
        (closed)="closeModals()"
      >
        <div class="global-logout-modal-body">
          <div class="alert-box alert-error" style="margin-bottom: 1.25rem;">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <div>
              <strong>Attenzione: Revoca Immediata di Tutti i Token Attivi</strong>
              <p style="margin: 0.25rem 0 0; font-size: 0.85rem;">
                Questa azione incrementerà la versione di sessione del tuo account, invalidando all'istante
                qualsiasi token JWT attivo su altri computer, smartphone, tablet o browser.
              </p>
            </div>
          </div>

          <p style="font-size: 0.92rem; color: var(--color-navy-dark);">
            Dopo la conferma, la tua sessione corrente verrà terminata e verrai reindirizzato alla pagina di accesso per eseguire un nuovo login sicuro.
          </p>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" (click)="closeModals()" class="btn btn-outline btn-sm">Annulla</button>
            <button type="button" (click)="executeGlobalLogout()" class="btn btn-danger btn-sm">
              <i class="fa-solid fa-power-off"></i> Conferma Logout Globale
            </button>
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
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
    }

    .btn-outline-danger {
      background: transparent;
      border: 1px solid var(--color-danger);
      color: var(--color-danger);
      padding: 0.65rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-danger);
        color: #ffffff;
      }
    }

    .btn-danger {
      background: var(--color-danger);
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background: #b80322;
      }
    }

    .master-admin-notice {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, rgba(221, 161, 94, 0.15) 0%, rgba(188, 108, 37, 0.1) 100%);
      border-left: 4px solid var(--color-gold);

      .notice-icon {
        font-size: 2rem;
        color: var(--color-gold-dark);
      }

      .notice-content {
        h3 {
          font-size: 1.05rem;
          color: var(--color-navy-dark);
          margin-bottom: 0.25rem;
        }

        p {
          font-size: 0.88rem;
          color: var(--color-text-main);
          margin: 0;
          line-height: 1.45;
        }
      }
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
        gap: 1rem;
        margin-bottom: 1.5rem;
        .table-search { max-width: 340px; }
        .table-role-select { max-width: 220px; }
      }

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

        tr.master-admin-row {
          background: rgba(221, 161, 94, 0.04);
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid var(--color-border);
          vertical-align: middle;

          .user-name-wrap {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;

            strong {
              color: var(--color-navy-dark);
            }
          }

          .badge-master-admin {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%);
            color: #ffffff;
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.5px;
            padding: 0.2rem 0.55rem;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.12);
          }

          .user-identifiers {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            .identifier-tag {
              font-size: 0.82rem;
              display: inline-flex;
              align-items: center;
              gap: 0.35rem;

              &.email-tag { color: var(--color-text-muted); }
              &.username-tag {
                color: var(--color-navy-medium);
                font-family: monospace;
                font-weight: 600;
              }
            }
          }

          .badge-secondary {
            background: #e2e8f0;
            color: #475569;
          }

          .ml-1 { margin-left: 0.25rem; font-size: 0.75rem; }

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

              &.edit {
                color: var(--color-navy-medium);
                &:hover:not(:disabled) { background: var(--color-navy-medium); color: #fff; }
                &:disabled { opacity: 0.3; cursor: not-allowed; }
              }
              &.delete {
                color: var(--color-danger);
                &:hover:not(:disabled) { background: var(--color-danger); color: #fff; }
                &:disabled { opacity: 0.3; cursor: not-allowed; }
              }
            }
          }
        }
      }
    }

    .input-icon-wrap {
      position: relative;
      i {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-light);
      }
      .form-control {
        padding-left: 2.75rem;
      }
    }
  `],
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  public authService = inject(AuthService);

  public users = signal<User[]>([]);
  public searchFilter: string = '';
  public roleFilter: string = '';

  public isCreateModalOpen = signal<boolean>(false);
  public isRoleModalOpen = signal<boolean>(false);
  public isResetPasswordModalOpen = signal<boolean>(false);
  public isGlobalLogoutModalOpen = signal<boolean>(false);
  public targetUser = signal<User | null>(null);
  public selectedNewRole: UserRole = 'gestore';
  public resetPasswordInput = '';

  public feedbackMsg = signal<string>('');
  public isError = signal<boolean>(false);

  public createFormData = {
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'gestore' as UserRole,
    isActive: true,
  };

  private masterAdminEmails: string[] = [
    'bortolatofilippo05@gmail.com',
    'pizzadalcampione@gmail.com',
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const params: any = {};
    if (this.searchFilter.trim()) params.search = this.searchFilter.trim();
    if (this.roleFilter) params.role = this.roleFilter;

    this.adminService.getUsers(params).subscribe({
      next: (res) => { if (res.success) this.users.set(res.data); },
    });
  }

  isMasterAdmin(user: User): boolean {
    if (user.isMasterAdmin) return true;
    if (user.email && this.masterAdminEmails.includes(user.email.toLowerCase().trim())) {
      return true;
    }
    return false;
  }

  isCurrentUser(user: User): boolean {
    const current = this.authService.currentUser();
    return current ? current.id === user.id : false;
  }

  openCreateModal(): void {
    this.createFormData = {
      name: '',
      email: '',
      username: '',
      password: '',
      role: 'gestore',
      isActive: true,
    };
    this.isCreateModalOpen.set(true);
  }

  onRoleTypeChange(): void {
    if (this.createFormData.role === 'gestore') {
      this.createFormData.username = this.createFormData.username || '';
    } else {
      this.createFormData.email = this.createFormData.email || '';
    }
  }

  isSaveDisabled(): boolean {
    if (!this.createFormData.name || !this.createFormData.password || this.createFormData.password.length < 6) {
      return true;
    }
    if (this.createFormData.role === 'gestore') {
      return !this.createFormData.username || this.createFormData.username.trim().length < 3;
    }
    return !this.createFormData.email || !this.createFormData.email.includes('@');
  }

  openRoleModal(user: User): void {
    if (this.isMasterAdmin(user)) {
      this.setFeedback('Non è consentito modificare il ruolo di un Master Admin.', true);
      return;
    }
    this.targetUser.set(user);
    this.selectedNewRole = user.role;
    this.isRoleModalOpen.set(true);
  }

  openResetPasswordModal(user: User): void {
    this.targetUser.set(user);
    this.resetPasswordInput = '';
    this.isResetPasswordModalOpen.set(true);
  }

  saveResetPassword(): void {
    const user = this.targetUser();
    if (!user || !user.id || !this.resetPasswordInput) return;

    this.adminService.resetUserPassword(user.id, this.resetPasswordInput).subscribe({
      next: (res) => {
        this.setFeedback(res.message || 'Password reimpostata con successo.');
        this.closeModals();
      },
      error: (err) => this.setFeedback(err.error?.message || err.message, true),
    });
  }

  openGlobalLogoutModal(): void {
    this.isGlobalLogoutModalOpen.set(true);
  }

  closeModals(): void {
    this.isCreateModalOpen.set(false);
    this.isRoleModalOpen.set(false);
    this.isResetPasswordModalOpen.set(false);
    this.isGlobalLogoutModalOpen.set(false);
    this.targetUser.set(null);
    this.resetPasswordInput = '';
  }

  saveNewUser(): void {
    const payload: any = {
      name: this.createFormData.name.trim(),
      password: this.createFormData.password,
      role: this.createFormData.role,
      isActive: this.createFormData.isActive,
    };

    if (this.createFormData.role === 'gestore') {
      payload.username = this.createFormData.username.toLowerCase().trim();
      if (this.createFormData.email?.trim()) {
        payload.email = this.createFormData.email.toLowerCase().trim();
      }
    } else {
      payload.email = this.createFormData.email.toLowerCase().trim();
      if (this.createFormData.username?.trim()) {
        payload.username = this.createFormData.username.toLowerCase().trim();
      }
    }

    this.adminService.createUser(payload).subscribe({
      next: () => {
        this.setFeedback('Nuovo account creato con successo.');
        this.closeModals();
        this.loadUsers();
      },
      error: (err) => this.setFeedback(err.message, true),
    });
  }

  saveUserRole(): void {
    const user = this.targetUser();
    if (!user) return;

    if (this.isMasterAdmin(user)) {
      this.setFeedback('Non è consentito modificare il ruolo di un Master Admin.', true);
      return;
    }

    this.adminService.updateUserRole(user.id, this.selectedNewRole).subscribe({
      next: () => {
        this.setFeedback(`Ruolo aggiornato a ${this.selectedNewRole} per ${user.name}.`);
        this.closeModals();
        this.loadUsers();
      },
      error: (err) => this.setFeedback(err.message, true),
    });
  }

  toggleUserStatus(user: User): void {
    if (this.isMasterAdmin(user)) {
      this.setFeedback('Non è consentito disattivare un account Master Admin.', true);
      return;
    }

    if (this.isCurrentUser(user)) {
      this.setFeedback('Non puoi disattivare il tuo stesso account amministratore.', true);
      return;
    }

    this.adminService.updateUserStatus(user.id, !user.isActive).subscribe({
      next: () => {
        this.setFeedback(`Stato account per ${user.name} aggiornato.`);
        this.loadUsers();
      },
      error: (err) => this.setFeedback(err.message, true),
    });
  }

  deleteUser(user: User): void {
    if (this.isMasterAdmin(user)) {
      this.setFeedback('Non è consentito eliminare un account Master Admin.', true);
      return;
    }

    if (this.isCurrentUser(user)) {
      this.setFeedback('Non puoi eliminare il tuo stesso account.', true);
      return;
    }

    const identifier = user.email || user.username || user.name;
    if (confirm(`Sei sicuro di voler eliminare definitivamente l'account di "${user.name}" (${identifier})?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.setFeedback('Account utente eliminato con successo.');
          this.loadUsers();
        },
        error: (err) => this.setFeedback(err.message, true),
      });
    }
  }

  executeGlobalLogout(): void {
    this.authService.logoutAll().subscribe({
      next: () => {
        this.closeModals();
      },
      error: () => {
        this.closeModals();
      },
    });
  }

  private setFeedback(msg: string, isErr = false): void {
    this.feedbackMsg.set(msg);
    this.isError.set(isErr);
    setTimeout(() => this.feedbackMsg.set(''), 4000);
  }
}
