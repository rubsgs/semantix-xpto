import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../customer/entities/customer.entity';
import { Product } from '../product/entities/product.entity';
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  In,
  IsNull,
  Like,
  Raw,
  Repository,
} from 'typeorm';
import { CreatePurchaseDto, PurchaseItemDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Purchase, PurchaseItem } from './entities/purchase.entity';

@Injectable()
export class PurchaseService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(PurchaseItem)
    private purchaseItemRepository: Repository<PurchaseItem>,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto) {
    let purchase = new Purchase();
    purchase.purchaseDate = new Date(createPurchaseDto.purchaseDate);

    try {
      if (createPurchaseDto.customerId) {
        purchase = await this.setPurchaseCustomer(
          purchase,
          createPurchaseDto.customerId,
        );
      }

      purchase = await this.setPurchaseItemsData(
        purchase,
        createPurchaseDto.items,
      );

      return await this.purchaseRepository.save(purchase);
    } catch (e) {
      this.logger.error(
        `An error occurred whiled trying to create a purchase: ${e.massage}`,
      );
      throw e;
    }
  }

  async findAll(
    orderBy?: string,
    direction: 'ASC' | 'DESC' = 'ASC',
    page = 0,
    limit = 10,
    customerId?: number,
    purchaseDate?: Date,
    purchaseMonth?: string,
    purchaseYear?: number,
  ) {
    const where: FindOptionsWhere<Purchase> = { deletedAt: IsNull() };
    const order: FindOptionsOrder<Purchase> = {};

    if (orderBy) order[orderBy] = { direction };
    if (customerId) where['customer'] = { id: customerId };

    if (purchaseYear) {
      const startDate = new Date(purchaseYear, 0, 1);
      const endDate = new Date(purchaseYear, 11, 31, 23, 59, 59);
      where['purchaseDate'] = Between(startDate, endDate);
    }

    if (purchaseMonth) {
      const [year, month] = purchaseMonth.split('-');
      const startDate = new Date(+year, +month - 1, 1);
      const endDate = new Date(+year, +month, 0);
      where['purchaseDate'] = Between(startDate, endDate);
    }

    if (purchaseDate) {
      const date = new Date(purchaseDate);
      date.setUTCHours(23, 59, 59, 999);
      where['purchaseDate'] = Between(purchaseDate, date);
    }

    return this.purchaseRepository.find({
      where,
      order,
      skip: page * limit,
      take: limit,
    });
  }

  async findOne(id: number) {
    return await this.purchaseRepository.findBy({ id });
  }

  async update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    const existingPurchase = await this.purchaseRepository.findOneBy({
      id,
      deletedAt: IsNull(),
    });

    if (!existingPurchase)
      throw new NotFoundException(`Purchase ID ${id} not found`);

    let purchase = new Purchase();
    purchase.id = existingPurchase.id;
    if (updatePurchaseDto.purchaseDate)
      purchase.purchaseDate = new Date(updatePurchaseDto.purchaseDate);

    try {
      if (updatePurchaseDto.customerId) {
        purchase = await this.setPurchaseCustomer(
          purchase,
          updatePurchaseDto.customerId,
        );
      }

      if (updatePurchaseDto.items) {
        await this.purchaseItemRepository.remove(existingPurchase.items);
        purchase = await this.setPurchaseItemsData(
          purchase,
          updatePurchaseDto.items,
        );
      }
      return await this.purchaseRepository.save(purchase);
    } catch (e) {
      this.logger.error(
        `An error occurred whiled trying to create a purchase: ${e.massage}`,
      );
      throw e;
    }
  }

  async remove(id: number) {
    const purchase = await this.purchaseRepository.findOneBy({
      id,
      deletedAt: IsNull(),
    });
    if (!purchase) throw new NotFoundException(`Purchase ID ${id} not found`);

    return await this.purchaseRepository.update(id, { deletedAt: new Date() });
  }

  private async setPurchaseCustomer(
    purchase: Purchase,
    customerId: number,
  ): Promise<Purchase> {
    const returnedPurchase = new Purchase();
    Object.assign(returnedPurchase, purchase);

    const customer = await this.customerRepository.findOneBy({
      id: customerId,
      deletedAt: IsNull(),
    });
    if (!customer)
      throw new NotFoundException(`Customer ID ${customerId} not found`);
    returnedPurchase.customer = customer;

    return returnedPurchase;
  }

  private async setPurchaseItemsData(
    purchase: Purchase,
    items: PurchaseItemDto[],
  ): Promise<Purchase> {
    const returnedPurchase = new Purchase();
    Object.assign(returnedPurchase, purchase);
    returnedPurchase.items = purchase.items ?? [];

    const productIdMap = new Map<number, number>();
    for (const item of items) {
      productIdMap.set(item.productId, item.quantity);
    }

    const productFilter = Array.from(productIdMap.keys());
    const products = await this.productRepository.findBy({
      id: In(productFilter),
    });

    let totalValue = 0;
    for (const product of products) {
      const item = new PurchaseItem();
      item.product = product;
      item.unitValue = product.price;
      item.quantity = productIdMap.get(product.id);
      returnedPurchase.items.push(item);
      totalValue += item.unitValue * item.quantity;
    }

    returnedPurchase.totalValue = totalValue;

    return returnedPurchase;
  }
}
