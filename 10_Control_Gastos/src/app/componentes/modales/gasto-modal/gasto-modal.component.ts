import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CuentaSb } from 'src/app/servicios/cuenta-sb';
import { UsusarioSb } from 'src/app/servicios/ususario-sb';
import { Gasto } from 'src/app/models/cuenta';
import {IonicModule} from '@ionic/angular'
import { IonHeader, IonButtons, IonButton, IonContent, ModalController,
   IonTitle, IonItem, IonLabel, IonSelect, IonToolbar, IonSelectOption } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { MarlujoInputComponent } from "../../marlujo-input/marlujo-input.component";


@Component({
  selector: 'app-gasto-modal',
  templateUrl: './gasto-modal.component.html',
  styleUrls: ['./gasto-modal.component.scss'],
  imports: [CommonModule, FormsModule, 
     IonicModule]
})
export class GastoModalComponent  implements OnInit {
  protected cuentaSvc = inject(CuentaSb);
  protected usrSvc = inject(UsusarioSb);
  protected modalCtrl = inject(ModalController);

  nombre!: string;
  monto!: string;
  tipo: string = 'otros';  // valor por defecto
  tiposDisponibles = ['alimentos', 'medicina', 'servicios', 'impuestos', 'otros'];

  constructor() {}

  ngOnInit() {}

  async registrarGasto(form: NgForm) {
    if (form.invalid) return;

    const uid = this.usrSvc.usrActual()?.uid;
    if (!uid) return;

    const gasto: Gasto = {
      nombre: this.nombre,
      monto: this.monto,
      tipo: this.tipo,
      usuario: uid,
    };
    await this.cuentaSvc.registrarGasto(this.monto, this.tipo, this.nombre);
    await this.cuentaSvc.recargarListados();
    this.modalCtrl.dismiss(true);
  }

  cancelar() {
    this.modalCtrl.dismiss(false);
  }

}
