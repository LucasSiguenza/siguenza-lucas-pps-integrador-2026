import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabaseService';
import { AuthSession, Session, User, WeakPassword } from '@supabase/supabase-js';
import { Usuario } from '../models/Usuario';
import { Utils } from './utils';
import { Email } from './email';

@Injectable({
  providedIn: 'root',
})
export class UsusarioSb {
 
  private sbSvc = inject(SupabaseService);
  private utilSvc = inject(Utils);
  private emailSvc = inject(Email);

  /* ===================== */
  /* ESTADO                */
  /* ===================== */
  usrActual = signal<Usuario | null>(null);
  usrDBActual = signal<{
    user: User;
    session: Session;
    weakPassword?: WeakPassword;
  } | null>(null);

  listaUsuarios = signal<Usuario[]>([]);

  private canalUsuarios: any = null;

  /* ===================== */
  /* USUARIO ACTUAL        */
  /* ===================== */
  async obtenerUsuarioActual() {
    const uid = this.usrDBActual()?.user.id;
    if (!uid) return;

    const usr = await this.sbSvc.adquirirFila<Usuario>('usuarios', 'uid', uid);

    if (usr) {
      usr.foto = await this.sbSvc.obtenerUrl('usuarios', `${uid}.png`);
      this.usrActual.set(usr);
    }
  }

  /* ===================== */
  /* LISTADO               */
  /* ===================== */
  async listarUsuarios(): Promise<Usuario[]> {
    const lst = await this.sbSvc.listarTodos<Usuario>('usuarios');

    const usuariosConFoto = await Promise.all(
      lst.map(async usr => ({
        ...usr,
        foto: usr.uid
          ? await this.sbSvc.obtenerUrl('usuarios', `${usr.uid}.png`)
          : undefined
      }))
    );

    this.listaUsuarios.set(usuariosConFoto);
    return usuariosConFoto;
  }

  async buscarUsuario(uuid: string): Promise<Usuario | null> {
    return await this.sbSvc.adquirirFila<Usuario>('usuarios', 'uid', uuid);
  }

  /* ===================== */
  /* ALTA DE USUARIO       */
  /* ===================== */
  // async agregarUsuario(usr: Usuario, contrasenia: string) {
  //   const { correo } = usr;
  //   const data = await this.sbSvc.registrarEmail(correo, contrasenia);
    
  //   if (!data?.user?.id) {
  //     throw new Error('No se pudo crear el usuario en Auth');
  //   }
    
  //   const datos: Usuario = {
  //     apellido: usr.apellido,
  //     correo: usr.correo,
  //     dni: usr.dni,
  //     nombre: usr.nombre,
  //     perfil: usr.perfil,
  //     sexo: usr.sexo,
  //     uid: data.user.id
  //   };
    
  //   if (usr.foto) {
  //     const blob = await this.utilSvc.procesarFoto(usr.foto);
  //     const foto = await this.sbSvc.subirFoto(datos.uid!, blob, 'usuarios');
  //   }
    
  //   const intento = await this.sbSvc.insertar('usuarios', datos);
  //   await this.emailSvc.envClienteAprobado(usr)
  // }
/* ===================== */
/* ELIMINAR USUARIO      */
/* ===================== */
async eliminarUsuario(usr: Usuario): Promise<void> {
  if (!usr.uid) {
    throw new Error('Usuario inválido');
  }

  /* 1️⃣ eliminar foto (si existe) */
  try {
    await this.sbSvc.eliminarArchivo('usuarios', `${usr.uid}.png`);
  } catch {
    // no cortamos el flujo si no existe
  }

  /* 2️⃣ eliminar fila en public.usuarios */
  await this.sbSvc.eliminar('usuarios', 'uid', usr.uid);

  /* 3️⃣ refresco manual (fallback) */
  await this.listarUsuarios();
}
  /* ===================== */
  /* REALTIME              */
  /* ===================== */
  iniciarCanalUsuarios() {
    if (this.canalUsuarios) return;

    this.canalUsuarios = this.sbSvc.sb
      .channel('usuarios-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usuarios',
        },
        async () => {
          await this.listarUsuarios();
        }
      )
      .subscribe();
  }

  destruirCanalUsuarios() {
    if (this.canalUsuarios) {
      this.sbSvc.sb.removeChannel(this.canalUsuarios);
      this.canalUsuarios = null;
    }
  }
}