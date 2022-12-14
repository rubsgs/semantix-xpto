import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { faker } from '@faker-js/faker';
import { Customer } from './entities/customer.entity';

describe('CustomerService', () => {
  let service: CustomerService;

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
    save: jest.fn().mockImplementation((customer: Customer) => {
      return { ...customer, id: faker.datatype.number() };
    }),
    createQueryBuilder: jest.fn().mockImplementation(() => queryBuilderMock),
    findOneBy: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: 'CustomerRepository', useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CustomerService.create', () => {
    it('should save a customer', async () => {
      const customer = new Customer();
      customer.name = faker.name.fullName();
      customer.email = faker.internet.email();
      customer.telephone = faker.phone.number();

      const savedCustomer = await service.create(customer);
      expect(savedCustomer.id).toBeTruthy();
    });

    it('should throw an exception in case of error', async () => {
      const customer = new Customer();
      customer.name = faker.name.fullName();
      customer.email = faker.internet.email();
      customer.telephone = faker.phone.number();
      jest
        .spyOn(repositoryMock, 'save')
        .mockRejectedValueOnce(new Error('Test Error'));

      await expect(service.create(customer)).rejects.toThrow('Test Error');
    });
  });

  describe('CustomerService.FindAll', () => {
    it('should return an empty array of customers', async () => {
      const customers = await service.findAll();
      expect(customers.length).toBe(0);
    });

    it('should return an array containing one customer', async () => {
      const customer = new Customer();
      customer.id = faker.datatype.number();
      customer.name = faker.name.fullName();
      customer.email = faker.internet.email();
      customer.telephone = faker.phone.number();
      jest.spyOn(queryBuilderMock, 'getMany').mockImplementationOnce(() => {
        return [customer];
      });

      const customers = await service.findAll();
      expect(customers.length).toBe(1);
      expect(customers[0].id).toBe(customer.id);
    });

    it('should throw an exception in case of error', async () => {
      jest
        .spyOn(queryBuilderMock, 'getMany')
        .mockRejectedValueOnce(new Error('Test Error'));

      await expect(() => service.findAll()).rejects.toThrow('Test Error');
    });
  });

  describe('CustomerService.findOne', () => {
    it('should return one customer', async () => {
      const customer = new Customer();
      customer.id = faker.datatype.number();
      customer.name = faker.lorem.words(2);
      customer.email = faker.internet.email();
      customer.telephone = faker.phone.number();

      jest.spyOn(repositoryMock, 'findOneBy').mockResolvedValueOnce(customer);
      const selectedCustomer = await service.findOne(customer.id);
      expect(selectedCustomer.id).toBe(customer.id);
    });

    it('should log an error if an exception is thrown', async () => {
      jest
        .spyOn(repositoryMock, 'findOneBy')
        .mockRejectedValueOnce(new Error('Test Error'));

      await expect(() => service.findOne(1)).rejects.toThrow('Test Error');
    });
  });

  describe('CustomerService.update', () => {
    it('should update a customer', async () => {
      const customer = new Customer();
      customer.id = faker.datatype.number();
      customer.name = faker.lorem.words(2);
      customer.email = faker.internet.email();
      customer.telephone = faker.phone.number();

      await service.update(customer.id, customer);
      expect(repositoryMock.update).toBeCalled();
    });

    it('should throw an error in case of error', async () => {
      const customer = new Customer();
      customer.id = faker.datatype.number();
      customer.name = faker.lorem.words(2);
      customer.email = faker.internet.email();
      customer.telephone = faker.phone.number();

      jest
        .spyOn(repositoryMock, 'update')
        .mockRejectedValueOnce(new Error('Test Error'));

      await expect(service.update(customer.id, customer)).rejects.toThrow(
        'Test Error',
      );
    });
  });

  describe('CustomerService.remove', () => {
    it('should throw an error when deleting an customer that doesnt exists', async () => {
      const id = faker.datatype.number();

      try {
        await service.remove(id);
        expect(repositoryMock.update).toBeCalled();
      } catch (e) {
        expect(e.message).toBe(`Customer ${id} not found`);
      }
    });

    it('should call repositoryMock.update', async () => {
      const customer = new Customer();
      customer.id = faker.datatype.number();
      customer.name = faker.lorem.words(2);
      customer.email = faker.internet.email();
      customer.telephone = faker.phone.number();

      jest.spyOn(repositoryMock, 'findOneBy').mockResolvedValueOnce(customer);
      await service.remove(customer.id);
      expect(repositoryMock.update).toBeCalled();
    });
  });

  describe('CustomerService.bestBuyers', () => {
    it('should use purchase year as filter and return an empty array', async () => {
      let where: string;
      jest
        .spyOn(queryBuilderMock, 'where')
        .mockImplementation((param: string) => {
          where = param;
          return queryBuilderMock;
        });

      const year = 2022;
      const bestSellers = await service.bestBuyers(undefined, undefined, year);
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
      const bestSellers = await service.bestBuyers(undefined, month);
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
      const bestSellers = await service.bestBuyers(date);
      expect(where).toBe(
        `TO_DATE(purchase_date::text, 'YYYY-MM-DD') = '${dateString}'`,
      );
      expect(bestSellers).toStrictEqual([]);
    });
  });
});
