import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'ventas', name: 'cliente' })
export class Cliente {
  @PrimaryGeneratedColumn({ name: 'id_cliente' })
  id!: number;

  @Column()
  nombre!: string;

  @Column({ name: 'cod_distrito', nullable: true })
  codDistrito?: string;
}
