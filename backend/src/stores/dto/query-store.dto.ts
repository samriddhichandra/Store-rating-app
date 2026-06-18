import { IsOptional, IsString } from 'class-validator';

export class QueryStoreDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  sortBy?: string; // name | email | address | rating

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC';
}
