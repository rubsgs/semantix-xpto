import { Exclude, Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { PurchaseItemDto } from './create-purchase.dto';

export class UpdatePurchaseDto {
  @IsOptional()
  @IsDateString()
  purchaseDate: string;

  @IsOptional()
  @IsNumber()
  customerId: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];
}
