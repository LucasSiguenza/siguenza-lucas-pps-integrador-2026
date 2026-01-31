import { Component, HostListener, inject, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonIcon } from "@ionic/angular/standalone";
import { MarlujoBotonComponent } from "../marlujo-boton/marlujo-boton.component";
import { NavController } from '@ionic/angular';
import { SupabaseService } from 'src/app/servicios/supabaseService';
import { Utils } from 'src/app/servicios/utils';
import { addIcons } from 'ionicons';
import { arrowBackOutline, barChartOutline, gitCompareOutline, personOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
// import { ElementoSb } from 'src/app/servicios/elemento-sb';
// import { UsusarioSb } from 'src/app/servicios/ususario-sb';


@Component({
  selector: 'app-marlujo-header',
  templateUrl: './marlujo-header.component.html',
  styleUrls: ['./marlujo-header.component.scss'],
  imports: [IonIcon, IonToolbar, IonHeader, MarlujoBotonComponent],
})
  export class MarlujoHeaderComponent {



  // private userSvc = inject(UsusarioSb)
  // private elemSvc = inject(ElementoSb);

  // protected rol = this.userSvc.usrActual()?.perfil




  private navCtrl = inject(NavController);
  private sbSvc = inject(SupabaseService);
  private router = inject(Router)
  private utilSvc = inject(Utils)
  protected estoyEnInicio = this.router.url === '/inicio'

  
  protected orientacion: 'vertical' | 'horizontal' = 'vertical';
  @HostListener('window:resize')
  onResize() {
    this.detectarOrientacion();
  }

  detectarOrientacion() {
  this.orientacion =
    window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical';
  }

  constructor(){
    addIcons({personOutline, barChartOutline, arrowBackOutline, gitCompareOutline})
  }
    volver() {
      this.navCtrl.back();
    }
    async irAGraficos(){
      await this.utilSvc.redirigir('graficos')
    }

    async irAMiPerfil(){
      await this.utilSvc.redirigir('mis-publicaciones')
    }

    async logout() {
      // this.elemSvc.destruirCanal();
      await this.sbSvc.cerrarSesion();
      this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/error.m4a', 2000);
      // this.userSvc.usrActual.set(null)
      await this.utilSvc.redirigir('prelogin')
    }
}
