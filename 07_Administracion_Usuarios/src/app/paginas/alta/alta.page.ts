import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonCol, 
  IonLabel, IonText, IonGrid, IonRow, IonButton, IonSelectOption, 
  IonAccordion, IonAccordionGroup,IonIcon, IonButtons, IonCard, IonCardHeader,
   IonCardTitle, IonCardContent, IonList, IonSegment, IonSegmentButton, IonImg, SegmentValue, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/servicios/supabaseService';
import { Utils } from 'src/app/servicios/utils';
import { UsusarioSb } from 'src/app/servicios/ususario-sb';
import { Usuario } from 'src/app/models/Usuario';
import { Capacitor } from '@capacitor/core';
import { LectorQr } from 'src/app/servicios/lector-qr';
import { environment } from 'src/environments/environment';
import { Photo } from '@capacitor/camera';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { MarlujoInputComponent } from "src/app/componentes/marlujo-input/marlujo-input.component";
import { MarlujoBotonComponent } from "src/app/componentes/marlujo-boton/marlujo-boton.component";
import { addIcons } from 'ionicons';
import { closeCircleOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-alta',
  templateUrl: './alta.page.html',
  styleUrls: ['./alta.page.scss'],
  standalone: true,
  imports: [IonFabButton, IonFab, IonImg, IonSegmentButton, IonSegment, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonIcon, IonButton, IonRow, IonGrid,
    IonLabel, IonCol, IonItem, IonAccordionGroup, IonAccordion,
    IonContent, CommonModule, FormsModule, ReactiveFormsModule, MarlujoHeaderComponent, MarlujoInputComponent, MarlujoBotonComponent]
})
export class AltaPage {
  @ViewChild('accordion2') accordionCtrl!: IonAccordionGroup;


  constructor(){
    addIcons({closeCircleOutline});
  }
  /* ===================== */
  /* 🔌 Servicios          */
  /* ===================== */
  private scanSvc = inject(LectorQr);
  private fb = inject(FormBuilder);
  private sbSvc = inject(SupabaseService);
  private utilSvc = inject(Utils);
  private userSvc = inject(UsusarioSb);

  /* ===================== */
  /* 🌐 Plataforma         */
  /* ===================== */
  isWeb = Capacitor.getPlatform() === 'web';

  /* ===================== */
  /* 🧠 Estado UI          */
  /* ===================== */
  protected fotoPreview: string | null | undefined = null;
  cargando = signal(false);

  /* ===================== */
  /* 🧭 Wizard de pasos    */
  /* ===================== */
  /**
   * currentStep es el paso REAL usado por el template.
   * pasoActual queda como vestigio de una versión anterior
   * (no se elimina para evitar romper referencias).
   */
  protected currentStep = signal<1 | 2 | 3 | 4 | number>(1);
  pasoActual = signal<1 | 2 | 3 | 4 | number>(1);

