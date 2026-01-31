import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent,} from '@ionic/angular/standalone';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { Utils } from 'src/app/servicios/utils';

import { UsusarioSb } from 'src/app/servicios/ususario-sb';
import { ChatSb } from 'src/app/servicios/chat-sb';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [ IonContent, CommonModule, FormsModule, MarlujoHeaderComponent]
})
export class InicioPage {
  protected utilSvc = inject(Utils)
  protected usrSvc = inject(UsusarioSb);
  protected chatSvc = inject(ChatSb)

  async redirigirChat(sala: 'A' | 'B'){
    this.chatSvc.sala.set(sala);
    await this.utilSvc.redirigir('chat');
  }

}
