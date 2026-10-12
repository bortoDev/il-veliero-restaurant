import { Component, inject, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { LogoScrittaIconComponent } from '../svg-icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoScrittaIconComponent],
  template: `
    <header 
      class="site-header" 
      [class.is-scrolled]="isScrolled()"
      [class.is-home]="isHome()" 
      [class.is-home-hero]="isHomeHero()" 
      [class.is-menu-page]="isMenuPage()"
      [class.theme-light]="isLightTheme()" 
      [class.theme-dark]="!isLightTheme()" 
      [class.menu-open]="isMobileOpen()"
    >
      <nav class="main-nav">
        <div class="container nav-container">
          <!-- Official Vector Logo with Dynamic Color Control -->
          <a routerLink="/" class="brand-logo" (click)="closeMobileMenu()" aria-label="Il Veliero Homepage">
            <app-logo-scritta [height]="'66px'"></app-logo-scritta>
          </a>

          <!-- Mobile Toggle Button -->
          <button
            class="mobile-toggle"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="isMobileOpen()"
            aria-label="Apri menu di navigazione"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
              <path *ngIf="!isMobileOpen()" d="M3 6h18M3 12h18M3 18h18" />
              <path *ngIf="isMobileOpen()" d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>

          <!-- Minimalist Navigation Links: MENÙ, PESCATO, EVENTI, DOVE SIAMO -->
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

            <!-- Right Actions: Logged User Badge & Reservation Button -->
            <div class="nav-actions">
              <ng-container *ngIf="authService.currentUser() as user">
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
      height: 82px;
      z-index: 1000;
      border: none !important;
      border-bottom: none !important;
      outline: none !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1);

      /* =========================================================================
         BACKGROUND COLOR LOGIC:
         1. HOME - Over video hero: Invisible (transparent)
         2. HOME - Below video hero: Solid matching background (#F1F5F9)
         3. SUBPAGES: Always solid matching background
         4. NO effects under the navbar (zero shadow, zero border, zero blur)
         ========================================================================= */

      /* Home - Over video hero */
      &.is-home.is-home-hero {
        background-color: transparent !important;
        background: transparent !important;
        pointer-events: none;

        .nav-container,
        .brand-logo,
        .nav-link,
        .btn-prenota,
        .mobile-toggle,
        .action-link,
        .btn-logout {
          pointer-events: auto;
        }
      }

      /* Home - Below video hero: solid matching canvas */
      &.is-home:not(.is-home-hero) {
        background-color: var(--bg-primary, #F1F5F9) !important;
        background: var(--bg-primary, #F1F5F9) !important;
        pointer-events: auto;

        &.theme-dark {
          background-color: var(--bg-navy-dark, #0B2545) !important;
          background: var(--bg-navy-dark, #0B2545) !important;
        }
      }

      /* Non-Home pages: always solid matching background */
      &:not(.is-home) {
        pointer-events: auto;

        &.theme-dark {
          background-color: var(--bg-navy-dark, #0B2545) !important;
          background: var(--bg-navy-dark, #0B2545) !important;
        }

        &.theme-light {
          background-color: var(--bg-primary, #F1F5F9) !important;
          background: var(--bg-primary, #F1F5F9) !important;

          &.is-menu-page {
            background-color: var(--dishoom-bg-primary, #FAF7F2) !important;
            background: var(--dishoom-bg-primary, #FAF7F2) !important;
          }
        }
      }

      /* Mobile menu open: solid background */
      &.menu-open {
        pointer-events: auto;
        &.theme-dark {
          background-color: var(--bg-navy-dark, #0B2545) !important;
        }
        &.theme-light {
          background-color: var(--bg-primary, #F1F5F9) !important;
          &.is-menu-page {
            background-color: var(--dishoom-bg-primary, #FAF7F2) !important;
          }
        }
      }

      /* =========================================================================
         THEME DARK — Active when over dark background sections (Hero / Footer)
         NO effects under text: text-shadow none, filter none, underline none
         ========================================================================= */
      &.theme-dark {
        box-shadow: none !important;
        border: none !important;
        border-bottom: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;

        .brand-logo {
          color: #FFFFFF;
          filter: none !important;

          &:hover {
            color: var(--color-accent-on-dark, #7DD3FC);
            filter: none !important;
          }
        }

        .mobile-toggle {
          color: #FFFFFF;
          filter: none !important;
        }

        .nav-link {
          color: #FFFFFF;
          text-shadow: none !important;
          filter: none !important;

          &::after {
            display: none !important;
          }

          &:hover, &.active {
            color: var(--color-accent-on-dark, #7DD3FC);
          }
        }

        .nav-actions {
          .user-badge {
            color: var(--color-accent-light, #BAE6FD);
            text-shadow: none !important;
            filter: none !important;
          }

          .action-link {
            color: var(--text-inverse-muted, #CBD5E1);
            text-shadow: none !important;
            filter: none !important;

            &:hover {
              color: #FFFFFF;
            }
          }

          .btn-prenota {
            background: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            color: #FFFFFF !important;
            border: 1px solid rgba(255, 255, 255, 0.55);
            border-radius: 4px;
            box-shadow: none !important;
            filter: none !important;

            &:hover {
              background: #FFFFFF !important;
              color: var(--bg-navy-dark, #12283F) !important;
            }
          }
        }
      }

      /* =========================================================================
         THEME LIGHT — Active when over light background sections
         NO effects under text: text-shadow none, filter none, underline none
         ========================================================================= */
      &.theme-light {
        box-shadow: none !important;
        border: none !important;
        border-bottom: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;

        .brand-logo {
          color: var(--bg-navy-dark, #0B2545);
          filter: none !important;

          &:hover {
            color: var(--color-accent-hover, #075985);
            filter: none !important;
          }
        }

        .mobile-toggle {
          color: var(--bg-navy-dark, #0B2545);
          filter: none !important;
        }

        .nav-link {
          color: var(--bg-navy-dark, #0B2545);
          text-shadow: none !important;
          filter: none !important;

          &::after {
            display: none !important;
          }

          &:hover, &.active {
            color: var(--color-accent-hover, #075985);
          }
        }

        .nav-actions {
          .user-badge {
            color: var(--bg-navy-dark, #0B2545);
            text-shadow: none !important;
            filter: none !important;
          }

          .action-link {
            color: var(--text-primary, #1E293B);
            text-shadow: none !important;
            filter: none !important;

            &:hover {
              color: var(--color-accent-hover, #075985);
            }
          }

          .btn-prenota {
            background: rgba(11, 37, 69, 0.03) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            color: var(--bg-navy-dark, #0B2545) !important;
            border: 1px solid rgba(11, 37, 69, 0.22) !important;
            border-radius: 4px;
            box-shadow: none !important;
            filter: none !important;

            &:hover {
              background: var(--bg-navy-dark, #0B2545) !important;
              border-color: var(--bg-navy-dark, #0B2545) !important;
              color: #FFFFFF !important;
            }
          }
        }
      }
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
        justify-content: center;
        height: 100%;
        margin-top: 0;
        transition: transform var(--transition-smooth, 0.35s ease), color 0.35s ease, filter 0.35s ease;

        &:hover {
          transform: translateY(-2px);
        }
      }

      .mobile-toggle {
        display: none;
        background: transparent;
        border: none;
        font-size: 1.6rem;
        cursor: pointer;
        padding: 0.4rem;
        transition: color 0.35s ease;
      }

      .nav-menu {
        display: flex;
        align-items: center;
        gap: 2rem;

        .nav-link {
          font-family: var(--font-body-editorial, 'Plus Jakarta Sans', sans-serif);
          font-weight: 700;
          font-size: 0.84rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 0.4rem 0.2rem;
          position: relative;
          text-decoration: none;
          transition: color 0.35s ease;

          &::after {
            display: none !important;
          }
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-left: 0.75rem;

          .user-badge {
            font-size: 0.82rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            transition: color 0.35s ease;
          }

          .action-link {
            font-size: 0.82rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            text-decoration: none;
            transition: color 0.35s ease;
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
            padding: 0.32rem 1.1rem;
            border-radius: 4px;
            font-family: var(--font-body-editorial, 'Plus Jakarta Sans', sans-serif);
            font-weight: 500;
            font-size: 0.74rem;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            text-decoration: none;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

            i {
              font-size: 0.68rem;
            }

            &::after { display: none; }

            &:hover {
              transform: translateY(-1px);
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
          flex-direction: column;
          align-items: flex-start;
          padding: 1.5rem 2rem;
          gap: 1.25rem;
          display: none;
          max-height: calc(100vh - 82px);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          border-top: none;

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

            .btn-prenota {
              width: 100%;
              justify-content: center;
              padding: 0.75rem;
            }
          }
        }
      }

      .site-header.theme-dark .nav-menu {
        background: var(--bg-navy-dark, #0B2545);
        box-shadow: none !important;
        border-top: none !important;
        .nav-actions { border-top: 1px solid rgba(255, 255, 255, 0.1); }
      }

      .site-header.theme-light .nav-menu {
        background: var(--bg-primary, #F1F5F9);
        box-shadow: none !important;
        border-top: none !important;
        .nav-actions { border-top: 1px solid var(--border-subtle, #D4D4D8); }
      }

      .site-header.theme-light.is-menu-page .nav-menu {
        background: var(--dishoom-bg-primary, #FAF7F2);
        box-shadow: none !important;
        border-top: none !important;
        .nav-actions { border-top: 1px solid var(--border-subtle, #D4D4D8); }
      }
    }
  `],
})
export class NavbarComponent implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);

  public isMobileOpen = signal(false);
  public isScrolled = signal(false);
  public isHome = signal(true);
  public isHomeHero = signal(true);
  public isMenuPage = signal(false);
  public isLightTheme = signal(false);
  public currentNavbarBg = signal<string>('var(--bg-navy-dark, #0B2545)');

  ngOnInit(): void {
    this.updateIsHome(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateIsHome(event.urlAfterRedirects || event.url);
        this.checkNavbarTheme();
        requestAnimationFrame(() => this.checkNavbarTheme());
        setTimeout(() => this.checkNavbarTheme(), 60);
        setTimeout(() => this.checkNavbarTheme(), 200);
      });
    this.checkNavbarTheme();
    requestAnimationFrame(() => this.checkNavbarTheme());
    setTimeout(() => this.checkNavbarTheme(), 60);
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowScroll(): void {
    this.checkNavbarTheme();
  }

  private checkNavbarTheme(): void {
    if (typeof window === 'undefined') return;

    const navbarHeight = 82;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    this.isScrolled.set(scrollY > 20);

    // If scrolled to the bottom over the dark site footer, switch back to white text & dark bg
    const footerEl = document.querySelector('.site-footer');
    if (footerEl) {
      const footerRect = footerEl.getBoundingClientRect();
      if (footerRect.top <= navbarHeight) {
        this.isLightTheme.set(false);
        this.isHomeHero.set(false);
        return;
      }
    }

    if (this.isHome()) {
      const nextLightSection = document.querySelector('.chef-intro-section');
      if (nextLightSection) {
        const lightRect = nextLightSection.getBoundingClientRect();
        // If the first light section reached or passed navbar line:
        if (lightRect.top <= navbarHeight) {
          this.isLightTheme.set(true);
          this.isHomeHero.set(false);
          return;
        } else {
          // While over the hero: ALWAYS dark theme & invisible!
          this.isLightTheme.set(false);
          this.isHomeHero.set(true);
          return;
        }
      } else {
        const heroHeight = (document.querySelector('.hero-morph-wrapper') as HTMLElement)?.offsetHeight || 700;
        const isOverHero = scrollY < heroHeight - navbarHeight;
        this.isLightTheme.set(!isOverHero);
        this.isHomeHero.set(isOverHero);
        return;
      }
    }

    // If scrolled past the page hero:
    const heroEl = document.querySelector(
      '.page-hero, .menu-hero-section, .diario-hero-section, .storia-hero-section, .eventi-hero-section, .dove-hero-section, .login-page, .not-found-hero'
    );
    if (heroEl) {
      const heroRect = heroEl.getBoundingClientRect();
      if (heroRect.bottom <= navbarHeight) {
        this.isLightTheme.set(true);
        this.isHomeHero.set(false);
      } else {
        this.isLightTheme.set(false);
        this.isHomeHero.set(false);
      }
    } else {
      // Pages without a dark hero are light theme by default
      this.isLightTheme.set(true);
      this.isHomeHero.set(false);
    }
  }

  private updateIsHome(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    this.isHome.set(cleanUrl === '/' || cleanUrl === '');
    this.isMenuPage.set(cleanUrl.startsWith('/menu'));
  }

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
