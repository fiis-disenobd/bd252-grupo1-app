import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'ventas', name: 'pedido' })
export class Pedido {
  @PrimaryGeneratedColumn({ name: 'id_pedido' })
  id!: number;

  @Column({ name: 'id_cliente' })
  idCliente!: number;

  @Column({ name: 'tipo_carne' })
  tipoCarne!: string;

  @Column({ name: 'peso_kg', type: 'numeric' })
  pesoKg!: string;

  @Column({ name: 'precio', type: 'numeric' })
  precio!: string;

  @Column({ name: 'fecha_pedido', type: 'date' })
  fechaPedido!: string;
}
