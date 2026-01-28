import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabaseService';
import { Elemento } from '../models/elementos';
import { Utils } from './utils';
import { UsusarioSb } from './ususario-sb';
import { Foto, Voto } from '../models/tablasAuxiliares';

@Injectable({
  providedIn: 'root',
})
export class ElementoSb {

  private sbSvc = inject(SupabaseService);
  private utilSvc = inject(Utils);
  private userSvc = inject(UsusarioSb)

  listadoSeleccionado = signal<'lindo' | 'feo' | null>(null);
  listadoFotos = signal<Foto[]>([]);
  listadoVotos = signal<Voto[]>([]);
  listadoElementos = signal<Elemento[]>([]);


  private canalRealtime = this.sbSvc.sb
  .channel('realtime-elementos')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'fotos' },
    () => {
      this.refrescarListado();
    }
  )
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'votos' },
    () => {
      this.refrescarListado();
    }
  )
  .subscribe();

  constructor() {
    this.refrescarListado();
  }

  /* =========================
     LISTADO GENERAL
  ========================== */
private async refrescarListado(): Promise<void> {
  const [elementos, fotos, votos] = await Promise.all([
    this.sbSvc.listarTodos<Elemento>('cosas_edificio'),
    this.sbSvc.listarTodos<Foto>('fotos'),
    this.sbSvc.listarTodos<Voto>('votos'),
  ]);

  this.listadoFotos.set(fotos);
  this.listadoVotos.set(votos);

  const completos = await Promise.all(
    elementos.map(async e => ({
      ...e,
      img: fotos
        .filter(f => f.publicacion === e.foto)
        .map(f => f.url)
    }))
  );

  this.listadoElementos.set(completos);
}

  async listarTodos(): Promise<Elemento[]> {
    const listadoPrel =
      await this.sbSvc.listarTodos<Elemento>('cosas_edificio');

    return await Promise.all(
      listadoPrel.map(async (e) => ({
        ...e,
        img: await this.obtenerUrls(e.foto!)
      }))
    );
  }

  /* =========================
     AGREGAR ELEMENTO
  ========================== */

  async agregarElemento(cosa: Elemento): Promise<void> {

    const identificador = crypto.randomUUID();
    const momento = Date.now();
    const nombreArchivo = `${cosa.usuario_subida}-${momento}`;
    const blobs = await this.utilSvc.convertirFotosABlobs(cosa.img!);

    const datos = {
      nombre: cosa.nombre,
      tipo: cosa.tipo,
      usuario_subida: cosa.usuario_subida,
      foto: identificador
    };

    const respuesta = await this.sbSvc.insertar('cosas_edificio', datos);

    if (respuesta.length === 0) {
      throw new Error('Hubo un problema con la subida');
    }

    const urls = await this.sbSvc.subirFoto(nombreArchivo, blobs, 'edificio');

    if (typeof urls === 'string') {
      throw new Error('Error al subir las fotos');
    }

    for (const ft of urls) {
      const dataFotos: Foto = {
        publicacion: identificador,
        url: ft
      };

      await this.sbSvc.insertar('fotos', dataFotos);
    }
  }

  /* =========================
     OBTENER FOTOS
  ========================== */

  async obtenerUrls(fotoId: string): Promise<string[]> {
    const lista = await this.sbSvc.listarTodos<Foto>('fotos');

    return lista
      .filter(ft => ft.publicacion === fotoId)
      .map(ft => ft.url);
  }

  /* =========================
     VOTAR
  ========================== */

  async emitirVoto(publicacion: string) {
    const elem = this.listadoElementos()
      .find(e => e.foto === publicacion);
    if (!elem) return;

    const uid = this.userSvc.usrActual()?.uid;
    if (!uid) return;

    // 1️⃣ Verificar si ya existe voto
    const yaVoto = this.listadoVotos()
      .some(v => v.publicacion === publicacion && v.usuario === uid);
    if (yaVoto == true) {
      throw new Error('YA_VOTO');
    }

    // 2️⃣ Insertar voto
    const datos = {
      publicacion: publicacion,
      usuario: uid,
    };
    
    const insert = await this.sbSvc.insertar('votos', datos);

    // 3️⃣ Actualizar contador
    const nuevosVotos = (elem.votos ?? 0) + 1;

    await this.sbSvc.actualizar(
      'cosas_edificio',
      'id',
      elem.id!.toString(),
      { votos: nuevosVotos }
    );

    await this.refrescarListado();
    alert("listados recargadusss")
  }


  /* =========================
     LIMPIEZA
  ========================== */

  destruirCanal(): void {
    this.sbSvc.sb.removeChannel(this.canalRealtime);
  }
}
