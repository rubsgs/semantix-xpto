import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

describe('ProductController', () => {
  let controller: ProductController;
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
      controllers: [ProductController],
      providers: [
        ProductService,
        {
          provide: 'ProductRepository',
          useValue: repositoryMock,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ProductController.create', () => {
    it('should create a product', async () => {
      const product = new CreateProductDto();
      product.name = faker.lorem.words(2);
      product.price = faker.datatype.float();
      product.stock = faker.datatype.number();

      const savedProduct = await controller.create(product);
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
        await controller.create(product);
      } catch (e) {
        expect(console.error).toBeCalled();
      }
    });
  });

  describe('ProductController.findAll', () => {
    it('should return an empty Array of products', async () => {
      const products = await controller.findAll();
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
      const products = await controller.findAll();
      expect(products.length).toBe(1);
      expect(products[0].id).toBe(product.id);
    });
  });

  describe('ProductController.findOne', () => {
    it('should return one product', async () => {
      const product = new Product();
      product.id = faker.datatype.number();
      product.name = faker.lorem.words(2);
      product.price = faker.datatype.float();
      product.stock = faker.datatype.number();

      jest.spyOn(repositoryMock, 'findOneBy').mockResolvedValueOnce(product);
      const selectedProduct = await controller.findOne(product.id.toString());
      expect(selectedProduct.id).toBe(product.id);
      expect(selectedProduct.name).toBe(product.name);
      expect(selectedProduct.price).toBe(product.price);
      expect(selectedProduct.stock).toBe(product.stock);
    });

    it('should return a 404 error for a product that doesnt exists', async () => {
      const id = faker.datatype.number();

      jest.spyOn(repositoryMock, 'findOneBy').mockResolvedValueOnce(null);
      try {
        const selectedProduct = await controller.findOne(id.toString());
      } catch (e) {
        expect(e.status).toBe(404);
      }
    });
  });

  describe('ProductController.update', () => {
    it('should call repositoryMock.update', async () => {
      const product = new UpdateProductDto();
      product.name = faker.lorem.words(2);
      product.price = faker.datatype.float();
      product.stock = faker.datatype.number();

      await controller.update(faker.datatype.number().toString(), product);
      expect(repositoryMock.update).toBeCalled();
    });
  });

  describe('ProductController.delete', () => {
    it('should throw an error when deleting an product that doesnt exists', async () => {
      const id = faker.datatype.number().toString();

      try {
        await controller.remove(id);
        expect(repositoryMock.update).toBeCalled();
      } catch (e) {
        expect(e.message).toBe(`Product ${id} not found`);
      }
    });

    it('should call repositoryMock.update', async () => {
      const product = new UpdateProductDto();
      const id = faker.datatype.number();
      product.name = faker.lorem.words(2);
      product.price = faker.datatype.float();
      product.stock = faker.datatype.number();

      jest.spyOn(repositoryMock, 'findOneBy').mockResolvedValueOnce(product);
      await controller.remove(id.toString());
      expect(repositoryMock.update).toBeCalled();
    });
  });
});
