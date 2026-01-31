import { Component, inject, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonContent, IonCard, IonCardContent, IonButton } from "@ionic/angular/standalone";
import { Pregunta } from '../../../models/botonIdioma';
import { Utils } from 'src/app/servicios/utils';

@Component({
  selector: 'app-desafio-modal',
  templateUrl: './desafio-modal.component.html',
  styleUrls: ['./desafio-modal.component.scss'],
  standalone: true,
  imports: [IonButton, IonCardContent, IonCard, IonContent],
  providers: [ModalController] // 🔹 Agregado

})
export class DesafioModalComponent {
  @Input() pregunta!: Pregunta; // Pregunta aleatoria ya filtrada por tema/nivel/idioma
  @Input() idioma!: string;     // Idioma seleccionado (por si quieres ajustar texto dinámicamente)

  private utilSvc = inject(Utils);
  mensajeFeedback: string = '';
  mostrarFeedback: boolean = false;
  respuestaCorrecta: boolean | null = null;

  constructor(private modalCtrl: ModalController) {}

  // Método para responder la pregunta
  responder(respuesta: boolean) {
    this.respuestaCorrecta = respuesta === this.pregunta.correcta;
    if(this.respuestaCorrecta) this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/success.m4a',1200)
    else this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/error.m4a',2000, 0.5)
    this.mensajeFeedback = this.respuestaCorrecta
      ? '¡ACERTASTE!'
      : 'Repasemos mejor para la próxima ;)';

    this.mostrarFeedback = true;

    // Cierra el modal tras 1.2s
    setTimeout(() => this.modalCtrl.dismiss(), 1200);
  }
}
