export interface Usuario{
    id?: number,
    creacion?: string,
    uid?: string,
    foto?: string,
    correo: string,
    perfil: 'admin' | 'invitado' | 'tester' | 'usuario' | 'anonimo' | string,
    sexo: 'masculino' | 'femenino' | string,
    nombre: string,
    apellido: string,
    dni: string,
}