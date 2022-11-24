import { PurchaseItem } from '../../purchase/entities/purchase.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'decimal',
    transformer: { from: (data) => +data, to: (data) => +data },
  })
  price: number;

  @Column({
    type: 'decimal',
    transformer: { from: (data) => +data, to: (data) => +data },
  })
  stock: number;

  @Column({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => PurchaseItem, (purchaseItem) => purchaseItem.product)
  purchases: PurchaseItem[];
}
