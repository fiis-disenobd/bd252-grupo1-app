import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'ventas', name: 'descuento' })
export class Descuento {
  @PrimaryGeneratedColumn({ name: 'id_descuento' })
  id!: number;

  @Column({ type: 'numeric' })
  valor!: string;
}
