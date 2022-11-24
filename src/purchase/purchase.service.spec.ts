import { Test, TestingModule } from '@nestjs/testing';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/product/entities/product.entity';
import { Purchase } from './entities/purchase.entity';
import { PurchaseService } from './purchase.service';
import { faker } from '@faker-js/faker';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

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
    find: jest.fn().mockReturnValue([]),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const purchaseItemRepository = {
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
    findBy: jest.fn(),
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
        { provide: 'PurchaseItemRepository', useValue: purchaseItemRepository },
      ],
    }).compile();

    service = module.get<PurchaseService>(PurchaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('PurchaseService.create', () => {
    it('should save a purchase with a valid customer', async () => {
      const purchase = new CreatePurchaseDto();
      purchase.items = [
        {
          productId: faker.datatype.number(),
          quantity: faker.datatype.number(),
        },
      ];
      purchase.customerId = faker.datatype.number();
      purchase.purchaseDate = '2022-01-01';

      jest
        .spyOn(productRepository, 'findBy')
        .mockResolvedValueOnce([{ id: 1, price: faker.datatype.float() }]);

      jest
        .spyOn(customerRepository, 'findOneBy')
        .mockResolvedValue({ id: faker.datatype.number() });
      const savedPurchase = await service.create(purchase);
      expect(savedPurchase.id).toBeTruthy();
    });

    it('should save a purchase without a customer', async () => {
      const purchase = new CreatePurchaseDto();
      purchase.items = [
        {
          productId: faker.datatype.number(),
          quantity: faker.datatype.number(),
        },
      ];
      purchase.purchaseDate = '2022-01-01';

      jest
        .spyOn(productRepository, 'findBy')
        .mockResolvedValueOnce([{ id: 1, price: faker.datatype.float() }]);

      const savedPurchase = await service.create(purchase);
      expect(savedPurchase.id).toBeTruthy();
    });

    it('should throw an error if customer is not found', async () => {
      const purchase = new CreatePurchaseDto();
      purchase.items = [
        {
          productId: faker.datatype.number(),
          quantity: faker.datatype.number(),
        },
      ];
      purchase.customerId = faker.datatype.number();
      purchase.purchaseDate = '2022-01-01';

      jest
        .spyOn(productRepository, 'findBy')
        .mockResolvedValueOnce([{ id: 1, price: faker.datatype.float() }]);

      jest.spyOn(customerRepository, 'findOneBy').mockResolvedValue(null);
      await expect(() => service.create(purchase)).rejects.toThrow();
    });
  });

  describe('PurchaseService.findAll', () => {
    it('should return an empty array of purchases', async () => {
      const selectedPurchases = await service.findAll();
      expect(selectedPurchases).toStrictEqual([]);
    });

    it('should validate year is being used in where clause and return an empty array', async () => {
      let whereValue;
      jest
        .spyOn(purchaseRepository, 'find')
        .mockImplementationOnce((options) => {
          const [startDate, endDate] = options.where.purchaseDate._value;
          whereValue = [startDate.toISOString(), endDate.toISOString()];
          return [];
        });

      const selectedPurchases = await service.findAll(
        undefined,
        'ASC',
        0,
        10,
        undefined,
        undefined,
        undefined,
        2022,
      );
      expect(selectedPurchases).toStrictEqual([]);
      expect(whereValue).toStrictEqual([
        '2022-01-01T03:00:00.000Z',
        '2023-01-01T02:59:59.000Z',
      ]);
    });

    it('should validate month is being used in where clause and return an empty array', async () => {
      let whereValue;
      jest
        .spyOn(purchaseRepository, 'find')
        .mockImplementationOnce((options) => {
          const [startDate, endDate] = options.where.purchaseDate._value;
          whereValue = [startDate.toISOString(), endDate.toISOString()];
          return [];
        });

      const selectedPurchases = await service.findAll(
        undefined,
        'ASC',
        0,
        10,
        undefined,
        undefined,
        '2022-12',
      );
      expect(selectedPurchases).toStrictEqual([]);
      expect(whereValue).toStrictEqual([
        '2022-12-01T03:00:00.000Z',
        '2023-01-01T02:59:59.000Z',
      ]);
    });

    it('should validate date is being used in where clause and return an empty array', async () => {
      let whereValue;
      jest
        .spyOn(purchaseRepository, 'find')
        .mockImplementationOnce((options) => {
          const [startDate, endDate] = options.where.purchaseDate._value;
          whereValue = [startDate.toISOString(), endDate.toISOString()];
          return [];
        });
      const filterDate = new Date(2022, 0, 1);
      const selectedPurchases = await service.findAll(
        undefined,
        'ASC',
        0,
        10,
        undefined,
        filterDate,
      );
      expect(selectedPurchases).toStrictEqual([]);
      expect(whereValue).toStrictEqual([
        '2022-01-01T00:00:00.000Z',
        '2022-01-01T23:59:59.999Z',
      ]);
    });
  });

  describe('PurchaseService.findOne', () => {
    it('should return one purchase', async () => {
      const purchase = new Purchase();
      purchase.id = faker.datatype.number();

      jest
        .spyOn(purchaseRepository, 'findOneBy')
        .mockResolvedValueOnce(purchase);
      const selectedCustomer = await service.findOne(purchase.id);
      expect(selectedCustomer.id).toBe(purchase.id);
    });
  });

  describe('PurchaseService.update', () => {
    it('should update a product', async () => {
      const product = {
        productId: faker.datatype.number(),
        quantity: faker.datatype.number(),
      };
      const purchase = new UpdatePurchaseDto();
      const id = faker.datatype.number();
      purchase.purchaseDate = '2022-01-01';
      purchase.items = [product];
      purchase.customerId = faker.datatype.number();

      jest.spyOn(productRepository, 'findBy').mockResolvedValueOnce([product]);
      jest.spyOn(purchaseRepository, 'findOneBy').mockResolvedValue(purchase);
      jest
        .spyOn(customerRepository, 'findOneBy')
        .mockResolvedValue({ id: faker.datatype.number() });

      await service.update(id, purchase);
      expect(purchaseRepository.save).toBeCalled();
    });

    it('should throw an exception if purchase is not found', async () => {
      const product = {
        productId: faker.datatype.number(),
        quantity: faker.datatype.number(),
      };
      const purchase = new UpdatePurchaseDto();
      const id = faker.datatype.number();
      purchase.purchaseDate = '2022-01-01';
      purchase.items = [product];

      jest.spyOn(productRepository, 'findBy').mockResolvedValueOnce([product]);
      jest.spyOn(purchaseRepository, 'findOneBy').mockResolvedValue(null);

      await expect(() => service.update(id, purchase)).rejects.toThrow(
        `Purchase ID ${id} not found`,
      );
    });

    it('should throw an exception in case of error', async () => {
      const product = {
        productId: faker.datatype.number(),
        quantity: faker.datatype.number(),
      };
      const purchase = new UpdatePurchaseDto();
      const id = faker.datatype.number();
      purchase.purchaseDate = '2022-01-01';

      jest.spyOn(purchaseRepository, 'findOneBy').mockResolvedValue(purchase);
      jest
        .spyOn(purchaseRepository, 'save')
        .mockRejectedValueOnce(new Error('Test Error'));

      await expect(() => service.update(id, purchase)).rejects.toThrow(
        'Test Error',
      );
    });

    describe('PurchaseService.remove', () => {
      it('should throw an error when deleting an purchase that doesnt exists', async () => {
        const id = faker.datatype.number();
        jest.spyOn(purchaseRepository, 'findOneBy').mockResolvedValue(null);
        try {
          await service.remove(id);
          expect(purchaseRepository.update).toBeCalled();
        } catch (e) {
          expect(e.message).toBe(`Purchase ID ${id} not found`);
        }
      });

      it('should call repositoryMock.update', async () => {
        const purchase = new Purchase();
        purchase.id = faker.datatype.number();
        purchase.purchaseDate = new Date();
        jest.spyOn(purchaseRepository, 'findOneBy').mockResolvedValue(purchase);

        jest
          .spyOn(purchaseRepository, 'findOneBy')
          .mockResolvedValueOnce(purchase);
        await service.remove(purchase.id);
        expect(purchaseRepository.update).toBeCalled();
      });
    });
  });
});
