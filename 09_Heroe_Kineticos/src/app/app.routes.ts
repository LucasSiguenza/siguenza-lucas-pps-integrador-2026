import { Routes } from '@angular/router';
import { LoginPage } from './paginas/auth/login/login.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'prelogin',
    pathMatch: 'full',
  },
  {
    path: 'prelogin',
    loadComponent: () => import('./componentes/prelogin/prelogin.page').then( m => m.PreloginPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./paginas/auth/login/login.page').then(m => LoginPage)
  },
  {
    path: 'inicio',
    loadComponent: () => import('./paginas/inicio/inicio.page').then( m => m.InicioPage)
  },
  {
    path: 'juego',
    loadComponent: () => import('./paginas/juego/juego.page').then( m => m.JuegoPage)
  },
  {
    path: 'top-puntuaciones',
    loadComponent: () => import('./paginas/top-puntuaciones/top-puntuaciones.page').then( m => m.TopPuntuacionesPage)
  },
];
