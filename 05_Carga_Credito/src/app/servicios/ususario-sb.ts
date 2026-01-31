import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabaseService';
import { Session, User, WeakPassword } from '@supabase/supabase-js';
import { Usuario } from '../models/Usuario';

@Injectable({
  providedIn: 'root',
})
export class UsusarioSb {
  private sbSvc = inject(SupabaseService);
  usrActual = signal<Usuario | null>(null);
  usrDBActual = signal<{ user: User; session: Session; weakPassword?: WeakPassword | undefined; } | null>(null);
  fotosUsrActual = signal<string[] | null>(null);

  
  async obtenerUsuarioActual(){
    const usr = await this.sbSvc.adquirirFila<Usuario>('usuarios','uid',this.usrDBActual()?.user.id!)
    this.usrActual.set(usr);
  }

  async listarUsuarios():Promise<Usuario[]>{
    return await this.sbSvc.listarTodos<Usuario>('usuarios')
  }

  async buscarUsuario(uuid: string):Promise<Usuario | null>{
    const usr = await this.sbSvc.adquirirFila<Usuario>('usuarios', 'uid',uuid);
    return usr;
  }

}
