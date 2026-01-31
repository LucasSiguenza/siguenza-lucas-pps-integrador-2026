import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { Boton, Pregunta, PREGUNTAS } from 'src/app/models/botonIdioma';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { DesafioModalComponent } from 'src/app/componentes/modales/desafio-modal/desafio-modal.component';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, MarlujoHeaderComponent]
})
export class InicioPage {
  orientacion: 'vertical' | 'horizontal' = 'vertical';
  private modalCtrl = inject(ModalController);

  // Idioma y tema seleccionados
  idiomaSeleccionado: string = 'es';
  temaSeleccionado: string = 'colores';

  // Botones principales
  botones: Boton[] = [
    { id: 'btn1', label: 'Muy fácil', color: '#1D9DB1' },
    { id: 'btn2', label: 'Fácil', color: '#2D7A86' },
    { id: 'btn3', label: 'Medio', color: '#00BEDC' },
    { id: 'btn4', label: 'Difícil', color: '#2E565C' },
    { id: 'btn5', label: 'Extremo', color: '#223133' },
  ];

  // Idiomas (botones flotantes)
  idiomas: Boton[] = [
    { id: 'es', flag: 'assets/banderas/es.svg' },
    { id: 'en', flag: 'assets/banderas/en.svg' },
    { id: 'pt', flag: 'assets/banderas/pt.svg' },
  ];

  // Temas (botones flotantes)
  temas: Boton[] = [
    { id: 'colores', icon: 'assets/temas/colores.svg' },
    { id: 'numeros', icon: 'assets/temas/numeros.svg' },
    { id: 'animales', icon: 'assets/temas/animales.svg' },
  ];

  constructor() {
    this.detectarOrientacion();
  }

  // Detectar cambios de orientación
  @HostListener('window:resize')
  onResize() {
    this.detectarOrientacion();
  }

  detectarOrientacion() {
    this.orientacion = window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical';
  }

  seleccionarIdioma(id: string) {
    this.idiomaSeleccionado = id;
  }

  seleccionarTema(id: string) {
    this.temaSeleccionado = id;
  }

  // Acción al presionar un botón de nivel
  async accionBoton(boton: Boton, nivelIndex: number) {
    const pregunta = this.generarPregunta(nivelIndex, this.temaSeleccionado, this.idiomaSeleccionado);
    if (!pregunta) return;

    const modal = await this.modalCtrl.create({
      component: DesafioModalComponent,
      componentProps: { pregunta, idioma: this.idiomaSeleccionado },
      cssClass: 'modal-desafio-wrapper'
    });

    await modal.present();
  }

  // Genera una pregunta aleatoria según nivel, tema e idioma
  generarPregunta(nivel: number, tema: string, idioma: string): Pregunta | null {
    // Filtra las preguntas precargadas según tema, idioma y nivel
    const filtradas = PREGUNTAS.filter(p => 
      p.tema === tema && 
      p.idioma === idioma && 
      p.nivel === nivel
    );

    if (filtradas.length === 0) return null;

    // Selecciona una al azar
    return filtradas[Math.floor(Math.random() * filtradas.length)];
  }
}
