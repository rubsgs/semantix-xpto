import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  async create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return await this.purchaseService.create(createPurchaseDto);
  }

  @Get()
  async findAll(
    @Query('order') sorting?: string,
    @Query('direction') direction: 'ASC' | 'DESC' = 'ASC',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('customerId') customerId?: number,
    @Query('date') purchaseDate?: string,
  ) {
    return this.purchaseService.findAll(
      sorting,
      direction,
      page,
      limit,
      customerId,
      purchaseDate ? new Date(purchaseDate) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ) {
    return this.purchaseService.update(+id, updatePurchaseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.purchaseService.remove(+id);
  }
}
