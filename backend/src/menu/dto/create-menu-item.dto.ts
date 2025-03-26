import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
} 