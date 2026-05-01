export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  fotoUrl?: string;
  matricula?: string;
  provincia?: string;
  ciudad?: string;
  telefono?: string;
  whatsapp?: string;
  direccion?: string;
  bio?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  behanceUrl?: string;
  pinterestUrl?: string;
  sitioWeb?: string;
  perfilCompleto?: boolean;
  fechaRegistro: string;
  presupuestosCargados: number;
  accesoDesbloqueado: boolean;
}
