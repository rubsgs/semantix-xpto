import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './product/product.controller';
import { CustomerController } from './customer/customer.controller';
import { ProductService } from './product/product.service';
import { CustomerService } from './customer/customer.service';
import { PurchaseService } from './purchase/purchase.service';
import { PurchaseController } from './purchase/purchase.controller';
import { CustomerModule } from './customer/customer.module';
import { ProductModule } from './product/product.module';
import { PurchaseModule } from './purchase/purchase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from './data-source';
import { Product } from './product/entities/product.entity';
import { Purchase, PurchaseItem } from './purchase/entities/purchase.entity';
import { Customer } from './customer/entities/customer.entity';

const entities = [Product, Customer, Purchase, PurchaseItem];
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...dataSource,
      entities,
    }),
    TypeOrmModule.forFeature(entities),
    CustomerModule,
    PurchaseModule,
    ProductModule,
  ],
  controllers: [
    AppController,
    ProductController,
    CustomerController,
    PurchaseController,
  ],
  providers: [AppService, ProductService, CustomerService, PurchaseService],
})
export class AppModule {}
