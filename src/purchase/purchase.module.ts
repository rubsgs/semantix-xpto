import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase, PurchaseItem } from './entities/purchase.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/product/entities/product.entity';

@Module({
  controllers: [PurchaseController],
  providers: [PurchaseService],
  imports: [
    TypeOrmModule.forFeature([Purchase, Customer, Product, PurchaseItem]),
  ],
})
export class PurchaseModule {}
