import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard-page">
      <div class="container">
        <div class="admin-header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; width: 100%;">
            <div>
              <div class="header-badges">
                <span class="admin-badge"><i class="fa-solid fa-shield-halved"></i> Area Amministratore</span>
                <span *ngIf="authService.isMasterAdmin()" class="master-crown-badge">
                  <i class="fa-solid fa-crown"></i> Master Admin Immutabile
                </span>
              </div>
              <h1>Pannello di Amministrazione & Sicurezza</h1>
              <p>Benvenuto, <strong>{{ authService.currentUser()?.name }}</strong>. Controllo accessi, governance utenti, audit log e revoca token.</p>
            </div>
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <a routerLink="/admin/security" class="btn btn-gold btn-sm">
                <i class="fa-solid fa-server"></i> Centro Tecnico & Log
              </a>
            </div>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card card">
            <div class="metric-icon icon-users"><i class="fa-solid fa-users-gear"></i></div>
            <div class="metric-data">
              <span class="metric-value">{{ totalUsers() }}</span>
              <span class="metric-label">Utenti & Gestori</span>
            </div>
            <a routerLink="/admin/users" class="metric-link">Gestisci Utenti <i class="fa-solid fa-arrow-right"></i></a>
          </div>

          <div class="metric-card card">
            <div class="metric-icon icon-audit"><i class="fa-solid fa-clipboard-list"></i></div>
            <div class="metric-data">
              <span class="metric-value">{{ totalLogs() }}</span>
              <span class="metric-label">Registrazioni Audit</span>
            </div>
            <a routerLink="/admin/security" class="metric-link">Consulta Audit Log <i class="fa-solid fa-arrow-right"></i></a>
          </div>

          <div class="metric-card card">
            <div class="metric-icon icon-blacklist"><i class="fa-solid fa-ban"></i></div>
            <div class="metric-data">
              <span class="metric-value">{{ totalBlacklisted() }}</span>
              <span class="metric-label">Token Revocati</span>
            </div>
            <a routerLink="/admin/security" class="metric-link">Gestisci Blacklist <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>

        <!-- Admin Navigation Hub -->
        <div class="admin-modules-section">
          <h2>Moduli di Governance & Sicurezza</h2>
          <div class="modules-grid">
            <a routerLink="/admin/security" class="module-card card" style="border: 2px solid var(--color-gold);">
              <i class="fa-solid fa-server module-icon" style="color: var(--color-gold);"></i>
              <div>
                <h3 style="color: var(--color-navy-dark);">Centro Tecnico, Audit Log & Blacklist</h3>
                <p>Monitoraggio di sicurezza unificato: registro attività, blocco credenziali compromesse, revoca token e cambio password.</p>
              </div>
            </a>
            <a routerLink="/admin/users" class="module-card card">
              <i class="fa-solid fa-user-shield module-icon"></i>
              <div>
                <h3>Gestione Utenti & Ruoli</h3>
                <p>Crea nuovi account gestori, modifica i ruoli (client, gestore, admin), attiva o disattiva le credenziali.</p>
              </div>
            </a>

            <a routerLink="/admin/audit-logs" class="module-card card">
              <i class="fa-solid fa-fingerprint module-icon"></i>
              <div>
                <h3>Registro Audit delle Operazioni</h3>
                <p>Traccia in tempo reale ogni mutazione dati, creazione, eliminazione e tentativo di accesso con IP e timestamp.</p>
              </div>
            </a>

            <a routerLink="/admin/blacklist" class="module-card card">
              <i class="fa-solid fa-shield-virus module-icon"></i>
              <div>
                <h3>Gestione Blacklist Token JWT</h3>
                <p>Revoca istantaneamente token di sessione compromessi e monitora la scadenza automatica TTL in MongoDB.</p>
              </div>
            </a>

            <a routerLink="/admin/info" class="module-card card">
              <i class="fa-solid fa-store module-icon"></i>
              <div>
                <h3>Editor Dati & Orari Locale</h3>
                <p>Modifica recapiti aziendali, P.IVA, SDI, orari di apertura e testi informativi di Bassano del Grappa.</p>
              </div>
            </a>

            <a routerLink="/gestore/dashboard" class="module-card card">
              <i class="fa-solid fa-utensils module-icon"></i>
              <div>
                <h3>Passa al Pannello Gestore</h3>
                <p>Accedi direttamente alle funzioni operative per menù, pescato del giorno, eventi e banner.</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard-page {
      padding: 3.5rem 0 5rem;
      background: var(--color-bg-main);
      min-height: 80vh;
    }

    .admin-header {
      margin-bottom: 2.5rem;

      .header-badges {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-bottom: 0.75rem;
      }

      .admin-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #ffffff;
        background: var(--color-navy-dark);
        padding: 0.3rem 0.75rem;
        border-radius: 20px;
      }

      .master-crown-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #ffffff;
        background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%);
        padding: 0.3rem 0.75rem;
        border-radius: 20px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.15);
      }

      h1 { font-size: 2.3rem; color: var(--color-navy-dark); margin-bottom: 0.35rem; }
      p { color: var(--color-text-muted); font-size: 1.05rem; }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3.5rem;

      .metric-card {
        padding: 1.75rem;

        .metric-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1.25rem;

          &.icon-users { background: rgba(11, 37, 69, 0.12); color: var(--color-navy-dark); }
          &.icon-audit { background: rgba(221, 161, 94, 0.2); color: var(--color-gold-dark); }
          &.icon-blacklist { background: rgba(217, 4, 41, 0.15); color: var(--color-danger); }
        }

        .metric-data {
          margin-bottom: 1.25rem;

          .metric-value {
            font-family: var(--font-heading);
            font-size: 2.2rem;
            font-weight: 700;
            color: var(--color-navy-dark);
            display: block;
            line-height: 1;
            margin-bottom: 0.35rem;
          }

          .metric-label {
            font-size: 0.85rem;
            color: var(--color-text-muted);
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
        }

        .metric-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-navy-medium);
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;

          &:hover { color: var(--color-gold-dark); padding-left: 3px; }
        }
      }
    }

    .admin-modules-section {
      h2 { font-size: 1.6rem; margin-bottom: 1.5rem; color: var(--color-navy-dark); }

      .modules-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;

        .module-card {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          padding: 1.75rem;
          color: inherit;
          transition: transform var(--transition-fast), border-color var(--transition-fast);

          .module-icon {
            font-size: 2rem;
            color: var(--color-navy-medium);
            margin-top: 0.2rem;
          }

          h3 { font-size: 1.15rem; margin-bottom: 0.4rem; color: var(--color-navy-dark); }
          p { font-size: 0.88rem; color: var(--color-text-muted); margin-bottom: 0; line-height: 1.5; }

          &:hover { transform: translateY(-3px); border-color: var(--color-gold); }
        }
      }
    }
  `],
})
export class AdminDashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private adminService = inject(AdminService);

  public totalUsers = signal<number>(0);
  public totalLogs = signal<number>(0);
  public totalBlacklisted = signal<number>(0);

  ngOnInit(): void {
    this.adminService.getUsers({ limit: 1 }).subscribe({
      next: (res) => { if (res.success) this.totalUsers.set(res.total); },
    });

    this.adminService.getAuditLogs({ limit: 1 }).subscribe({
      next: (res) => { if (res.success) this.totalLogs.set(res.total); },
    });

    this.adminService.getBlacklistedTokens({ limit: 1 }).subscribe({
      next: (res) => { if (res.success) this.totalBlacklisted.set(res.pagination?.total ?? res.total ?? 0); },
    });
  }
}
