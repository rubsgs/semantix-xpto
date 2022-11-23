import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      this.logger.log(
        `Creating product ${createProductDto.name} | Price: ${createProductDto.price} | Stock: ${createProductDto.stock}`,
      );
      return await this.productRepository.save(createProductDto);
    } catch (e) {
      this.logger.error(
        `An error occurred while trying to save a product: ${e.message}`,
      );
      throw e;
    }
  }

  async findAll(
    orderBy?: string,
    direction: 'ASC' | 'DESC' = 'ASC',
    page = 0,
    limit = 10,
  ) {
    try {
      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .where('deleted_at IS NULL')
        .offset(page * limit)
        .limit(limit)
        .orderBy(orderBy, direction);

      return await queryBuilder.getMany();
    } catch (e) {
      this.logger.error(`An error occurred on findAll: ${e.message}`);
      throw e;
    }
  }

  async findOne(id: number) {
    try {
      return await this.productRepository.findOneBy({
        id,
        deletedAt: IsNull(),
      });
    } catch (e) {
      this.logger.error(`An error occurred on findOne: ${e.message}`);
      throw e;
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      this.logger.log(
        `Updating product: ${id}|Name: ${updateProductDto.name}|Price: ${updateProductDto.price}|Stock: ${updateProductDto.price}`,
      );
      return await this.productRepository.update(id, updateProductDto);
    } catch (e) {
      this.logger.error(`An error occurred on update: ${e.message}`);
      throw e;
    }
  }

  async remove(id: number) {
    this.logger.log(`Deleting product ${id}`);
    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    product.deletedAt = new Date();
    return await this.productRepository.update(id, product);
  }

  async bestSellers(
    date?: Date,
    month?: string,
    year?: number,
    direction: 'ASC' | 'DESC' = 'ASC',
  ) {
    let where = '';
    if (year) {
      where = `EXTRACT(YEAR FROM pu.purchase_date) = ${year}`;
    }

    if (month) {
      where = `TO_DATE(purchase_date::text, 'YYYY-MM') = '${month}-01'`;
    }

    if (date) {
      const dateString = date.toISOString().split('T')[0];
      where = `TO_DATE(purchase_date::text, 'YYYY-MM-DD') = '${dateString}'`;
    }

    const queryBuilder = this.productRepository
      .createQueryBuilder('p')
      .select('p.*')
      .addSelect('SUM(quantity) AS soldUnits')
      .innerJoin('purchase_items', 'pi', 'p.id = pi.product_id')
      .innerJoin('purchases', 'pu', 'pi.purchase_id = pu.id')
      .where(where)
      .groupBy('p.id')
      .orderBy('soldUnits', direction);

    return await queryBuilder.getRawMany();
  }
}
