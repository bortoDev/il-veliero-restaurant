import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LogoScrittaIconComponent } from '../../../shared/components/svg-icons';
import { BoIconComponent } from '../shared/bo-icon.component';

interface NavItem {
  path: string;
  label: string;
  short: string;
  icon: string;
}

@Component({
  selector: 'app-gestore-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoScrittaIconComponent, BoIconComponent],
  template: `
    <div class="bo-shell">
      <!-- Barra laterale (desktop) -->
      <aside class="sidebar">
        <a routerLink="/gestore/dashboard" class="brand" aria-label="Area gestore — Il Veliero">
          <app-logo-scritta height="44px" color="#FFFFFF"></app-logo-scritta>
          <span class="brand-tag">Area gestore</span>
        </a>

        <nav class="side-nav" aria-label="Sezioni area gestore">
          <a
            *ngFor="let item of nav"
            [routerLink]="item.path"
            routerLinkActive="active"
            class="side-link"
          >
            <bo-icon [name]="item.icon"></bo-icon>
            <span>{{ item.label }}</span>
          </a>
        </nav>

        <div class="side-foot">
          <a routerLink="/" target="_blank" class="side-link subtle">
            <bo-icon name="external"></bo-icon>
            <span>Vedi il sito</span>
          </a>
          <div class="user-box">
            <span class="user-name">{{ auth.displayName() }}</span>
            <button type="button" class="logout" (click)="logout()">
              <bo-icon name="logout" [size]="18"></bo-icon> Esci
            </button>
          </div>
        </div>
      </aside>

      <!-- Barra superiore (telefono) -->
      <header class="topbar">
        <a routerLink="/gestore/dashboard" aria-label="Area gestore">
          <app-logo-scritta height="34px" color="#FFFFFF"></app-logo-scritta>
        </a>
        <div class="topbar-actions">
          <a routerLink="/" target="_blank" class="icon-btn" aria-label="Vedi il sito">
            <bo-icon name="external"></bo-icon>
          </a>
          <button type="button" class="icon-btn" (click)="logout()" aria-label="Esci">
            <bo-icon name="logout"></bo-icon>
          </button>
        </div>
      </header>

      <main class="bo-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Navigazione in basso (telefono) -->
      <nav class="tabbar" aria-label="Sezioni area gestore">
        <a *ngFor="let item of nav" [routerLink]="item.path" routerLinkActive="active" class="tab">
          <bo-icon [name]="item.icon" [size]="22"></bo-icon>
          <span>{{ item.short }}</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .bo-shell {
      min-height: 100vh;
      background: var(--bg-primary);
      padding-left: 248px;
    }

    /* ---------- Sidebar ---------- */
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 248px;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      background: var(--bg-navy-dark);
      color: var(--text-inverse);
      z-index: 100;
    }

    .brand {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0 0.6rem 1.5rem;
      color: #FFFFFF;

      .brand-tag {
        font-family: var(--font-sans);
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--color-accent-on-dark);
      }
    }

    .side-nav {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .side-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-height: 44px;
      padding: 0 0.75rem;
      border-radius: 6px;
      font-family: var(--font-sans);
      font-size: 0.92rem;
      font-weight: 500;
      color: var(--text-inverse-muted);
      text-decoration: none;
      transition: background var(--transition-fast), color var(--transition-fast);

      &:hover { background: rgba(255, 255, 255, 0.06); color: #FFFFFF; }

      &.active {
        background: rgba(125, 211, 252, 0.12);
        color: #FFFFFF;
        box-shadow: inset 3px 0 0 var(--color-accent-on-dark);
      }

      &.subtle { font-size: 0.85rem; }
    }

    .side-foot {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .user-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.9rem 0.75rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);

      .user-name {
        font-size: 0.85rem;
        color: #FFFFFF;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .logout {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      min-height: 36px;
      padding: 0 0.6rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      background: transparent;
      color: var(--text-inverse-muted);
      font-size: 0.82rem;
      cursor: pointer;

      &:hover { color: #FFFFFF; border-color: rgba(255, 255, 255, 0.45); }
    }

    /* ---------- Topbar & tabbar (telefono) ---------- */
    .topbar, .tabbar { display: none; }

    @media (max-width: 900px) {
      .bo-shell { padding-left: 0; padding-top: 56px; }
      .sidebar { display: none; }

      .topbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 0.5rem 0 1rem;
        background: var(--bg-navy-dark);
        color: #FFFFFF;
        z-index: 100;

        a { color: #FFFFFF; display: inline-flex; }
      }

      .topbar-actions { display: flex; gap: 0.25rem; }

      .icon-btn {
        width: 44px;
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--text-inverse-muted);
        cursor: pointer;
      }

      .tabbar {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        background: var(--bg-surface);
        border-top: 1px solid var(--border-subtle);
        padding-bottom: env(safe-area-inset-bottom);
        z-index: 100;
      }

      .tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.2rem;
        min-height: 60px;
        font-family: var(--font-sans);
        font-size: 0.68rem;
        font-weight: 600;
        color: var(--text-muted);
        text-decoration: none;

        &.active { color: var(--color-accent); }
      }
    }
  `],
})
export class GestoreLayoutComponent {
  readonly auth = inject(AuthService);

  readonly nav: NavItem[] = [
    { path: '/gestore/dashboard', label: 'Oggi', short: 'Oggi', icon: 'home' },
    { path: '/gestore/pescato', label: 'Pescato del giorno', short: 'Pescato', icon: 'fish' },
    { path: '/gestore/eventi', label: 'Eventi', short: 'Eventi', icon: 'calendar' },
    { path: '/gestore/avvisi', label: 'Avvisi', short: 'Avvisi', icon: 'bell' },
    { path: '/gestore/menu', label: 'Menù', short: 'Menù', icon: 'book' },
    { path: '/gestore/info', label: 'Orari e contatti', short: 'Info', icon: 'info' },
  ];

  logout(): void {
    this.auth.logout().subscribe();
  }
}
