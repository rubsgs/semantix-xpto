import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
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
      console.error(
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
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .where('deleted_at IS NULL')
      .offset(page)
      .limit(limit)
      .orderBy(orderBy, direction);

    return await queryBuilder.getMany();
  }

  async findOne(id: number) {
    return await this.productRepository.findOneBy({ id, deletedAt: IsNull() });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return await this.productRepository.update(id, updateProductDto);
  }

  async remove(id: number) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    product.deletedAt = new Date();
    return await this.productRepository.update(id, product);
  }
}
