import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
    
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}
