import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFabButton, IonFab } from '@ionic/angular/standalone';
import { Puntuacion } from 'src/app/models/puntuacion';
// import { PuntuacionSb } from 'src/app/servicios/puntuacion-sb';
import { Utils } from 'src/app/servicios/utils';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { FormatoFechaPipe } from 'src/pipes/formato-fecha-pipe';
import { PuntajeSb } from 'src/app/servicios/puntaje-sb';
import { SegundosPipe } from 'src/app/pipes/segundo-pipe';

@Component({
  selector: 'app-top-puntuaciones',
  templateUrl: './top-puntuaciones.page.html',
  styleUrls: ['./top-puntuaciones.page.scss'],
  standalone: true,
  imports: [IonFab, IonFabButton, SegundosPipe, IonContent, FormatoFechaPipe, CommonModule, FormsModule, MarlujoHeaderComponent]
})
export class TopPuntuacionesPage implements OnInit {
  
  protected utilSvc = inject(Utils);
  protected ptsSvc = inject(PuntajeSb);

  puntuaciones = signal<Puntuacion[]>([]);

  async ngOnInit() {
    const carga = await this.utilSvc.loading();
    await carga.present();

    // ⚠️ acá vos después traés los datos reales
    this.puntuaciones.set(await this.ptsSvc.obtenerPuntuaciones());

    await carga.dismiss();
  }

  topCinco = computed(() => {
    return [...this.puntuaciones()]
      .sort((a, b) => Number(b.valor) - Number(a.valor)) // MÁS tiempo primero
      .slice(0, 5);
  });
}

