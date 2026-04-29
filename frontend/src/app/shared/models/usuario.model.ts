export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  fotoUrl?: string;
  matricula?: string;
  provincia?: string;
  ciudad?: string;
  fechaRegistro: string;
  presupuestosCargados: number;
  accesoDesbloqueado: boolean;
}
