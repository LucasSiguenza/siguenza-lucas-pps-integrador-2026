export interface Boton {
  id: string;
  label?: string; // opcional, solo para referencia interna
  icon?: string; // URL o path a imagen (temas)
  flag?: string; // URL o path a banderita (idiomas)
  color?: string; // para diferenciar botones grandes
}

export interface Pregunta {
  texto: string;
  correcta: boolean;
  imagen: string; // ruta de imagen alusiva según tema
  nivel: 0 | 1 | 2 | 3 | 4;  // 0 a 4
  tema: 'colores' | 'numeros' | 'animales';
  idioma: 'es' | 'en' | 'pt';
}


export const PREGUNTAS: Pregunta[] = [
  // ===================== Colores =====================
  // Nivel 0 - Muy fácil
  { texto: 'El cielo es azul', correcta: true, imagen: 'assets/temas/colores/azul.png', nivel: 0, tema: 'colores', idioma: 'es' },
  { texto: 'The sky is red', correcta: false, imagen: 'assets/temas/colores/azul.png', nivel: 0, tema: 'colores', idioma: 'en' },
  { texto: 'O céu é azul', correcta: true, imagen: 'assets/temas/colores/azul.png', nivel: 0, tema: 'colores', idioma: 'pt' },

  // Nivel 1 - Fácil
  { texto: 'El sol es amarillo', correcta: true, imagen: 'assets/temas/colores/amarillo.png', nivel: 1, tema: 'colores', idioma: 'es' },
  { texto: 'The sun is green', correcta: false, imagen: 'assets/temas/colores/amarillo.png', nivel: 1, tema: 'colores', idioma: 'en' },
  { texto: 'O sol é amarelo', correcta: true, imagen: 'assets/temas/colores/amarillo.png', nivel: 1, tema: 'colores', idioma: 'pt' },

  // Nivel 2 - Medio
  { texto: 'El césped es verde', correcta: true, imagen: 'assets/temas/colores/verde.png', nivel: 2, tema: 'colores', idioma: 'es' },
  { texto: 'Grass is purple', correcta: false, imagen: 'assets/temas/colores/verde.png', nivel: 2, tema: 'colores', idioma: 'en' },
  { texto: 'A grama é verde', correcta: true, imagen: 'assets/temas/colores/verde.png', nivel: 2, tema: 'colores', idioma: 'pt' },

  // Nivel 3 - Difícil
  { texto: 'El limón es amarillo', correcta: true, imagen: 'assets/temas/colores/limon.png', nivel: 3, tema: 'colores', idioma: 'es' },
  { texto: 'Lemon is red', correcta: false, imagen: 'assets/temas/colores/limon.png', nivel: 3, tema: 'colores', idioma: 'en' },
  { texto: 'O limão é amarelo', correcta: true, imagen: 'assets/temas/colores/limon.png', nivel: 3, tema: 'colores', idioma: 'pt' },

  // Nivel 4 - Extremo
  { texto: 'El carmín es un color rojo', correcta: true, imagen: 'assets/temas/colores/carmín.png', nivel: 4, tema: 'colores', idioma: 'es' },
  { texto: 'Carmine is a blue color', correcta: false, imagen: 'assets/temas/colores/carmín.png', nivel: 4, tema: 'colores', idioma: 'en' },
  { texto: 'Carmim é vermelho', correcta: true, imagen: 'assets/temas/colores/carmín.png', nivel: 4, tema: 'colores', idioma: 'pt' },

  // ===================== Números =====================
  { texto: 'Uno más uno es dos', correcta: true, imagen: 'assets/temas/numeros/1.png', nivel: 0, tema: 'numeros', idioma: 'es' },
  { texto: 'One plus one equals three', correcta: false, imagen: 'assets/temas/numeros/1.png', nivel: 0, tema: 'numeros', idioma: 'en' },
  { texto: 'Um mais um é dois', correcta: true, imagen: 'assets/temas/numeros/1.png', nivel: 0, tema: 'numeros', idioma: 'pt' },

  // Nivel 1
  { texto: 'Dos más dos son cuatro', correcta: true, imagen: 'assets/temas/numeros/2.png', nivel: 1, tema: 'numeros', idioma: 'es' },
  { texto: 'Two plus two equals five', correcta: false, imagen: 'assets/temas/numeros/2.png', nivel: 1, tema: 'numeros', idioma: 'en' },
  { texto: 'Dois mais dois é quatro', correcta: true, imagen: 'assets/temas/numeros/2.png', nivel: 1, tema: 'numeros', idioma: 'pt' },

  // Nivel 2
  { texto: 'Tres menos uno es dos', correcta: true, imagen: 'assets/temas/numeros/3.png', nivel: 2, tema: 'numeros', idioma: 'es' },
  { texto: 'Three minus one equals four', correcta: false, imagen: 'assets/temas/numeros/3.png', nivel: 2, tema: 'numeros', idioma: 'en' },
  { texto: 'Três menos um é dois', correcta: true, imagen: 'assets/temas/numeros/3.png', nivel: 2, tema: 'numeros', idioma: 'pt' },

  // Nivel 3
  { texto: 'Cinco más cinco es diez', correcta: true, imagen: 'assets/temas/numeros/5.png', nivel: 3, tema: 'numeros', idioma: 'es' },
  { texto: 'Five plus five equals eleven', correcta: false, imagen: 'assets/temas/numeros/5.png', nivel: 3, tema: 'numeros', idioma: 'en' },
  { texto: 'Cinco mais cinco é dez', correcta: true, imagen: 'assets/temas/numeros/5.png', nivel: 3, tema: 'numeros', idioma: 'pt' },

  // Nivel 4
  { texto: 'Nueve menos seis es tres', correcta: true, imagen: 'assets/temas/numeros/9.png', nivel: 4, tema: 'numeros', idioma: 'es' },
  { texto: 'Nine minus six equals four', correcta: false, imagen: 'assets/temas/numeros/9.png', nivel: 4, tema: 'numeros', idioma: 'en' },
  { texto: 'Nove menos seis é três', correcta: true, imagen: 'assets/temas/numeros/9.png', nivel: 4, tema: 'numeros', idioma: 'pt' },

  // ===================== Animales =====================
  { texto: 'El gato dice "miau"', correcta: true, imagen: 'assets/temas/animales/gato.png', nivel: 0, tema: 'animales', idioma: 'es' },
  { texto: 'The cat says "meow"', correcta: true, imagen: 'assets/temas/animales/gato.png', nivel: 0, tema: 'animales', idioma: 'en' },
  { texto: 'O gato diz "miau"', correcta: true, imagen: 'assets/temas/animales/gato.png', nivel: 0, tema: 'animales', idioma: 'pt' },

  // Nivel 1
  { texto: 'El perro dice "guau"', correcta: true, imagen: 'assets/temas/animales/perro.png', nivel: 1, tema: 'animales', idioma: 'es' },
  { texto: 'The dog says "woof"', correcta: true, imagen: 'assets/temas/animales/perro.png', nivel: 1, tema: 'animales', idioma: 'en' },
  { texto: 'O cachorro diz "au"', correcta: true, imagen: 'assets/temas/animales/perro.png', nivel: 1, tema: 'animales', idioma: 'pt' },

  // Nivel 2
  { texto: 'El caballo puede volar', correcta: false, imagen: 'assets/temas/animales/caballo.png', nivel: 2, tema: 'animales', idioma: 'es' },
  { texto: 'The horse can fly', correcta: false, imagen: 'assets/temas/animales/caballo.png', nivel: 2, tema: 'animales', idioma: 'en' },
  { texto: 'O cavalo pode voar', correcta: false, imagen: 'assets/temas/animales/caballo.png', nivel: 2, tema: 'animales', idioma: 'pt' },

  // Nivel 3
  { texto: 'El elefante es más grande que un ratón', correcta: true, imagen: 'assets/temas/animales/elefante.png', nivel: 3, tema: 'animales', idioma: 'es' },
  { texto: 'The elephant is bigger than a mouse', correcta: true, imagen: 'assets/temas/animales/elefante.png', nivel: 3, tema: 'animales', idioma: 'en' },
  { texto: 'O elefante é maior que um rato', correcta: true, imagen: 'assets/temas/animales/elefante.png', nivel: 3, tema: 'animales', idioma: 'pt' },

  // Nivel 4
  { texto: 'El pez puede caminar en la tierra', correcta: false, imagen: 'assets/temas/animales/pez.png', nivel: 4, tema: 'animales', idioma: 'es' },
  { texto: 'The fish can walk on land', correcta: false, imagen: 'assets/temas/animales/pez.png', nivel: 4, tema: 'animales', idioma: 'en' },
  { texto: 'O peixe pode andar na terra', correcta: false, imagen: 'assets/temas/animales/pez.png', nivel: 4, tema: 'animales', idioma: 'pt' },
];
