import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';
import { faker } from '@faker-js/faker';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Purchase } from './entities/purchase.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/product/entities/product.entity';

describe('PurchaseController', () => {
  let controller: PurchaseController;

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
      controllers: [PurchaseController],
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

    controller = module.get<PurchaseController>(PurchaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('PurchaseController.create', () => {
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
      const savedPurchase = await controller.create(purchase);
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

      const savedPurchase = await controller.create(purchase);
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
      await expect(() => controller.create(purchase)).rejects.toThrow();
    });
  });

  describe('PurchaseController.findAll', () => {
    it('should return an empty array of purchases', async () => {
      const selectedPurchases = await controller.findAll();
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

      const selectedPurchases = await controller.findAll(
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

      const selectedPurchases = await controller.findAll(
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
      const selectedPurchases = await controller.findAll(
        undefined,
        'ASC',
        0,
        10,
        undefined,
        '2022-01-01',
      );
      expect(selectedPurchases).toStrictEqual([]);
      expect(whereValue).toStrictEqual([
        '2022-01-01T00:00:00.000Z',
        '2022-01-01T23:59:59.999Z',
      ]);
    });
  });

  describe('PurchaseController.findOne', () => {
    it('should return one purchase', async () => {
      const purchase = new Purchase();
      purchase.id = faker.datatype.number();

      jest
        .spyOn(purchaseRepository, 'findOneBy')
        .mockResolvedValueOnce(purchase);
      const selectedCustomer = await controller.findOne(purchase.id.toString());
      expect(selectedCustomer.id).toBe(purchase.id);
    });
  });

  describe('PurchaseController.update', () => {
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

      await controller.update(id.toString(), purchase);
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

      await expect(() =>
        controller.update(id.toString(), purchase),
      ).rejects.toThrow(`Purchase ID ${id} not found`);
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

      await expect(() =>
        controller.update(id.toString(), purchase),
      ).rejects.toThrow('Test Error');
    });

    describe('PurchaseController.remove', () => {
      it('should throw an error when deleting an purchase that doesnt exists', async () => {
        const id = faker.datatype.number();
        jest.spyOn(purchaseRepository, 'findOneBy').mockResolvedValue(null);
        try {
          await controller.remove(id.toString());
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
        await controller.remove(purchase.id.toString());
        expect(purchaseRepository.update).toBeCalled();
      });
    });
  });
});
