import { inject, Injectable, signal } from '@angular/core';
import { Usuario } from '../models/Usuario';
import { SupabaseService } from './supabaseService';
import { Session, User, WeakPassword } from '@supabase/supabase-js';

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


}
