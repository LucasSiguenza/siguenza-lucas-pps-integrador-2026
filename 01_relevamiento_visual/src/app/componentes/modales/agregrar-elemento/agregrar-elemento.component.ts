import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonIcon, IonContent } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { cameraOutline, closeOutline, cloudUploadOutline } from 'ionicons/icons';
import { ElementoSb } from 'src/app/servicios/elemento-sb';
import { UsusarioSb } from 'src/app/servicios/ususario-sb';
import { Utils } from 'src/app/servicios/utils';
import { MarlujoInputComponent } from "../../marlujo-input/marlujo-input.component";
import { ModalController } from '@ionic/angular/standalone';
import { Photo } from '@capacitor/camera';
import { Elemento } from 'src/app/models/elementos';



@Component({
  selector: 'app-agregrar-elemento',
  templateUrl: './agregrar-elemento.component.html',
  styleUrls: ['./agregrar-elemento.component.scss'],
  imports: [IonIcon, ReactiveFormsModule, MarlujoInputComponent, IonContent],
})
export class AgregrarElementoComponent {
//! =============== Variables y servicios ===============
  private utilSvc = inject(Utils)
  private userSvc = inject(UsusarioSb);
  private elementoSvc = inject(ElementoSb)

  protected form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.nullValidator]),
    foto1: new FormControl('', [Validators.required, Validators.nullValidator]),
    foto2: new FormControl(''),
    foto3: new FormControl('')
  })

  constructor() {
    addIcons({
      cameraOutline, cloudUploadOutline, closeOutline
    })
   }
//! =============== Signals ===============

fotos = signal<(string | null)[]>([null, null, null]);
animando = signal(false);


//! =============== Metodos para lo visual ===============
  get hayFotoInicial(): boolean {
    return this.fotos().some(f => f !== null);
  }

  fotosCargadas = computed(() =>
    this.fotos().filter(f => f !== null).length
  );

  fotoActiva = signal(0);

  private touchStartX = 0;

  onTouchStart(ev: TouchEvent) {
    this.touchStartX = ev.changedTouches[0].clientX;
  }

  onTouchEnd(ev: TouchEvent) {
    const touchEndX = ev.changedTouches[0].clientX;
    const delta = touchEndX - this.touchStartX;
    
    const UMBRAL = 50; // px
    
    if (delta > UMBRAL) {
        this.irAnterior();
      } else if (delta < -UMBRAL) {
        this.irSiguiente();
      }
    }
    
  private animar() {
    this.animando.set(true);
    setTimeout(() => this.animando.set(false), 500);
  }

  irAnterior() {
    this.fotoActiva.update(i => Math.max(i - 1, 0));
    this.animar();
  }

  irSiguiente() {
    this.fotoActiva.update(i => Math.min(i + 1, this.fotos().length - 1));
    this.animar();
  }

  totalFotos = this.fotos().length;

  fotoActual = computed(() => this.fotoActiva() + 1);

  private modalCtrl = inject(ModalController);

  cerrar() {
    this.modalCtrl.dismiss();
  }

  
//! =============== Métodos funcionales ===============

  async subirFoto(index = 0) {
    try {
      const foto: Photo | null = await this.utilSvc.tomarFotoCelular();

      // Caso 1: usuario cancela
      if (!foto) {
        this.utilSvc.mostrarToast(
          'Acción cancelada: no se tomó ninguna foto.',
          'error',
          'middle'
        );
        return;
      }

      // Caso 2: foto inválida
      if (!foto.webPath || !foto.path) {
        this.utilSvc.mostrarToast(
          'No se pudo obtener la foto. Intente nuevamente.',
          'error',
          'middle'
        );
        alert(JSON.stringify(foto))
        return;
      }

      // Caso 3: actualizar signal (preview)
      const copia = [...this.fotos()];
      copia[index] = foto.webPath;
      this.fotos.set(copia);

      // Caso 4: actualizar formulario según índice
      switch (index) {
        case 0:
          this.form.patchValue({ foto1: foto.path });
          break;
        case 1:
          this.form.patchValue({ foto2: foto.path });
          break;
        case 2:
          this.form.patchValue({ foto3: foto.path });
          break;
      }

    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al intentar tomar la foto.';
          alert(JSON.stringify(error))

      if (mensaje.toLowerCase().includes('permission')) {
        this.utilSvc.mostrarToast(
          'No se otorgaron permisos para usar la cámara.',
          'info',
          'middle'
        );
      } else if (mensaje.toLowerCase().includes('cancel')) {
        this.utilSvc.mostrarToast(
          'Captura cancelada por el usuario.',
          'info',
          'middle'
        );
      } else {
        this.utilSvc.mostrarToast(mensaje, 'error', 'middle');
      }

      console.error('[subirFoto] Error capturado:', error);
    }
  }

  async subirElemento(){

    if(this.form.invalid){
      this.utilSvc.mostrarToast('Complete correctamente los campos', 'error','middle',750);
      return
    }


    const imagenes: string[] = [];
    const foto1 = this.form.controls.foto1.value;
    if (foto1) {
      imagenes.push(foto1);
    }

    const foto2 = this.form.controls.foto2.value;
    if (foto2) {
      imagenes.push(foto2);
    }

    const foto3 = this.form.controls.foto3.value;
    if (foto3) {
      imagenes.push(foto3);
    }

    const nuevaCosa: Elemento = {
      nombre: this.form.controls.nombre.value!,
      tipo: this.elementoSvc.listadoSeleccionado()!,
      usuario_subida: this.userSvc.usrActual()?.uid!,
      img: imagenes,
    };

    const carga = await this.utilSvc.loading()

    try {
      await carga.present()
      await this.elementoSvc.agregarElemento(nuevaCosa);
      this.cerrar();
      await carga.dismiss();
      
    } catch (error) {
      this.utilSvc.mostrarToast("Hubo un error.", 'error','middle',500)
      await carga.dismiss();
    }
  }
}
