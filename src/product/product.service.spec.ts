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
    getMany: jest.fn().mockReturnValue([]),
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

    it('should log an error if an exception is thrown', async () => {
      const product = new CreateProductDto();
      product.name = faker.lorem.words(2);
      product.price = faker.datatype.float();
      product.stock = faker.datatype.number();
      jest.spyOn(console, 'error').mockImplementation(() => null);
      jest
        .spyOn(repositoryMock, 'save')
        .mockRejectedValueOnce(() => new Error('Test Error'));

      try {
        await service.create(product);
      } catch (e) {
        expect(console.error).toBeCalled();
      }
    });
  });

  describe('ProductService.findAll', () => {
    it('should return an empty Array of products', async () => {
      const products = await service.findAll();
      expect(products.length).toBe(0);
    });

    it('should return an empty Array of products', async () => {
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
  });

  describe('ProductSerivce.update', () => {
    it('should call repositoryMock.update', async () => {
      const product = new Product();
      product.id = faker.datatype.number();
      product.name = faker.lorem.words(2);
      product.price = faker.datatype.float();
      product.stock = faker.datatype.number();

      await service.update(faker.datatype.number(), product);
      expect(repositoryMock.update).toBeCalled();
    });
  });

  describe('ProductSerivce.delete', () => {
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
});