  /* ===================== */
  /* 📝 Formulario         */
  /* ===================== */
  protected form!: FormGroup<{
    nombre: FormControl<string | null>;
    apellido: FormControl<string | null>;
    dni: FormControl<string | null>;
    correo: FormControl<string | null>;
    genero: FormControl<string | null>;
    foto: FormControl<string | null>;
    clave: FormControl<string | null>;
    repetirClave: FormControl<string | null>;
  }>;
  ngOnInit() {
    this.form = this.fb.group({
      nombre: this.fb.control('',[Validators.required,Validators.minLength(3)]),
      apellido: this.fb.control('',[Validators.required,Validators.minLength(3)]),
      dni: this.fb.control('',[Validators.required, Validators.min(1_000_000),Validators.max(99_999_999)]),
      correo: this.fb.control('',[Validators.required,Validators.email]),
      genero: this.fb.control('',[Validators.required,]),
      foto: this.fb.control('',[Validators.required,]),
      clave: this.fb.control('',[Validators.required, Validators.minLength(6)]),
      repetirClave: this.fb.control('',[Validators.required,Validators.minLength(6)]),
    });
  }
  /* ===================== */
  /* 🚶 Navegación pasos  */
  /* ===================== */
  nextStep() {
    if (!this.formValidoParaPaso()) {
      this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/flip.m4a',500);
      this.form.markAllAsTouched();
      return;
    }

    if (this.currentStep() < 4) {
      this.currentStep.update(v => v + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(v => v - 1);
    }
  } 

  async cancelacion(){
    this.form.reset();
    await this.utilSvc.redirigir('inicio');
  }

  /* ===================== */
  /* ✅ Validación por paso */
  /* ===================== */
  /**
   * Esta función valida conceptualmente cada paso del alta.
   * Actualmente NO se usa en el template,
   * pero se conserva para futuras mejoras.
   */
  private formValidoParaPaso(): boolean {
    switch (this.pasoActual()) {
      case 1:
        return this.form.controls.nombre.valid &&
              this.form.controls.apellido.valid;
      case 2:
        return this.form.controls.dni.valid &&
              this.form.controls.genero.valid

      case 3:
        return this.form.controls.correo.valid &&
              this.form.controls.clave.valid &&
              this.form.controls.repetirClave.valid &&
              this.form.value.clave === this.form.value.repetirClave;

      case 4:
        return this.form.controls.foto.valid;

      default:
        return false;
    }
  }

 /* ===================== */
  /* 👤 Alta de usuario    */
  /* ===================== */
  async crearUsuario() {
    if (this.form.invalid) return;

      const carga = await this.utilSvc.loading();
      await carga.present();
    try {
      const usr: Usuario = {
        nombre: this.form.controls.nombre.value!,
        apellido: this.form.controls.apellido.value!,
        dni: this.form.controls.dni.value!,
        correo: this.form.controls.correo.value!,
        sexo: this.form.controls.genero.value!,
        foto: this.form.controls.foto.value!,
        perfil: 'usuario',
      };

      await this.userSvc.agregarUsuario(
        usr,
        this.form.controls.clave.value as string
      );

      await this.utilSvc.mostrarToast(
        'Usuario creado correctamente',
        'success'
      );

      this.form.reset();
      this.currentStep.set(1);

    } catch (e) {
      await this.utilSvc.mostrarToast(
        'Error al crear usuario',
        'error'
      );

    } finally {
      this.utilSvc.redirigir('inicio');
      await carga.dismiss();
    }
  }


  /* ===================== */
  /* 📸 Foto del usuario   */
  /* ===================== */
  async tomarFoto() {
    if (this.isWeb) {
      this.fotoPreview = 'assets/icon/Marlujo administracion de usuarios.png';
      this.form.patchValue({ foto: this.fotoPreview });
      return;
    }

    const fotoNueva = await this.utilSvc.tomarFotoCelular();
    if (fotoNueva) {
      this.fotoPreview = Capacitor.convertFileSrc(fotoNueva.path!);
      this.form.patchValue({ foto: fotoNueva.path });
    }
  }

  /* ===================== */
  /* 🪪 Escaneo DNI QR     */
  /* ===================== */
  async escanearDNI() {
    const carga = await this.utilSvc.loading();
    await carga.present();

    const text = await this.scanSvc.scanDni();

    if (!text?.length) {
      carga.dismiss();
      return;
    }

    const texto = this.utilSvc.formatearPdf147(text[0].rawValue!);
    const datos = texto.split('@');

    this.form.patchValue({
      nombre: this.utilSvc.toTitleCase(datos[2]),
      apellido: this.utilSvc.toTitleCase(datos[1]),
      dni: String(datos[4]),
    });

    carga.dismiss();

    this.utilSvc.mostrarToast(
      '¡Escaneo exitoso! Corrija los posibles errores',
      'success',
      'top',
      4000
    );
  }

/* ===================== */
/* ⚧ Selección género    */
/* ===================== */
seleccionarPerfil(genero: string | SegmentValue) {
  let valor: string;
  const rta = String(genero).toLowerCase();

  switch (rta) {
    case 'm':
    case 'masculino':
      valor = 'masculino';
      break;

    case 'f':
    case 'femenino':
      valor = 'femenino';
      break;

    case 'o':
    case 'otro':
      valor = 'otro';
      break;

    default:
      valor = '';
      break;
  }

  this.form.patchValue({ genero: valor });
}

}
