export type SalaSlug = 'pacifico' | 'atlantico-b' | 'atlantico-c';

export type CategoriaSlug =
  | 'estrategia-y-liderazgo'
  | 'agentes-y-automatizacion'
  | 'producto-datos-y-experiencia'
  | 'plataforma-y-escala'
  | 'ecosistema-inversion-y-talento'
  | 'networking-y-contenido';

export type SesionTipo =
  | 'acreditacion'
  | 'talk'
  | 'panel'
  | 'keynote'
  | 'workshop'
  | 'break'
  | 'cierre';

export interface Speaker {
  id: string;
  nombre: string;
  rol: string;
  linkedin?: string;
  bio?: string;
}

export interface Sesion {
  id: string;
  titulo: string;
  descripcion?: string;
  sala: SalaSlug;
  inicio: string;
  fin: string;
  speakers: string[];
  moderador?: string;
  tipo: SesionTipo;
  category: CategoriaSlug;
  categoryAlt?: CategoriaSlug[];
}

export interface Categoria {
  slug: CategoriaSlug;
  nombre: string;
  descripcion: string;
}

export type AvisoTipo = 'info' | 'warning' | 'urgent';

export interface Aviso {
  tipo: AvisoTipo;
  texto: string;
  desde?: string;
  hasta?: string;
}

export type AppMode = 'pre' | 'during' | 'post';

export const SALA_NOMBRE: Record<SalaSlug, string> = {
  'pacifico': 'Pacífico',
  'atlantico-b': 'Atlántico B',
  'atlantico-c': 'Atlántico C',
};

export const SALA_TAG: Record<SalaSlug, string> = {
  'pacifico': 'Sala principal',
  'atlantico-b': 'AI in action',
  'atlantico-c': 'VCs · pitches',
};
