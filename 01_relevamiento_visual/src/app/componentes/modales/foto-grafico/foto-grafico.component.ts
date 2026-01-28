import { TitleCasePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline, closeCircleOutline, closeOutline } from 'ionicons/icons';
import { Elemento } from 'src/app/models/elementos';
import { FormatoFechaPipe } from 'src/app/pipes/formato-fecha-pipe';

@Component({
  selector: 'app-foto-grafico',
  templateUrl: './foto-grafico.component.html',
  styleUrls: ['./foto-grafico.component.scss'],
  imports: [IonIcon, FormatoFechaPipe, TitleCasePipe],
  standalone: true,
})
export class FotoGraficoComponent implements OnInit {

  @Input({ required: true }) elemento!: Elemento;

  
  //~ ======================= Carrusel =======================

  fotoActiva = 0;
  private touchStartX = 0;

  ngOnInit() {
    // 🔹 seguridad: cada vez que se abre el modal
    this.fotoActiva = 0;
  }

  onTouchStart(ev: TouchEvent) {
    this.touchStartX = ev.changedTouches[0].clientX;
  }

  onTouchEnd(ev: TouchEvent) {
    const delta = ev.changedTouches[0].clientX - this.touchStartX;
    const UMBRAL = 50;

    if (delta > UMBRAL) this.irAnterior();
    if (delta < -UMBRAL) this.irSiguiente(this.elemento.img?.length ?? 1);
  }

  irAnterior() {
    this.fotoActiva = Math.max(this.fotoActiva - 1, 0);
  }

  irSiguiente(total: number) {
    this.fotoActiva = Math.min(this.fotoActiva + 1, total - 1);
  }

  irA(index: number) {
    this.fotoActiva = index;
  }

  //~ ======================= Cerrar =======================

  constructor(private modalCtrl: ModalController) {
    addIcons({closeCircleOutline,chevronBackOutline,chevronForwardOutline});
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
