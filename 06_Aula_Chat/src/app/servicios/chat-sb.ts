import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabaseService';
import { Mensaje } from '../models/chat';
import { UsusarioSb } from './ususario-sb';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Utils } from './utils';

@Injectable({
  providedIn: 'root',
})
export class ChatSb {
  private sbSvc = inject(SupabaseService);
  private usrSvc = inject(UsusarioSb);
  private utilSvc = inject(Utils);

  private canal?: RealtimeChannel;


  sala = signal<'A'|'B'>('A')
  listaMensajes = signal<Mensaje[]>([]);

  async recargarMensajes(): Promise<void> {
    const mensajes = await this.sbSvc.sb
      .from('chat')
      .select('*')
      .eq('sala', this.sala())
      .order('subida', { ascending: true });

    this.listaMensajes.set(mensajes.data ?? []);
  }
  async enviarMensaje(msj: string){
    const nombre = this.usrSvc.usrActual()?.nombre! ?? 'No definido'
    const uid = this.usrSvc.usrActual()?.uid! ?? 'anon'

    const data: Mensaje = {
      nombre: nombre,
      usuario: uid,
      mensaje: msj,
      sala: this.sala(),
    }

    this.sbSvc.insertar('chat', data);
  }

    iniciarRealtime(): void {
    this.canal = this.sbSvc.sb
      .channel('chat-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat',
          filter: `sala=eq.${this.sala()}`
        },
        () => {
          this.recargarMensajes();
          this.utilSvc.reproducirSonidoPorDuracion('assets/sonidos/flip.m4a',500)
        }
      )
      .subscribe();
  }

    destruirRealtime(): void {
    if (this.canal) {
      this.sbSvc.sb.removeChannel(this.canal);
      this.canal = undefined;
    }
  }

}
