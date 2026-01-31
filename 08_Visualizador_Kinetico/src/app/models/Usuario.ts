export interface Usuario{
    id?: number,
    creacion?: string,
    uid?: string,
    correo: string,
    perfil: 'admin' | 'invitado' | 'tester' | 'usuario' | 'anonimo' | string,
    sexo: 'masculino' | 'femenino' | string,
}