export class CrearProgramacionDto {
  reporteId!: number; // FK al reporte que se programa
  nombre!: string; // nombre_programacion
  expresion!: string; // regla de recurrencia (ej: FREQ=DAILY;BYHOUR=6)
  horaReferencia!: string; // HH:mm:ss
  zonaHoraria!: string; // ej: America/Lima
  vigenteDesde!: string; // date (YYYY-MM-DD)
  vigenteHasta?: string; // date opcional
  entregaAutomatica?: boolean; // default true
  creadoPorUsuarioId?: number; // opcional
}
