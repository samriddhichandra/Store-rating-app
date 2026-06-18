import { IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @Length(1, 60, { message: 'Store name must not exceed 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @Length(1, 400, { message: 'Address must not exceed 400 characters' })
  address: string;

  // Optional: id of an existing user with role STORE_OWNER to attach as the store's owner
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
