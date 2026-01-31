import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabaseService';
import { UsusarioSb } from './ususario-sb';
import { Puntuacion } from '../models/puntuacion';

@Injectable({
  providedIn: 'root',
})
export class PuntuacionSb {
  private sbSvc = inject(SupabaseService);
  private usrSvc = inject(UsusarioSb);

  public dificultad = signal<"facil"| "medio"| "dificil"| null>(null);
  
  async obtenerPuntuaciones(): Promise<Puntuacion[]> {
    const pts = await this.sbSvc.listarTodos<Puntuacion>('puntuaciones');

    for (const pt of pts) {
      const usr = await this.usrSvc.buscarUsuario(pt.jugador as string);
      pt.jugador = usr?.nombre ?? 'Jugador no registrado';
    }

    return pts;
  }

  async agregarPuntuacion(tiempo: any, dificultad: string ){
    const uid = this.usrSvc.usrActual()?.uid

    await this.sbSvc.insertar<Puntuacion>('puntuaciones', {tiempo: tiempo, jugador: String(uid), dificultad: dificultad });

  }

}
