export interface Credito{
    id?: number,
    usuario: string,
    carga: string,
    codigo: string,
}

export interface Carga{
    id?: number,
    credito: string,
    usuario: string,
}
