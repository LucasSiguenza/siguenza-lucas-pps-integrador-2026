import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFabButton, IonFab } from '@ionic/angular/standalone';
import { Puntuacion } from 'src/app/models/puntuacion';
import { PuntuacionSb } from 'src/app/servicios/puntuacion-sb';
import { Utils } from 'src/app/servicios/utils';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { FormatoFechaPipe } from 'src/pipes/formato-fecha-pipe';

@Component({
  selector: 'app-top-puntuaciones',
  templateUrl: './top-puntuaciones.page.html',
  styleUrls: ['./top-puntuaciones.page.scss'],
  standalone: true,
  imports: [IonFab, IonFabButton, IonContent, FormatoFechaPipe, CommonModule, FormsModule, MarlujoHeaderComponent]
})
export class TopPuntuacionesPage implements OnInit {
  protected ptsSvc = inject(PuntuacionSb)
  protected utilSvc = inject(Utils)
  puntuaciones = signal<Puntuacion[]>([]);

  dificultadSeleccionada = signal<'facil' | 'media' | 'dificil'>('facil');

  async ngOnInit() {
    const carga = await this.utilSvc.loading();
    carga.present();

    this.puntuaciones.set( await this.ptsSvc.obtenerPuntuaciones());

    await carga.dismiss()

  }

  topCinco = computed(() => {
  return this.puntuaciones()
    .filter(p => p.dificultad === this.dificultadSeleccionada())
    .sort((a, b) => this.parseTiempo(a.tiempo) - this.parseTiempo(b.tiempo))
    .slice(0, 5);
});


  cambiarDificultad(dificultad: 'facil' | 'media' | 'dificil') {
    this.dificultadSeleccionada.set(dificultad);
  }

  private parseTiempo(tiempo: string): number {
    // formato mm:ss:ms → milisegundos
    const [min, seg, ms] = tiempo.split(':').map(Number);
    return (min * 60_000) + (seg * 1_000) + ms;
  }
}
