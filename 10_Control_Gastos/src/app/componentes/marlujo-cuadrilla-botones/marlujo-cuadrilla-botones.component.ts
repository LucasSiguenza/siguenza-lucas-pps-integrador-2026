import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CuadrillaConfig } from 'src/app/models/cuadrillaConfig';

@Component({
  selector: 'app-marlujo-cuadrilla-botones',
  templateUrl: './marlujo-cuadrilla-botones.component.html',
  styleUrls: ['./marlujo-cuadrilla-botones.component.scss'],
  imports: [CommonModule]
})
export class MarlujoCuadrillaBotonesComponent {
  @Input({ required: true }) cards!: CuadrillaConfig[];
  @Input() centro?: CuadrillaConfig;


  onClick(card: CuadrillaConfig) {
    card.accion();
  }

}
