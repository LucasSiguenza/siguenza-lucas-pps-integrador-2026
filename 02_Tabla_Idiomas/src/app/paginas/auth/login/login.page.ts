import { Component, HostListener, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { MarlujoInputComponent } from 'src/app/componentes/marlujo-input/marlujo-input.component';
import { SupabaseService } from 'src/app/servicios/supabaseService';
import { Utils } from 'src/app/servicios/utils';
import { MarlujoBotonComponent } from "src/app/componentes/marlujo-boton/marlujo-boton.component";
import { CuadrillaConfig } from 'src/app/models/cuadrillaConfig';
import { MarlujoCuadrillaBotonesComponent } from "src/app/componentes/marlujo-cuadrilla-botones/marlujo-cuadrilla-botones.component";
// import { UsusarioSb } from 'src/app/servicios/ususario-sb';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [ ReactiveFormsModule, FormsModule, IonContent, MarlujoInputComponent, MarlujoBotonComponent, MarlujoCuadrillaBotonesComponent]
})
export class LoginPage {
  
  
  //! ======================= Variables y Servicios =======================
  protected utilSvc = inject(Utils);
  private sb = inject(SupabaseService)
  // private usrSvc = inject(UsusarioSb);

  protected cuadrillaIconos:CuadrillaConfig[] = [
    {
      color: 'violet',
      iconPath:'assets/icon/admin.png',
      position: 'arriba-izquierda',
      accion:()=>{
        this.autocompletar('admin@admin.com', '111111')
      }
    },
    {
      color: 'green',
      iconPath:'assets/icon/tester.png',
      position: 'arriba-derecha',
      accion:()=>{
        this.autocompletar('tester@tester.com', '555555')
      }
    },
    {
      color: 'blue',
      iconPath:'assets/icon/usuario.png',
      position: 'abajo-izquierda',
      accion:()=>{
        this.autocompletar('usuario@usuario.com', '333333')
      }
    },
    {
      color: 'pink',
      iconPath:'assets/icon/invitado.png',
      position: 'abajo-derecha',
      accion:()=>{
        this.autocompletar('invitado@invitado.com', '222222')
      }
    },
  ]
  protected botonCentral: CuadrillaConfig = {
    color: 'black',
    iconPath: 'assets/icon/anonimo.png',
    accion: () => {
      this.autocompletar('anonimo@anonimo.com','444444');
    }
  };

  protected form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email, Validators.nullValidator]),
    contrasenia:  new FormControl('', [Validators.required, Validators.minLength(6),Validators.nullValidator])
  });
  //! ======================= Métodos públicos =======================
  async iniciarSesion(){
    if(this.form.invalid){
      this.utilSvc.mostrarToast('¡Complete correctamente los campos!','error','middle');
      return
    }
    const correo = this.form.controls.email.value;
    const contrasenia = this.form.controls.contrasenia.value
    const loader = await this.utilSvc.loading();
    
    try{
      await loader.present()
      const usr = await this.sb.iniciarSesion(correo as string, contrasenia as string);
      // this.usrSvc.usrDBActual.set(usr);
      // await this.usrSvc.obtenerUsuarioActual();
      
      await this.utilSvc.redirigir('/inicio')
      this.utilSvc.mostrarToast('¡Sesión iniciada correctamente!','success','middle',1000)
    }catch(e) {
      this.utilSvc.mostrarToast('Algo salió mal', 'error','middle');
      console.error(e)
      return
    } finally{
      await loader.dismiss()
    }
  }
  //! ======================= Métodos auxiliares =======================
  autocompletar(email: string, password: string)
  {
    return this.form.setValue({
    email: email,
    contrasenia: password
    })
  }
  //! ======================= Visuales =======================
  protected orientacion: 'vertical' | 'horizontal' = 'vertical';

    @HostListener('window:resize')
  onResize() {
    this.detectarOrientacion();
  }

  detectarOrientacion() {
    this.orientacion = window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical';
  }

}
