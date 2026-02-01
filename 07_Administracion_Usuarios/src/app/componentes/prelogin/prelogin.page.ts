import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent,IonCol, IonRow, IonGrid } from '@ionic/angular/standalone';
import { MarlujoInputComponent } from "../marlujo-input/marlujo-input.component";
import { Utils } from 'src/app/servicios/utils';
import { defineCustomElements } from '@ionic/core/loader';


@Component({
 selector: 'app-prelogin',
  templateUrl: './prelogin.page.html',
  styleUrls: ['./prelogin.page.scss'],
  standalone: true,
  imports: [
    IonCol,
    IonRow,
    IonGrid,
    IonContent,
    FormsModule,
  ],
})
export class PreloginPage {

  private utilSvc = inject(Utils);


  constructor() {
    defineCustomElements(window);
    setTimeout(() => {
      //! ¡Forzar que Ionic actualice sus segmentos después de que el DOM esté montado!
      const segments = document.querySelectorAll('ion-segment');
      segments.forEach((seg) => (seg.value = seg.value));
    }, 50);
  }
    async ionViewDidEnter(): Promise<void> {
      this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/prelogin.m4a',3000)
      setTimeout(async () => {
        {  
          await this.utilSvc.redirigir('login', true); 
        }
      }, 2000);
  }
}