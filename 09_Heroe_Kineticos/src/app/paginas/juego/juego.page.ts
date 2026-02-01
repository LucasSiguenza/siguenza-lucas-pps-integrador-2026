import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { Utils } from '../../servicios/utils';
import { Router } from '@angular/router';
import { PuntajeSb } from 'src/app/servicios/puntaje-sb';

@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [IonContent, CommonModule],
  templateUrl: './juego.page.html',
  styleUrls: ['./juego.page.scss'],
})
export class JuegoPage implements OnInit, OnDestroy {
// 🟥 Marco dinámico (zona segura)
safeMargin = 40;
safeDir = 1;

  private utils = inject(Utils);
  private router = inject(Router);
  private ptSvc = inject(PuntajeSb);

  // 🦸 Imagen del héroe
  heroImg!: string;

  // 📍 Tamaño del personaje
  size = 80;

  // 📍 Posición
  pos = { x: 0, y: 0 };

  // 🧭 Velocidad
  vel = { x: 3, y: 3 };

  // ⏱️ Timer
  tiempo = 0;
  intervaloTimer: any;

  subscription?: Subscription;
  juegoActivo = false;
  muerto = false;

  ngOnInit() {
    this.obtenerImagen();
    this.iniciarJuego();
  }

  obtenerImagen() {
    if (this.ptSvc.tipo() === 'marvel') {
      return this.heroImg = 'assets/icon/batman.png';
    } 
    if (this.ptSvc.tipo() === 'dc') {
      return this.heroImg = 'assets/icon/spiderman.png';
    } 
    return this.heroImg = 'assets/icon/Marlujo juego de la memoria.png';
    
  }

  iniciarJuego() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Centro de la pantalla
    this.pos.x = w / 2 - this.size / 2;
    this.pos.y = h / 2 - this.size / 2;

    this.vel = { x: 3, y: 3 };
    this.tiempo = 0;
    this.muerto = false;
    this.juegoActivo = true;
    this.intervaloTimer = setInterval(() => {
      this.tiempo += 0.1;

      // Marco dinámico
      this.safeMargin += this.safeDir * 1;

      if (this.safeMargin > 120) this.safeDir = -1;
      if (this.safeMargin < 30) this.safeDir = 1;
    }, 100);


    this.subscription = this.utils
      .getAccelerationObservable()
      .subscribe(acc => {
        this.actualizarMovimiento(acc.x, acc.y);
      });
  }

  actualizarMovimiento(ax: number, ay: number) {
    if (!this.juegoActivo) return;

    const sensibilidad = 0.4;

    /**
     * 👉 Mapeo de ejes:
     * ay → izquierda / derecha
     * ax → arriba / abajo
     * (si lo sentís invertido, cambiá los signos)
     */
    this.vel.x += ay * sensibilidad;
    this.vel.y += ax * sensibilidad;

    const MAX = 12;
    this.vel.x = Math.max(-MAX, Math.min(MAX, this.vel.x));
    this.vel.y = Math.max(-MAX, Math.min(MAX, this.vel.y));

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    this.chequearBordes();
  }

  chequearBordes() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const left = this.safeMargin;
    const top = this.safeMargin;
    const right = w - this.safeMargin;
    const bottom = h - this.safeMargin;

    if (
      this.pos.x <= left ||
      this.pos.y <= top ||
      this.pos.x + this.size >= right ||
      this.pos.y + this.size >= bottom
    ) {
      this.perder();
    }
  }

  async perder() {
    this.juegoActivo = false;
    this.muerto = true;
    clearInterval(this.intervaloTimer);
    this.subscription?.unsubscribe();

    // 👉 después guardás puntaje acá
    await this.ptSvc.agregarPuntuacion(this.tiempo);
  }

  repetir() {
  clearInterval(this.intervaloTimer);
  this.subscription?.unsubscribe();

  this.vel = { x: 3, y: 3 }; // 🔧 reset limpio
  this.iniciarJuego();
}


  volver() {
    this.router.navigate(['/inicio']);
  }

  ngOnDestroy() {
    clearInterval(this.intervaloTimer);
    this.subscription?.unsubscribe();
  }
}
