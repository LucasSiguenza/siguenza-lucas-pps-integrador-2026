
export interface CuadrillaConfig {
  iconPath: string;
  color: 'pink' | 'blue' | 'black' | 'violet' | 'green';
  position?: 'arriba-izquierda' | 'arriba-derecha' | 'abajo-izquierda' | 'abajo-derecha';
  accion: () => void;
}
