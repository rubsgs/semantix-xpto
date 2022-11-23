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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @Get()
  async findAll(
    @Query('order') sorting?: string,
    @Query('direction') direction: 'ASC' | 'DESC' = 'ASC',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.productService.findAll(sorting, direction, page, limit);
  }

  @Get('/best-sellers')
  async getBestSellers(
    @Query('date') date: string,
    @Query('month') month: string,
    @Query('year') year: number,
    @Query('direction') direction: 'ASC' | 'DESC',
  ) {
    const dateObj = date ? new Date(date) : undefined;
    return await this.productService.bestSellers(
      dateObj,
      month,
      year,
      direction,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(+id);
    if (!product) throw new NotFoundException(`Product ID ${id} not found`);
    return product;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productService.remove(+id);
  }
}
