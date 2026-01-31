import { Component, effect, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController, IonButton, IonGrid, IonRow, IonCol, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { Utils } from 'src/app/servicios/utils';
import { addIcons } from 'ionicons';
import { journalOutline, qrCodeOutline, trashOutline } from 'ionicons/icons';
import { UsusarioSb } from 'src/app/servicios/ususario-sb';
import { CreditoSb } from 'src/app/servicios/credito-sb';
import { LectorQr } from 'src/app/servicios/lector-qr';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonIcon, IonCol, IonRow, IonGrid, IonButton, IonContent, CommonModule, FormsModule, MarlujoHeaderComponent]
})
export class InicioPage {
  protected utilSvc = inject(Utils)
  protected usrSvc = inject(UsusarioSb);
  protected creditoSvc = inject(CreditoSb)

  protected lectorSvc = inject(LectorQr);
  

  saldoMostrado = signal<number>(0);

  async ngOnInit(){ 
    await this.creditoSvc.refrescarTodo();
    await this.creditoSvc.iniciarRealtime()
  }

  ngOnDestroy(): void {
    this.creditoSvc.destruirRealtime()
  }

  constructor() {
    effect(() => {
      const nuevoSaldo = this.creditoSvc.saldoActual();
      this.animarSaldo(nuevoSaldo);
      addIcons({qrCodeOutline, trashOutline});
    });
  }


  async escanearQr() {
    const loading = await this.utilSvc.loading();
    await loading.present();

    try {
      const barcodes = await this.lectorSvc.scan();
      const valorQr = barcodes?.[0]?.rawValue?.trim().toLowerCase()
      if (!valorQr) {
        this.utilSvc.mostrarToast(
          'Hubo un problema al leer el QR',
          'error',
          'middle',
          1200
        );
        return;
      }
      let valorCarga: string | null = null;

      switch (valorQr) {
        case '8c95def646b6127282ed50454b73240300dccabc':
          valorCarga = '10';
          break;

        case 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172':
          valorCarga = '50';
          break;

        case '2786f4877b9091dcad7f35751bfcf5d5ea712b2f':
          valorCarga = '100';
          break;
      }

      if (!valorCarga) {
        this.utilSvc.mostrarToast(
          'Código QR inválido',
          'warning',
          'middle',
          1200
        );

        this.utilSvc.mostrarToast(`${valorQr}`,'info','top',2000)
        return;
      }

      await this.creditoSvc.cargarCredito(valorCarga);

      this.utilSvc.mostrarToast(
        `Carga de $${valorCarga} realizada`,
        'success',
        'bottom',
        1200
      );

    } catch (err: any) {
      this.utilSvc.mostrarToast(
        err?.message ?? 'Error al cargar el crédito',
        'error',
        'middle',
        1500
      );
    } finally {
      loading.dismiss();
    }
  }
  private animacionSaldoInterval?: number;

  private animarSaldo(valorFinal: number) {
    // ⛔ Cortamos cualquier animación previa
    if (this.animacionSaldoInterval) {
      clearInterval(this.animacionSaldoInterval);
      this.animacionSaldoInterval = undefined;
    }

    const inicio = this.saldoMostrado();
    const diferencia = valorFinal - inicio;

    if (diferencia === 0) return;

    const pasos = 20;
    const duracion = 400;
    const incremento = diferencia / pasos;
    let paso = 0;

    this.animacionSaldoInterval = window.setInterval(() => {
      paso++;

      this.saldoMostrado.set(
        Math.round(inicio + incremento * paso)
      );

      if (paso >= pasos) {
        this.saldoMostrado.set(valorFinal);
        clearInterval(this.animacionSaldoInterval);
        this.animacionSaldoInterval = undefined;
      }
    }, duracion / pasos);
  }

}
