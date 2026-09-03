import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NauticalDecorComponent } from '../../../shared/components/nautical-decor/nautical-decor.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NauticalDecorComponent, ModalComponent],
  template: `
    <div class="login-page">
      <app-nautical-decor></app-nautical-decor>

      <div class="login-card-container">
        <div class="login-card card">
          <div class="login-header">
            <i class="fa-solid fa-anchor login-icon"></i>
            <h2>AREA RISERVATA</h2>
            <p>Accedi al pannello gestionale con Email o Username</p>
          </div>

          <div *ngIf="errorMessage()" class="alert-danger-box">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{{ errorMessage() }}</span>
          </div>

          <div *ngIf="loginSuccessMessage()" class="alert-success-box">
            <i class="fa-solid fa-circle-check"></i>
            <span>{{ loginSuccessMessage() }}</span>
          </div>

          <form (ngSubmit)="onLogin()">
            <div class="form-group">
              <label>Email o Username *</label>
              <div class="input-icon-wrap">
                <i class="fa-solid fa-user-shield"></i>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="identifier"
                  name="identifier"
                  required
                  placeholder="bortolatofilippo05@gmail.com oppure gestore"
                  autocomplete="username"
                >
              </div>
            </div>

            <div class="form-group">
              <label>Password *</label>
              <div class="input-icon-wrap">
                <i class="fa-solid fa-lock"></i>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  class="form-control"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  autocomplete="current-password"
                >
                <button
                  type="button"
                  class="btn-toggle-pwd"
                  (click)="togglePasswordVisibility()"
                  aria-label="Mostra/Nascondi password"
                >
                  <i class="fa-solid" [ngClass]="showPassword() ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="emergency-link-wrap">
              <button type="button" class="btn-emergency-link" (click)="openEmergencyModal()">
                <i class="fa-solid fa-key"></i> Recupero Credenziali d'Emergenza (Master Key)
              </button>
            </div>

            <button
              type="submit"
              class="btn btn-gold btn-block"
              [disabled]="isLoading() || !identifier || !password"
            >
              <i *ngIf="isLoading()" class="fa-solid fa-spinner fa-spin"></i>
              <i *ngIf="!isLoading()" class="fa-solid fa-right-to-bracket"></i>
              {{ isLoading() ? 'Autenticazione in corso...' : 'Accedi' }}
            </button>
          </form>

          <!-- Quick Test Credentials Shortcut -->
          <div class="demo-accounts">
            <span class="demo-title">Credenziali di Prova Rapide:</span>
            <div class="demo-btns">
              <button type="button" (click)="fillCredentials('bortolatofilippo05@gmail.com', 'AdminPass123!')" class="btn-demo" title="Master Admin: bortolatofilippo05@gmail.com">
                <i class="fa-solid fa-crown"></i> Master Admin
              </button>
              <button type="button" (click)="fillCredentials('pizzadalcampione@gmail.com', 'AdminPass123!')" class="btn-demo" title="Admin Pizzeria: pizzadalcampione@gmail.com">
                <i class="fa-solid fa-shield"></i> Admin Pizzeria
              </button>
              <button type="button" (click)="fillCredentials('gestore_veliero', 'GestorePass123!')" class="btn-demo" title="Gestore Username: gestore_veliero">
                <i class="fa-solid fa-at"></i> Gestore
              </button>
              <button type="button" (click)="fillCredentials('cliente@ilveliero.it', 'ClientPass123!')" class="btn-demo" title="Cliente: cliente@ilveliero.it">
                <i class="fa-solid fa-user"></i> Cliente
              </button>
            </div>
            <div class="demo-credentials-info">
              <small>Master Admin: <code>bortolatofilippo05&#64;gmail.com</code> | Gestori: <code>gestore_veliero</code>, <code>gestore</code></small>
            </div>
          </div>
        </div>
      </div>

      <!-- Emergency Recovery Modal -->
      <app-modal
        *ngIf="isEmergencyModalOpen()"
        title="Recupero Credenziali d'Emergenza"
        (closed)="closeEmergencyModal()"
      >
        <div class="emergency-modal-body">
          <div class="emergency-notice">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <p>
              Questo strumento consente il ripristino forzato della password di qualsiasi account tramite la
              <strong>Master Emergency Recovery Key</strong> configurata nel sistema. L'operazione invaliderà
              istantaneamente tutte le sessioni attive dell'utente su tutti i dispositivi.
            </p>
          </div>

          <div *ngIf="emergencyErrorMsg()" class="alert-danger-box">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{{ emergencyErrorMsg() }}</span>
          </div>

          <div *ngIf="emergencySuccessMsg()" class="alert-success-box">
            <i class="fa-solid fa-circle-check"></i>
            <span>{{ emergencySuccessMsg() }}</span>
          </div>

          <form (ngSubmit)="submitEmergencyRecovery()" *ngIf="!emergencySuccessMsg()">
            <div class="form-group">
              <label>Master Emergency Recovery Key *</label>
              <input
                type="password"
                class="form-control"
                [(ngModel)]="recoveryKey"
                name="recoveryKey"
                required
                placeholder="Chiave segreta di emergenza"
              >
            </div>

            <div class="form-group">
              <label>Email o Username dell'Account da Ripristinare *</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="targetIdentifier"
                name="targetIdentifier"
                required
                placeholder="es. bortolatofilippo05@gmail.com oppure gestore"
              >
            </div>

            <div class="form-group">
              <label>Nuova Password (min. 6 caratteri) *</label>
              <input
                type="password"
                class="form-control"
                [(ngModel)]="newPassword"
                name="newPassword"
                minlength="6"
                required
                placeholder="Nuova password sicura"
              >
            </div>

            <div class="form-group">
              <label>Conferma Nuova Password *</label>
              <input
                type="password"
                class="form-control"
                [(ngModel)]="confirmNewPassword"
                name="confirmNewPassword"
                minlength="6"
                required
                placeholder="Ripeti la nuova password"
              >
            </div>

            <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
              <button type="button" (click)="closeEmergencyModal()" class="btn btn-outline btn-sm">Annulla</button>
              <button
                type="submit"
                class="btn btn-gold btn-sm"
                [disabled]="isEmergencyLoading() || !recoveryKey || !targetIdentifier || !newPassword || newPassword !== confirmNewPassword"
              >
                <i *ngIf="isEmergencyLoading()" class="fa-solid fa-spinner fa-spin"></i>
                <i *ngIf="!isEmergencyLoading()" class="fa-solid fa-key"></i>
                {{ isEmergencyLoading() ? 'Ripristino in corso...' : 'Reimposta Password' }}
              </button>
            </div>
          </form>

          <div *ngIf="emergencySuccessMsg()" class="modal-footer" style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
            <button type="button" (click)="closeEmergencyModal()" class="btn btn-gold btn-sm">
              <i class="fa-solid fa-right-to-bracket"></i> Vai al Login
            </button>
          </div>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      position: relative;
      background: linear-gradient(135deg, var(--color-navy-dark) 0%, var(--color-navy-primary) 100%);
    }

    .login-card-container {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 460px;
    }

    .login-card {
      padding: 3rem 2.5rem;
      border-radius: 16px;
      box-shadow: var(--shadow-lg);

      .login-header {
        text-align: center;
        margin-bottom: 2rem;

        .login-icon {
          font-size: 2.75rem;
          color: var(--color-gold);
          margin-bottom: 0.75rem;
        }

        h2 {
          font-size: 1.8rem;
          color: var(--color-navy-dark);
          letter-spacing: 1px;
        }

        p {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          margin-bottom: 0;
        }
      }

      .alert-danger-box {
        background: rgba(217, 4, 41, 0.12);
        color: var(--color-danger);
        padding: 0.85rem 1rem;
        border-radius: 6px;
        font-size: 0.88rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }

      .alert-success-box {
        background: rgba(42, 157, 143, 0.15);
        color: var(--color-success);
        padding: 0.85rem 1rem;
        border-radius: 6px;
        font-size: 0.88rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }

      .input-icon-wrap {
        position: relative;

        i:first-child {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-light);
        }

        .form-control {
          padding-left: 2.75rem;
          padding-right: 2.75rem;
        }

        .btn-toggle-pwd {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--color-text-light);
          cursor: pointer;
          padding: 0.35rem;

          &:hover {
            color: var(--color-text-main);
          }
        }
      }

      .emergency-link-wrap {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.5rem;
        margin-bottom: 1rem;

        .btn-emergency-link {
          background: none;
          border: none;
          color: var(--color-gold-dark);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0;

          &:hover {
            color: var(--color-navy-dark);
            text-decoration: underline;
          }
        }
      }

      .btn-block {
        width: 100%;
        margin-top: 0.5rem;
        padding: 0.85rem;
      }

      .demo-accounts {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px dashed var(--color-border);
        text-align: center;

        .demo-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-light);
          display: block;
          margin-bottom: 0.5rem;
        }

        .demo-btns {
          display: flex;
          justify-content: center;
          gap: 0.75rem;

          .btn-demo {
            padding: 0.3rem 0.85rem;
            font-size: 0.8rem;
            font-weight: 600;
            background: var(--color-seafoam);
            color: var(--color-navy-dark);
            border: 1px solid var(--color-border);
            border-radius: 4px;
            cursor: pointer;
            transition: all var(--transition-fast);

            &:hover {
              background: var(--color-gold);
              color: var(--color-navy-dark);
            }
          }
        }

        .demo-credentials-info {
          margin-top: 0.75rem;
          color: var(--color-text-muted);
          font-size: 0.8rem;

          code {
            background: var(--color-seafoam);
            padding: 0.15rem 0.35rem;
            border-radius: 4px;
            color: var(--color-navy-dark);
            font-weight: 600;
          }
        }
      }
    }

    .emergency-modal-body {
      .emergency-notice {
        background: rgba(221, 161, 94, 0.15);
        border-left: 4px solid var(--color-gold);
        padding: 0.85rem 1rem;
        border-radius: 4px;
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        font-size: 0.85rem;
        color: var(--color-navy-dark);

        i {
          color: var(--color-gold-dark);
          font-size: 1.2rem;
          margin-top: 0.1rem;
        }

        p {
          margin: 0;
          line-height: 1.45;
        }
      }

      .alert-danger-box {
        background: rgba(217, 4, 41, 0.12);
        color: var(--color-danger);
        padding: 0.75rem 1rem;
        border-radius: 6px;
        font-size: 0.88rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }

      .alert-success-box {
        background: rgba(42, 157, 143, 0.15);
        color: var(--color-success);
        padding: 0.75rem 1rem;
        border-radius: 6px;
        font-size: 0.88rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }
    }
  `],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public identifier: string = '';
  public password: string = '';
  public showPassword = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string>('');
  public loginSuccessMessage = signal<string>('');

  // Emergency Recovery State
  public isEmergencyModalOpen = signal<boolean>(false);
  public isEmergencyLoading = signal<boolean>(false);
  public recoveryKey: string = '';
  public targetIdentifier: string = '';
  public newPassword: string = '';
  public confirmNewPassword: string = '';
  public emergencyErrorMsg = signal<string>('');
  public emergencySuccessMsg = signal<string>('');

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  fillCredentials(id: string, p: string): void {
    this.identifier = id;
    this.password = p;
    this.errorMessage.set('');
  }

  onLogin(): void {
    if (!this.identifier || !this.password) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login({ identifier: this.identifier, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.user) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
          } else if (res.user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (res.user.role === 'gestore') {
            this.router.navigate(['/gestore/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Credenziali non valide. Riprova.');
      },
    });
  }

  openEmergencyModal(): void {
    this.recoveryKey = '';
    this.targetIdentifier = this.identifier || '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.emergencyErrorMsg.set('');
    this.emergencySuccessMsg.set('');
    this.isEmergencyModalOpen.set(true);
  }

  closeEmergencyModal(): void {
    this.isEmergencyModalOpen.set(false);
    if (this.emergencySuccessMsg()) {
      this.identifier = this.targetIdentifier;
      this.password = '';
    }
  }

  submitEmergencyRecovery(): void {
    if (!this.recoveryKey || !this.targetIdentifier || !this.newPassword) return;

    if (this.newPassword !== this.confirmNewPassword) {
      this.emergencyErrorMsg.set('Le due password inserite non coincidono');
      return;
    }

    if (this.newPassword.length < 6) {
      this.emergencyErrorMsg.set('La password deve essere di almeno 6 caratteri');
      return;
    }

    this.isEmergencyLoading.set(true);
    this.emergencyErrorMsg.set('');
    this.emergencySuccessMsg.set('');

    this.authService.emergencyRecovery(this.recoveryKey, this.targetIdentifier, this.newPassword).subscribe({
      next: (res) => {
        this.isEmergencyLoading.set(false);
        this.emergencySuccessMsg.set(res.message || 'Password reimpostata con successo d\'emergenza. Tutte le sessioni sono state revocate.');
      },
      error: (err) => {
        this.isEmergencyLoading.set(false);
        this.emergencyErrorMsg.set(err.message || 'Errore durante il recupero d\'emergenza. Verifica la chiave e l\'identificativo.');
      },
    });
  }
}
