import { inject, Injectable, signal } from '@angular/core';
import { UsusarioSb } from './ususario-sb';
import { SupabaseService } from './supabaseService';
import { Carga, Credito } from '../models/credito';
import { Utils } from './utils';
import { RealtimeChannel } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class CreditoSb {
 
  /* ===================== */
  /* 🔌 Servicios          */
  /* ===================== */
  private sbSvc = inject(SupabaseService);
  private utilSvc = inject(Utils);
  private usrSvc = inject(UsusarioSb);
  private canalSaldo: RealtimeChannel | null = null;


  /* ===================== */
  /* 📡 Signals            */
  /* ===================== */
  cargas = signal<Carga[]>([]);
  creditos = signal<Credito[]>([]);
  saldoActual = signal<number>(0);

  cargandoCredito = signal<boolean>(false);

  /* ===================== */
  /* 🔁 Refrescar todo     */
  /* ===================== */
  async refrescarTodo() {
    const uid = this.usrSvc.usrActual()?.uid;
    if (!uid) return;

    const creditos = await this.sbSvc.listarTodos<Credito>('saldos');
    this.creditos.set(creditos);

    const cuenta = creditos.find(c => c.usuario === uid);
    this.saldoActual.set(Number(cuenta?.carga ?? 0));

    const cargas =  await this.sbSvc.listarTodos<Carga>('cargas')
    this.cargas.set(cargas);
  }

    
  async cargarCredito(valorQr: string) {
    const uid = this.usrSvc.usrActual()?.uid;
    if (!uid) return;
    this.cargandoCredito.set(true);

    try {
      // 1️⃣ Traemos todos los créditos válidos
      const creditos = await this.sbSvc.listarTodos<{ credito: string; valor: string }>('creditos');
      const registro = creditos.find(c => c.valor === valorQr);
      
      if (!registro) {
        throw new Error('Código QR no válido');
      }

      const creditoUUID = registro.credito;

      // 2️⃣ Obtenemos datos necesarios
      const cuenta = this.creditos().find(c => c.usuario === uid);
      const usr = await this.usrSvc.buscarUsuario(uid);

      const cargasUsuario = this.cargas().filter(
        c => c.usuario === uid && c.credito === creditoUUID
      );
      // 3️⃣ Regla de negocio (usuario / admin)
      let puedeCargar = false;

      if (usr?.perfil === 'admin') {
        puedeCargar = cargasUsuario.length < 2;
      } else {
        puedeCargar = cargasUsuario.length === 0;
      }

      if (!puedeCargar) {
        throw new Error('Este código QR ya fue cargado el máximo de veces permitido');
      }

      // 4️⃣ Actualización / creación de saldo
      if (cuenta) {
        const nuevoSaldo = Number(cuenta.carga) + Number(registro.valor);

        await this.sbSvc.actualizar(
          'saldos',
          'usuario',
          uid,
          { ...cuenta, carga: String(nuevoSaldo) }
        );
      } else {
        await this.sbSvc.insertar('saldos', {
          usuario: uid,
          codigo: creditoUUID,
          carga: registro.valor,
        });
      }

      // 5️⃣ Registro de la carga
      const dataCarga: Carga = {
        credito: creditoUUID,
        usuario: uid,
      };

      const res = await this.sbSvc.insertar('cargas', dataCarga);
    } finally {
      setTimeout(()=>{
        this.cargandoCredito.set(false);
      },500)
    }
  }
  /* ===================== */
  /* 📡 Realtime           */
  /* ===================== */
  iniciarRealtime() {
    const uid = this.usrSvc.usrActual()?.uid;
    if (!uid) return;

    this.canalSaldo = this.sbSvc.sb
      .channel('saldo-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saldos',
        },
        payload => {
          const nuevo = payload.new as Credito;
          this.saldoActual.set(Number(nuevo.carga));
          this.refrescarTodo()
        }
      )
      .subscribe();
  }


  async limpiarCargas() {
  const uid = this.usrSvc.usrActual()?.uid;
  if (!uid) return;

  try {
    // Elimina todas las cargas de este usuario
    await this.sbSvc.sb
      .from('cargas')
      .delete()
      .eq('usuario', uid);

    // Actualiza la signal local
    const nuevasCargas = this.cargas().filter(c => c.usuario !== uid);
    this.cargas.set(nuevasCargas);

    this.utilSvc.mostrarToast(
      'Tus cargas han sido limpiadas. Ahora puedes volver a cargar.',
      'success',
      'bottom',
      1500
    );

  } catch (err: any) {
    this.utilSvc.mostrarToast(
      err?.message ?? 'Error al limpiar las cargas',
      'error',
      'middle',
      1500
    );
  }  
}
destruirRealtime() {
  if (!this.canalSaldo) return;

  this.sbSvc.sb.removeChannel(this.canalSaldo);
  this.canalSaldo = null;
}


}