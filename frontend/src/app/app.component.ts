import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <!-- L'area gestore ha una sua cornice (barra laterale), senza navbar e footer del sito pubblico -->
    <router-outlet *ngIf="isBackOffice(); else publicSite"></router-outlet>

    <ng-template #publicSite>
      <div class="app-layout">
        <app-navbar></app-navbar>
        <main class="main-wrapper">
          <router-outlet></router-outlet>
        </main>
        <app-footer></app-footer>
      </div>
    </ng-template>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--bg-primary, #F1F5F9);
    }

    .main-wrapper {
      flex: 1;
      padding-top: 82px;
      background-color: var(--bg-primary, #F1F5F9);
    }
  `],
})
export class AppComponent {
  private router = inject(Router);

  title = 'Ristorante Il Veliero';

  readonly isBackOffice = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.startsWith('/gestore'))
    ),
    { initialValue: typeof window !== 'undefined' && window.location.pathname.startsWith('/gestore') }
  );
}
