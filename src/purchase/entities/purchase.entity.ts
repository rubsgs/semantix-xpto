import { Customer } from '../../customer/entities/customer.entity';
import { Product } from '../../product/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'purchase_date' })
  purchaseDate: Date;

  @Column({ name: 'total_value' })
  totalValue: number;

  @ManyToOne(() => Customer, (customer) => customer.purchases, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => PurchaseItem, (purchaseItem) => purchaseItem.purchase, {
    cascade: true,
    eager: true,
  })
  items: PurchaseItem[];
}

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Purchase, (purchase) => purchase.items)
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;

  @ManyToOne(() => Product, (product) => product.purchases)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  quantity: number;

  @Column({ name: 'unit_value' })
  unitValue: number;
}
