import { IsEmail, IsString, Length, Matches } from 'class-validator';

// Matches the assignment's password rule: 8-16 chars, >=1 uppercase, >=1 special char
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]/\\;']).{8,16}$/;

export class SignupDto {
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
}
