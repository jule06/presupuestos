export interface ContactoPresupuesto {
  nombre: string;
  apellido: string;
  ciudad?: string;
  provincia?: string;
  whatsapp?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  behanceUrl?: string;
  pinterestUrl?: string;
  sitioWeb?: string;
  bio?: string;
}

export type TipoObra = 'VIVIENDA_NUEVA' | 'REFORMA_PARCIAL' | 'REFORMA_INTEGRAL' | 'LOCAL_COMERCIAL' | 'OFICINA' | 'OTRO';
export type CategoriaTerminacion = 'BASICA' | 'MEDIA' | 'PREMIUM';
export type GanoTrabajo = 'SI' | 'NO' | 'NO_SABE';
export type TipoCliente = 'PARTICULAR' | 'EMPRESA' | 'DESARROLLADORA';

export interface Desglose {
  estructura?: number;
  instalaciones?: number;
  terminaciones?: number;
  honorarios?: number;
}

export interface Presupuesto {
  id: number;
  tipoObra: TipoObra;
  superficieM2: number;
  provincia: string;
  ciudad: string;
  barrio?: string;
  anioPresupuesto: number;
  categoriaTerminacion: CategoriaTerminacion;
  costoTotal: number;
  costoPorM2: number;
  desglose?: Desglose;
  ganoTrabajo?: GanoTrabajo;
  tipoCliente?: TipoCliente;
  duracionMeses?: number;
  notas?: string;
  fechaCarga: string;
  anonimo?: boolean;
  contacto?: ContactoPresupuesto;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Estadisticas {
  promedioCostoM2: number;
  medianaCostoM2: number;
  minCostoM2: number;
  maxCostoM2: number;
  totalRegistros: number;
  distribucionPorTipo: Record<string, number>;
  distribucionPorCategoria: Record<string, number>;
}

export const TIPO_OBRA_LABELS: Record<TipoObra, string> = {
  VIVIENDA_NUEVA: 'Vivienda nueva',
  REFORMA_PARCIAL: 'Reforma parcial',
  REFORMA_INTEGRAL: 'Reforma integral',
  LOCAL_COMERCIAL: 'Local comercial',
  OFICINA: 'Oficina',
  OTRO: 'Otro'
};

export const CATEGORIA_LABELS: Record<CategoriaTerminacion, string> = {
  BASICA: 'Básica',
  MEDIA: 'Media',
  PREMIUM: 'Premium'
};

export const GANO_LABELS: Record<GanoTrabajo, string> = {
  SI: 'Sí',
  NO: 'No',
  NO_SABE: 'No sabe'
};

export const TIPO_CLIENTE_LABELS: Record<TipoCliente, string> = {
  PARTICULAR: 'Particular',
  EMPRESA: 'Empresa',
  DESARROLLADORA: 'Desarrolladora'
};
