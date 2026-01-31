import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton } from '@ionic/angular/standalone';
import { ElementoSb } from 'src/app/servicios/elemento-sb';
import { Elemento } from 'src/app/models/elementos';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { addIcons } from 'ionicons';
import { arrowDownOutline, arrowUpOutline, addOutline, cameraOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { FormatoFechaPipe } from 'src/app/pipes/formato-fecha-pipe';
import { Utils } from 'src/app/servicios/utils';
import {ModalController} from '@ionic/angular/standalone'
import { AgregrarElementoComponent } from 'src/app/componentes/modales/agregrar-elemento/agregrar-elemento.component';
import { Usuario } from 'src/app/models/Usuario';
import { UsusarioSb } from 'src/app/servicios/ususario-sb';
import { VotosPipe } from 'src/app/pipes/votos-pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mis-publicaciones',
  templateUrl: './mis-publicaciones.page.html',
  styleUrls: ['./mis-publicaciones.page.scss'],
  standalone: true,
  imports: [ IonIcon, IonContent, CommonModule, FormsModule, MarlujoHeaderComponent, TitleCasePipe, FormatoFechaPipe, VotosPipe]
})
export class MisPublicacionesPage implements OnInit {
  //! ======================= Variables y Servicios =======================

  
  private utilSvc = inject(Utils);
  private elemSvc = inject(ElementoSb);
  private usrSvc = inject(UsusarioSb);

  protected usuarioActual!:Usuario
  
  protected listado: Elemento[] = [];
  private listadoFiltrado: Elemento[] = [];

  private modalCtrl = inject(ModalController)
  protected usrActual = this.usrSvc.usrActual();

  private paginaActual = 0;
  private readonly limite = 1;

  constructor() {
    addIcons({cameraOutline,arrowUpOutline,chevronBackOutline,chevronForwardOutline,arrowDownOutline,addOutline});
  }

  //! ======================= Métodos visuales =======================
  
  //~ ======================= Paginado 
  
  private actualizarPagina() {
    const inicio = this.paginaActual * this.limite;
    const fin = inicio + this.limite;
    
    this.listado = this.listadoFiltrado.slice(inicio, fin);
    
    // 🔹 reset del carrusel al cambiar de elemento
    this.fotoActiva = 0;
  }
  
  siguientePagina() {
    if ((this.paginaActual + 1) * this.limite < this.listadoFiltrado.length) {
      this.paginaActual++;
      this.actualizarPagina();
    }
  }
  
  paginaAnterior() {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.actualizarPagina();
    }
  }
  
  //~ ======================= carrusel
  
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

  protected get puedeSubir(): boolean {
  return this.paginaActual > 0;
}

  protected get puedeBajar(): boolean {
    return (this.paginaActual + 1) * this.limite < this.listadoFiltrado.length;
  }

  //! ======================= Métodos privados =======================
  
  async ngOnInit() {
    this.usuarioActual = this.usrSvc.usrActual()!
    await this.activarDetector()
    const carga = await this.utilSvc.loading()
    await carga.present()
    this.listadoFiltrado = (await this.elemSvc.listarTodos()).filter(
      elem => elem.usuario_subida === this.usuarioActual.uid
    );
    this.actualizarPagina();
    await carga.dismiss();
  }

    private ultimoEvento = 0;
    private readonly delayMs = 1200; 
    private motionSub: Subscription | null = null;
    
  evaluarOrientacion(x: number, y: number, z: number) {
    if (x > 6) {
      this.irAnterior();
    } else if (x < -6) {
      this.irSiguiente();
    }
  }
    /* ===================== */
    /* ▶️ ACTIVAR DETECTOR   */
    /* ===================== */
    async activarDetector() {
      this.motionSub = this.utilSvc.getAccelerationObservable().subscribe(acc => {
  
        const ahora = Date.now();
        if (ahora - this.ultimoEvento < this.delayMs) return;
        this.ultimoEvento = ahora;
        this.evaluarOrientacion(acc.x, acc.y, acc.z);
      });
    }
  
     /* ===================== */
    /* 🔄 LIMPIEZA AL DESTRUIR COMPONENTE */
    /* ===================== */
    async ngOnDestroy(): Promise<void> {
      this.motionSub?.unsubscribe();
      await this.utilSvc.stopMotionListener();
    }

  //! ======================= Métodos públicos =======================

  iraVotar(){
    this.utilSvc.redirigir('inicio')
  }

}
