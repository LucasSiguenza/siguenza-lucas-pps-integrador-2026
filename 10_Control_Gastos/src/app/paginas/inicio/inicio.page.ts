import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController, IonButton, IonGrid, IonRow, IonCol, IonIcon, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { Utils } from 'src/app/servicios/utils';
import { addIcons } from 'ionicons';
import { journalOutline, qrCodeOutline, trashOutline, createOutline, add } from 'ionicons/icons';
import { UsusarioSb } from 'src/app/servicios/ususario-sb';
import { CuentaSb } from 'src/app/servicios/cuenta-sb';
import { CrearCuentaModalComponent } from 'src/app/componentes/modales/crear-cuenta-modal/crear-cuenta-modal.component';
import { GastoModalComponent } from 'src/app/componentes/modales/gasto-modal/gasto-modal.component';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonFabButton, IonFab, IonText, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonContent,
    CommonModule, FormsModule, MarlujoHeaderComponent, IonButton, IonIcon, IonRow, IonGrid, IonCol],
  providers: [CuentaSb] // <-- importante

})
export class InicioPage {
  protected utilSvc = inject(Utils)
  protected usrSvc = inject(UsusarioSb);
  protected cuentaSvc = inject(CuentaSb);
  protected modalCtrl = inject(ModalController);

  gastosOrdenados = computed(() =>
    [...this.cuentaSvc.listaGastos()]
      .sort((a, b) =>
        new Date(b.fecha!).getTime() - new Date(a.fecha!).getTime()
      )
  );

  constructor(){
    addIcons({add});
  }

  async ngOnInit() {
    await this.cuentaSvc.recargarListados();

    const tieneCuenta = this.cuentaSvc
      .listaCuentas()
      .some(c => c.usuario === this.usrSvc.usrActual()?.uid);

    if (!tieneCuenta) {
      await this.abrirModalCrearCuenta();
    }
  }

  async abrirModalCrearCuenta() {
    const modal = await this.modalCtrl.create({
      component: CrearCuentaModalComponent,
      backdropDismiss: false
    });

    await modal.present();
    await modal.onDidDismiss();
  }

  async abrirModalGasto() {
    await this.cuentaSvc.recargarListados(); // ⚠ importante
    const modal = await this.modalCtrl.create({
      component: GastoModalComponent,
      backdropDismiss: false
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) await this.cuentaSvc.recargarListados();
  }

  porcentajeDelIngreso(monto: string): string {
    const ingreso = Number(this.cuentaSvc.listaCuentas()[0]?.ingreso_mensual || 1);
    const gasto = Number(monto);
    return ((gasto / ingreso) * 100).toFixed(2);
  }


  //! =============== Paginacion ===============
  paginaActual = signal(1);
  pageSize = 10;

  gastosPaginados = computed(() => {
    const start = (this.paginaActual() - 1) * this.pageSize;
    return this.gastosOrdenados().slice(start, start + this.pageSize);
  });



}

