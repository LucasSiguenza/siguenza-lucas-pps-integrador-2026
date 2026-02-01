import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController, IonButton } from '@ionic/angular/standalone';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { Utils } from 'src/app/servicios/utils';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { PuntajeSb } from 'src/app/servicios/puntaje-sb';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, MarlujoHeaderComponent]
})
export class InicioPage {
  private ptsSvc = inject(PuntajeSb)
  private utilSvc = inject(Utils)

  async seleccionarListado(selec: 'marvel' | 'dc'){
    this.ptsSvc.tipo.set(selec);
    await this.utilSvc.redirigir('juego')
  }

  
}
