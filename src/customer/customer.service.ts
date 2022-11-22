import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      this.logger.log(`Creating customer name: ${createCustomerDto.name}`);
      return await this.customerRepository.save(createCustomerDto);
    } catch (e) {
      this.logger.error(
        `An error occurred while trying to save a customer: ${e.message}`,
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
      const queryBuilder = this.customerRepository
        .createQueryBuilder('customer')
        .where('deleted_at IS NULL')
        .offset(page)
        .limit(limit)
        .orderBy(orderBy, direction);
      return await queryBuilder.getMany();
    } catch (e) {}
  }

  async findOne(id: number) {
    try {
      return await this.customerRepository.findOneBy({
        id,
        deletedAt: IsNull(),
      });
    } catch (e) {
      this.logger.error(`An error occurred on findOne: ${e.message}`);
      throw e;
    }
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    try {
      this.logger.log(`Updating customer: ${id}`);
      return await this.customerRepository.update(id, updateCustomerDto);
    } catch (e) {
      this.logger.error(`An error occurred on update: ${e.message}`);
      throw e;
    }
  }

  async remove(id: number) {
    this.logger.log(`Deleting customer ${id}`);
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);

    customer.deletedAt = new Date();
    return await this.customerRepository.update(id, customer);
  }
}
