export interface Mensaje{
    id?: number,
    subida?: string,
    nombre: string,
    usuario: string,
    mensaje: string,
    sala: "A" | "B" | "string",
}