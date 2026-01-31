import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, AlertController } from '@ionic/angular/standalone';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import {Carta} from '../../models/carta'
import { PuntuacionSb } from 'src/app/servicios/puntuacion-sb';
import { Utils } from 'src/app/servicios/utils';

@Component({
  selector: 'app-juego',
  templateUrl: './juego.page.html',
  styleUrls: ['./juego.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, CommonModule, FormsModule, MarlujoHeaderComponent]
})
export class JuegoPage implements OnInit {
  //! ================= Variables y servicios =================
  private ptsSvc = inject(PuntuacionSb)
  private alertCtrl = inject(AlertController)
  private utilSvc = inject(Utils);

  protected dificultad: 'facil' | 'medio' | 'dificil' = this.ptsSvc.dificultad() ?? 'facil';
  protected isTerminado = signal(false);


  cartas: Carta[] = []; //* Total de cartas que varía con la dificultad
  cartasSeleccionadas: Carta[] = []; //* Array con las clickeadas

  tiempo = 0;
  timerId: any;

  bloqueado = false;

  ngOnInit(): void {
    this.iniciarJuego()
  }
  

  //! ================= Métodos de inicio =================
  
  iniciarJuego(): void {
    this.isTerminado.set(false);
    this.tiempo = 0;
    this.cartasSeleccionadas = [];
    this.bloqueado = false;

    this.generarCartas();
    this.iniciarTimer();
  }

  iniciarTimer(): void {
    this.timerId = setInterval(() => {
      this.tiempo++;
    }, 1000);
  }

  detenerTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  async mostrarVictoria(tiempo: number): Promise<void> {
  const alert = await this.alertCtrl.create({
    header: '¡Felicidades!',
    message: `Completaste el juego en ${tiempo} segundos`,
    backdropDismiss: true,
    cssClass: 'alert-victoria'
  });

  await alert.present();

  setTimeout(() => {
    alert.dismiss();
  }, 3000);
}

  //! ================= Métodos de Mecánicas =================
  generarCartas(): void {
    let imagenes: string[] = [];

    switch (this.dificultad) {
      case 'facil':
        imagenes = [
          'assets/animales/1.svg',
          'assets/animales/2.svg',
          'assets/animales/3.svg',
        ];
        break;

      case 'medio':
        imagenes = [
          'assets/herramientas/1.svg',
          'assets/herramientas/2.svg',
          'assets/herramientas/3.svg',
          'assets/herramientas/4.svg',
          'assets/herramientas/5.svg',
        ];
        break;

      case 'dificil':
        imagenes = [
          'assets/frutas/1.svg',
          'assets/frutas/2.svg',
          'assets/frutas/3.svg',
          'assets/frutas/4.svg',
          'assets/frutas/5.svg',
          'assets/frutas/6.svg',
          'assets/frutas/7.svg',
          'assets/frutas/8.svg',
        ];
        break;
    }

    const duplicadas = [...imagenes, ...imagenes];

    this.cartas = this.shuffleArray(
      duplicadas.map((img, index) => ({
        id: index,
        imagen: img,
        descubierta: false,
        bloqueada: false,
      }))
    );
  }

  seleccionarCarta(carta: Carta): void {
    if (this.bloqueado || carta.descubierta) {
      return;
    }

    this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/flip.m4a', 700)
    carta.descubierta = true;
    this.cartasSeleccionadas.push(carta);

    if (this.cartasSeleccionadas.length === 2) {
      this.bloqueado = true;

      const [c1, c2] = this.cartasSeleccionadas;

      if (c1.imagen === c2.imagen) {
        // Coincidencia
        this.cartasSeleccionadas = [];
        this.bloqueado = false;

        this.verificarFinJuego();
      } else {
        // No coinciden
        setTimeout(() => {
          c1.descubierta = false;
          c2.descubierta = false;
          this.cartasSeleccionadas = [];
          this.bloqueado = false;
        }, 600);
      }
    }
  }

  verificarFinJuego(): void {
    const todasDescubiertas = this.cartas.every(c => c.descubierta);

    if (todasDescubiertas) {
      this.detenerTimer();
      this.isTerminado.set(true);
      this.mostrarVictoria(this.tiempo);
    }
  }

  shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
  }

  async registrarPuntuacion(){
    const carga = await this.utilSvc.loading();
    await carga.present()

    try {  
      
      await this.ptsSvc.agregarPuntuacion(this.tiempo as number, this.dificultad);
      
      this.utilSvc.mostrarToast('¡Record guardado!', 'success', 'middle',1000);
      
    } catch (error) {
      alert((error as Error).message);
      this.utilSvc.mostrarToast('Hubo un error', 'error', 'middle', 500)  
    } finally{
      
      await carga.dismiss();
    }
  }

}
