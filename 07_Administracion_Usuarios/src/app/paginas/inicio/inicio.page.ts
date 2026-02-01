import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController, IonButton, IonGrid, IonRow, IonCol, IonIcon, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { Utils } from 'src/app/servicios/utils';
import { addIcons } from 'ionicons';
import { journalOutline, qrCodeOutline, trashOutline, createOutline, add } from 'ionicons/icons';
import { UsusarioSb } from 'src/app/servicios/ususario-sb';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonFabButton, IonFab, IonText, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonContent,
     CommonModule, FormsModule, MarlujoHeaderComponent, IonButton, IonIcon, IonRow]
})
export class InicioPage {
  protected utilSvc = inject(Utils)
  protected usrSvc = inject(UsusarioSb);
 
  private usrSb = inject(UsusarioSb);

  /* ===================== */
  /* ESTADO                */
  /* ===================== */
  constructor(){
    addIcons({add,trashOutline});
  }
  usuarios = this.usrSb.listaUsuarios;

  /* ===================== */
  /* LISTADO ORDENADO       */
  /* ===================== */

  usuariosOrdenados = computed(() =>
    [...this.usuarios()]
      .sort((a, b) =>
        a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' })
      )
  );

  /* ===================== */
  /* PERFIL ACTUAL         */
  /* ===================== */

  esAdmin = computed(() =>
    this.usrSb.usrActual()?.perfil === 'admin'
  );

  /* ===================== */
  /* CICLO DE VIDA         */
  /* ===================== */

  async ngOnInit() {
    await this.usrSb.listarUsuarios();
    this.usrSb.iniciarCanalUsuarios();
  }

  ngOnDestroy() {
    this.usrSb.destruirCanalUsuarios();
  }
/* ===================== */
/* PAGINACIÓN            */
/* ===================== */

page = signal(1);
pageSize = 1;

totalPages = computed(() =>
  Math.ceil(this.usuariosOrdenados().length / this.pageSize)
);

usuariosPaginados = computed(() => {
  const start = (this.page() - 1) * this.pageSize;
  const end = start + this.pageSize;
  return this.usuariosOrdenados().slice(start, end);
});

  async agregarUsuario(){
    await this.utilSvc.redirigir('alta')
  }
}

