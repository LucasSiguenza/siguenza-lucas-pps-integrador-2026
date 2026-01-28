import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowDownOutline,
  arrowUpOutline,
  addOutline,
  cameraOutline,
  chevronBackOutline,
  chevronForwardOutline
} from 'ionicons/icons';

import { ElementoSb } from 'src/app/servicios/elemento-sb';
import { Elemento } from 'src/app/models/elementos';
import { MarlujoHeaderComponent } from 'src/app/componentes/marlujo-header/marlujo-header.component';
import { FormatoFechaPipe } from 'src/app/pipes/formato-fecha-pipe';
import { Utils } from 'src/app/servicios/utils';
import { AgregrarElementoComponent } from 'src/app/componentes/modales/agregrar-elemento/agregrar-elemento.component';
import { Usuario } from 'src/app/models/Usuario';
import { UsusarioSb } from 'src/app/servicios/ususario-sb';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.page.html',
  styleUrls: ['./listado.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonContent,
    CommonModule,
    FormsModule,
    MarlujoHeaderComponent,
    TitleCasePipe,
    FormatoFechaPipe
  ]
})
export class ListadoPage {

  private utilSvc = inject(Utils);
  private elemSvc = inject(ElementoSb);
  private usrSVC = inject(UsusarioSb);
  private modalCtrl = inject(ModalController);

  protected usuarioActual = this.usrSVC.usrActual();

  private readonly limite = 1;
  private paginaActual = signal(0);

  /* =======================
    LISTADOS (computed)
  ======================= */

  private listadoFiltrado = computed<Elemento[]>(() => {
    const tipo = this.elemSvc.listadoSeleccionado();
    const elementos = this.elemSvc.listadoElementos();

    if (!tipo) return [];

    // Filtrar elementos por tipo y ordenar por ID ascendente
    return elementos
      .filter(elem => elem.tipo === tipo)
      .sort((a, b) => a.id! - b.id!); // Ordenar de menor a mayor por id
  });

  protected listado = computed<Elemento[]>(() => {
    const inicio = this.paginaActual() * this.limite;
    const fin = inicio + this.limite;

    return this.listadoFiltrado().slice(inicio, fin);
  });

  constructor() {
    addIcons({
      cameraOutline,
      arrowUpOutline,
      chevronBackOutline,
      chevronForwardOutline,
      arrowDownOutline,
      addOutline
    });
  }

  async ngOnInit() {
    this.usuarioActual = this.usrSVC.usrActual()!;

    const carga = await this.utilSvc.loading();
    await carga.present();

    // el servicio ya carga y mantiene el listado (realtime)
    await carga.dismiss();
  }

  //! ======================= Paginado =======================

  siguientePagina() {
    if ((this.paginaActual() + 1) * this.limite < this.listadoFiltrado().length) {
      this.paginaActual.update(p => p + 1);
      this.fotoActiva = 0;
    }
  }

  paginaAnterior() {
    if (this.paginaActual() > 0) {
      this.paginaActual.update(p => p - 1);
      this.fotoActiva = 0;
    }
  }

  //! ======================= Visuales =======================
  protected puedeSubir = computed(() => {
    return this.paginaActual() > 0;
  });

  protected puedeBajar = computed(() => {
    return (this.paginaActual() + 1) * this.limite < this.listadoFiltrado().length;
  });
  fotoActiva = 0;
  private touchStartX = 0;

  onTouchStart(ev: TouchEvent) {
    this.touchStartX = ev.changedTouches[0].clientX;
  }

  onTouchEnd(ev: TouchEvent) {
    const delta = ev.changedTouches[0].clientX - this.touchStartX;
    const UMBRAL = 50;

    if (delta > UMBRAL) this.irAnterior();
    if (delta < -UMBRAL) this.irSiguiente();
  }

  irAnterior() {
    this.fotoActiva = Math.max(this.fotoActiva - 1, 0);
  }

  irSiguiente(total: number = 1) {
    this.fotoActiva = Math.min(this.fotoActiva + 1, total - 1);
  }

  irA(index: number) {
    this.fotoActiva = index;
  }

  yaVotado = computed(() => {
    const uid = this.usuarioActual?.uid;
    const elem = this.listado()[0]; // solo uno por página
    
    const retorno =  this.elemSvc.listadoVotos()
            .some(v => v.publicacion === elem.foto && v.usuario === uid);
  
    return retorno

          });

    
  //! ======================= Métodos =======================
  async votar() {
    const elem = this.listado()[0];
    if (!elem) return;

    try {
      await this.elemSvc.emitirVoto(elem.foto!);
    } catch (e) {
      if ((e as Error).message === 'YA_VOTO') {
        this.utilSvc.mostrarToast('Ya votaste esta publicación','info','middle');
      }
    }
}
  async agregarElemento() {
    const modal = await this.modalCtrl.create({
      component: AgregrarElementoComponent,
      cssClass: 'modal-agregar-elemento',
      backdropDismiss: false,
    });

    await modal.present();
  }
}
