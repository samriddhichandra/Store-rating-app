import { IsString } from 'class-validator';
import { Matches } from 'class-validator';
import { PASSWORD_REGEX } from './signup.dto';

export class UpdatePasswordDto {
  @IsString()
  currentPassword: string;

  @Matches(PASSWORD_REGEX, {
    message:
      'New password must be 8-16 characters and include at least one uppercase letter and one special character',
  })
  newPassword: string;
}
