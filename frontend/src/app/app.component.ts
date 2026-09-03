import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <div class="app-layout">
      <app-navbar></app-navbar>
      <main class="main-wrapper">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--dishoom-bg-navy-dark, #07192F);
    }

    .main-wrapper {
      flex: 1;
      padding-top: 68px;
      background-color: var(--dishoom-bg-navy-dark, #07192F);
    }
  `],
})
export class AppComponent {
  title = 'Ristorante Il Veliero';
}
