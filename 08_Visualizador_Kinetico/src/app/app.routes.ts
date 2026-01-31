import { Routes } from '@angular/router';

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
    loadComponent: () => import('./paginas/auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'inicio',
    loadComponent: () => import('./paginas/inicio/inicio.page').then( m => m.InicioPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./paginas/auth/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'listado',
    loadComponent: () => import('./paginas/listado/listado.page').then( m => m.ListadoPage)
  },
  {
    path: 'mis-publicaciones',
    loadComponent: () => import('./paginas/mis-publicaciones/mis-publicaciones.page').then( m => m.MisPublicacionesPage)
  },
  {
    path: 'graficos',
    loadComponent: () => import('./paginas/graficos/graficos.page').then( m => m.GraficosPage)
  },
];
