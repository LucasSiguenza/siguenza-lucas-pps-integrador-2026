import { Injectable } from '@angular/core';
import { Usuario } from '../models/Usuario';
import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Email {
  private servId = environment.EmailService;
  private servKey = environment.EmailPublicKey;
  private template = environment.EmailTemplate;


  enviarEmail(usr: Usuario| null, mensaje: string, encabezado: string){

    const templateParams = {
      encabezado: encabezado,
      nombre: usr?.nombre+" "+usr?.apellido,
      mensaje: mensaje,
      email: usr?.correo ? `${usr.correo}` : 'desesperaciondreams@gmail.com',
    };

    emailjs.send(this.servId, this.template, templateParams, {
    publicKey: this.servKey,
    })
    .then((response: EmailJSResponseStatus) => {
      console.log('Correo enviado correctamente:', response.status, response.text);
    })
    .catch((error: EmailJSResponseStatus) => {
      console.error('Error al enviar el correo:', error.text);
    });

  }

  envClienteAprobado(usr: Usuario){
    const nombre = usr.nombre+" "+usr.apellido;
    const encabezado = `MarlujoTeam - ¡Felicidades, ${nombre}! Ahora puedes ingresar a la app.`
    const mensaje= `¡Hola${nombre}!
¡Su solicitud de registro ha sido aprobada!`

  this.enviarEmail(usr, mensaje, encabezado);
  }

    envClienteRechazado(usr: Usuario){
      const nombre = usr.nombre+" "+usr.apellido;
      const encabezado = `MjorApp - Lamentamos informarle, ${nombre}. No se le permitirá el ingreso.`
      const mensaje= `¡Hola ${nombre}!
Su solicitud de registro ha sido rechazada por nuestro supervisor`

    this.enviarEmail(usr, mensaje, encabezado);
  }
}
