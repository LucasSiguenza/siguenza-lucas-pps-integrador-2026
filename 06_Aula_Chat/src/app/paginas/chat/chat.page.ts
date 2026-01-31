import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonTextarea, IonButton, IonIcon } from '@ionic/angular/standalone';
import { Utils } from 'src/app/servicios/utils';
import { UsusarioSb } from 'src/app/servicios/ususario-sb';
import { ChatSb } from 'src/app/servicios/chat-sb';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { Mensaje } from 'src/app/models/chat';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MarlujoHeaderComponent]
})
export class ChatPage implements OnInit {

  protected utilSvc = inject(Utils);
  protected userSvc = inject(UsusarioSb);
  protected chatSvc = inject(ChatSb);

  /** input controlado */
  mensajeInput = signal('');

  /** sala actual */
  readonly sala = this.chatSvc.sala;

  /** estado derivado para estilos */
  readonly esA = computed(() => this.sala() === 'A');
  readonly esB = computed(() => !this.esA());

  /** mensajes del servicio */
  readonly mensajes = this.chatSvc.listaMensajes;

  async ngOnInit() {
    await this.chatSvc.recargarMensajes();
    this.chatSvc.iniciarRealtime();
  }

  ngOnDestroy() {
    this.chatSvc.destruirRealtime();
  }

  /* ===================== */
  /* 🧠 MÉTODOS VISUALES   */
  /* ===================== */

  esMensajePropio(msj: Mensaje): boolean {
    return msj.usuario === this.userSvc.usrActual()?.uid;
  }

  obtenerHora(msj: Mensaje): string {
    if (!msj.subida) return '';
    return new Date(msj.subida).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async enviar(): Promise<void> {
    const texto = this.mensajeInput().trim();
    if (!texto) return;

    await this.chatSvc.enviarMensaje(texto);
    this.mensajeInput.set('');
  }
}