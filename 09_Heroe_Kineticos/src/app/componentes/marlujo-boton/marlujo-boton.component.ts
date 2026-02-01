import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-marlujo-boton',
  standalone: true,
  imports: [CommonModule, ],
  templateUrl: './marlujo-boton.component.html',
  styleUrls: ['./marlujo-boton.component.scss'],
})
export class MarlujoBotonComponent {
  @Input({ required: true }) texto!: string;
  @Input() tipo: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled:boolean = false;
  @Input() color: 'azul' | 'violeta' | 'rojo' | 'verde' | 'amarillo' = 'azul';

}
