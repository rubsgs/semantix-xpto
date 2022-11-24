import { Test, TestingModule } from '@nestjs/testing';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { faker } from '@faker-js/faker';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductService', () => {
  let service: ProductService;

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

  const repositoryMock = {
    save: jest.fn().mockImplementation((prod: Product) => {
      return { ...prod, id: faker.datatype.number() };
    }),
    createQueryBuilder: jest.fn().mockImplementation(() => queryBuilderMock),
    findOneBy: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: 'ProductRepository',
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ProductService.create', () => {
    it('should create a product', async () => {
      const product = new CreateProductDto();
      product.name = faker.lorem.words(2);
      product.price = faker.datatype.float();
      product.stock = faker.datatype.number();

      const savedProduct = await service.create(product);
      expect(savedProduct.name).toBe(product.name);
      expect(savedProduct.price).toBe(product.price);
      expect(savedProduct.stock).toBe(product.stock);
      expect(savedProduct.id).toBeTruthy();
    });

    it('should throw an exception in case of error', async () => {
      const product = new CreateProductDto();
      product.name = faker.lorem.words(2);
      product.price = faker.datatype.float();
      product.stock = faker.datatype.number();
      jest
        .spyOn(repositoryMock, 'save')
        .mockRejectedValueOnce(new Error('Test Error'));

      await expect(service.create(product)).rejects.toThrow('Test Error');
    });
  });

  describe('ProductService.findAll', () => {
    it('should return an empty array of products', async () => {
      const products = await service.findAll();
      expect(products.length).toBe(0);
    });

    it('should return an array containing one product', async () => {
      const product = new Product();
      product.id = faker.datatype.number();
      product.name = faker.lorem.words(2);
      product.price = faker.datatype.float();
      product.stock = faker.datatype.number();

      jest.spyOn(queryBuilderMock, 'getMany').mockImplementationOnce(() => {
        return [product];
      });
      const products = await service.findAll();
      expect(products.length).toBe(1);
      expect(products[0].id).toBe(product.id);
    });

    it('should throw an error in case of error', async () => {
      jest
        .spyOn(queryBuilderMock, 'getMany')
        .mockRejectedValueOnce(new Error('Test Error'));

      await expect(() => service.findAll()).rejects.toThrow('Test Error');
    });
  });

  describe('ProductService.findOne', () => {
    it('should return one product', async () => {
      const product = new Product();
      product.id = faker.datatype.number();
      product.name = faker.lorem.words(2);
      product.price = faker.datatype.float();
      product.stock = faker.datatype.number();

      jest.spyOn(repositoryMock, 'findOneBy').mockResolvedValueOnce(product);
      const selectedProduct = await service.findOne(product.id);
      expect(selectedProduct.id).toBe(product.id);
    });

    it('should throw an exception in case of error', async () => {
      jest
        .spyOn(repositoryMock, 'findOneBy')
        .mockRejectedValueOnce(new Error('Test Error'));

      await expect(() => service.findOne(1)).rejects.toThrow('Test Error');
    });
  });

  describe('ProductSerivce.update', () => {
    it('should call repositoryMock.update', async () => {
      const product = new Product();
      product.id = faker.datatype.number();
      product.name = faker.lorem.words(2);
      product.price = faker.datatype.float();
      product.stock = faker.datatype.number();

      await service.update(product.id, product);
      expect(repositoryMock.update).toBeCalled();
    });

    it('should throw an exception in case of error', async () => {
      const product = new Product();
      product.id = faker.datatype.number();
      product.name = faker.lorem.words(2);
      product.price = faker.datatype.float();
      product.stock = faker.datatype.number();
      jest
        .spyOn(repositoryMock, 'update')
        .mockRejectedValueOnce(new Error('Test Error'));

      await expect(() => service.update(product.id, product)).rejects.toThrow(
        'Test Error',
      );
    });
  });

  describe('ProductSerivce.remove', () => {
    it('should throw an error when deleting an product that doesnt exists', async () => {
      const id = faker.datatype.number();

      try {
        await service.remove(id);
        expect(repositoryMock.update).toBeCalled();
      } catch (e) {
        expect(e.message).toBe(`Product ${id} not found`);
      }
    });

    it('should call repositoryMock.update', async () => {
      const product = new Product();
      product.id = faker.datatype.number();
      product.name = faker.lorem.words(2);
      product.price = faker.datatype.float();
      product.stock = faker.datatype.number();

      jest.spyOn(repositoryMock, 'findOneBy').mockResolvedValueOnce(product);
      await service.remove(product.id);
      expect(repositoryMock.update).toBeCalled();
    });
  });

  describe('ProductSerive.bestSellers', () => {
    it('should use purchase year as filter and return an empty array', async () => {
      let where: string;
      jest
        .spyOn(queryBuilderMock, 'where')
        .mockImplementation((param: string) => {
          where = param;
          return queryBuilderMock;
        });

      const year = 2022;
      const bestSellers = await service.bestSellers(undefined, undefined, year);
      expect(where).toBe(`EXTRACT(YEAR FROM pu.purchase_date) = ${year}`);
      expect(bestSellers).toStrictEqual([]);
    });

    it('should use purchase month as filter and return an empty array', async () => {
      let where: string;
      jest
        .spyOn(queryBuilderMock, 'where')
        .mockImplementation((param: string) => {
          where = param;
          return queryBuilderMock;
        });

      const month = '2022-01';
      const bestSellers = await service.bestSellers(undefined, month);
      expect(where).toBe(
        `TO_DATE(purchase_date::text, 'YYYY-MM') = '${month}-01'`,
      );
      expect(bestSellers).toStrictEqual([]);
    });

    it('should use purchase date as filter and return an empty array', async () => {
      let where: string;
      jest
        .spyOn(queryBuilderMock, 'where')
        .mockImplementation((param: string) => {
          where = param;
          return queryBuilderMock;
        });

      const date = new Date();
      const dateString = date.toISOString().split('T')[0];
      const bestSellers = await service.bestSellers(date);
      expect(where).toBe(
        `TO_DATE(purchase_date::text, 'YYYY-MM-DD') = '${dateString}'`,
      );
      expect(bestSellers).toStrictEqual([]);
    });
  });
});
