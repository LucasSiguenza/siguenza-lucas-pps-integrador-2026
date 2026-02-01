import { inject, Injectable, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from './supabaseService';
import { UsusarioSb } from './ususario-sb';
import { Cuenta, Gasto } from '../models/cuenta';

@Injectable({
  providedIn: 'root'
})
export class CuentaSb {

  private sbSvc = inject(SupabaseService);
  private userSvc = inject(UsusarioSb);

  listaGastos = signal<Gasto[]>([]);
  listaCuentas = signal<Cuenta[]>([]);

  private canalRealtime?: RealtimeChannel;

  /* =============================
     CARGA INICIAL
  ============================== */
  async recargarListados() {
    const uid = this.userSvc.usrActual()?.uid;
    if (!uid) return;

    this.listaCuentas.set(
      (await this.sbSvc.listarTodos<Cuenta>('cuentas'))
        .filter(c => c.usuario === uid)
    );

    this.listaGastos.set(
      (await this.sbSvc.listarTodos<Gasto>('gastos'))
        .filter(g => g.usuario === uid)
    );
  }

  /* =============================
     CREAR CUENTA
  ============================== */

  async crearCuenta(cta: Cuenta){
    const existe = this.listaCuentas()
      .some(c => c.usuario === cta.usuario);

    if (existe) return;

    await this.sbSvc.insertar('cuentas', cta);
    this.recargarListados();
  }


  /* =============================
     REGISTRAR GASTO
  ============================== */
  async registrarGasto(monto: string, tipo: string, nombre: string) {
    const uid = this.userSvc.usrActual()?.uid;
    if (!uid) return;

    const cuenta = this.obtenerCuentaUsuario();
    if (!cuenta) return;

    const gastoData: Gasto = {
      monto,
      nombre,
      tipo,
      usuario: uid
    };
    const nuevoSaldo = this.calcularNuevoSaldo(cuenta.saldo, monto);
    
    const res = await this.sbSvc.insertar('gastos', gastoData);
    
    const expect = await this.sbSvc.actualizar(
      'cuentas',
      'id',
      String(cuenta.id),
      { ...cuenta, saldo: nuevoSaldo }
    );
  }

  /* =============================
     HELPERS
  ============================== */
  private obtenerCuentaUsuario(): Cuenta | undefined {
    const uid = this.userSvc.usrActual()?.uid;
    return this.listaCuentas().find(c => c.usuario === uid);
  }

  private calcularNuevoSaldo(saldoActual: string, monto: string): string {
    const saldo = Number(saldoActual);
    const gasto = Number(monto);
    return String(saldo - gasto);
  }

  /* =============================
     REALTIME
  ============================== */

  crearCanalRealtime() {
    const uid = this.userSvc.usrActual()?.uid;
    if (!uid || this.canalRealtime) return;

    this.canalRealtime = this.sbSvc.sb
      .channel(`gastos-${uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gastos',
          filter: `usuario=eq.${uid}`
        },
        payload => {
          console.log('Cambio realtime:', payload);
          this.recargarListados();
        }
      )
      .subscribe();
  }

  destruirCanalRealtime() {
    if (!this.canalRealtime) return;

    this.sbSvc.sb.removeChannel(this.canalRealtime);
    this.canalRealtime = undefined;
  }
}
