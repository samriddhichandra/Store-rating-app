import { IsEmail, IsEnum, IsString, Length, Matches } from 'class-validator';
import { Role } from '../../common/enums/role.enum';
import { PASSWORD_REGEX } from '../../auth/dto/signup.dto';

// Used by the System Administrator to create normal users, store owners, or other admins
export class CreateUserDto {
  @IsString()
  @Length(20, 60, { message: 'Name must be between 20 and 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @Length(1, 400, { message: 'Address must not exceed 400 characters' })
  address: string;

  @Matches(PASSWORD_REGEX, {
    message:
      'Password must be 8-16 characters and include at least one uppercase letter and one special character',
  })
  password: string;

  @IsEnum(Role, { message: 'Role must be one of ADMIN, NORMAL_USER, STORE_OWNER' })
  role: Role;
}
