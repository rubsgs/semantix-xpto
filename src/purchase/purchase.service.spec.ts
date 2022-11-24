import { Test, TestingModule } from '@nestjs/testing';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/product/entities/product.entity';
import { Purchase } from './entities/purchase.entity';
import { PurchaseService } from './purchase.service';
import { faker } from '@faker-js/faker';

describe('PurchaseService', () => {
  let service: PurchaseService;

  const queryBuilderMock = {
    where: jest.fn().mockImplementation(() => queryBuilderMock),
    offset: jest.fn().mockImplementation(() => queryBuilderMock),
    limit: jest.fn().mockImplementation(() => queryBuilderMock),
    orderBy: jest.fn().mockImplementation(() => queryBuilderMock),
    groupBy: jest.fn().mockImplementation(() => queryBuilderMock),
    select: jest.fn().mockImplementation(() => queryBuilderMock),
    addSelect: jest.fn().mockImplementation(() => queryBuilderMock),
    innerJoin: jest.fn().mockImplementation(() => queryBuilderMock),
    getMany: jest.fn().mockReturnValue([]),
    getRawMany: jest.fn().mockReturnValue([]),
  };

  const purchaseRepository = {
    save: jest.fn().mockImplementation((purchase: Purchase) => {
      return { ...purchase, id: faker.datatype.number() };
    }),
    createQueryBuilder: jest.fn().mockImplementation(() => queryBuilderMock),
    findOneBy: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const customerRepository = {
    save: jest.fn().mockImplementation((customer: Customer) => {
      return { ...customer, id: faker.datatype.number() };
    }),
    createQueryBuilder: jest.fn().mockImplementation(() => queryBuilderMock),
    findOneBy: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const productRepository = {
    save: jest.fn().mockImplementation((product: Product) => {
      return { ...product, id: faker.datatype.number() };
    }),
    createQueryBuilder: jest.fn().mockImplementation(() => queryBuilderMock),
    findOneBy: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseService,
        {
          provide: 'ProductRepository',
          useValue: productRepository,
        },
        { provide: 'CustomerRepository', useValue: customerRepository },
        { provide: 'PurchaseRepository', useValue: purchaseRepository },
      ],
    }).compile();

    service = module.get<PurchaseService>(PurchaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
