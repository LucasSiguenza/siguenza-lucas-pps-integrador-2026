import { Component, inject, OnInit } from '@angular/core';
import { CuentaSb } from 'src/app/servicios/cuenta-sb';
import { ModalController, IonHeader, IonText, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonNote, IonButton } from '@ionic/angular/standalone'
import { UsusarioSb } from 'src/app/servicios/ususario-sb';
import { Utils } from 'src/app/servicios/utils';
import { Cuenta } from 'src/app/models/cuenta';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-cuenta-modal',
  templateUrl: './crear-cuenta-modal.component.html',
  styleUrls: ['./crear-cuenta-modal.component.scss'],
  imports: [IonButton, IonNote, CommonModule, IonInput, IonLabel, IonItem,
    IonContent, IonTitle, IonToolbar, IonHeader, FormsModule, IonText],
})
export class CrearCuentaModalComponent  implements OnInit {
  protected utilSvc = inject(Utils);
  protected usrSvc = inject(UsusarioSb);
  protected cuentaSvc = inject(CuentaSb);
  protected modalCtrl = inject(ModalController);

  ingresoMensual!: string;
  porcentajeAhorro!: string;

  ngOnInit() {}

  async confirmar() {
    const uid = this.usrSvc.usrActual()?.uid;
    if (!uid) return;

    const cuenta: Cuenta = {
      usuario: uid,
      ingreso_mensual: this.ingresoMensual,
      umbral: String(100 - Number(this.porcentajeAhorro)),
      saldo: this.ingresoMensual
    };

    try {
      await this.cuentaSvc.crearCuenta(cuenta);
      await this.cuentaSvc.recargarListados();
      this.modalCtrl.dismiss(true);
    }catch(e){
      this.utilSvc.mostrarToast((e as Error).message, 'error');
    }
  }
}
