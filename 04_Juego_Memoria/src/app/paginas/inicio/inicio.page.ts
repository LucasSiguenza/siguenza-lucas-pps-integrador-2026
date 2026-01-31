import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController, IonButton } from '@ionic/angular/standalone';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { Utils } from 'src/app/servicios/utils';
import { PuntuacionSb } from 'src/app/servicios/puntuacion-sb';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, CommonModule, FormsModule, MarlujoHeaderComponent, RouterLink]
})
export class InicioPage {
  orientacion: 'vertical' | 'horizontal' = 'vertical';
  protected utilSvc = inject(Utils)
  protected ptsSvc = inject(PuntuacionSb);
 
  constructor() {
    this.detectarOrientacion();
  }

  // Detectar cambios de orientación
  @HostListener('window:resize')
  onResize() {
    this.detectarOrientacion();
  }

  detectarOrientacion() {
    this.orientacion = window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical';
  }

  async redirigirDificultad(dif: 'facil'| 'medio'| 'dificil'){
    this.ptsSvc.dificultad.set(dif);
    await this.utilSvc.redirigir('juego');
  }
  
}
