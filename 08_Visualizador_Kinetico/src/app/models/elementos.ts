export interface Elemento{
    id?: number,
    img?: string[],
    subida?: string,
    foto?: string,
    votos?: number,
    nombre: string, 
    tipo: 'lindo' | 'feo',
    usuario_subida: string,
}

export interface EstadisticasElemento {
  tipo: 'lindo' | 'feo'; // Tipo de elemento: 'lindo' o 'feo'
  totalEncuestas: number;
  promedioGeneral: number;
  porcentajePostres: number;
  promedioComida: number;
  promedioBebida: number;
  promedioPrecioCalidad: number;
  promedioAtencion: number;
  distribucionRecomendacion: {
    si: number;
    no: number;
    tal_vez: number;
  };
}
