export interface Cuenta{
    id?: number,
    usuario: string,
    ingreso_mensual: string,
    umbral: string,
    saldo: string,
}

export interface Gasto{
    id?: number,
    fecha?: string,
    nombre: string,
    usuario: string,
    monto: string,
    tipo: string | 'medicina' | 'servicio' | 'alimento' | 'impuesto' | 'otro',
}