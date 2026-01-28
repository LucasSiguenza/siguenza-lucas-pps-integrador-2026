import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { ElementoSb } from 'src/app/servicios/elemento-sb';
import { Utils } from 'src/app/servicios/utils';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, MarlujoHeaderComponent]
})
export class InicioPage {

  private elementoSvc = inject(ElementoSb)
  private utilSvc = inject(Utils)

  async seleccionarListado(selec: 'lindo' | 'feo'){
    this.elementoSvc.listadoSeleccionado.set(selec);
    await this.utilSvc.redirigir('listado')
  }
}
