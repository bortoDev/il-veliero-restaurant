import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="site-header">
      <nav class="main-nav">
        <div class="container nav-container">
          <!-- Cursive Logo matching authentic style requested by user -->
          <a routerLink="/" class="brand-logo" (click)="closeMobileMenu()">
            <span class="brand-title-cursive">Il Veliero</span>
          </a>

          <!-- Mobile Toggle Button -->
          <button
            class="mobile-toggle"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="isMobileOpen()"
            aria-label="Apri menu di navigazione"
          >
            <i class="fa-solid" [ngClass]="isMobileOpen() ? 'fa-xmark' : 'fa-bars'"></i>
          </button>

          <!-- Minimalist Navigation Links: menu, pescato, storia, eventi, dovesiamo -->
          <div class="nav-menu" [class.open]="isMobileOpen()">
            <a
              routerLink="/menu"
              routerLinkActive="active"
              (click)="closeMobileMenu()"
              class="nav-link"
            >
              MENÙ
            </a>
            <a
              routerLink="/pescato"
              routerLinkActive="active"
              (click)="closeMobileMenu()"
              class="nav-link"
            >
              PESCATO
            </a>
            <a
              routerLink="/storia"
              routerLinkActive="active"
              (click)="closeMobileMenu()"
              class="nav-link"
            >
              STORIA
            </a>
            <a
              routerLink="/eventi"
              routerLinkActive="active"
              (click)="closeMobileMenu()"
              class="nav-link"
            >
              EVENTI
            </a>
            <a
              routerLink="/dove-siamo"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{exact: true}"
              (click)="closeMobileMenu()"
              class="nav-link"
            >
              DOVE SIAMO
            </a>

            <!-- Right Actions: Auth & Reservation -->
            <div class="nav-actions">
              <ng-container *ngIf="authService.currentUser() as user; else guestNav">
                <span class="user-badge">
                  <i class="fa-solid fa-user-shield"></i> {{ user.name || user.username }}
                </span>
                <a *ngIf="user.role === 'admin'" routerLink="/admin/dashboard" (click)="closeMobileMenu()" class="action-link">
                  <i class="fa-solid fa-gauge-high"></i> Dashboard
                </a>
                <a *ngIf="user.role === 'gestore'" routerLink="/gestore/dashboard" (click)="closeMobileMenu()" class="action-link">
                  <i class="fa-solid fa-utensils"></i> Dashboard
                </a>
                <button (click)="logout(); closeMobileMenu()" class="btn-logout" title="Esci">
                  <i class="fa-solid fa-right-from-bracket"></i>
                </button>
              </ng-container>
              <ng-template #guestNav>
                <a routerLink="/login" (click)="closeMobileMenu()" class="login-subtle-link" title="Area Riservata">
                  <i class="fa-solid fa-lock"></i>
                  <span>Area Riservata</span>
                </a>
              </ng-template>

              <!-- Quick Reservation Button -->
              <a
                href="tel:0424500200"
                class="btn-prenota"
                (click)="closeMobileMenu()"
              >
                <i class="fa-solid fa-phone"></i> Prenota Tavolo
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .site-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 68px;
      z-index: 1000;
      background: #07192F;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: none;
      border-bottom: none;
      box-shadow: none;
    }

    .main-nav {
      height: 100%;
      display: flex;
      align-items: center;

      .nav-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1.5rem;
      }

      .brand-logo {
        text-decoration: none;
        display: flex;
        align-items: center;
        transition: transform var(--transition-smooth, 0.35s ease);

        &:hover {
          transform: translateY(-1px);
        }

        .brand-title-cursive {
          font-family: 'Great Vibes', 'Alex Brush', 'Playfair Display', cursive;
          font-size: clamp(1.85rem, 5vw, 2.35rem);
          color: #FAF7F2;
          letter-spacing: 0.02em;
          line-height: 1;
          text-shadow: 0 0 14px rgba(197, 138, 62, 0.45);
          font-weight: 400;
          white-space: nowrap;
          user-select: none;
        }
      }

      .mobile-toggle {
        display: none;
        background: transparent;
        border: none;
        color: #FAF7F2;
        font-size: 1.6rem;
        cursor: pointer;
        padding: 0.4rem;
      }

      .nav-menu {
        display: flex;
        align-items: center;
        gap: 1.65rem;

        .nav-link {
          font-family: var(--font-body-editorial, 'Plus Jakarta Sans', sans-serif);
          color: #FAF7F2;
          font-weight: 600;
          font-size: 0.88rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 0.4rem 0.15rem;
          position: relative;
          text-decoration: none;
          transition: color var(--transition-fast, 0.2s ease);

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--dishoom-brass, #C58A3E);
            transition: width var(--transition-fast, 0.2s ease);
          }

          &:hover, &.active {
            color: var(--dishoom-brass, #C58A3E);

            &::after {
              width: 100%;
            }
          }
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-left: 0.5rem;

          .user-badge {
            color: var(--dishoom-brass, #C58A3E);
            font-size: 0.82rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
          }

          .action-link, .login-subtle-link {
            color: var(--dishoom-ink-inverse-muted, #DDD3C4);
            font-size: 0.82rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            text-decoration: none;
            transition: color var(--transition-fast, 0.2s ease);

            &:hover {
              color: var(--dishoom-brass, #C58A3E);
            }
          }

          .btn-logout {
            background: transparent;
            border: none;
            color: #f87171;
            cursor: pointer;
            font-size: 0.9rem;
            padding: 0.2rem;
            &:hover { color: #ef4444; }
          }

          .btn-prenota {
            background: transparent;
            color: var(--dishoom-brass, #C58A3E) !important;
            border: 1px solid var(--dishoom-brass, #C58A3E);
            padding: 0.45rem 1.15rem;
            border-radius: 3px;
            font-family: var(--font-body-editorial, 'Plus Jakarta Sans', sans-serif);
            font-weight: 700;
            font-size: 0.82rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            text-decoration: none;
            transition: all var(--transition-smooth, 0.35s ease);

            &::after { display: none; }

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 14px rgba(197, 138, 62, 0.3);
              background: var(--dishoom-brass, #C58A3E);
              color: var(--dishoom-bg-navy-dark, #07192F) !important;
            }
          }
        }
      }
    }

    @media (max-width: 992px) {
      .main-nav {
        .mobile-toggle {
          display: block;
        }

        .nav-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(7, 25, 47, 0.98);
          backdrop-filter: blur(14px);
          flex-direction: column;
          align-items: flex-start;
          padding: 1.5rem 2rem;
          gap: 1.25rem;
          display: none;
          max-height: calc(100vh - 68px);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          border-top: 1px solid rgba(197, 138, 62, 0.25);

          &.open {
            display: flex;
          }

          .nav-link {
            width: 100%;
            font-size: 1rem;
            padding: 0.5rem 0;
          }

          .nav-actions {
            width: 100%;
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            margin-left: 0;
            padding-top: 0.75rem;
            border-top: 1px solid rgba(197, 138, 62, 0.25);

            .btn-prenota {
              width: 100%;
              justify-content: center;
              padding: 0.75rem;
            }
          }
        }
      }
    }
  `],
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public isMobileOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileOpen.set(false);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
