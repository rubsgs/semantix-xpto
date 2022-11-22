import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  findAll(
    @Query('order') sorting?: string,
    @Query('direction') direction: 'ASC' | 'DESC' = 'ASC',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.customerService.findAll(sorting, direction, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const customer = this.customerService.findOne(+id);
    if (!customer) throw new NotFoundException(`Customer ID ${id} not found`);
    return customer;
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}
