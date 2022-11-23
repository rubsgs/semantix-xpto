import { Purchase } from 'src/purchase/entities/purchase.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  telephone: string;

  @Column()
  email: string;

  @Column({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => Purchase, (purchase) => purchase.customer, { eager: false })
  purchases: Purchase[];
}
