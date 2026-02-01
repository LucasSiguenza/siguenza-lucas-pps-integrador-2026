import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabaseService';
import { UsusarioSb } from './ususario-sb';
import { Puntuacion } from '../models/puntuacion';

@Injectable({
  providedIn: 'root',
})
export class PuntajeSb {
    private usrSvc = inject(UsusarioSb);
    private sbSvc = inject(SupabaseService);
    tipo = signal<'marvel' | 'dc'| string>('');
    
    async obtenerPuntuaciones(): Promise<Puntuacion[]> {
        const pts = await this.sbSvc.listarTodos<Puntuacion>('puntajes');

        for (const pt of pts) {
        const usr = await this.usrSvc.buscarUsuario(pt.usuario as string);
        pt.usuario = usr?.nombre ?? 'Jugador no registrado';
        }

        return pts;
    }

    async agregarPuntuacion(tiempo: any){
        const uid = this.usrSvc.usrActual()?.uid

        await this.sbSvc.insertar<Puntuacion>('puntajes', {valor: tiempo, usuario: String(uid) });

    }

}