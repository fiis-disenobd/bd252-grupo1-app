import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'ventas', name: 'venta' })
export class Venta {
  @PrimaryGeneratedColumn({ name: 'id_venta' })
  id!: number;

  @Column({ name: 'id_pedido' })
  idPedido!: number;

  @Column({ name: 'id_descuento', nullable: true })
  idDescuento?: number;

  @Column({ name: 'monto_total', type: 'numeric' })
  montoTotal!: string;
}
