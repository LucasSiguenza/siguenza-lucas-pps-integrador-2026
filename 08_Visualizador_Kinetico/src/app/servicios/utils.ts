import { inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, 
  ToastController, AlertController
 } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo} from '@capacitor/camera';
import { decode } from 'base64-arraybuffer';
import { Filesystem } from '@capacitor/filesystem';
import { Motion } from '@capacitor/motion';
import type { AccelListenerEvent } from '@capacitor/motion';
import { PluginListenerHandle } from '@capacitor/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class Utils {
  //! ================== Variables ==================
  private enrutador = inject(Router);
  private cargaCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  private motionListenerHandle: PluginListenerHandle | null = null;
  private ngZone = inject(NgZone)
  
  
  //! ================== Redirección ==================
async redirigir(ruta: string, sinLoading: boolean = false): Promise<void> {
  this.reproducirSonidoPorDuracion('assets/sonidos/nav.m4a', 1000)
  if (!sinLoading) {
    const carga = await this.loading();
    await carga.present();
    await this.enrutador.navigateByUrl(ruta);
    await carga.dismiss();
    return;
  }

  await this.enrutador.navigateByUrl(ruta);
}
  //! ================== Sonidos ==================
  reproducirSonidoPorDuracion(path: string, duracionMs: number,
    volumen: number = 1
  ): void {
    const audio = new Audio(path);
    audio.volume = volumen;
    audio.currentTime = 0;

    audio.play().catch(() => {});

    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, duracionMs);
  }

  //! ================== Loading ==================
  async loading(): Promise<HTMLIonLoadingElement>{
    const loading = await this.cargaCtrl.create({
      spinner: null,
      translucent: false,
      message: "Cargando...",
      cssClass: 'custom-loading'})
    
    return loading;
  }
  
  //! ================== Toast ==================
  async mostrarToast(mensaje: string,
    tipo: ('success' | 'error' | 'info' | 'warning' | 'dark'| 'primary') = 'dark',
    posicion: 'top' | 'middle' | 'bottom' = 'top',
    duracion: number = 1500
  ){
    let tipoAsig: string
    if(tipo === 'info') tipoAsig = 'medium' 
    if(tipo === 'error') tipoAsig = 'danger' 
    else tipoAsig = tipo; 
    const toast = await this.toastCtrl.create({
      color: tipoAsig,
      duration: duracion,
      message: mensaje,
      position: posicion
    }
    )
    return toast.present();
  }

  //! ================== Métodos para imágenes ==================
  /**
   * Convierte un archivo (File) a su representación base64 completa (con prefijo data:[tipo];base64,)
   * @param file Archivo a convertir
   * @returns Promise<string> cadena base64 completa
   */
  private convertirArchivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
        console.log(resolve)
      };

      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);  // Documentación: readAsDataURL devuelve DataURL con prefijo. :contentReference[oaicite:3]{index=3}
    });
  }

  /**
   * Convierte un string base64 completo (con prefijo data:[tipo];base64,) a un Blob válido para subir.
   * @param base64 cadena base64 completa con prefijo
   * @returns Blob o null si el formato es inválido
   */
  public formatearBase64AImagen(base64: string): Blob | null {
    if (!base64 || !base64.startsWith('data:')) {
      console.warn('El string no tiene prefijo data: esperado.');
    }

    // Extraer el tipo MIME
    const match = base64.match(/^data:(.*?);base64,/);
    if (!match) {
      console.warn('No se pudo extraer MIME del prefijo del base64.');
      return null;
    }
    const mimeType = match[1];

    // Eliminar el prefijo para obtener solo la parte base64
    const base64Data = base64.substring(base64.indexOf(',') + 1);

    // Decodificar a bytes
    const byteChars = atob(base64Data);  // atob decodifica base64 → string de bytes. :contentReference[oaicite:4]{index=4}
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // Crear Blob
    const blob = new Blob([byteArray], { type: mimeType });
    return blob;
  }

  
  /* ===================== */
  /* 📱 MOTION → OBSERVABLE CON NGZONE + cooldown */
  /* ===================== */
  getAccelerationObservable(): Observable<{ x: number, y: number, z: number }> {
    return new Observable(observer => {
      let listener: PluginListenerHandle | null = null;
      let move = true; // cooldown flag

      const startListening = async () => {
        listener = await Motion.addListener('accel', (event: AccelListenerEvent) => {
          this.ngZone.run(() => {
            if (!move) return;
            move = false;
            const { x = 0, y = 0, z = 0 } = event.accelerationIncludingGravity;
            observer.next({ x, y, z });
            setTimeout(() => move = true, 1000); // 500ms cooldown
          });
        });
        this.motionListenerHandle = listener;
      };

      startListening();

      return () => {
        if (listener) { listener.remove(); this.motionListenerHandle = null; }
      };
    });
  }

  /* ===================== */
  /* 🚫 DETENER MOTION      */
  /* ===================== */
  async stopMotionListener(): Promise<void> {
    if (this.motionListenerHandle) { await this.motionListenerHandle.remove(); this.motionListenerHandle = null; }
    await Motion.removeAllListeners();
  }

  //! ================== Cámara ==================
  async convertirFotosABlobs(fotos: string[]): Promise<Blob[]> {
    const blobs: Blob[] = [];

    for (const fotoPath of fotos) {
      const blob = await this.procesarFoto(fotoPath);
      blobs.push(blob);
    }

    return blobs;
  }
  /**
   * Convierte un string con el path de una foto en el sistema en un blob
   * @param img path de la imagen
   * @returns Promise<Blob> o null si el formato es inválido
   */
  async procesarFoto(img: string): Promise<Blob>{
    const file = await Filesystem.readFile({
        path: img,
      });
    const ab = decode(file.data as string) as ArrayBuffer;
    const archivo = new Blob([ab], { type: 'image/png' });
    
    return archivo
  }

   /** //? Crea una instancia de la interfaz de Photo con el producto de
   *   ?la interacción del usuario.
   * * Devuelve la instancia de Photo o null en caso de error.
   * @returns Photo
   */
  async tomarFotoCelular(): Promise<Photo | null>{
    try{
      await Camera.requestPermissions();
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        width: 500,
      } as ImageOptions);

      if(image){
        return image;
      }

      return null;
    }catch(e){
      alert(String(e));
      return null;
    }
  }
  /** //?Habilita a seleccionar una imágen desde la galería
   *  *  Devuelve un objeto del tipo Promise<Photo> 
   * @returns String
   */
  async seleccionarFotoCelular(): Promise<Photo | null |string> {
    try {
      await Camera.requestPermissions();
      const imagen = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        width: 500,
      } as ImageOptions);

      if (imagen.path) {
        return imagen;
      }

      return null;

    } catch (error) {
      alert(String(error));
      return null;
    }
  }

}
