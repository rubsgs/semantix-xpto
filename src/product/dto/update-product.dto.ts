import { IsString, IsPositive, Min, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsPositive()
  price: number;

  @IsOptional()
  @Min(0)
  stock: number;
}
