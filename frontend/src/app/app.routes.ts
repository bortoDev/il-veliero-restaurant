import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { gestoreGuard, adminGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public Routes
  {
    path: '',
    loadComponent: () =>
      import('./features/public/home/home.component').then((m) => m.HomeComponent),
    title: 'Il Veliero — Ristorante & Pizzeria dal Campione del Mondo',
  },
  {
    path: 'storia',
    loadComponent: () =>
      import('./features/public/storia/storia.component').then((m) => m.StoriaComponent),
    title: 'La Nostra Storia — Il Veliero',
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./features/public/menu/menu.component').then((m) => m.MenuComponent),
    title: 'Il Menù — Il Veliero',
  },
  {
    path: 'qr-menu',
    loadComponent: () =>
      import('./features/public/qr-menu/qr-menu.component').then((m) => m.QrMenuComponent),
    title: 'Menù Tavolo — Il Veliero',
  },
  {
    path: 'pescato',
    loadComponent: () =>
      import('./features/public/pescato/pescato.component').then((m) => m.PescatoComponent),
    title: 'Pescato del Giorno — Il Veliero',
  },
  {
    path: 'eventi',
    loadComponent: () =>
      import('./features/public/eventi/eventi.component').then((m) => m.EventiComponent),
    title: 'Eventi & Serate — Il Veliero',
  },
  {
    path: 'dove-siamo',
    loadComponent: () =>
      import('./features/public/dove-siamo/dove-siamo.component').then((m) => m.DoveSiamoComponent),
    title: 'Dove Siamo & Contatti — Il Veliero',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/public/login/login.component').then((m) => m.LoginComponent),
    title: 'Area Riservata — Il Veliero',
  },

  // Protected Gestore Routes
  {
    path: 'gestore',
    canActivate: [authGuard, gestoreGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/gestore/dashboard/gestore-dashboard.component').then(
            (m) => m.GestoreDashboardComponent
          ),
        title: 'Dashboard Gestore — Il Veliero',
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./features/gestore/menu-management/menu-management.component').then(
            (m) => m.MenuManagementComponent
          ),
        title: 'Gestione Menù — Il Veliero',
      },
      {
        path: 'pescato',
        loadComponent: () =>
          import('./features/gestore/pescato-management/pescato-management.component').then(
            (m) => m.PescatoManagementComponent
          ),
        title: 'Gestione Pescato — Il Veliero',
      },
      {
        path: 'avvisi',
        loadComponent: () =>
          import('./features/gestore/avvisi-management/avvisi-management.component').then(
            (m) => m.AvvisiManagementComponent
          ),
        title: 'Gestione Avvisi — Il Veliero',
      },
      {
        path: 'eventi',
        loadComponent: () =>
          import('./features/gestore/eventi-management/eventi-management.component').then(
            (m) => m.EventiManagementComponent
          ),
        title: 'Gestione Eventi — Il Veliero',
      },
      {
        path: 'info',
        loadComponent: () =>
          import('./features/gestore/info-management/info-management.component').then(
            (m) => m.InfoManagementComponent
          ),
        title: 'Informazioni Locale — Il Veliero',
      },
    ],
  },

  // Protected Admin Routes
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
        title: 'Pannello Admin — Il Veliero',
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/user-management/user-management.component').then(
            (m) => m.UserManagementComponent
          ),
        title: 'Gestione Utenti — Il Veliero Admin',
      },
      {
        path: 'audit-logs',
        loadComponent: () =>
          import('./features/admin/audit-log-viewer/audit-log-viewer.component').then(
            (m) => m.AuditLogViewerComponent
          ),
        title: 'Registro Audit — Il Veliero Admin',
      },
      {
        path: 'blacklist',
        loadComponent: () =>
          import('./features/admin/blacklist-management/blacklist-management.component').then(
            (m) => m.BlacklistManagementComponent
          ),
        title: 'Gestione Blacklist JWT — Il Veliero Admin',
      },
      {
        path: 'security',
        loadComponent: () =>
          import('./features/admin/security-hub/security-hub.component').then(
            (m) => m.SecurityHubComponent
          ),
        title: 'Centro Tecnico & Sicurezza — Il Veliero Admin',
      },
      {
        path: 'info',
        loadComponent: () =>
          import('./features/admin/info-editor/info-editor.component').then(
            (m) => m.InfoEditorComponent
          ),
        title: 'Editor Informazioni Locale — Il Veliero Admin',
      },
      {
        path: 'info-editor',
        redirectTo: 'info',
        pathMatch: 'full',
      },
    ],
  },

  // Fallback Wildcard
  {
    path: '**',
    redirectTo: '',
  },
];
