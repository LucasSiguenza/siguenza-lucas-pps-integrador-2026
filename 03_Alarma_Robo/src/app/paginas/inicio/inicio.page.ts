import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, AlertController, IonInput } from '@ionic/angular/standalone';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { Utils } from 'src/app/servicios/utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonInput, IonContent, CommonModule, FormsModule, MarlujoHeaderComponent, ReactiveFormsModule]
})


export class InicioPage {
  private utilSvc = inject(Utils);
  private alertCtrl = inject(AlertController);
  private orientacion: 'vertical' | 'horizontal' = 'vertical';
  @HostListener('window:resize')
  onResize() {
    this.detectarOrientacion();
  }

  detectarOrientacion() {
  this.orientacion =
    window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical';

  this.ultimoEvento = Date.now();
}

  private ultimoEvento = 0;
  private readonly delayMs = 1200; // probá entre 500 y 1000

  protected form = new FormGroup({ contrasenia: new FormControl('', [Validators.required, Validators.minLength(4)]) });
  protected alarmaActiva = false;
  private motionSub: Subscription | null = null;

  /* ===================== */
  /* ▶️ ACTIVAR DETECTOR   */
  /* ===================== */
  async activarDetector() {
    this.alarmaActiva = true;
    this.motionSub = this.utilSvc.getAccelerationObservable().subscribe(acc => {
      if (!this.alarmaActiva) return;

      const ahora = Date.now();
      if (ahora - this.ultimoEvento < this.delayMs) return;
      this.ultimoEvento = ahora;
      this.evaluarOrientacion(acc.x, acc.y, acc.z);
    });
  }

  /* ===================== */
  /* ⏹ DESACTIVAR DETECTOR */
  /* ===================== */
  async desactivarDetector(contraseñaIngresada: string) {
    if (contraseñaIngresada === this.form.controls.contrasenia.value) {
      this.alarmaActiva = false;
      await this.utilSvc.stopMotionListener();
      this.motionSub?.unsubscribe();
    } else { await this.castigoSeguridad(); }
  }

  /* ===================== */
  /* 🧭 EVALUAR ORIENTACIÓN */
  /* ===================== */
  evaluarOrientacion(x: number, y: number, z: number) {
  if (this.orientacion === 'horizontal') {
      this.enHorizontal();
    }
    if (y > 5 || y < -5) this.enVertical();
    else if (x > 3) this.haciaIzquierda();
    else if (x < -3) this.haciaDerecha();
  }

  /* ===================== */
  /* 📱 REACCIONES SEGÚN POSICIÓN */
  /* ===================== */
  async enHorizontal() { 
    this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/horizontal.m4a',5000);
    await this.utilSvc.vibrar(5000); 
  }

  async enVertical() { 
    const disp = await this.utilSvc.isFlashAvailable(); 
    if (disp) { 
      this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/vertical.m4a',5000); 
      await this.utilSvc.switchFlashOn(); 
      setTimeout(() => this.utilSvc.switchFlashOff(),5000); 
    } 
  }

  async haciaIzquierda() { 
    this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/izquierda.m4a',1000); 
  }

  async haciaDerecha() { 
    this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/derecha.m4a',1000); 
  }

  /* ===================== */
  /* 🚨 CASTIGO POR CONTRASEÑA INCORRECTA */
  /* ===================== */
  async castigoSeguridad() {
    this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/alarma.m4a',5000);
    const disp = await this.utilSvc.isFlashAvailable();
    if (disp) { 
      await this.utilSvc.switchFlashOn(); 
      setTimeout(() => this.utilSvc.switchFlashOff(),5000); 
    }
    await this.utilSvc.vibrar(5000);
  }

  /* ===================== */
  /* ⚡ ACTIVAR / DESACTIVAR ALARMA */
  /* ===================== */
  async activarAlarma() {
    if (this.form.invalid) { 
      this.utilSvc.mostrarToast('Inserte una contraseña válida','error','middle',300); 
      return; 
    }
    if (!this.alarmaActiva) { 
      this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/unlock.m4a',1000); 
      this.detectarOrientacion();
      await this.activarDetector(); 
      return; 
    }

    const passwordOk = await this.verificarContrasenia();
    if (!passwordOk) { 
      this.utilSvc.mostrarToast('No se desactivó.','error','middle',400); 
      this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/lock.m4a',1000); 
      await this.castigoSeguridad(); 
      return; 
    }

    this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/unlock.m4a',1000);
    this.alarmaActiva = false;
    await this.utilSvc.stopMotionListener();
    this.motionSub?.unsubscribe();
  }

  /* ===================== */
  /* 🔑 VERIFICAR CONTRASEÑA CON ALERT */
  /* ===================== */
  async verificarContrasenia(): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header: 'Desactivar alarma',
      message: 'Ingresá la contraseña',
      cssClass: 'alert-alarma-roja',
      inputs: [{ name: 'password', type: 'password', placeholder: 'Contraseña' }],
      buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Desactivar', role: 'confirm' }]
    });

    await alert.present();
    const { role, data } = await alert.onDidDismiss();
    if (role !== 'confirm') return false;
    return data?.values?.password === this.form.controls.contrasenia.value;
  }

  /* ===================== */
  /* 🔄 LIMPIEZA AL DESTRUIR COMPONENTE */
  /* ===================== */
  ngOnDestroy(): void {
    this.motionSub?.unsubscribe();
    this.utilSvc.stopMotionListener();
  }
}
