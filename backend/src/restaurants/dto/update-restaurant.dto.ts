import { IsString, IsOptional, IsArray, IsObject, IsBoolean } from 'class-validator';

export class UpdateRestaurantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsOptional()
  cuisineTypes?: string[];

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsObject()
  @IsOptional()
  workingHours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
} 